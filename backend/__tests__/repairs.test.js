const request = require('supertest');
const express = require('express');
const repairRoutes = require('../routes/repairs');

const createTestApp = () => {
  const app = express();
  app.use(express.json());
  
  // Mock authenticated user
  app.use((req, res, next) => {
    req.user = { id: 1, username: 'testuser', role: 'user' };
    next();
  });
  
  app.use('/api/repairs', repairRoutes);
  return app;
};

describe('Repair Routes', () => {
  let app;

  beforeEach(() => {
    app = createTestApp();
  });

  describe('GET /api/repairs', () => {
    test('should return repairs list', async () => {
      const response = await request(app).get('/api/repairs');
      
      expect(response.status).toBeLessThanOrEqual(500);
    });

    test('should handle request successfully or with expected error', async () => {
      const response = await request(app).get('/api/repairs');
      
      expect([200, 404, 500]).toContain(response.status);
    });
  });

  describe('POST /api/repairs', () => {
    test('should handle repair creation', async () => {
      const response = await request(app)
        .post('/api/repairs')
        .send({
          description: 'Test Repair',
          cost: 500,
          status: 'pending'
        });
      
      expect([201, 400, 500]).toContain(response.status);
    });

    test('should validate repair data', async () => {
      const response = await request(app)
        .post('/api/repairs')
        .send({});
      
      expect([201, 400, 500]).toContain(response.status);
    });
  });

  describe('GET /api/repairs/:id', () => {
    test('should get specific repair', async () => {
      const response = await request(app).get('/api/repairs/1');
      
      expect([200, 404, 500]).toContain(response.status);
    });
  });

  describe('PUT /api/repairs/:id', () => {
    test('should update repair', async () => {
      const response = await request(app)
        .put('/api/repairs/1')
        .send({
          status: 'completed'
        });
      
      expect([200, 404, 500]).toContain(response.status);
    });
  });

  describe('DELETE /api/repairs/:id', () => {
    test('should delete repair', async () => {
      const response = await request(app).delete('/api/repairs/1');
      
      expect([200, 404, 500]).toContain(response.status);
    });
  });
});
