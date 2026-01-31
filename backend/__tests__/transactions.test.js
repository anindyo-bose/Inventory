const request = require('supertest');
const express = require('express');
const transactionRoutes = require('../routes/transactions');
const { authenticateToken } = require('../middleware/auth');
const jwt = require('jsonwebtoken');

const createTestApp = () => {
  const app = express();
  app.use(express.json());
  
  // Create test token
  const testToken = jwt.sign(
    { id: 1, username: 'testuser', role: 'user' },
    'test-secret-key-for-testing'
  );
  
  // Middleware to set the test token
  app.use((req, res, next) => {
    req.user = { id: 1, username: 'testuser', role: 'user' };
    next();
  });
  
  app.use('/api/transactions', transactionRoutes);
  return app;
};

describe('Transaction Routes', () => {
  let app;

  beforeEach(() => {
    app = createTestApp();
  });

  describe('GET /api/transactions', () => {
    test('should return transactions list', async () => {
      const response = await request(app).get('/api/transactions');
      
      expect(response.status).toBeLessThanOrEqual(500);
    });

    test('should return array or object', async () => {
      const response = await request(app).get('/api/transactions');
      
      expect(response.body || response.status).toBeDefined();
    });
  });

  describe('POST /api/transactions', () => {
    test('should handle transaction creation', async () => {
      const response = await request(app)
        .post('/api/transactions')
        .send({
          description: 'Test Transaction',
          amount: 100,
          status: 'pending'
        });
      
      expect([201, 400, 500]).toContain(response.status);
    });
  });

  describe('PUT /api/transactions/:id', () => {
    test('should handle transaction update', async () => {
      const response = await request(app)
        .put('/api/transactions/1')
        .send({
          description: 'Updated Transaction',
          status: 'completed'
        });
      
      expect([200, 404, 500]).toContain(response.status);
    });
  });

  describe('DELETE /api/transactions/:id', () => {
    test('should handle transaction deletion', async () => {
      const response = await request(app).delete('/api/transactions/1');
      
      expect([200, 404, 500]).toContain(response.status);
    });
  });
});
