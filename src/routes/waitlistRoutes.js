'use strict';

const express = require('express');

const  {
  getWaitlists,
  getWaitlistById,
  addToWaitlist,
  removeFromWaitlist,
  getWaitlistBySection,
  getWaitlistByStudent,
} = require('../controllers/waitlistController');

const router = express.Router();

router.get('/', getWaitlists);
router.get('/section/:sectionId', getWaitlistBySection);
router.get('/student/:studentId', getWaitlistByStudent);
router.get('/:id', getWaitlistById);
router.post('/', addToWaitlist);
router.delete('/:id', removeFromWaitlist);

module.exports = router;