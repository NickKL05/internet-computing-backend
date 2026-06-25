'use strict';

const ApiError = require('./ApiError');

function parseId(value, name = 'id') {
  const n = Number(value);
  if (!Number.isInteger(n) || n <= 0) {
    throw ApiError.badRequest(`Invalid ${name}`);
  }
  return n;
}

function parsePagination(query = {}) {
  const limit = Math.min(Math.max(Number.parseInt(query.limit, 10) || 100, 1), 500);
  const offset = Math.max(Number.parseInt(query.offset, 10) || 0, 0);
  return { limit, offset };
}

function requireFields(body, fields) {
  const missing = fields.filter(
    (f) => body[f] === undefined || body[f] === null || body[f] === ''
  );
  if (missing.length > 0) {
    throw ApiError.badRequest(`Missing required fields: ${missing.join(', ')}`, {
      code: 'VALIDATION_ERROR',
      details: { missing },
    });
  }
}

module.exports = { parseId, parsePagination, requireFields };
