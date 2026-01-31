const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();
const { authorizeRoles } = require('../middleware/auth');

// Mock repairs database (in production, use a real database)
// Generate sample data for the past month
const generateSampleRepairs = () => {
  const repairs = [];
  const now = Date.now();
  const oneMonthAgo = now - (30 * 24 * 60 * 60 * 1000);
  
  const sampleData = [
    { itemName: 'Laptop', customerName: 'John Doe', customerContact: '+1234567890', repairCost: 120, amountCharged: 150, advanceAmount: 50, status: 'delivered' },
    { itemName: 'Smartphone', customerName: 'Jane Smith', customerContact: '+1987654321', repairCost: 80, amountCharged: 120, advanceAmount: 40, status: 'repaired' },
    { itemName: 'Tablet', customerName: 'Bob Johnson', customerContact: '+1555123456', repairCost: 100, amountCharged: 140, advanceAmount: 60, status: 'in_progress' },
    { itemName: 'Desktop PC', customerName: 'Alice Williams', customerContact: '+1555987654', repairCost: 200, amountCharged: 280, advanceAmount: 100, status: 'pending' },
    { itemName: 'Gaming Console', customerName: 'Charlie Brown', customerContact: '+1555111222', repairCost: 150, amountCharged: 200, advanceAmount: 80, status: 'delivered' },
    { itemName: 'Monitor', customerName: 'Diana Prince', customerContact: '+1555333444', repairCost: 90, amountCharged: 130, advanceAmount: 50, status: 'repaired' },
    { itemName: 'Keyboard', customerName: 'Edward Norton', customerContact: '+1555555666', repairCost: 40, amountCharged: 60, advanceAmount: 30, status: 'in_progress' },
    { itemName: 'Mouse', customerName: 'Fiona Apple', customerContact: '+1555777888', repairCost: 25, amountCharged: 45, advanceAmount: 20, status: 'pending' },
    { itemName: 'Headphones', customerName: 'George Lucas', customerContact: '+1555999000', repairCost: 60, amountCharged: 90, advanceAmount: 40, status: 'delivered' },
    { itemName: 'Speaker', customerName: 'Helen Keller', customerContact: '+1555222111', repairCost: 110, amountCharged: 160, advanceAmount: 70, status: 'repaired' },
    { itemName: 'Camera', customerName: 'Ian Fleming', customerContact: '+1555444333', repairCost: 180, amountCharged: 250, advanceAmount: 100, status: 'in_progress' },
    { itemName: 'Printer', customerName: 'Julia Roberts', customerContact: '+1555666777', repairCost: 130, amountCharged: 180, advanceAmount: 80, status: 'pending' },
    { itemName: 'Scanner', customerName: 'Kevin Spacey', customerContact: '+1555888999', repairCost: 95, amountCharged: 135, advanceAmount: 55, status: 'delivered' },
    { itemName: 'Router', customerName: 'Lisa Simpson', customerContact: '+1555101010', repairCost: 50, amountCharged: 75, advanceAmount: 35, status: 'repaired' },
    { itemName: 'Modem', customerName: 'Mike Tyson', customerContact: '+1555121212', repairCost: 70, amountCharged: 100, advanceAmount: 45, status: 'in_progress' },
  ];

  sampleData.forEach((data, index) => {
    const daysAgo = Math.floor(Math.random() * 30); // Random day in the past month
    const receivedDate = new Date(oneMonthAgo + (daysAgo * 24 * 60 * 60 * 1000));
    const dueDate = new Date(receivedDate.getTime() + (7 * 24 * 60 * 60 * 1000));
    const completedDate = (data.status === 'delivered' || data.status === 'repaired') 
      ? new Date(receivedDate.getTime() + (Math.random() * 5 + 2) * 24 * 60 * 60 * 1000)
      : null;

    repairs.push({
      id: index + 1,
      repairId: `REP-${String(index + 1).padStart(3, '0')}`,
      billNo: `BILL-${1000 + index + 1}`,
      itemName: data.itemName,
      itemDescription: `${data.itemName} repair - ${data.status === 'delivered' ? 'Completed' : 'In progress'}`,
      customerName: data.customerName,
      customerContact: data.customerContact,
      forwardedTo: `Repair Shop ${index % 3 + 1}`,
      forwardedDate: receivedDate.toISOString(),
      repairCost: data.repairCost,
      amountCharged: data.amountCharged,
      advanceAmount: data.advanceAmount,
      status: data.status,
      receivedDate: receivedDate.toISOString(),
      dueDate: dueDate.toISOString(),
      completedDate: completedDate ? completedDate.toISOString() : null,
      createdBy: index % 2 === 0 ? 'admin' : 'user',
      notes: `Repair for ${data.itemName}`
    });
  });

  return repairs;
};

let repairs = generateSampleRepairs();

// Get all repairs
router.get('/', (req, res) => {
  // Ensure all repairs have advanceAmount field (for backward compatibility)
  const repairsWithAdvance = repairs.map(repair => ({
    ...repair,
    advanceAmount: repair.advanceAmount || 0
  }));
  res.json({ repairs: repairsWithAdvance });
});

// Get repair by ID
router.get('/:id', (req, res) => {
  const repair = repairs.find(r => r.id === parseInt(req.params.id));
  if (!repair) {
    return res.status(404).json({ message: 'Repair not found' });
  }
  // Ensure advanceAmount field exists (for backward compatibility)
  res.json({ repair: { ...repair, advanceAmount: repair.advanceAmount || 0 } });
});

// Create new repair (viewers cannot create)
router.post('/', authorizeRoles('super_admin', 'admin', 'user'), [
  body('customerName').notEmpty().withMessage('Customer name is required'),
  body('customerContact')
    .notEmpty().withMessage('Customer contact (phone number) is required')
    .matches(/^[0-9+\-\s()]+$/).withMessage('Customer contact must be a valid phone number'),
  body('billNo').notEmpty().withMessage('Bill number is required')
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      itemName,
      itemDescription,
      customerName,
      customerContact,
      forwardedTo,
      repairCost,
      amountCharged,
      status,
      dueDate,
      notes,
      billNo
    } = req.body;

    // Check if billNo already exists (Bill No should be unique)
    const existingRepair = repairs.find(r => r.billNo === billNo);
    if (existingRepair) {
      return res.status(409).json({ message: 'Bill number already exists' });
    }

    const newRepair = {
      id: repairs.length + 1,
      repairId: `REP-${String(repairs.length + 1).padStart(3, '0')}`,
      itemName: itemName || '',
      itemDescription: itemDescription || '',
      customerName,
      customerContact,
      forwardedTo: forwardedTo || '',
      billNo,
      forwardedDate: new Date().toISOString(),
      repairCost: parseFloat(repairCost) || 0.00,
      amountCharged: parseFloat(amountCharged) || 0.00,
      advanceAmount: parseFloat(advanceAmount) || 0.00,
      status: status || 'pending',
      receivedDate: new Date().toISOString(),
      dueDate: dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      completedDate: null,
      createdBy: req.user.username,
      notes: notes || ''
    };

    repairs.push(newRepair);
    res.status(201).json({ repair: newRepair });
  } catch (error) {
    console.error('Create repair error:', error);
    res.status(500).json({ message: 'Server error creating repair' });
  }
});

// Update repair (viewers cannot update)
router.put('/:id', authorizeRoles('super_admin', 'admin', 'user'), [
  body('customerName').optional().notEmpty().withMessage('Customer name cannot be empty'),
  body('customerContact')
    .optional()
    .notEmpty().withMessage('Customer contact cannot be empty')
    .matches(/^[0-9+\-\s()]+$/).withMessage('Customer contact must be a valid phone number'),
  body('billNo').optional().notEmpty().withMessage('Bill number cannot be empty')
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const repair = repairs.find(r => r.id === parseInt(req.params.id));
    if (!repair) {
      return res.status(404).json({ message: 'Repair not found' });
    }

    const {
      itemName,
      itemDescription,
      customerName,
      customerContact,
      forwardedTo,
      repairCost,
      amountCharged,
      advanceAmount,
      status,
      dueDate,
      notes,
      billNo
    } = req.body;

    // Check if billNo already exists for a different repair (Bill No should be unique)
    if (billNo) {
      const existingRepair = repairs.find(r => r.billNo === billNo && r.id !== parseInt(req.params.id));
      if (existingRepair) {
        return res.status(409).json({ message: 'Bill number already exists' });
      }
    }

    if (itemName) repair.itemName = itemName;
    if (itemDescription !== undefined) repair.itemDescription = itemDescription;
    if (customerName) repair.customerName = customerName;
    if (customerContact !== undefined) repair.customerContact = customerContact;
    if (forwardedTo) repair.forwardedTo = forwardedTo;
    if (repairCost !== undefined) repair.repairCost = parseFloat(repairCost);
    if (amountCharged !== undefined) repair.amountCharged = parseFloat(amountCharged);
    if (advanceAmount !== undefined) repair.advanceAmount = parseFloat(advanceAmount);
    if (dueDate) repair.dueDate = dueDate;
    if (status) {
      repair.status = status;
      if ((status === 'repaired' || status === 'delivered') && !repair.completedDate) {
        repair.completedDate = new Date().toISOString();
      }
      if (status !== 'repaired' && status !== 'delivered') {
        repair.completedDate = null;
      }
    }
    if (notes !== undefined) repair.notes = notes;
    if (billNo !== undefined) repair.billNo = billNo;

    res.json({ repair });
  } catch (error) {
    console.error('Update repair error:', error);
    res.status(500).json({ message: 'Server error updating repair' });
  }
});

// Delete repair (viewers cannot delete)
router.delete('/:id', authorizeRoles('super_admin', 'admin', 'user'), (req, res) => {
  const index = repairs.findIndex(r => r.id === parseInt(req.params.id));
  if (index === -1) {
    return res.status(404).json({ message: 'Repair not found' });
  }

  repairs.splice(index, 1);
  res.json({ message: 'Repair deleted successfully' });
});

module.exports = router;

