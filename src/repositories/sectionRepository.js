'use strict';

const baseRepository = require('./baseRepository');
const db = require('../db');

const SECTION_COLUMNS = `
  cs.section_id, cs.course_id, cs.instructor_id, cs.term_id, cs.section_number,
  cs.capacity, cs.enrolled_count, cs.room_id, cs.delivery_mode, cs.status,
  (cs.capacity - cs.enrolled_count) AS seats_remaining,
  c.course_code, c.course_name,
  i.first_name AS instructor_first_name, i.last_name AS instructor_last_name,
  r.building, r.room_number,
  t.term_name`;

const SECTION_JOINS = `
  FROM CourseSections cs
  LEFT JOIN Courses c ON c.course_id = cs.course_id
  LEFT JOIN Instructors i ON i.instructor_id = cs.instructor_id
  LEFT JOIN Rooms r ON r.room_id = cs.room_id
  LEFT JOIN AcademicTerms t ON t.term_id = cs.term_id`;

const repo = baseRepository('CourseSections', 'section_id', [
  'course_id',
  'instructor_id',
  'term_id',
  'section_number',
  'capacity',
  'enrolled_count',
  'room_id',
  'delivery_mode',
  'status',
]);

// section listing with filters: course, term, and availability (US-19)
repo.search = (filters = {}) => {
  const { courseId, termId, availableOnly } = filters;
  const where = [];
  const params = [];
  if (courseId) {
    where.push('cs.course_id = ?');
    params.push(Number(courseId));
  }
  if (termId) {
    where.push('cs.term_id = ?');
    params.push(Number(termId));
  }
  if (availableOnly === 'true' || availableOnly === true) {
    where.push('(cs.capacity IS NULL OR cs.enrolled_count < cs.capacity)');
  }
  const whereClause = where.length > 0 ? `WHERE ${where.join(' AND ')}` : '';
  const lim = Number.parseInt(filters.limit, 10) || 100;
  const off = Number.parseInt(filters.offset, 10) || 0;
  return db.query(
    `SELECT ${SECTION_COLUMNS} ${SECTION_JOINS} ${whereClause}
      ORDER BY c.course_code, cs.section_number
      LIMIT ${lim} OFFSET ${off}`,
    params
  );
};

repo.findDetail = async (sectionId) => {
  const section = await db.queryOne(
    `SELECT ${SECTION_COLUMNS} ${SECTION_JOINS} WHERE cs.section_id = ?`,
    [sectionId]
  );
  if (!section) {
    return null;
  }
  section.schedule = await db.query(
    'SELECT schedule_id, day_of_week, start_time, end_time FROM ClassSchedule WHERE section_id = ?',
    [sectionId]
  );
  return section;
};

repo.findSeats = (sectionId) =>
  db.queryOne(
    `SELECT capacity, enrolled_count, (capacity - enrolled_count) AS seats_remaining
       FROM CourseSections WHERE section_id = ?`,
    [sectionId]
  );

repo.findEnrolledStudents = (sectionId) =>
  db.query(
    `SELECT s.student_id, s.first_name, s.last_name, s.student_email, e.status, e.enrollment_date
       FROM Enrollments e
       JOIN Students s ON s.student_id = e.student_id
      WHERE e.section_id = ? AND e.status = 'Registered'
      ORDER BY s.last_name, s.first_name`,
    [sectionId]
  );

module.exports = repo;
