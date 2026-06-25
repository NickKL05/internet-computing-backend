'use strict';

const getStudents = (req, res) => {
    res.json({message: "Get all students"})
};

const getStudentById = (req, res) => {
    res.json({message: `Get student ${req.params.id}`})
};

const createStudent = (req, res) => {
    res.json({message: "Create student"})
};

const updateStudent = (req, res) => {
    res.json({message: `Update student information ${req.params.id}`})
};

const deleteStudent = (req, res) => {
    res.json({message: `Delete student ${req.params.id}`})
};

const getStudentSchedule = (req, res) => {
    res.json({message: `View student schedule ${req.params.id}`})
};

const getStudentEnrollments = (req, res) => {
    res.json({message: `View student current enrollment ${req.params.id}`})
};

const getStudentWaitlist = (req, res) => {
    res.json({message: `View student waitlist ${req.params.id}`})
};

module.exports = {
    getStudents,
    getStudentSchedule,
    getStudentEnrollments,
    getStudentWaitlist,
    getStudentById,
    createStudent,
    updateStudent,
    deleteStudent
};
