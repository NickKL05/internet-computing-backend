'use strict';

const express = require('express');

const {
  getInstructors,
  getInstructorById,
  createInstructor,
  updateInstructor,
  deleteInstructor,
  getInstructorSections,
} = require('../controllers/instructorController');

const router = express.Router();

router.get('/', getInstructors);
router.get('/:id/sections', getInstructorSections);
router.get('/:id', getInstructorById);
router.post('/', createInstructor);
router.put('/:id', updateInstructor);
router.delete('/:id', deleteInstructor);

module.exports = router;