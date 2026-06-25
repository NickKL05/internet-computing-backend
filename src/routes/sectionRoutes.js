'use strict';

const express = require('express');

const {
    getSections,
    getSectionById,
    createSection,
    updateSection,
    deleteSection,
    getSectionSeats,
    getSectionEnrolledStudents
} = require('../controllers/sectionController');

const router = express.Router();

router.get("/", getSections);
router.get("/:id", getSectionById);
router.post("/", createSection); 
router.put("/:id", updateSection); 
router.delete("/:id", deleteSection); 
router.get("/:id/seats", getSectionSeats);
router.get("/:id/students", getSectionEnrolledStudents);

module.exports = router;