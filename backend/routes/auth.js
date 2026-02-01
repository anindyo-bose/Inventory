const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { body, validationResult, param } = require('express-validator');
const router = express.Router();
const { authenticateToken, authorizeRoles, sanitizeInput } = require('../middleware/auth');
const { generateAuthToken } = require('../utils/jwtHelper');

// Mock users database (in production, use a real database)
// Password for all users: admin123
const plainPassword = 'admin123';
const hashedPassword = bcrypt.hashSync(plainPassword, 10);

// Store SHA256 hash of plain password for frontend compatibility
// SHA256('admin123' + 'inventory-app-salt-2024') = the value frontend will send
const crypto = require('crypto');
const salt = 'inventory-app-salt-2024';
const sha256Hash = crypto
  .createHash('sha256')
  .update(`${plainPassword}${salt}`)
  .digest('hex');

const allowedRoles = ['super_admin', 'admin', 'user', 'viewer'];

let users = [
  {
    id: 1,
    username: 'superadmin',
    email: 'superadmin@example.com',
    password: hashedPassword,
    sha256Password: sha256Hash, // Store SHA256 for frontend verification
    role: 'super_admin',
    name: 'Super Admin'
  },
  {
    id: 2,
    username: 'admin',
    email: 'admin@example.com',
    password: hashedPassword,
    sha256Password: sha256Hash,
    role: 'admin',
    name: 'Admin User'
  },
  {
    id: 3,
    username: 'user',
    email: 'user@example.com',
    password: hashedPassword,
    sha256Password: sha256Hash,
    role: 'user',
    name: 'Regular User'
  },
  {
    id: 4,
    username: 'viewer',
    email: 'viewer@example.com',
    password: hashedPassword,
    sha256Password: sha256Hash,
    role: 'viewer',
    name: 'Viewer'
  },
  {
    id: 5,
    username: 'john',
    email: 'john@example.com',
    password: hashedPassword,
    sha256Password: sha256Hash,
    role: 'admin',
    name: 'John Doe'
  },
  {
    id: 6,
    username: 'jane',
    email: 'jane@example.com',
    password: hashedPassword,
    sha256Password: sha256Hash,
    role: 'user',
    name: 'Jane Smith'
  },
  {
    id: 7,
    username: 'bob',
    email: 'bob@example.com',
    password: hashedPassword,
    sha256Password: sha256Hash,
    role: 'user',
    name: 'Bob Johnson'
  }
];

// Login endpoint - supports both hashed (SHA256 from frontend) and plain passwords
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

    // Verify password - support both methods:
    // 1. SHA256 hash from frontend (64 hex characters)
    // 2. Plain password (for backward compatibility)
    
    let isValidPassword = false;

    // Check if it's a SHA256 hash (64 hex characters)
    if (password.length === 64 && /^[a-f0-9]{64}$/.test(password)) {
      // Direct comparison with stored SHA256 hash
      isValidPassword = password === user.sha256Password;
    } else {
      // It's a plain password, use bcrypt comparison
      isValidPassword = await bcrypt.compare(password, user.password);
    }
    
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token with optional tenant info
    // BACKWARD COMPATIBILITY: If user is not assigned to a tenant,
    // tenantId and tenantRole will be undefined in the token
    const token = generateAuthToken(user, {
      // tenantId and tenantRole can be added here if user is in a specific tenant
      // For now, only standard user info is included
      // Tenant selection happens in a separate flow after login
    });

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
      
      // Also compute SHA256 hash for frontend compatibility
      const sha256Hashed = crypto
        .createHash('sha256')
        .update(`${password}${salt}`)
        .digest('hex');
      
      const nextId = users.length ? Math.max(...users.map(u => u.id)) + 1 : 1;

      const newUser = {
        id: nextId,
        username,
        email,
        password: hashed,
        sha256Password: sha256Hashed, // Store SHA256 for frontend verification
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

// Get all users (for tenant management - Super Admin only)
router.get(
  '/users',
  authenticateToken,
  authorizeRoles('super_admin'),
  (req, res) => {
    // Never return passwords
    const safeUsers = users.map(({ password, sha256Password, ...rest }) => rest);
    res.json({ users: safeUsers });
  }
);

// Logout endpoint (mainly for frontend to clear token)
router.post('/logout', authenticateToken, (req, res) => {
  // Token invalidation should be handled on frontend by removing it
  res.json({ message: 'Logged out successfully' });
});

module.exports = router;

