'use strict';

const crudService = require('./crudService');
const repo = require('../repositories/enrollmentRepository');
const registrationService = require('./registrationService');
const ApiError = require('../utils/ApiError');

const service = crudService(repo, 'Enrollment');

service.list = (options) => repo.findAllDetailed(options);

service.get = async (id) => {
  const enrollment = await repo.findByIdDetailed(id);
  if (!enrollment) {
    throw ApiError.notFound('Enrollment not found');
  }
  return enrollment;
};

// raw row (student_id, section_id) used for ownership checks before drop/swap
service.findRaw = (id) => repo.findById(id);

service.register = (studentId, sectionId) => registrationService.registerSection(studentId, sectionId);
service.drop = (studentId, sectionId) => registrationService.dropSection(studentId, sectionId);
service.swap = (studentId, fromSectionId, toSectionId) =>
  registrationService.swapSection(studentId, fromSectionId, toSectionId);

module.exports = service;
