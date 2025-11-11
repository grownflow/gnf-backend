const request = require('supertest');
const express = require('express');
const routes = require('../../../src/api/routes/index');
const { User } = require('../../../src/models');
const { getCollection, close } = require('../../../src/db');

// Create a test app with the routes
const app = express();
app.use(express.json());
app.use('/api', routes);

describe('Auth Routes', () => {
  // Clean up test users before and after tests
  beforeAll(async () => {
    const users = await getCollection('users');
    await users.deleteMany({ email: { $regex: /^test@/ } });
  });

  afterAll(async () => {
    const users = await getCollection('users');
    await users.deleteMany({ email: { $regex: /^test@/ } });
    await close();
  });

  describe('POST /api/auth/register', () => {
    test('should register a new user successfully', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123'
        })
        .expect(201);

      expect(response.body).toHaveProperty('message', 'User registered successfully');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('id');
      expect(response.body.user).toHaveProperty('name', 'Test User');
      expect(response.body.user).toHaveProperty('email', 'test@example.com');
      expect(response.body.user).toHaveProperty('role', 'user');
      expect(response.body.user).toHaveProperty('is_verified', false);
      expect(response.body.user).not.toHaveProperty('password_hash');
    });

    test('should return 400 for missing required fields', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User'
          // Missing email and password
        })
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Missing required fields');
      expect(response.body).toHaveProperty('details');
    });

    test('should return 400 for invalid email format', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: 'invalid-email',
          password: 'password123'
        })
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Invalid email');
    });

    test('should return 400 for password too short', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: 'test2@example.com',
          password: 'short'
        })
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Invalid password');
      expect(response.body.details).toContain('8 characters');
    });

    test('should return 400 for name too short', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'A',
          email: 'test3@example.com',
          password: 'password123'
        })
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Invalid name');
    });

    test('should return 409 for duplicate email', async () => {
      // Register first user
      await request(app)
        .post('/api/auth/register')
        .send({
          name: 'First User',
          email: 'duplicate@example.com',
          password: 'password123'
        })
        .expect(201);

      // Try to register with same email
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Second User',
          email: 'duplicate@example.com',
          password: 'password456'
        })
        .expect(409);

      expect(response.body).toHaveProperty('error', 'Email already registered');
    });

    test('should accept optional role parameter', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Admin User',
          email: 'admin@example.com',
          password: 'password123',
          role: 'admin'
        })
        .expect(201);

      expect(response.body.user).toHaveProperty('role', 'admin');
    });

    test('should trim name and email', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: '  Trimmed User  ',
          email: '  trimmed@example.com  ',
          password: 'password123'
        })
        .expect(201);

      expect(response.body.user.name).toBe('Trimmed User');
      expect(response.body.user.email).toBe('trimmed@example.com');
    });

    test('should lowercase email', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Case Test',
          email: 'UPPERCASE@EXAMPLE.COM',
          password: 'password123'
        })
        .expect(201);

      expect(response.body.user.email).toBe('uppercase@example.com');
    });
  });

  describe('GET /api/auth/me', () => {
    test('should return 501 (not implemented)', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .expect(501);

      expect(response.body).toHaveProperty('error', 'Not implemented');
    });
  });
});

