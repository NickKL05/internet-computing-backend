'use strict';

const getSections = (req, res) => {
    res.json({message: "Get all sections"})
};

const getSectionById = (req, res) => {
    res.json({message: `Get one section ${req.params.id}`})
};

const createSection = (req, res) => {
    res.json({message: "Create section"})
};

const updateSection = (req, res) => {
    res.json({message: `Update section information ${req.params.id}`})
};

const deleteSection = (req, res) => {
    res.json({message: `Delete section ${req.params.id}`})
};

const getSectionSeats = (req, res) => {
    res.json({message: `Get available seats in section ${req.params.id}`})
};

const getSectionEnrolledStudents = (req, res) => {
    res.json({message: `Get students enrolled in section ${req.params.id}`})
};

module.exports = {
    getSections,
    getSectionById,
    createSection,
    updateSection,
    deleteSection,
    getSectionSeats,
    getSectionEnrolledStudents
};
