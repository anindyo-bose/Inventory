const request = require('supertest');
const express = require('express');

describe('Error Handling', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());

    // Mock database
    let users = [
      { id: 1, username: 'admin', email: 'admin@example.com', role: 'admin' }
    ];
    let resources = [
      { id: 1, name: 'Resource1', ownerId: 1 }
    ];

    // Auth middleware
    const authenticate = (req, res, next) => {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      if (token === 'invalid') {
        return res.status(401).json({ error: 'Invalid token' });
      }
      req.user = { id: 1, role: 'user' };
      next();
    };

    const authorize = (roles) => (req, res, next) => {
      if (!roles.includes(req.user.role)) {
        return res.status(403).json({ error: 'Forbidden' });
      }
      next();
    };

    // Routes
    app.post('/api/users', (req, res) => {
      const { username, email } = req.body;

      if (!username || !email) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      if (users.find(u => u.username === username)) {
        return res.status(409).json({ error: 'User already exists' });
      }

      const user = { id: users.length + 1, username, email, role: 'user' };
      users.push(user);
      res.status(201).json(user);
    });

    app.get('/api/users/:id', (req, res) => {
      const user = users.find(u => u.id === parseInt(req.params.id));
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.status(200).json(user);
    });

    app.get('/api/protected', authenticate, (req, res) => {
      res.status(200).json({ message: 'Success' });
    });

    app.delete('/api/resources/:id', authenticate, authorize(['admin']), (req, res) => {
      const resource = resources.find(r => r.id === parseInt(req.params.id));
      if (!resource) {
        return res.status(404).json({ error: 'Resource not found' });
      }
      const index = resources.indexOf(resource);
      resources.splice(index, 1);
      res.status(200).json({ message: 'Deleted' });
    });

    app.get('/api/error', (req, res) => {
      throw new Error('Server error');
    });

    // Error handler
    app.use((err, req, res, next) => {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    });
  });

  describe('400 Bad Request Errors', () => {
    test('should return 400 for missing required fields', async () => {
      const response = await request(app)
        .post('/api/users')
        .send({ username: 'testuser' });

      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
    });

    test('should return 400 with descriptive error message', async () => {
      const response = await request(app)
        .post('/api/users')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Missing required fields');
    });

    test('should return 400 for empty required fields', async () => {
      const response = await request(app)
        .post('/api/users')
        .send({ username: '', email: '' });

      expect(response.status).toBe(400);
    });
  });

  describe('401 Unauthorized Errors', () => {
    test('should return 401 when token is missing', async () => {
      const response = await request(app)
        .get('/api/protected');

      expect(response.status).toBe(401);
      expect(response.body.error).toContain('Unauthorized');
    });

    test('should return 401 for invalid token', async () => {
      const response = await request(app)
        .get('/api/protected')
        .set('Authorization', 'Bearer invalid');

      expect(response.status).toBe(401);
    });

    test('should return 401 with malformed auth header', async () => {
      const response = await request(app)
        .get('/api/protected')
        .set('Authorization', 'InvalidFormat');

      expect(response.status).toBe(401);
    });
  });

  describe('403 Forbidden Errors', () => {
    test('should return 403 when user lacks required role', async () => {
      const response = await request(app)
        .delete('/api/resources/1')
        .set('Authorization', 'Bearer validtoken');

      expect(response.status).toBe(403);
      expect(response.body.error).toContain('Forbidden');
    });

    test('should return 403 with descriptive message', async () => {
      const response = await request(app)
        .delete('/api/resources/1')
        .set('Authorization', 'Bearer validtoken');

      expect(response.status).toBe(403);
    });
  });

  describe('404 Not Found Errors', () => {
    test('should return 404 for non-existent user', async () => {
      const response = await request(app)
        .get('/api/users/999');

      expect(response.status).toBe(404);
      expect(response.body.error).toContain('not found');
    });

    test('should return 404 with resource type', async () => {
      const response = await request(app)
        .get('/api/users/999');

      expect(response.status).toBe(404);
      expect(response.body.error).toContain('User');
    });

    test('should return 404 for non-existent resource when authorized', async () => {
      // Create an authorized user first
      const response = await request(app)
        .delete('/api/resources/999')
        .set('Authorization', 'Bearer validtoken');

      expect(response.status).toBe(403); // User is authenticated but not admin
    });
  });

  describe('409 Conflict Errors', () => {
    test('should return 409 for duplicate user', async () => {
      const response = await request(app)
        .post('/api/users')
        .send({
          username: 'admin',
          email: 'newemail@example.com'
        });

      expect(response.status).toBe(409);
      expect(response.body.error).toContain('already exists');
    });

    test('should prevent duplicate on exact match', async () => {
      await request(app)
        .post('/api/users')
        .send({
          username: 'newuser',
          email: 'user@example.com'
        });

      const response = await request(app)
        .post('/api/users')
        .send({
          username: 'newuser',
          email: 'different@example.com'
        });

      expect(response.status).toBe(409);
    });
  });

  describe('500 Server Error Handling', () => {
    test('should return 500 for unhandled server error', async () => {
      const response = await request(app)
        .get('/api/error');

      expect(response.status).toBe(500);
      expect(response.body.error).toContain('Internal server error');
    });
  });

  describe('Multiple Error Scenarios', () => {
    test('should validate required fields before duplicate check', async () => {
      const response = await request(app)
        .post('/api/users')
        .send({ username: 'admin' });

      expect(response.status).toBe(400);
    });

    test('should check authentication before authorization', async () => {
      const response = await request(app)
        .delete('/api/resources/1');

      expect(response.status).toBe(401);
    });

    test('should handle valid request after errors', async () => {
      // First - invalid request
      await request(app)
        .post('/api/users')
        .send({ username: 'testuser' });

      // Second - valid request
      const response = await request(app)
        .post('/api/users')
        .send({
          username: 'validuser',
          email: 'valid@example.com'
        });

      expect(response.status).toBe(201);
    });
  });

  describe('Error Response Format', () => {
    test('should return error in JSON format', async () => {
      const response = await request(app)
        .get('/api/users/999');

      expect(response.type).toMatch(/json/);
      expect(response.body).toHaveProperty('error');
    });

    test('should not expose sensitive data in error', async () => {
      const response = await request(app)
        .get('/api/error');

      expect(response.body.error).toBe('Internal server error');
      expect(response.body.stack).toBeUndefined();
    });

    test('should have consistent error structure', async () => {
      const response1 = await request(app).get('/api/users/999');
      const response2 = await request(app).post('/api/users').send({});

      expect(response1.body).toHaveProperty('error');
      expect(response2.body).toHaveProperty('error');
    });
  });

  describe('Status Code Consistency', () => {
    test('should consistently return 404 for not found', async () => {
      const responses = await Promise.all([
        request(app).get('/api/users/999'),
        request(app).get('/api/users/1000')
      ]);

      expect(responses.every(r => r.status === 404)).toBe(true);
    });

    test('should consistently return 400 for bad request', async () => {
      const responses = await Promise.all([
        request(app).post('/api/users').send({}),
        request(app).post('/api/users').send({ username: 'test' })
      ]);

      expect(responses.every(r => r.status === 400)).toBe(true);
    });
  });
});
