'use strict';

const express = require('express');

const {
  getSchedules,
  getScheduleById,
  createSchedule,
  updateSchedule,
  deleteSchedule,
  getScheduleBySection,
} = require('../controllers/scheduleController');

const router = express.Router();

router.get('/', getSchedules);
router.get('/section/:sectionId', getScheduleBySection);
router.get('/:id', getScheduleById);
router.post('/', createSchedule);
router.put('/:id', updateSchedule);
router.delete('/:id', deleteSchedule);

module.exports = router;