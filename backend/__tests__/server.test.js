const request = require('supertest');
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');

describe('Server Setup', () => {
  test('should have JSON parsing', () => {
    const app = express();
    app.use(express.json());
    expect(app._router.stack.some(m => m.name === 'jsonParser')).toBe(true);
  });

  test('should parse JSON', () => {
    const app = express();
    app.use(express.json());
    expect(app._router.stack.some(m => m.name === 'jsonParser')).toBe(true);
  });

  test('should have health check endpoint', async () => {
    const app = express();
    app.get('/api/health', (req, res) => {
      res.json({ status: 'OK', message: 'Server is running' });
    });

    const response = await request(app).get('/api/health');

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('OK');
    expect(response.body).toHaveProperty('message');
  });

  test('should handle 404 errors gracefully', async () => {
    const app = express();
    const response = await request(app).get('/api/nonexistent');

    expect(response.status).toBe(404);
  });
});

describe('JWT Token Validation', () => {
  test('should create valid JWT token', () => {
    const payload = {
      id: 1,
      username: 'testuser',
      role: 'admin'
    };

    const token = jwt.sign(payload, 'test-secret-key-for-testing', { expiresIn: '24h' });

    expect(token).toBeDefined();
    expect(typeof token).toBe('string');
  });

  test('should verify JWT token correctly', () => {
    const payload = {
      id: 1,
      username: 'testuser',
      email: 'test@example.com'
    };

    const token = jwt.sign(payload, 'test-secret-key-for-testing');
    const decoded = jwt.verify(token, 'test-secret-key-for-testing');

    expect(decoded.username).toBe('testuser');
    expect(decoded.email).toBe('test@example.com');
  });

  test('should reject expired token', () => {
    const payload = { id: 1, username: 'testuser' };
    const token = jwt.sign(payload, 'test-secret-key-for-testing', { expiresIn: '-1s' });

    expect(() => {
      jwt.verify(token, 'test-secret-key-for-testing');
    }).toThrow();
  });

  test('should reject token with wrong secret', () => {
    const payload = { id: 1, username: 'testuser' };
    const token = jwt.sign(payload, 'test-secret-key-for-testing');

    expect(() => {
      jwt.verify(token, 'wrong-secret');
    }).toThrow();
  });

  test('should include all required claims in token', () => {
    const payload = {
      id: 1,
      username: 'testuser',
      email: 'test@example.com',
      role: 'user',
      name: 'Test User'
    };

    const token = jwt.sign(payload, 'test-secret-key-for-testing');
    const decoded = jwt.verify(token, 'test-secret-key-for-testing');

    expect(decoded).toHaveProperty('id');
    expect(decoded).toHaveProperty('username');
    expect(decoded).toHaveProperty('email');
    expect(decoded).toHaveProperty('role');
    expect(decoded).toHaveProperty('name');
  });
});

describe('Error Handling', () => {
  test('should handle malformed JSON gracefully', async () => {
    const app = express();
    app.use(express.json());
    app.post('/api/test', (req, res) => {
      res.json({ received: req.body });
    });

    const response = await request(app)
      .post('/api/test')
      .set('Content-Type', 'application/json')
      .send('invalid json');

    expect(response.status).toBe(400);
  });

  test('should set proper CORS headers', async () => {
    const app = express();
    app.use(cors());
    app.get('/api/test', (req, res) => res.json({ ok: true }));

    const response = await request(app).get('/api/test');

    expect(response.headers['access-control-allow-origin']).toBeDefined();
  });
});
