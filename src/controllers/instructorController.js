'use strict';

const getInstructors = (req, res) => {
  res.json({ message: 'Get all instructors' });
};

const getInstructorById = (req, res) => {
  res.json({ message: `Get instructor with ID ${req.params.id}` });
};

const createInstructor = (req, res) => {
  res.json({ message: 'Create new instructor' });
};

const updateInstructor = (req, res) => {
  res.json({ message: `Update instructor with ID ${req.params.id}` });
};

const deleteInstructor = (req, res) => {
  res.json({ message: `Delete instructor with ID ${req.params.id}` });
};

const getInstructorSections = (req, res) => {
  res.json({ message: `Get sections taught by instructor with ID ${req.params.id}` });
};

module.exports = {
  getInstructors,
  getInstructorById,
  createInstructor,
  updateInstructor,
  deleteInstructor,
  getInstructorSections,
};
