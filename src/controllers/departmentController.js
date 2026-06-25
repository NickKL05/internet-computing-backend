'use strict';

const getDepartments = (req, res) => {
  res.json({ message: 'Get all departments' });
};

const getDepartmentById = (req, res) => {
  res.json({ message: `Get department with ID ${req.params.id}` });
};

const createDepartment = (req, res) => {
  res.json({ message: 'Create new department' });
};

const updateDepartment = (req, res) => {
  res.json({ message: `Update department with ID ${req.params.id}` });
};

const deleteDepartment = (req, res) => {
  res.json({ message: `Delete department with ID ${req.params.id}` });
};

const getDepartmentCourses = (req, res) => {
  res.json({ message: `Get courses for department with ID ${req.params.id}` });
};

module.exports = {
  getDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  getDepartmentCourses,
};
