'use strict';

const express = require('express');

const router = express.Router();

router.get('/', (req, res) => {
  res.json({
    message: 'Course Registration API',
    routes: [],
  });
});

module.exports = router;
