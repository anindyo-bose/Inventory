const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();
const { authorizeRoles } = require('../middleware/auth');

// Mock transactions database (in production, use a real database)
let transactions = [
  {
    id: 1,
    transactionId: 'TXN-001',
    customerName: 'John Doe',
    items: [
      { name: 'Product A', quantity: 2, price: 100 },
      { name: 'Product B', quantity: 1, price: 50 }
    ],
    totalAmount: 250,
    sellingDone: true,
    paymentDone: true,
    date: new Date().toISOString(),
    createdBy: 'admin'
  },
  {
    id: 2,
    transactionId: 'TXN-002',
    customerName: 'Jane Smith',
    items: [
      { name: 'Product C', quantity: 3, price: 75 }
    ],
    totalAmount: 225,
    sellingDone: true,
    paymentDone: false,
    date: new Date().toISOString(),
    createdBy: 'user'
  }
];

// Get all transactions
router.get('/', (req, res) => {
  res.json({ transactions });
});

// Get transaction by ID
router.get('/:id', (req, res) => {
  const transaction = transactions.find(t => t.id === parseInt(req.params.id));
  if (!transaction) {
    return res.status(404).json({ message: 'Transaction not found' });
  }
  res.json({ transaction });
});

// Create new transaction (viewers cannot create)
router.post('/', authorizeRoles('super_admin', 'admin', 'user'), [
  body('customerName').notEmpty().withMessage('Customer name is required'),
  body('items').isArray().withMessage('Items must be an array'),
  body('items.*.name').notEmpty().withMessage('Item name is required'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('items.*.price').isFloat({ min: 0 }).withMessage('Price must be a positive number')
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { customerName, items } = req.body;
    const totalAmount = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    
    const newTransaction = {
      id: transactions.length + 1,
      transactionId: `TXN-${String(transactions.length + 1).padStart(3, '0')}`,
      customerName,
      items,
      totalAmount,
      sellingDone: false,
      paymentDone: false,
      date: new Date().toISOString(),
      createdBy: req.user.username
    };

    transactions.push(newTransaction);
    res.status(201).json({ transaction: newTransaction });
  } catch (error) {
    console.error('Create transaction error:', error);
    res.status(500).json({ message: 'Server error creating transaction' });
  }
});

// Update transaction status (viewers cannot update)
router.patch('/:id/status', authorizeRoles('super_admin', 'admin', 'user'), [
  body('sellingDone').optional().isBoolean(),
  body('paymentDone').optional().isBoolean()
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const transaction = transactions.find(t => t.id === parseInt(req.params.id));
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    if (req.body.sellingDone !== undefined) {
      transaction.sellingDone = req.body.sellingDone;
    }
    if (req.body.paymentDone !== undefined) {
      transaction.paymentDone = req.body.paymentDone;
    }

    res.json({ transaction });
  } catch (error) {
    console.error('Update transaction error:', error);
    res.status(500).json({ message: 'Server error updating transaction' });
  }
});

// Update transaction (viewers cannot update)
router.put('/:id', authorizeRoles('super_admin', 'admin', 'user'), [
  body('customerName').optional().notEmpty(),
  body('items').optional().isArray()
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const transaction = transactions.find(t => t.id === parseInt(req.params.id));
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    if (req.body.customerName) transaction.customerName = req.body.customerName;
    if (req.body.items) {
      transaction.items = req.body.items;
      transaction.totalAmount = req.body.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    }

    res.json({ transaction });
  } catch (error) {
    console.error('Update transaction error:', error);
    res.status(500).json({ message: 'Server error updating transaction' });
  }
});

// Delete transaction (viewers cannot delete)
router.delete('/:id', authorizeRoles('super_admin', 'admin', 'user'), (req, res) => {
  const index = transactions.findIndex(t => t.id === parseInt(req.params.id));
  if (index === -1) {
    return res.status(404).json({ message: 'Transaction not found' });
  }

  transactions.splice(index, 1);
  res.json({ message: 'Transaction deleted successfully' });
});

module.exports = router;



