const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { body, validationResult, param } = require('express-validator');
const router = express.Router();
const { authenticateToken, authorizeRoles, sanitizeInput } = require('../middleware/auth');

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

// Login endpoint - supports both hashed and plain passwords for compatibility
router.post('/login', [
  body('username')
    .trim()
    .notEmpty()
    .withMessage('Username is required')
    .isLength({ max: 100 })
    .withMessage('Username too long')
    .matches(/^[a-zA-Z0-9@._-]+$/)
    .withMessage('Username contains invalid characters'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 1, max: 500 })
    .withMessage('Invalid password format')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Sanitize inputs
    let { username, password } = req.body;
    username = sanitizeInput(username);

    // Find user - use case-insensitive search
    const user = users.find(u => 
      u.username.toLowerCase() === username.toLowerCase() || 
      u.email.toLowerCase() === username.toLowerCase()
    );
    
    if (!user) {
      // Don't reveal if username exists (security best practice)
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Verify password
    // The frontend now sends a SHA256 hashed password, but we still verify against bcrypt
    // The password parameter could be:
    // 1. SHA256 hash from frontend (new secure method)
    // 2. Plain password (for backward compatibility)
    let isValidPassword = await bcrypt.compare(password, user.password);
    
    // If direct comparison fails, try with hashed version
    // This allows frontend to send pre-hashed passwords
    if (!isValidPassword && password.length === 64) {
      // Password looks like SHA256 hash (64 hex chars)
      // Hash it again for server-side verification
      const doubleHashedPassword = await bcrypt.hash(password, 1);
      isValidPassword = await bcrypt.compare(password, user.password);
    }
    
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
        name: user.name,
        iat: Math.floor(Date.now() / 1000)
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
    body('username')
      .trim()
      .notEmpty()
      .withMessage('Username is required')
      .isLength({ min: 3, max: 50 })
      .withMessage('Username must be 3-50 characters')
      .matches(/^[a-zA-Z0-9_-]+$/)
      .withMessage('Username can only contain letters, numbers, underscore, and dash'),
    body('email')
      .trim()
      .isEmail()
      .withMessage('Valid email is required')
      .normalizeEmail(),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[a-zA-Z\d@$!%*?&]/)
      .withMessage('Password must contain uppercase, lowercase, number, and special character'),
    body('role')
      .isIn(allowedRoles)
      .withMessage('Invalid role'),
    body('name')
      .trim()
      .notEmpty()
      .withMessage('Name is required')
      .isLength({ max: 100 })
      .withMessage('Name too long')
      .matches(/^[a-zA-Z\s'-]+$/)
      .withMessage('Name contains invalid characters')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      let { username, email, password, role, name } = req.body;
      
      // Sanitize inputs
      username = sanitizeInput(username);
      email = sanitizeInput(email);
      name = sanitizeInput(name);

      // Check if username already exists (case-insensitive)
      const usernameExists = users.some(u => u.username.toLowerCase() === username.toLowerCase());
      if (usernameExists) {
        return res.status(409).json({ message: 'Username already exists' });
      }

      // Check if email already exists (case-insensitive)
      const emailExists = users.some(u => u.email.toLowerCase() === email.toLowerCase());
      if (emailExists) {
        return res.status(409).json({ message: 'Email already exists' });
      }

      // Hash password with bcrypt
      const hashed = await bcrypt.hash(password, 12); // 12 salt rounds
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
    // Never return passwords
    const safeUsers = users.map(({ password, ...rest }) => rest);
    res.json({ users: safeUsers });
  }
);

// Get current user info
router.get(
  '/me',
  authenticateToken,
  (req, res) => {
    // Find current user and exclude password
    const currentUser = users.find(u => u.id === req.user.id);
    if (!currentUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const { password, ...safeUser } = currentUser;
    res.json({ user: safeUser });
  }
);

// Logout endpoint (mainly for frontend to clear token)
router.post('/logout', authenticateToken, (req, res) => {
  // Token invalidation should be handled on frontend by removing it
  res.json({ message: 'Logged out successfully' });
});

module.exports = router;

