'use strict';

const crudService = require('./crudService');
const repo = require('../repositories/scheduleRepository');

const service = crudService(repo, 'Schedule entry');

service.bySection = (sectionId) => repo.findBySection(sectionId);

module.exports = service;
