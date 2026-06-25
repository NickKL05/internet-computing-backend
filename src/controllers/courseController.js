'use strict';

const getCourses = (req, res) => {
    res.json({message: "Get all courses"})
};

const getCourseById = (req, res) => {
    res.json({message: `Get course ${req.params.id}`})
};

const createCourse = (req, res) => {
    res.json({message: "Create course"})
};

const updateCourse = (req, res) => {
    res.json({message: `Update course ${req.params.id}`})
};

const deleteCourse = (req, res) => {
    res.json({message: `Delete course ${req.params.id}`})
};

module.exports = {
  getCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
};