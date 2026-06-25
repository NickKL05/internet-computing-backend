'use strict';

const express = require('express');

const {
    getEnrollments,
    getEnrollmentById,
    registerStudent,
    dropStudent,
    updateEnrollments,
    swapSections
} = require('../controllers/enrollmentController');

const router = express.Router();

router.get("/", getEnrollments);
router.get("/:id", getEnrollmentById);
router.post("/", registerStudent);
router.delete("/:id", dropStudent);
router.put("/:id", updateEnrollments);
router.post("/:id/switch", swapSections);

module.exports = router;