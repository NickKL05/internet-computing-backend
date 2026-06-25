'use strict';

const getSchedules = (req, res) => {
  res.json({ message: 'Get all schedule entries' });
};

const getScheduleById = (req, res) => {
  res.json({ message: `Get schedule entry with ID ${req.params.id}` });
};

const createSchedule = (req, res) => {
  res.json({ message: 'Create new schedule entry' });
};

const updateSchedule = (req, res) => {
  res.json({ message: `Update schedule entry with ID ${req.params.id}` });
};

const deleteSchedule = (req, res) => {
  res.json({ message: `Delete schedule entry with ID ${req.params.id}` });
};

const getScheduleBySection = (req, res) => {
  res.json({ message: `Get schedule for section with ID ${req.params.sectionId}` });
};

module.exports = {
  getSchedules,
  getScheduleById,
  createSchedule,
  updateSchedule,
  deleteSchedule,
  getScheduleBySection,
};