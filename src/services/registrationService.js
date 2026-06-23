'use strict';

const db = require('../db');
const ApiError = require('../utils/ApiError');

const RESULT = { REGISTERED: 'registered', WAITLISTED: 'waitlisted', FAILED: 'failed' };
const ENROLLMENT = { REGISTERED: 'Registered', DROPPED: 'Dropped' };

const PASSING = "e.final_grade IS NOT NULL AND e.final_grade NOT IN ('F', 'WF', 'DNW')";

function timesOverlap(startA, endA, startB, endB) {
  return startA < endB && startB < endA;
}

function schedulesConflict(entriesA, entriesB) {
  for (const a of entriesA) {
    for (const b of entriesB) {
      if (
        a.day_of_week === b.day_of_week &&
        timesOverlap(a.start_time, a.end_time, b.start_time, b.end_time)
      ) {
        return true;
      }
    }
  }
  return false;
}

async function getSchedulesForSections(sectionIds) {
  const map = new Map();
  if (!sectionIds || sectionIds.length === 0) {
    return map;
  }
  const placeholders = sectionIds.map(() => '?').join(', ');
  const rows = await db.query(
    `SELECT section_id, day_of_week, start_time, end_time
       FROM ClassSchedule
      WHERE section_id IN (${placeholders})`,
    sectionIds
  );
  for (const row of rows) {
    if (!map.has(row.section_id)) {
      map.set(row.section_id, []);
    }
    map.get(row.section_id).push(row);
  }
  return map;
}

async function findConflicts(sectionIds) {
  const schedules = await getSchedulesForSections(sectionIds);
  const conflicts = [];
  for (let i = 0; i < sectionIds.length; i += 1) {
    for (let j = i + 1; j < sectionIds.length; j += 1) {
      const a = schedules.get(sectionIds[i]) || [];
      const b = schedules.get(sectionIds[j]) || [];
      if (schedulesConflict(a, b)) {
        conflicts.push({ sectionA: sectionIds[i], sectionB: sectionIds[j] });
      }
    }
  }
  return conflicts;
}

async function getRegisteredSectionIds(studentId) {
  const rows = await db.query(
    'SELECT section_id FROM Enrollments WHERE student_id = ? AND status = ?',
    [studentId, ENROLLMENT.REGISTERED]
  );
  return rows.map((row) => row.section_id);
}

async function conflictsWithRegistered(studentId, sectionId, options = {}) {
  const { excludeSectionId = null } = options;
  const registered = (await getRegisteredSectionIds(studentId)).filter(
    (id) => id !== sectionId && id !== excludeSectionId
  );
  if (registered.length === 0) {
    return { conflict: false, conflictingSectionIds: [] };
  }
  const schedules = await getSchedulesForSections([sectionId, ...registered]);
  const target = schedules.get(sectionId) || [];
  const conflictingSectionIds = registered.filter((id) =>
    schedulesConflict(target, schedules.get(id) || [])
  );
  return { conflict: conflictingSectionIds.length > 0, conflictingSectionIds };
}

async function getMissingPrerequisites(studentId, courseId) {
  const rows = await db.query(
    `SELECT p.required_course_id
       FROM Prerequisites p
      WHERE p.course_id = ?
        AND NOT EXISTS (
          SELECT 1
            FROM Enrollments e
            JOIN CourseSections cs ON cs.section_id = e.section_id
           WHERE e.student_id = ?
             AND cs.course_id = p.required_course_id
             AND ${PASSING}
        )`,
    [courseId, studentId]
  );
  return rows.map((row) => row.required_course_id);
}

async function getBlockingAntirequisites(studentId, courseId) {
  const rows = await db.query(
    `SELECT DISTINCT cs.course_id
       FROM Enrollments e
       JOIN CourseSections cs ON cs.section_id = e.section_id
      WHERE e.student_id = ?
        AND (e.status = ? OR (${PASSING}))
        AND cs.course_id IN (
          SELECT antirequisite_course_id FROM Antirequisites WHERE course_id = ?
          UNION
          SELECT course_id FROM Antirequisites WHERE antirequisite_course_id = ?
        )`,
    [studentId, ENROLLMENT.REGISTERED, courseId, courseId]
  );
  return rows.map((row) => row.course_id);
}

async function isRegisteredInCourse(studentId, courseId, options = {}) {
  const { excludeSectionId = null } = options;
  const params = [studentId, courseId, ENROLLMENT.REGISTERED];
  let exclude = '';
  if (excludeSectionId !== null) {
    exclude = ' AND e.section_id <> ?';
    params.push(excludeSectionId);
  }
  const row = await db.queryOne(
    `SELECT 1
       FROM Enrollments e
       JOIN CourseSections cs ON cs.section_id = e.section_id
      WHERE e.student_id = ? AND cs.course_id = ? AND e.status = ?${exclude}
      LIMIT 1`,
    params
  );
  return row !== null;
}

async function getActiveHold(studentId) {
  return db.queryOne(
    'SELECT hold_id, hold_type, reason FROM Holds WHERE student_id = ? AND active = TRUE LIMIT 1',
    [studentId]
  );
}

async function recordAttempt(executor, studentId, sectionId, result, reason) {
  await executor.execute(
    `INSERT INTO RegistrationAttempts (student_id, section_id, result, failure_reason)
     VALUES (?, ?, ?, ?)`,
    [studentId, sectionId, result, reason || null]
  );
}

async function recordAudit(executor, studentId, sectionId, actionType, details) {
  await executor.execute(
    `INSERT INTO AuditLog (student_id, action_type, section_id, details)
     VALUES (?, ?, ?, ?)`,
    [studentId, actionType, sectionId, details || null]
  );
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

async function registerSection(studentId, sectionId) {
  const section = await db.queryOne(
    `SELECT cs.section_id, cs.course_id, cs.status,
            t.registration_open_date, t.registration_close_date
       FROM CourseSections cs
       LEFT JOIN AcademicTerms t ON t.term_id = cs.term_id
      WHERE cs.section_id = ?`,
    [sectionId]
  );

  if (!section) {
    return { result: RESULT.FAILED, reason: 'Section not found' };
  }

  const fail = async (reason) => {
    await recordAttempt(db.pool, studentId, sectionId, RESULT.FAILED, reason);
    return { result: RESULT.FAILED, reason };
  };

  if (section.status && section.status !== 'Open') {
    return fail('Section is not open');
  }

  const today = todayIso();
  if (section.registration_open_date && today < section.registration_open_date) {
    return fail('Registration has not opened');
  }
  if (section.registration_close_date && today > section.registration_close_date) {
    return fail('Registration is closed');
  }

  if (await getActiveHold(studentId)) {
    return fail('Active hold on account');
  }

  if (await isRegisteredInCourse(studentId, section.course_id)) {
    return fail('Already registered in this course');
  }

  if ((await getMissingPrerequisites(studentId, section.course_id)).length > 0) {
    return fail('Prerequisite not met');
  }

  if ((await getBlockingAntirequisites(studentId, section.course_id)).length > 0) {
    return fail('Antirequisite restriction');
  }

  const { conflict, conflictingSectionIds } = await conflictsWithRegistered(studentId, sectionId);
  if (conflict) {
    await recordAttempt(db.pool, studentId, sectionId, RESULT.FAILED, 'Time conflict');
    return { result: RESULT.FAILED, reason: 'Time conflict', conflictingSectionIds };
  }

  return db.withTransaction(async (conn) => {
    const [secRows] = await conn.execute(
      'SELECT capacity, enrolled_count FROM CourseSections WHERE section_id = ? FOR UPDATE',
      [sectionId]
    );
    const seat = secRows[0];
    const isFull = seat.capacity !== null && seat.enrolled_count >= seat.capacity;

    if (isFull) {
      const [already] = await conn.execute(
        'SELECT position FROM Waitlists WHERE student_id = ? AND section_id = ?',
        [studentId, sectionId]
      );
      if (already.length > 0) {
        return { result: RESULT.WAITLISTED, position: already[0].position };
      }
      const [posRows] = await conn.execute(
        'SELECT COALESCE(MAX(position), 0) + 1 AS nextPos FROM Waitlists WHERE section_id = ?',
        [sectionId]
      );
      const position = posRows[0].nextPos;
      await conn.execute(
        'INSERT INTO Waitlists (student_id, section_id, position, date_joined) VALUES (?, ?, ?, ?)',
        [studentId, sectionId, position, today]
      );
      await recordAttempt(conn, studentId, sectionId, RESULT.WAITLISTED, 'Section full');
      await recordAudit(conn, studentId, sectionId, 'WAITLIST', `Joined waitlist at position ${position}`);
      return { result: RESULT.WAITLISTED, position };
    }

    const [existing] = await conn.execute(
      'SELECT enrollment_id FROM Enrollments WHERE student_id = ? AND section_id = ?',
      [studentId, sectionId]
    );
    if (existing.length > 0) {
      await conn.execute(
        'UPDATE Enrollments SET status = ?, enrollment_date = ?, final_grade = NULL WHERE enrollment_id = ?',
        [ENROLLMENT.REGISTERED, today, existing[0].enrollment_id]
      );
    } else {
      await conn.execute(
        'INSERT INTO Enrollments (student_id, section_id, enrollment_date, status) VALUES (?, ?, ?, ?)',
        [studentId, sectionId, today, ENROLLMENT.REGISTERED]
      );
    }
    await conn.execute(
      'UPDATE CourseSections SET enrolled_count = enrolled_count + 1 WHERE section_id = ?',
      [sectionId]
    );
    await recordAttempt(conn, studentId, sectionId, RESULT.REGISTERED, null);
    await recordAudit(conn, studentId, sectionId, 'REGISTER', 'Registered for section');
    return { result: RESULT.REGISTERED };
  });
}

async function registerPlan(studentId, planId) {
  const owned = await db.queryOne(
    'SELECT plan_id FROM CoursePlans WHERE plan_id = ? AND student_id = ?',
    [planId, studentId]
  );
  if (!owned) {
    throw ApiError.notFound('Plan not found');
  }

  const items = await db.query(
    'SELECT section_id FROM CoursePlanItems WHERE plan_id = ? ORDER BY date_added ASC',
    [planId]
  );

  const results = [];
  for (const item of items) {
    // eslint-disable-next-line no-await-in-loop
    const outcome = await registerSection(studentId, item.section_id);
    results.push({ sectionId: item.section_id, ...outcome });
  }
  return { items: results };
}

async function dropSection(studentId, sectionId) {
  return db.withTransaction(async (conn) => {
    const [rows] = await conn.execute(
      'SELECT enrollment_id FROM Enrollments WHERE student_id = ? AND section_id = ? AND status = ? FOR UPDATE',
      [studentId, sectionId, ENROLLMENT.REGISTERED]
    );
    if (rows.length === 0) {
      throw ApiError.badRequest('You are not registered in this section');
    }
    await conn.execute('UPDATE Enrollments SET status = ? WHERE enrollment_id = ?', [
      ENROLLMENT.DROPPED,
      rows[0].enrollment_id,
    ]);
    await conn.execute(
      'UPDATE CourseSections SET enrolled_count = GREATEST(enrolled_count - 1, 0) WHERE section_id = ?',
      [sectionId]
    );
    await recordAudit(conn, studentId, sectionId, 'DROP', 'Dropped section');
    return { result: 'dropped' };
  });
}

async function swapSection(studentId, fromSectionId, toSectionId) {
  if (fromSectionId === toSectionId) {
    throw ApiError.badRequest('Cannot swap a section for itself');
  }

  const sections = await db.query(
    'SELECT section_id, course_id, status FROM CourseSections WHERE section_id IN (?, ?)',
    [fromSectionId, toSectionId]
  );
  const from = sections.find((s) => s.section_id === fromSectionId);
  const to = sections.find((s) => s.section_id === toSectionId);
  if (!from || !to) {
    throw ApiError.notFound('Section not found');
  }
  if (from.course_id !== to.course_id) {
    throw ApiError.badRequest('Swap must be within the same course');
  }

  const fail = async (reason) => {
    await recordAttempt(db.pool, studentId, toSectionId, RESULT.FAILED, reason);
    return { result: RESULT.FAILED, reason };
  };

  if (to.status && to.status !== 'Open') {
    return fail('Section is not open');
  }
  if (await getActiveHold(studentId)) {
    return fail('Active hold on account');
  }
  const { conflict, conflictingSectionIds } = await conflictsWithRegistered(studentId, toSectionId, {
    excludeSectionId: fromSectionId,
  });
  if (conflict) {
    await recordAttempt(db.pool, studentId, toSectionId, RESULT.FAILED, 'Time conflict');
    return { result: RESULT.FAILED, reason: 'Time conflict', conflictingSectionIds };
  }

  const today = todayIso();
  return db.withTransaction(async (conn) => {
    const [fromRows] = await conn.execute(
      'SELECT enrollment_id FROM Enrollments WHERE student_id = ? AND section_id = ? AND status = ? FOR UPDATE',
      [studentId, fromSectionId, ENROLLMENT.REGISTERED]
    );
    if (fromRows.length === 0) {
      throw ApiError.badRequest('You are not registered in the section you are swapping out');
    }

    const [toRows] = await conn.execute(
      'SELECT capacity, enrolled_count FROM CourseSections WHERE section_id = ? FOR UPDATE',
      [toSectionId]
    );
    const seat = toRows[0];
    if (seat.capacity !== null && seat.enrolled_count >= seat.capacity) {
      await recordAttempt(conn, studentId, toSectionId, RESULT.FAILED, 'Section full');
      return { result: RESULT.FAILED, reason: 'Section full' };
    }

    await conn.execute('UPDATE Enrollments SET status = ? WHERE enrollment_id = ?', [
      ENROLLMENT.DROPPED,
      fromRows[0].enrollment_id,
    ]);
    await conn.execute(
      'UPDATE CourseSections SET enrolled_count = GREATEST(enrolled_count - 1, 0) WHERE section_id = ?',
      [fromSectionId]
    );

    const [existing] = await conn.execute(
      'SELECT enrollment_id FROM Enrollments WHERE student_id = ? AND section_id = ?',
      [studentId, toSectionId]
    );
    if (existing.length > 0) {
      await conn.execute(
        'UPDATE Enrollments SET status = ?, enrollment_date = ?, final_grade = NULL WHERE enrollment_id = ?',
        [ENROLLMENT.REGISTERED, today, existing[0].enrollment_id]
      );
    } else {
      await conn.execute(
        'INSERT INTO Enrollments (student_id, section_id, enrollment_date, status) VALUES (?, ?, ?, ?)',
        [studentId, toSectionId, today, ENROLLMENT.REGISTERED]
      );
    }
    await conn.execute(
      'UPDATE CourseSections SET enrolled_count = enrolled_count + 1 WHERE section_id = ?',
      [toSectionId]
    );

    await recordAttempt(conn, studentId, toSectionId, RESULT.REGISTERED, null);
    await recordAudit(conn, studentId, fromSectionId, 'SWAP', `Swapped to section ${toSectionId}`);
    return { result: RESULT.REGISTERED };
  });
}

module.exports = {
  RESULT,
  timesOverlap,
  schedulesConflict,
  getSchedulesForSections,
  findConflicts,
  getRegisteredSectionIds,
  conflictsWithRegistered,
  getMissingPrerequisites,
  getBlockingAntirequisites,
  isRegisteredInCourse,
  getActiveHold,
  registerSection,
  registerPlan,
  dropSection,
  swapSection,
};
