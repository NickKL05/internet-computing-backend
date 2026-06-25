'use strict';

const express = require('express');

const {
    getStudents,
    getStudentSchedule,
    getStudentEnrollments,
    getStudentWaitlist,
    getStudentById,
    createStudent,
    updateStudent,
    deleteStudent
} = require('../controllers/studentController');

const router = express.Router();

router.get("/", getStudents);
router.get("/:id/schedule", getStudentSchedule);
router.get("/:id/enrollments", getStudentEnrollments);
router.get("/:id/waitlist", getStudentWaitlist);
router.get("/:id", getStudentById);
router.post("/", createStudent);
router.put("/:id", updateStudent);
router.delete("/:id", deleteStudent);

module.exports = router;
