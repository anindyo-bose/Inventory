const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();
const { authorizeRoles } = require('../middleware/auth');
const { filterAccessible, ensureAccessible, addTenantId } = require('../utils/dataIsolation');

// Mock suppliers database (in production, use a real database)
let suppliers = [
  {
    id: 1,
    name: 'Tech Supplies Co.',
    contactPerson: 'John Smith',
    email: 'john@techsupplies.com',
    phone: '+1-234-567-8900',
    address: '123 Main St, City, State',
    createdAt: new Date().toISOString(),
    createdBy: 'admin'
  },
  {
    id: 2,
    name: 'Electronics Warehouse',
    contactPerson: 'Jane Doe',
    email: 'jane@electronics.com',
    phone: '+1-234-567-8901',
    address: '456 Oak Ave, City, State',
    createdAt: new Date().toISOString(),
    createdBy: 'admin'
  },
  {
    id: 3,
    name: 'Global Components Ltd.',
    contactPerson: 'Michael Chen',
    email: 'michael@globalcomponents.com',
    phone: '+1-555-123-4567',
    address: '789 Industrial Blvd, Tech Park, CA 94000',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    createdBy: 'admin'
  },
  {
    id: 4,
    name: 'Prime Hardware Solutions',
    contactPerson: 'Sarah Johnson',
    email: 'sarah@primehardware.com',
    phone: '+1-555-987-6543',
    address: '321 Commerce Drive, Business District, NY 10001',
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    createdBy: 'admin'
  },
  {
    id: 5,
    name: 'Digital Parts Express',
    contactPerson: 'Robert Williams',
    email: 'robert@digitalparts.com',
    phone: '+1-555-456-7890',
    address: '654 Tech Street, Innovation Hub, TX 75001',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    createdBy: 'admin'
  },
  {
    id: 6,
    name: 'Advanced Materials Inc.',
    contactPerson: 'Emily Davis',
    email: 'emily@advancedmaterials.com',
    phone: '+1-555-321-0987',
    address: '987 Manufacturing Way, Industrial Zone, IL 60601',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    createdBy: 'admin'
  },
  {
    id: 7,
    name: 'Quick Ship Electronics',
    contactPerson: 'David Martinez',
    email: 'david@quickship.com',
    phone: '+1-555-654-3210',
    address: '147 Distribution Center, Logistics Park, FL 33101',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    createdBy: 'admin'
  },
  {
    id: 8,
    name: 'Reliable Components Co.',
    contactPerson: 'Lisa Anderson',
    email: 'lisa@reliablecomponents.com',
    phone: '+1-555-789-0123',
    address: '258 Supplier Avenue, Trade Center, WA 98101',
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    createdBy: 'admin'
  }
];

// Mock bills/dues database
let bills = [
  {
    id: 1,
    supplierId: 1,
    billNumber: 'BILL-001',
    amount: 5000.00,
    billDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    dueDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
    billImage: null, // In production, store image URL/path
    description: 'Monthly supplies order',
    createdAt: new Date().toISOString(),
    createdBy: 'user'
  }
];

// Mock payments database
let payments = [
  {
    id: 1,
    supplierId: 1,
    billId: 1,
    amount: 2000.00,
    paymentDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    paymentMethod: 'Bank Transfer',
    referenceNumber: 'REF-001',
    notes: 'Partial payment',
    createdAt: new Date().toISOString(),
    createdBy: 'user'
  }
];

// Get all suppliers
// TENANT ISOLATION: Filters by tenantId if user is in a tenant
router.get('/', (req, res) => {
  const accessibleSuppliers = filterAccessible(suppliers, req.context);
  res.json({ suppliers: accessibleSuppliers });
});

// Get supplier by ID
// TENANT ISOLATION: Verifies user has access to the supplier
router.get('/:id', (req, res) => {
  const supplier = suppliers.find(s => s.id === parseInt(req.params.id));
  if (!supplier) {
    return res.status(404).json({ message: 'Supplier not found' });
  }
  
  // Check tenant isolation
  try {
    ensureAccessible(supplier, req.context, 'Supplier');
  } catch (error) {
    return res.status(error.status || 403).json({ message: error.message });
  }
  
  res.json({ supplier });
});

// Create new supplier (admin only, viewers cannot create)
// TENANT ISOLATION: Automatically adds tenantId to new supplier if user is in a tenant
router.post('/', authorizeRoles('super_admin', 'admin', 'user'), [
  body('name').notEmpty().withMessage('Supplier name is required'),
  body('contactPerson').notEmpty().withMessage('Contact person is required')
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, contactPerson, email, phone, address } = req.body;

    const newSupplier = {
      id: suppliers.length + 1,
      name,
      contactPerson,
      email: email || '',
      phone: phone || '',
      address: address || '',
      createdAt: new Date().toISOString(),
      createdBy: req.user.username
    };

    // Add tenantId if user is in a tenant
    addTenantId(newSupplier, req.context);

    suppliers.push(newSupplier);
    res.status(201).json({ supplier: newSupplier });
  } catch (error) {
    console.error('Create supplier error:', error);
    res.status(500).json({ message: 'Server error creating supplier' });
  }
});

// Update supplier (admin only, viewers cannot update)
// TENANT ISOLATION: Verifies user has access before updating
router.put('/:id', authorizeRoles('super_admin', 'admin', 'user'), [
  body('name').optional().notEmpty(),
  body('contactPerson').optional().notEmpty()
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const supplier = suppliers.find(s => s.id === parseInt(req.params.id));
    if (!supplier) {
      return res.status(404).json({ message: 'Supplier not found' });
    }

    // Check tenant isolation
    try {
      ensureAccessible(supplier, req.context, 'Supplier');
    } catch (error) {
      return res.status(error.status || 403).json({ message: error.message });
    }

    const { name, contactPerson, email, phone, address } = req.body;

    if (name) supplier.name = name;
    if (contactPerson) supplier.contactPerson = contactPerson;
    if (email !== undefined) supplier.email = email;
    if (phone !== undefined) supplier.phone = phone;
    if (address !== undefined) supplier.address = address;

    res.json({ supplier });
  } catch (error) {
    console.error('Update supplier error:', error);
    res.status(500).json({ message: 'Server error updating supplier' });
  }
});

// Delete supplier (admin only, viewers cannot delete)
// TENANT ISOLATION: Verifies user has access before deleting
router.delete('/:id', authorizeRoles('super_admin', 'admin', 'user'), (req, res) => {
  const supplier = suppliers.find(s => s.id === parseInt(req.params.id));
  if (!supplier) {
    return res.status(404).json({ message: 'Supplier not found' });
  }

  // Check tenant isolation
  try {
    ensureAccessible(supplier, req.context, 'Supplier');
  } catch (error) {
    return res.status(error.status || 403).json({ message: error.message });
  }

  const index = suppliers.findIndex(s => s.id === parseInt(req.params.id));
  suppliers.splice(index, 1);
  // Also delete related bills and payments
  bills = bills.filter(b => b.supplierId !== parseInt(req.params.id));
  payments = payments.filter(p => p.supplierId !== parseInt(req.params.id));

  res.json({ message: 'Supplier deleted successfully' });
});

// Get all bills for a supplier
router.get('/:id/bills', (req, res) => {
  const supplierBills = bills.filter(b => b.supplierId === parseInt(req.params.id));
  res.json({ bills: supplierBills });
});

// Create new bill/due (user+, viewers cannot create)
router.post('/:id/bills', authorizeRoles('super_admin', 'admin', 'user'), [
  body('billNumber').notEmpty().withMessage('Bill number is required'),
  body('amount').isFloat({ min: 0 }).withMessage('Amount must be a positive number')
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const supplier = suppliers.find(s => s.id === parseInt(req.params.id));
    if (!supplier) {
      return res.status(404).json({ message: 'Supplier not found' });
    }

    const {
      billNumber,
      amount,
      billDate,
      dueDate,
      billImage,
      description
    } = req.body;

    const newBill = {
      id: bills.length + 1,
      supplierId: parseInt(req.params.id),
      billNumber,
      amount: parseFloat(amount),
      billDate: billDate || new Date().toISOString(),
      dueDate: dueDate || new Date().toISOString(),
      billImage: billImage || null,
      description: description || '',
      createdAt: new Date().toISOString(),
      createdBy: req.user.username
    };

    bills.push(newBill);
    res.status(201).json({ bill: newBill });
  } catch (error) {
    console.error('Create bill error:', error);
    res.status(500).json({ message: 'Server error creating bill' });
  }
});

// Update bill (viewers cannot update)
router.put('/:id/bills/:billId', authorizeRoles('super_admin', 'admin', 'user'), (req, res) => {
  try {
    const bill = bills.find(b => 
      b.id === parseInt(req.params.billId) && 
      b.supplierId === parseInt(req.params.id)
    );
    if (!bill) {
      return res.status(404).json({ message: 'Bill not found' });
    }

    const {
      billNumber,
      amount,
      billDate,
      dueDate,
      billImage,
      description
    } = req.body;

    if (billNumber) bill.billNumber = billNumber;
    if (amount !== undefined) bill.amount = parseFloat(amount);
    if (billDate) bill.billDate = billDate;
    if (dueDate) bill.dueDate = dueDate;
    if (billImage !== undefined) bill.billImage = billImage;
    if (description !== undefined) bill.description = description;

    res.json({ bill });
  } catch (error) {
    console.error('Update bill error:', error);
    res.status(500).json({ message: 'Server error updating bill' });
  }
});

// Delete bill (viewers cannot delete)
router.delete('/:id/bills/:billId', authorizeRoles('super_admin', 'admin', 'user'), (req, res) => {
  const index = bills.findIndex(b => 
    b.id === parseInt(req.params.billId) && 
    b.supplierId === parseInt(req.params.id)
  );
  if (index === -1) {
    return res.status(404).json({ message: 'Bill not found' });
  }

  bills.splice(index, 1);
  res.json({ message: 'Bill deleted successfully' });
});

// Get all payments for a supplier
router.get('/:id/payments', (req, res) => {
  const supplierPayments = payments.filter(p => p.supplierId === parseInt(req.params.id));
  res.json({ payments: supplierPayments });
});

// Create new payment (user+, viewers cannot create)
router.post('/:id/payments', authorizeRoles('super_admin', 'admin', 'user'), [
  body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
  body('paymentDate').notEmpty().withMessage('Payment date is required')
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const supplier = suppliers.find(s => s.id === parseInt(req.params.id));
    if (!supplier) {
      return res.status(404).json({ message: 'Supplier not found' });
    }

    const {
      amount,
      paymentDate,
      paymentMethod,
      referenceNumber,
      notes
    } = req.body;

    const newPayment = {
      id: payments.length + 1,
      supplierId: parseInt(req.params.id),
      amount: parseFloat(amount),
      paymentDate: paymentDate || new Date().toISOString(),
      paymentMethod: paymentMethod || 'Cash',
      referenceNumber: referenceNumber || '',
      notes: notes || '',
      createdAt: new Date().toISOString(),
      createdBy: req.user.username
    };

    payments.push(newPayment);
    res.status(201).json({ payment: newPayment });
  } catch (error) {
    console.error('Create payment error:', error);
    res.status(500).json({ message: 'Server error creating payment' });
  }
});

// Get all dues (admin only) - aggregated view
router.get('/dues/all', (req, res) => {
  const duesSummary = suppliers.map(supplier => {
    const supplierBills = bills.filter(b => b.supplierId === supplier.id);
    const supplierPayments = payments.filter(p => p.supplierId === supplier.id);
    
    const totalBillsAmount = supplierBills.reduce((sum, bill) => sum + bill.amount, 0);
    const totalPaymentsAmount = supplierPayments.reduce((sum, payment) => sum + payment.amount, 0);
    const totalDues = totalBillsAmount - totalPaymentsAmount;

    return {
      supplierId: supplier.id,
      supplierName: supplier.name,
      totalDues: totalDues > 0 ? totalDues : 0,
      totalBills: supplierBills.length,
      totalBillsAmount,
      totalPaymentsAmount,
      bills: supplierBills
    };
  });

  res.json({ dues: duesSummary });
});

module.exports = router;

