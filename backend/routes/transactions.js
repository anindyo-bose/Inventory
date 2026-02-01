const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();
const { authorizeRoles } = require('../middleware/auth');
const { filterAccessible, ensureAccessible, addTenantId } = require('../utils/dataIsolation');

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
// TENANT ISOLATION: Filters by tenantId if user is in a tenant
router.get('/', (req, res) => {
  // Filter transactions based on tenant context
  // BACKWARD COMPATIBILITY: If req.context is not set or tenantId is undefined,
  // returns all transactions (existing behavior)
  const accessibleTransactions = filterAccessible(transactions, req.context);
  res.json({ transactions: accessibleTransactions });
});

// Get transaction by ID
// TENANT ISOLATION: Verifies user has access to the transaction
router.get('/:id', (req, res) => {
  const transaction = transactions.find(t => t.id === parseInt(req.params.id));
  if (!transaction) {
    return res.status(404).json({ message: 'Transaction not found' });
  }
  
  // Check tenant isolation
  try {
    ensureAccessible(transaction, req.context, 'Transaction');
  } catch (error) {
    return res.status(error.status || 403).json({ message: error.message });
  }
  
  res.json({ transaction });
});

// Create new transaction (viewers cannot create)
// TENANT ISOLATION: Automatically adds tenantId to new transaction if user is in a tenant
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

    // Add tenantId if user is in a tenant
    addTenantId(newTransaction, req.context);

    transactions.push(newTransaction);
    res.status(201).json({ transaction: newTransaction });
  } catch (error) {
    console.error('Create transaction error:', error);
    res.status(500).json({ message: 'Server error creating transaction' });
  }
});

// Update transaction status (viewers cannot update)
// TENANT ISOLATION: Verifies user has access before updating
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

    // Check tenant isolation
    try {
      ensureAccessible(transaction, req.context, 'Transaction');
    } catch (error) {
      return res.status(error.status || 403).json({ message: error.message });
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
// TENANT ISOLATION: Verifies user has access before updating
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

    // Check tenant isolation
    try {
      ensureAccessible(transaction, req.context, 'Transaction');
    } catch (error) {
      return res.status(error.status || 403).json({ message: error.message });
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
// TENANT ISOLATION: Verifies user has access before deleting
router.delete('/:id', authorizeRoles('super_admin', 'admin', 'user'), (req, res) => {
  const transaction = transactions.find(t => t.id === parseInt(req.params.id));
  if (!transaction) {
    return res.status(404).json({ message: 'Transaction not found' });
  }

  // Check tenant isolation
  try {
    ensureAccessible(transaction, req.context, 'Transaction');
  } catch (error) {
    return res.status(error.status || 403).json({ message: error.message });
  }

  const index = transactions.findIndex(t => t.id === parseInt(req.params.id));
  transactions.splice(index, 1);
  res.json({ message: 'Transaction deleted successfully' });
});

module.exports = router;



