'use strict';

const baseRepository = require('./baseRepository');
const db = require('../db');

const repo = baseRepository('Waitlists', 'waitlist_id', [
  'student_id',
  'section_id',
  'position',
  'date_joined',
]);

repo.findBySection = (sectionId) =>
  db.query(
    `SELECT w.waitlist_id, w.position, w.date_joined,
            s.student_id, s.first_name, s.last_name
       FROM Waitlists w
       JOIN Students s ON s.student_id = w.student_id
      WHERE w.section_id = ?
      ORDER BY w.position`,
    [sectionId]
  );

repo.findByStudent = (studentId) =>
  db.query(
    `SELECT w.waitlist_id, w.position, w.date_joined,
            cs.section_id, cs.section_number, c.course_code, c.course_name
       FROM Waitlists w
       JOIN CourseSections cs ON cs.section_id = w.section_id
       JOIN Courses c ON c.course_id = cs.course_id
      WHERE w.student_id = ?
      ORDER BY c.course_code`,
    [studentId]
  );

module.exports = repo;
