const request = require('supertest');
const express = require('express');
const cors = require('cors');
const authRoutes = require('../routes/auth');

// Create a test app
const createTestApp = () => {
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use('/api/auth', authRoutes);
  return app;
};

describe('Authentication Routes', () => {
  let app;

  beforeEach(() => {
    app = createTestApp();
  });

  describe('POST /api/auth/login', () => {
    test('should successfully login with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'superadmin',
          password: 'admin123'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.role).toBe('super_admin');
      expect(response.body.user.username).toBe('superadmin');
    });

    test('should login with email instead of username', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'admin@example.com',
          password: 'admin123'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
    });

    test('should reject login with invalid username', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'invaliduser',
          password: 'admin123'
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toBe('Invalid credentials');
    });

    test('should reject login with invalid password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'superadmin',
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Invalid credentials');
    });

    test('should reject login without username', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          password: 'admin123'
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('errors');
    });

    test('should reject login without password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'superadmin'
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('errors');
    });

    test('should generate valid JWT token', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'user',
          password: 'admin123'
        });

      expect(response.status).toBe(200);
      const token = response.body.token;
      expect(token).toMatch(/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/);
    });

    test('should return user object with all required fields', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'viewer',
          password: 'admin123'
        });

      expect(response.status).toBe(200);
      const user = response.body.user;
      expect(user).toHaveProperty('id');
      expect(user).toHaveProperty('username');
      expect(user).toHaveProperty('email');
      expect(user).toHaveProperty('role');
      expect(user).toHaveProperty('name');
      expect(user).not.toHaveProperty('password');
    });

    test('should handle all user roles', async () => {
      const roles = [
        { username: 'superadmin', expectedRole: 'super_admin' },
        { username: 'admin', expectedRole: 'admin' },
        { username: 'user', expectedRole: 'user' },
        { username: 'viewer', expectedRole: 'viewer' }
      ];

      for (const roleTest of roles) {
        const response = await request(app)
          .post('/api/auth/login')
          .send({
            username: roleTest.username,
            password: 'admin123'
          });

        expect(response.status).toBe(200);
        expect(response.body.user.role).toBe(roleTest.expectedRole);
      }
    });
  });

  describe('GET /api/auth/me', () => {
    test('should get current authenticated user', async () => {
      // First login to get token
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'admin',
          password: 'admin123'
        });

      const token = loginResponse.body.token;

      // Then get current user
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('user');
    });

    test('should reject request without token', async () => {
      const response = await request(app)
        .get('/api/auth/me');

      expect(response.status).toBe(401);
    });

    test('should reject with invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalidtoken');

      expect(response.status).toBe(403);
    });
  });

  describe('POST /api/auth/users (Create user)', () => {
    test('should create new user as super admin', async () => {
      // Login as super admin
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'superadmin',
          password: 'admin123'
        });

      const token = loginResponse.body.token;

      // Create new user
      const response = await request(app)
        .post('/api/auth/users')
        .set('Authorization', `Bearer ${token}`)
        .send({
          username: 'newuser',
          email: 'newuser@example.com',
          password: 'password123',
          role: 'user',
          name: 'New User'
        });

      expect([201, 409]).toContain(response.status);
    });

    test('should reject if non-super-admin creates user', async () => {
      // Login as regular user
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'user',
          password: 'admin123'
        });

      const token = loginResponse.body.token;

      // Try to create user
      const response = await request(app)
        .post('/api/auth/users')
        .set('Authorization', `Bearer ${token}`)
        .send({
          username: 'another',
          email: 'another@example.com',
          password: 'password123',
          role: 'user',
          name: 'Another User'
        });

      expect(response.status).toBe(403);
    });

    test('should validate user data', async () => {
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'superadmin',
          password: 'admin123'
        });

      const token = loginResponse.body.token;

      // Missing required fields
      const response = await request(app)
        .post('/api/auth/users')
        .set('Authorization', `Bearer ${token}`)
        .send({
          username: 'incomplete'
        });

      expect(response.status).toBe(400);
    });

    test('should reject duplicate username', async () => {
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'superadmin',
          password: 'admin123'
        });

      const token = loginResponse.body.token;

      const response = await request(app)
        .post('/api/auth/users')
        .set('Authorization', `Bearer ${token}`)
        .send({
          username: 'admin',
          email: 'duplicate@example.com',
          password: 'password123',
          role: 'user',
          name: 'Duplicate'
        });

      expect(response.status).toBe(409);
    });

    test('should reject duplicate email', async () => {
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'superadmin',
          password: 'admin123'
        });

      const token = loginResponse.body.token;

      const response = await request(app)
        .post('/api/auth/users')
        .set('Authorization', `Bearer ${token}`)
        .send({
          username: 'uniqueuser',
          email: 'admin@example.com',
          password: 'password123',
          role: 'user',
          name: 'Unique'
        });

      expect(response.status).toBe(409);
    });

    test('should validate email format', async () => {
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'superadmin',
          password: 'admin123'
        });

      const token = loginResponse.body.token;

      const response = await request(app)
        .post('/api/auth/users')
        .set('Authorization', `Bearer ${token}`)
        .send({
          username: 'newuser2',
          email: 'invalidemail',
          password: 'password123',
          role: 'user',
          name: 'New User'
        });

      expect(response.status).toBe(400);
    });

    test('should validate password length', async () => {
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'superadmin',
          password: 'admin123'
        });

      const token = loginResponse.body.token;

      const response = await request(app)
        .post('/api/auth/users')
        .set('Authorization', `Bearer ${token}`)
        .send({
          username: 'newuser3',
          email: 'newuser3@example.com',
          password: 'short',
          role: 'user',
          name: 'New User'
        });

      expect(response.status).toBe(400);
    });

    test('should validate role is one of allowed roles', async () => {
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'superadmin',
          password: 'admin123'
        });

      const token = loginResponse.body.token;

      const response = await request(app)
        .post('/api/auth/users')
        .set('Authorization', `Bearer ${token}`)
        .send({
          username: 'newuser4',
          email: 'newuser4@example.com',
          password: 'password123',
          role: 'invalid_role',
          name: 'New User'
        });

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/auth/users (List users)', () => {
    test('should list all users as super admin', async () => {
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'superadmin',
          password: 'admin123'
        });

      const token = loginResponse.body.token;

      const response = await request(app)
        .get('/api/auth/users')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('users');
      expect(Array.isArray(response.body.users)).toBe(true);
      expect(response.body.users.length).toBeGreaterThan(0);
      
      // Ensure passwords are not included
      response.body.users.forEach(user => {
        expect(user).not.toHaveProperty('password');
      });
    });

    test('should reject list users for non-super-admin', async () => {
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'user',
          password: 'admin123'
        });

      const token = loginResponse.body.token;

      const response = await request(app)
        .get('/api/auth/users')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(403);
    });

    test('should reject list users without authentication', async () => {
      const response = await request(app)
        .get('/api/auth/users');

      expect(response.status).toBe(401);
    });
  });
});
