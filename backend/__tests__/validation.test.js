const request = require('supertest');
const express = require('express');

describe('Input Validation', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());

    // Simple validation route
    app.post('/api/test', (req, res) => {
      const { email, username, password } = req.body;

      // Email validation
      if (email && !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
        return res.status(400).json({ error: 'Invalid email format' });
      }

      // Username validation
      if (username && username.length < 3) {
        return res.status(400).json({ error: 'Username too short' });
      }

      // Password validation
      if (password && password.length < 6) {
        return res.status(400).json({ error: 'Password too short' });
      }

      res.status(200).json({ success: true });
    });
  });

  describe('Email Validation', () => {
    test('should accept valid email', async () => {
      const response = await request(app)
        .post('/api/test')
        .send({ email: 'user@example.com' });

      expect(response.status).toBe(200);
    });

    test('should reject email without @', async () => {
      const response = await request(app)
        .post('/api/test')
        .send({ email: 'userexample.com' });

      expect(response.status).toBe(400);
    });

    test('should reject email without domain', async () => {
      const response = await request(app)
        .post('/api/test')
        .send({ email: 'user@' });

      expect(response.status).toBe(400);
    });

    test('should reject email with spaces', async () => {
      const response = await request(app)
        .post('/api/test')
        .send({ email: 'user @example.com' });

      expect(response.status).toBe(400);
    });

    test('should accept email with + sign', async () => {
      const response = await request(app)
        .post('/api/test')
        .send({ email: 'user+tag@example.com' });

      expect(response.status).toBe(200);
    });
  });

  describe('Username Validation', () => {
    test('should accept valid username', async () => {
      const response = await request(app)
        .post('/api/test')
        .send({ username: 'validuser' });

      expect(response.status).toBe(200);
    });

    test('should reject username too short', async () => {
      const response = await request(app)
        .post('/api/test')
        .send({ username: 'ab' });

      expect(response.status).toBe(400);
    });

    test('should accept username when field is not provided', async () => {
      const response = await request(app)
        .post('/api/test')
        .send({ email: 'test@example.com', password: 'password' });

      expect(response.status).toBe(200);
    });

    test('should accept 3 character username', async () => {
      const response = await request(app)
        .post('/api/test')
        .send({ username: 'abc' });

      expect(response.status).toBe(200);
    });

    test('should accept long username', async () => {
      const response = await request(app)
        .post('/api/test')
        .send({ username: 'averylongusernamewithlotofcharacters' });

      expect(response.status).toBe(200);
    });
  });

  describe('Password Validation', () => {
    test('should accept valid password', async () => {
      const response = await request(app)
        .post('/api/test')
        .send({ password: 'validPassword123' });

      expect(response.status).toBe(200);
    });

    test('should reject short password', async () => {
      const response = await request(app)
        .post('/api/test')
        .send({ password: '12345' });

      expect(response.status).toBe(400);
    });

    test('should accept password when field is not provided', async () => {
      const response = await request(app)
        .post('/api/test')
        .send({ email: 'test@example.com', username: 'testuser' });

      expect(response.status).toBe(200);
    });

    test('should accept 6 character password', async () => {
      const response = await request(app)
        .post('/api/test')
        .send({ password: 'abc123' });

      expect(response.status).toBe(200);
    });

    test('should accept password with special characters', async () => {
      const response = await request(app)
        .post('/api/test')
        .send({ password: 'Pass@123!word' });

      expect(response.status).toBe(200);
    });
  });

  describe('Multiple Field Validation', () => {
    test('should validate all fields together', async () => {
      const response = await request(app)
        .post('/api/test')
        .send({
          email: 'user@example.com',
          username: 'validuser',
          password: 'strongPassword123'
        });

      expect(response.status).toBe(200);
    });

    test('should fail if any field is invalid', async () => {
      const response = await request(app)
        .post('/api/test')
        .send({
          email: 'user@example.com',
          username: 'ab', // Invalid
          password: 'strongPassword123'
        });

      expect(response.status).toBe(400);
    });
  });
});
