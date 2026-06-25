'use strict';

const express = require('express');

const courseRoutes = require('./courseRoutes');
const studentRoutes = require('./studentRoutes');
const sectionRoutes = require('./sectionRoutes');
const enrollmentRoutes = require('./enrollmentRoutes');
const departmentRoutes = require('./departmentRoutes');
const instructorRoutes = require('./instructorRoutes');
const scheduleRoutes = require('./scheduleRoutes');
const waitlistRoutes = require('./waitlistRoutes');
const programRoutes = require('./programRoutes');

const router = express.Router();

router.get('/', (req, res) => {
  res.json({
    message: 'Course Registration API',
    routes: [
      '/api/courses',
      '/api/students',
      '/api/sections',
      '/api/enrollments',
      '/api/departments',
      '/api/instructors',
      '/api/schedules',
      '/api/waitlists',
      '/api/programs',
    ],
  });
});

router.use('/courses', courseRoutes);
router.use('/students', studentRoutes);
router.use('/sections', sectionRoutes);
router.use('/enrollments', enrollmentRoutes);
router.use('/departments', departmentRoutes);
router.use('/instructors', instructorRoutes);
router.use('/schedules', scheduleRoutes);
router.use('/waitlists', waitlistRoutes);
router.use('/programs', programRoutes);

module.exports = router;
