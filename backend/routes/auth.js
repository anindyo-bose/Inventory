const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const router = express.Router();
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// Mock users database (in production, use a real database)
// Password for all users: admin123
const hashedPassword = bcrypt.hashSync('admin123', 10);

const allowedRoles = ['super_admin', 'admin', 'user', 'viewer'];

let users = [
  {
    id: 1,
    username: 'superadmin',
    email: 'superadmin@example.com',
    password: hashedPassword,
    role: 'super_admin',
    name: 'Super Admin'
  },
  {
    id: 2,
    username: 'admin',
    email: 'admin@example.com',
    password: hashedPassword,
    role: 'admin',
    name: 'Admin User'
  },
  {
    id: 3,
    username: 'user',
    email: 'user@example.com',
    password: hashedPassword,
    role: 'user',
    name: 'Regular User'
  },
  {
    id: 4,
    username: 'viewer',
    email: 'viewer@example.com',
    password: hashedPassword,
    role: 'viewer',
    name: 'Viewer'
  }
];

// Login endpoint
router.post('/login', [
  body('username').notEmpty().withMessage('Username is required'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, password } = req.body;

    // Find user
    const user = users.find(u => u.username === username || u.email === username);
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user.id, 
        username: user.username, 
        email: user.email, 
        role: user.role,
        name: user.name
      },
      process.env.JWT_SECRET || 'your-secret-key-change-in-production',
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        name: user.name
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Create a new user (Super Admin only)
router.post(
  '/users',
  authenticateToken,
  authorizeRoles('super_admin'),
  [
    body('username').notEmpty().withMessage('Username is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('role').isIn(allowedRoles).withMessage('Invalid role'),
    body('name').notEmpty().withMessage('Name is required')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { username, email, password, role, name } = req.body;

      const usernameExists = users.some(u => u.username === username);
      if (usernameExists) {
        return res.status(409).json({ message: 'Username already exists' });
      }

      const emailExists = users.some(u => u.email === email);
      if (emailExists) {
        return res.status(409).json({ message: 'Email already exists' });
      }

      const hashed = await bcrypt.hash(password, 10);
      const nextId = users.length ? Math.max(...users.map(u => u.id)) + 1 : 1;

      const newUser = {
        id: nextId,
        username,
        email,
        password: hashed,
        role,
        name
      };

      users.push(newUser);

      return res.status(201).json({
        user: {
          id: newUser.id,
          username: newUser.username,
          email: newUser.email,
          role: newUser.role,
          name: newUser.name
        }
      });
    } catch (error) {
      console.error('Create user error:', error);
      res.status(500).json({ message: 'Server error while creating user' });
    }
  }
);

// List users (Super Admin only)
router.get(
  '/users',
  authenticateToken,
  authorizeRoles('super_admin'),
  (req, res) => {
    const safeUsers = users.map(({ password, ...rest }) => rest);
    res.json({ users: safeUsers });
  }
);

// Get current user
router.get('/me', require('../middleware/auth').authenticateToken, (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;

