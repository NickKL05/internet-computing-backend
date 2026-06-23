'use strict';

const request = require('supertest');
const createApp = require('../src/app');

const app = createApp();

describe('application wiring', () => {
  test('GET / returns API info', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('name');
    expect(res.body.api).toBe('/api');
  });

  test('GET /api returns the API index', async () => {
    const res = await request(app).get('/api');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('routes');
  });

  test('unknown routes return a 404 error envelope', async () => {
    const res = await request(app).get('/does-not-exist');
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error');
    expect(res.body.error).toHaveProperty('message');
  });
});
