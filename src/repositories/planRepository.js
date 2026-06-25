'use strict';

const baseRepository = require('./baseRepository');
const db = require('../db');

const repo = baseRepository('CoursePlans', 'plan_id', ['student_id', 'plan_name', 'active']);

repo.findByStudent = (studentId) =>
  db.query('SELECT * FROM CoursePlans WHERE student_id = ? ORDER BY created_at DESC', [studentId]);

repo.findItems = (planId) =>
  db.query(
    `SELECT cpi.plan_item_id, cpi.date_added,
            cs.section_id, cs.section_number, cs.delivery_mode,
            c.course_id, c.course_code, c.course_name, c.credits
       FROM CoursePlanItems cpi
       JOIN CourseSections cs ON cs.section_id = cpi.section_id
       JOIN Courses c ON c.course_id = cs.course_id
      WHERE cpi.plan_id = ?
      ORDER BY cpi.date_added`,
    [planId]
  );

repo.addItem = async (planId, sectionId) => {
  const result = await db.query(
    'INSERT INTO CoursePlanItems (plan_id, section_id) VALUES (?, ?)',
    [planId, sectionId]
  );
  return result.insertId;
};

repo.removeItem = async (planId, sectionId) => {
  const result = await db.query(
    'DELETE FROM CoursePlanItems WHERE plan_id = ? AND section_id = ?',
    [planId, sectionId]
  );
  return result.affectedRows > 0;
};

module.exports = repo;
