'use strict';

const getWaitlists = (req, res) => {
  res.json({ message: 'Get all waitlist records' });
};

const getWaitlistById = (req, res) => {
  res.json({ message: `Get waitlist record with ID ${req.params.id}` });
};

const addToWaitlist = (req, res) => {
  res.json({ message: 'Add student to waitlist' });
};

const removeFromWaitlist = (req, res) => {
  res.json({ message: `Remove waitlist record with ID ${req.params.id}` });
};

const getWaitlistBySection = (req, res) => {
  res.json({ message: `Get waitlist for section with ID ${req.params.sectionId}` });
};

const getWaitlistByStudent = (req, res) => {
  res.json({ message: `Get waitlist records for student with ID ${req.params.studentId}` });
};

module.exports = {
  getWaitlists,
  getWaitlistById,
  addToWaitlist,
  removeFromWaitlist,
  getWaitlistBySection,
  getWaitlistByStudent,
};
