'use strict';

// seeds sample data (npm run db:seed). logins: teststudent/Password123!, admin/Admin123!

const db = require('../src/db');
const authService = require('../src/services/authService');
const logger = require('../src/utils/logger');

async function main() {
  const existing = await db.queryOne('SELECT COUNT(*) AS count FROM Faculties');
  if (existing && existing.count > 0) {
    logger.warn('Database already contains data. Skipping seed to avoid duplicates.');
    logger.warn('Drop and re-initialize the database first if you want a clean seed.');
    return;
  }

  const studentPasswordHash = await authService.hashPassword('Password123!');
  const adminPasswordHash = await authService.hashPassword('Admin123!');

  await db.withTransaction(async (conn) => {
    const insert = async (sql, params) => {
      const [result] = await conn.execute(sql, params);
      return result.insertId;
    };

    const facultyId = await insert(
      'INSERT INTO Faculties (faculty_name) VALUES (?)',
      ['Faculty of Science']
    );
    const departmentId = await insert(
      'INSERT INTO Departments (department_name, faculty_id) VALUES (?, ?)',
      ['Physics and Computer Science', facultyId]
    );
    const programId = await insert(
      'INSERT INTO Programs (program_name, degree_type, department_id) VALUES (?, ?, ?)',
      ['Computer Science', 'BSc', departmentId]
    );

    const roomA = await insert(
      'INSERT INTO Rooms (building, room_number, capacity) VALUES (?, ?, ?)',
      ['Lazaridis Hall', '1001', 120]
    );
    const roomB = await insert(
      'INSERT INTO Rooms (building, room_number, capacity) VALUES (?, ?, ?)',
      ['Bricker Academic', '201', 60]
    );

    const instructorA = await insert(
      'INSERT INTO Instructors (first_name, last_name, email, department_id) VALUES (?, ?, ?, ?)',
      ['Ada', 'Lovelace', 'alovelace@example.edu', departmentId]
    );
    const instructorB = await insert(
      'INSERT INTO Instructors (first_name, last_name, email, department_id) VALUES (?, ?, ?, ?)',
      ['Alan', 'Turing', 'aturing@example.edu', departmentId]
    );

    const termId = await insert(
      `INSERT INTO AcademicTerms
         (term_name, semester, year, start_date, end_date,
          registration_open_date, registration_close_date)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      ['Fall 2026', 'Fall', 2026, '2026-09-08', '2026-12-05', '2026-06-01', '2026-09-15']
    );

    const cp164 = await insert(
      `INSERT INTO Courses
         (course_code, course_name, course_description, course_level, credits, department_id)
       VALUES (?, ?, ?, ?, ?, ?)`,
      ['CP164', 'Data Structures I', 'Introduction to data structures.', 100, 1, departmentId]
    );
    const cp264 = await insert(
      `INSERT INTO Courses
         (course_code, course_name, course_description, course_level, credits, department_id)
       VALUES (?, ?, ?, ?, ?, ?)`,
      ['CP264', 'Data Structures II', 'Further data structures and C.', 200, 1, departmentId]
    );
    const cp312 = await insert(
      `INSERT INTO Courses
         (course_code, course_name, course_description, course_level, credits, department_id)
       VALUES (?, ?, ?, ?, ?, ?)`,
      ['CP312', 'Algorithm Design and Analysis I', 'Algorithm design techniques.', 300, 1, departmentId]
    );

    await insert('INSERT INTO Prerequisites (course_id, required_course_id) VALUES (?, ?)', [
      cp264,
      cp164,
    ]);
    await insert('INSERT INTO Prerequisites (course_id, required_course_id) VALUES (?, ?)', [
      cp312,
      cp264,
    ]);

    const sectionCp164 = await insert(
      `INSERT INTO CourseSections
         (course_id, instructor_id, term_id, section_number, capacity, enrolled_count,
          room_id, delivery_mode, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [cp164, instructorA, termId, 'A', 120, 0, roomA, 'In-Person', 'Open']
    );
    const sectionCp264 = await insert(
      `INSERT INTO CourseSections
         (course_id, instructor_id, term_id, section_number, capacity, enrolled_count,
          room_id, delivery_mode, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [cp264, instructorB, termId, 'A', 60, 0, roomB, 'In-Person', 'Open']
    );

    await insert(
      'INSERT INTO ClassSchedule (section_id, day_of_week, start_time, end_time) VALUES (?, ?, ?, ?)',
      [sectionCp164, 'Monday', '10:00:00', '11:20:00']
    );
    await insert(
      'INSERT INTO ClassSchedule (section_id, day_of_week, start_time, end_time) VALUES (?, ?, ?, ?)',
      [sectionCp164, 'Wednesday', '10:00:00', '11:20:00']
    );
    await insert(
      'INSERT INTO ClassSchedule (section_id, day_of_week, start_time, end_time) VALUES (?, ?, ?, ?)',
      [sectionCp264, 'Tuesday', '13:00:00', '14:20:00']
    );

    const studentAccountId = await insert(
      'INSERT INTO Accounts (username, password_hash) VALUES (?, ?)',
      ['teststudent', studentPasswordHash]
    );
    const studentId = await insert(
      `INSERT INTO Students
         (account_id, first_name, last_name, student_email, student_phone,
          date_of_birth, program_id, GPA)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [studentAccountId, 'Test', 'Student', 'teststudent@example.edu', '5195551234', '2003-04-15', programId, 3.50]
    );

    const adminAccountId = await insert(
      'INSERT INTO Accounts (username, password_hash) VALUES (?, ?)',
      ['admin', adminPasswordHash]
    );
    await insert(
      'INSERT INTO Administrators (account_id, first_name, last_name, email) VALUES (?, ?, ?, ?)',
      [adminAccountId, 'Site', 'Admin', 'admin@example.edu']
    );

    await insert('INSERT INTO CoursePlans (student_id) VALUES (?)', [studentId]);
  });

  logger.info('Seed complete.');
  logger.info('Student login -> username: teststudent  password: Password123!');
  logger.info('Admin login   -> username: admin        password: Admin123!');
}

main()
  .catch((err) => {
    logger.error('Failed to seed the database:', err.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.close();
  });
