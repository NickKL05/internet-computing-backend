'use strict';

const getPrograms = (req, res) => {
  res.json({ message: 'Get all programs' });
};

const getProgramById = (req, res) => {
  res.json({ message: `Get program with ID ${req.params.id}` });
};

const createProgram = (req, res) => {
  res.json({ message: 'Create new program' });
};

const updateProgram = (req, res) => {
  res.json({ message: `Update program with ID ${req.params.id}` });
};

const deleteProgram = (req, res) => {
  res.json({ message: `Delete program with ID ${req.params.id}` });
};

const getProgramCourses = (req, res) => {
  res.json({ message: `Get required courses for program with ID ${req.params.id}` });
};

module.exports = {
  getPrograms,
  getProgramById,
  createProgram,
  updateProgram,
  deleteProgram,
  getProgramCourses
};