'use strict';

const express = require('express');

const {
  getPrograms,
  getProgramById,
  createProgram,
  updateProgram,
  deleteProgram,
  getProgramCourses
} = require('../controllers/programController');

const router = express.Router();

router.get('/', getPrograms);
router.get('/:id/courses', getProgramCourses);
router.get('/:id', getProgramById);
router.post('/', createProgram);
router.put('/:id', updateProgram);
router.delete('/:id', deleteProgram);

module.exports = router;