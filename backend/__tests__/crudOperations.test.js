const request = require('supertest');
const express = require('express');

describe('CRUD Operations', () => {
  let app;
  let transactions = [];
  let repairs = [];
  let suppliers = [];
  let nextTransactionId = 1;
  let nextRepairId = 1;
  let nextSupplierId = 1;

  beforeEach(() => {
    app = express();
    app.use(express.json());

    // Reset data
    transactions = [];
    repairs = [];
    suppliers = [];
    nextTransactionId = 1;
    nextRepairId = 1;
    nextSupplierId = 1;

    // Transaction CRUD routes
    app.post('/api/transactions', (req, res) => {
      const { type, amount, description, date } = req.body;

      if (!type || !amount || !description) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      if (amount <= 0) {
        return res.status(400).json({ error: 'Amount must be positive' });
      }

      const transaction = {
        id: nextTransactionId++,
        type,
        amount,
        description,
        date: date || new Date().toISOString()
      };

      transactions.push(transaction);
      res.status(201).json(transaction);
    });

    app.get('/api/transactions', (req, res) => {
      res.status(200).json(transactions);
    });

    app.get('/api/transactions/:id', (req, res) => {
      const transaction = transactions.find(t => t.id === parseInt(req.params.id));
      if (!transaction) {
        return res.status(404).json({ error: 'Transaction not found' });
      }
      res.status(200).json(transaction);
    });

    app.put('/api/transactions/:id', (req, res) => {
      const transaction = transactions.find(t => t.id === parseInt(req.params.id));
      if (!transaction) {
        return res.status(404).json({ error: 'Transaction not found' });
      }

      const { amount, description } = req.body;
      if (amount && amount <= 0) {
        return res.status(400).json({ error: 'Amount must be positive' });
      }

      if (amount) transaction.amount = amount;
      if (description) transaction.description = description;

      res.status(200).json(transaction);
    });

    app.delete('/api/transactions/:id', (req, res) => {
      const index = transactions.findIndex(t => t.id === parseInt(req.params.id));
      if (index === -1) {
        return res.status(404).json({ error: 'Transaction not found' });
      }
      const deleted = transactions.splice(index, 1);
      res.status(200).json(deleted[0]);
    });

    // Repair CRUD routes
    app.post('/api/repairs', (req, res) => {
      const { itemName, cost, status } = req.body;

      if (!itemName || cost === undefined || !status) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      if (cost < 0) {
        return res.status(400).json({ error: 'Cost cannot be negative' });
      }

      const repair = {
        id: nextRepairId++,
        itemName,
        cost,
        status,
        dateCreated: new Date().toISOString()
      };

      repairs.push(repair);
      res.status(201).json(repair);
    });

    app.get('/api/repairs', (req, res) => {
      res.status(200).json(repairs);
    });

    app.get('/api/repairs/:id', (req, res) => {
      const repair = repairs.find(r => r.id === parseInt(req.params.id));
      if (!repair) {
        return res.status(404).json({ error: 'Repair not found' });
      }
      res.status(200).json(repair);
    });

    app.put('/api/repairs/:id', (req, res) => {
      const repair = repairs.find(r => r.id === parseInt(req.params.id));
      if (!repair) {
        return res.status(404).json({ error: 'Repair not found' });
      }

      const { cost, status } = req.body;
      if (cost !== undefined && cost < 0) {
        return res.status(400).json({ error: 'Cost cannot be negative' });
      }

      if (cost !== undefined) repair.cost = cost;
      if (status) repair.status = status;

      res.status(200).json(repair);
    });

    app.delete('/api/repairs/:id', (req, res) => {
      const index = repairs.findIndex(r => r.id === parseInt(req.params.id));
      if (index === -1) {
        return res.status(404).json({ error: 'Repair not found' });
      }
      const deleted = repairs.splice(index, 1);
      res.status(200).json(deleted[0]);
    });

    // Supplier CRUD routes
    app.post('/api/suppliers', (req, res) => {
      const { name, contact, email } = req.body;

      if (!name || !contact || !email) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      if (!email.includes('@')) {
        return res.status(400).json({ error: 'Invalid email' });
      }

      const supplier = {
        id: nextSupplierId++,
        name,
        contact,
        email,
        dateCreated: new Date().toISOString()
      };

      suppliers.push(supplier);
      res.status(201).json(supplier);
    });

    app.get('/api/suppliers', (req, res) => {
      res.status(200).json(suppliers);
    });

    app.get('/api/suppliers/:id', (req, res) => {
      const supplier = suppliers.find(s => s.id === parseInt(req.params.id));
      if (!supplier) {
        return res.status(404).json({ error: 'Supplier not found' });
      }
      res.status(200).json(supplier);
    });

    app.put('/api/suppliers/:id', (req, res) => {
      const supplier = suppliers.find(s => s.id === parseInt(req.params.id));
      if (!supplier) {
        return res.status(404).json({ error: 'Supplier not found' });
      }

      const { name, contact, email } = req.body;
      if (email && !email.includes('@')) {
        return res.status(400).json({ error: 'Invalid email' });
      }

      if (name) supplier.name = name;
      if (contact) supplier.contact = contact;
      if (email) supplier.email = email;

      res.status(200).json(supplier);
    });

    app.delete('/api/suppliers/:id', (req, res) => {
      const index = suppliers.findIndex(s => s.id === parseInt(req.params.id));
      if (index === -1) {
        return res.status(404).json({ error: 'Supplier not found' });
      }
      const deleted = suppliers.splice(index, 1);
      res.status(200).json(deleted[0]);
    });
  });

  describe('Transaction CRUD', () => {
    describe('Create Transaction (Positive Scenarios)', () => {
      test('should create transaction with valid data', async () => {
        const response = await request(app)
          .post('/api/transactions')
          .send({
            type: 'income',
            amount: 1000,
            description: 'Sale'
          });

        expect(response.status).toBe(201);
        expect(response.body.id).toBe(1);
        expect(response.body.amount).toBe(1000);
      });

      test('should create transaction with custom date', async () => {
        const date = '2024-01-01T00:00:00Z';
        const response = await request(app)
          .post('/api/transactions')
          .send({
            type: 'expense',
            amount: 500,
            description: 'Purchase',
            date
          });

        expect(response.status).toBe(201);
        expect(response.body.date).toBe(date);
      });

      test('should handle decimal amounts', async () => {
        const response = await request(app)
          .post('/api/transactions')
          .send({
            type: 'income',
            amount: 99.99,
            description: 'Partial payment'
          });

        expect(response.status).toBe(201);
        expect(response.body.amount).toBe(99.99);
      });
    });

    describe('Create Transaction (Negative Scenarios)', () => {
      test('should reject missing type', async () => {
        const response = await request(app)
          .post('/api/transactions')
          .send({
            amount: 1000,
            description: 'Sale'
          });

        expect(response.status).toBe(400);
      });

      test('should reject missing amount', async () => {
        const response = await request(app)
          .post('/api/transactions')
          .send({
            type: 'income',
            description: 'Sale'
          });

        expect(response.status).toBe(400);
      });

      test('should reject negative amount', async () => {
        const response = await request(app)
          .post('/api/transactions')
          .send({
            type: 'income',
            amount: -100,
            description: 'Invalid'
          });

        expect(response.status).toBe(400);
      });

      test('should reject zero amount', async () => {
        const response = await request(app)
          .post('/api/transactions')
          .send({
            type: 'income',
            amount: 0,
            description: 'Invalid'
          });

        expect(response.status).toBe(400);
      });
    });

    describe('Read Transaction (Positive Scenarios)', () => {
      beforeEach(async () => {
        await request(app)
          .post('/api/transactions')
          .send({
            type: 'income',
            amount: 1000,
            description: 'Test'
          });
      });

      test('should get all transactions', async () => {
        const response = await request(app).get('/api/transactions');

        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBe(1);
      });

      test('should get transaction by id', async () => {
        const response = await request(app).get('/api/transactions/1');

        expect(response.status).toBe(200);
        expect(response.body.id).toBe(1);
        expect(response.body.type).toBe('income');
      });
    });

    describe('Read Transaction (Negative Scenarios)', () => {
      test('should return 404 for non-existent transaction', async () => {
        const response = await request(app).get('/api/transactions/999');

        expect(response.status).toBe(404);
      });
    });

    describe('Update Transaction (Positive Scenarios)', () => {
      beforeEach(async () => {
        await request(app)
          .post('/api/transactions')
          .send({
            type: 'income',
            amount: 1000,
            description: 'Test'
          });
      });

      test('should update transaction amount', async () => {
        const response = await request(app)
          .put('/api/transactions/1')
          .send({ amount: 2000 });

        expect(response.status).toBe(200);
        expect(response.body.amount).toBe(2000);
      });

      test('should update transaction description', async () => {
        const response = await request(app)
          .put('/api/transactions/1')
          .send({ description: 'Updated description' });

        expect(response.status).toBe(200);
        expect(response.body.description).toBe('Updated description');
      });

      test('should update multiple fields', async () => {
        const response = await request(app)
          .put('/api/transactions/1')
          .send({
            amount: 1500,
            description: 'Updated'
          });

        expect(response.status).toBe(200);
        expect(response.body.amount).toBe(1500);
        expect(response.body.description).toBe('Updated');
      });
    });

    describe('Update Transaction (Negative Scenarios)', () => {
      beforeEach(async () => {
        await request(app)
          .post('/api/transactions')
          .send({
            type: 'income',
            amount: 1000,
            description: 'Test'
          });
      });

      test('should reject negative amount on update', async () => {
        const response = await request(app)
          .put('/api/transactions/1')
          .send({ amount: -500 });

        expect(response.status).toBe(400);
      });

      test('should return 404 for non-existent transaction on update', async () => {
        const response = await request(app)
          .put('/api/transactions/999')
          .send({ amount: 2000 });

        expect(response.status).toBe(404);
      });
    });

    describe('Delete Transaction (Positive Scenarios)', () => {
      beforeEach(async () => {
        await request(app)
          .post('/api/transactions')
          .send({
            type: 'income',
            amount: 1000,
            description: 'Test'
          });
      });

      test('should delete transaction', async () => {
        const response = await request(app).delete('/api/transactions/1');

        expect(response.status).toBe(200);
        expect(response.body.id).toBe(1);
      });

      test('should confirm deletion', async () => {
        await request(app).delete('/api/transactions/1');
        const getResponse = await request(app).get('/api/transactions');

        expect(getResponse.body.length).toBe(0);
      });
    });

    describe('Delete Transaction (Negative Scenarios)', () => {
      test('should return 404 for non-existent transaction on delete', async () => {
        const response = await request(app).delete('/api/transactions/999');

        expect(response.status).toBe(404);
      });
    });
  });

  describe('Repair CRUD', () => {
    describe('Create Repair (Positive Scenarios)', () => {
      test('should create repair with valid data', async () => {
        const response = await request(app)
          .post('/api/repairs')
          .send({
            itemName: 'Computer',
            cost: 500,
            status: 'pending'
          });

        expect(response.status).toBe(201);
        expect(response.body.itemName).toBe('Computer');
      });

      test('should handle zero cost', async () => {
        const response = await request(app)
          .post('/api/repairs')
          .send({
            itemName: 'Item',
            cost: 0,
            status: 'completed'
          });

        expect(response.status).toBe(201);
        expect(response.body.cost).toBe(0);
      });
    });

    describe('Create Repair (Negative Scenarios)', () => {
      test('should reject missing itemName', async () => {
        const response = await request(app)
          .post('/api/repairs')
          .send({
            cost: 500,
            status: 'pending'
          });

        expect(response.status).toBe(400);
      });

      test('should reject negative cost', async () => {
        const response = await request(app)
          .post('/api/repairs')
          .send({
            itemName: 'Computer',
            cost: -100,
            status: 'pending'
          });

        expect(response.status).toBe(400);
      });
    });

    describe('Update Repair (Positive Scenarios)', () => {
      beforeEach(async () => {
        await request(app)
          .post('/api/repairs')
          .send({
            itemName: 'Computer',
            cost: 500,
            status: 'pending'
          });
      });

      test('should update repair status', async () => {
        const response = await request(app)
          .put('/api/repairs/1')
          .send({ status: 'completed' });

        expect(response.status).toBe(200);
        expect(response.body.status).toBe('completed');
      });

      test('should update repair cost', async () => {
        const response = await request(app)
          .put('/api/repairs/1')
          .send({ cost: 750 });

        expect(response.status).toBe(200);
        expect(response.body.cost).toBe(750);
      });
    });

    describe('Delete Repair (Positive Scenarios)', () => {
      beforeEach(async () => {
        await request(app)
          .post('/api/repairs')
          .send({
            itemName: 'Computer',
            cost: 500,
            status: 'pending'
          });
      });

      test('should delete repair', async () => {
        const response = await request(app).delete('/api/repairs/1');

        expect(response.status).toBe(200);
        expect(response.body.id).toBe(1);
      });
    });
  });

  describe('Supplier CRUD', () => {
    describe('Create Supplier (Positive Scenarios)', () => {
      test('should create supplier with valid data', async () => {
        const response = await request(app)
          .post('/api/suppliers')
          .send({
            name: 'Supplier Co',
            contact: '555-1234',
            email: 'supplier@example.com'
          });

        expect(response.status).toBe(201);
        expect(response.body.name).toBe('Supplier Co');
      });
    });

    describe('Create Supplier (Negative Scenarios)', () => {
      test('should reject invalid email', async () => {
        const response = await request(app)
          .post('/api/suppliers')
          .send({
            name: 'Supplier Co',
            contact: '555-1234',
            email: 'invalidemail'
          });

        expect(response.status).toBe(400);
      });

      test('should reject missing email', async () => {
        const response = await request(app)
          .post('/api/suppliers')
          .send({
            name: 'Supplier Co',
            contact: '555-1234'
          });

        expect(response.status).toBe(400);
      });
    });

    describe('Update Supplier (Positive Scenarios)', () => {
      beforeEach(async () => {
        await request(app)
          .post('/api/suppliers')
          .send({
            name: 'Supplier Co',
            contact: '555-1234',
            email: 'supplier@example.com'
          });
      });

      test('should update supplier email', async () => {
        const response = await request(app)
          .put('/api/suppliers/1')
          .send({ email: 'newemail@example.com' });

        expect(response.status).toBe(200);
        expect(response.body.email).toBe('newemail@example.com');
      });
    });

    describe('Update Supplier (Negative Scenarios)', () => {
      beforeEach(async () => {
        await request(app)
          .post('/api/suppliers')
          .send({
            name: 'Supplier Co',
            contact: '555-1234',
            email: 'supplier@example.com'
          });
      });

      test('should reject invalid email on update', async () => {
        const response = await request(app)
          .put('/api/suppliers/1')
          .send({ email: 'invalidemail' });

        expect(response.status).toBe(400);
      });
    });

    describe('Delete Supplier (Positive Scenarios)', () => {
      beforeEach(async () => {
        await request(app)
          .post('/api/suppliers')
          .send({
            name: 'Supplier Co',
            contact: '555-1234',
            email: 'supplier@example.com'
          });
      });

      test('should delete supplier', async () => {
        const response = await request(app).delete('/api/suppliers/1');

        expect(response.status).toBe(200);
        expect(response.body.id).toBe(1);
      });
    });
  });
});
