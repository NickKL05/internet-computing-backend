'use strict';

const getEnrollments = (req, res) => {
    res.json({message: "Get all enrollments"})
};

const getEnrollmentById = (req, res) => {
    res.json({message: `Get one enrollment record ${req.params.id}`})
};

const registerStudent = (req, res) => {
    res.json({message: "Register student in course section"})
};

const dropStudent = (req, res) => {
    res.json({message: `Drop a student from a course section ${req.params.id}`})
};

const updateEnrollments = (req, res) => {
    res.json({message: `Update enrollment status ${req.params.id}`})
};

const swapSections = (req, res) => {
    res.json({message: `Swaps one section for another ${req.params.id}`})
};

module.exports = {
    getEnrollments,
    getEnrollmentById,
    registerStudent,
    dropStudent,
    updateEnrollments,
    swapSections
};
