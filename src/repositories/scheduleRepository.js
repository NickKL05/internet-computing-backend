'use strict';

const baseRepository = require('./baseRepository');
const db = require('../db');

const DAY_ORDER =
  'FIELD(day_of_week, "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday")';

const repo = baseRepository('ClassSchedule', 'schedule_id', [
  'section_id',
  'day_of_week',
  'start_time',
  'end_time',
]);

repo.findBySection = (sectionId) =>
  db.query(
    `SELECT * FROM ClassSchedule WHERE section_id = ? ORDER BY ${DAY_ORDER}, start_time`,
    [sectionId]
  );

module.exports = repo;
