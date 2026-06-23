'use strict';

const authorize = require('../src/middleware/authorize');

describe('authorize middleware', () => {
  test('calls next with no error when the role is allowed', () => {
    const next = jest.fn();
    authorize('admin')({ user: { role: 'admin' } }, {}, next);
    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith();
  });

  test('rejects with 403 when the role is not allowed', () => {
    const next = jest.fn();
    authorize('admin')({ user: { role: 'student' } }, {}, next);
    const err = next.mock.calls[0][0];
    expect(err.statusCode).toBe(403);
    expect(err.code).toBe('FORBIDDEN_ROLE');
  });

  test('rejects with 401 when there is no authenticated user', () => {
    const next = jest.fn();
    authorize('admin')({}, {}, next);
    const err = next.mock.calls[0][0];
    expect(err.statusCode).toBe(401);
  });

  test('allows any role when none are specified', () => {
    const next = jest.fn();
    authorize()({ user: { role: 'student' } }, {}, next);
    expect(next).toHaveBeenCalledWith();
  });
});
