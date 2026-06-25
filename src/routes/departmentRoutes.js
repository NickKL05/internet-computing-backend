'use strict';

const express = require('express');

const {
  getDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  getDepartmentCourses,
} = require('../controllers/departmentController');

const router = express.Router();

router.get('/', getDepartments);
router.get('/:id/courses', getDepartmentCourses);
router.get('/:id', getDepartmentById);
router.post('/', createDepartment);
router.put('/:id', updateDepartment);
router.delete('/:id', deleteDepartment);

module.exports = router;