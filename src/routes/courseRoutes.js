'use strict';

const express = require('express');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const courseController = require('../controllers/courseController');

const router = express.Router();

router.get('/', courseController.list);
router.get('/:id', courseController.getById);
router.post('/', authenticate, authorize('admin'), courseController.create);
router.put('/:id', authenticate, authorize('admin'), courseController.update);
router.delete('/:id', authenticate, authorize('admin'), courseController.remove);

module.exports = router;
