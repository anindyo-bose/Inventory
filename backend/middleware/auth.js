const jwt = require('jsonwebtoken');
const encryptionWrapper = require('../utils/encryption');

// Helper function to sanitize user input (prevent XSS)
const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  return input
    .replace(/[<>\"']/g, (char) => {
      const map = {
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;'
      };
      return map[char] || char;
    })
    .trim()
    .slice(0, 500); // Limit length
};

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  try {
    jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-change-in-production', (err, user) => {
      if (err) {
        return res.status(403).json({ message: 'Invalid or expired token' });
      }
      req.user = user;
      next();
    });
  } catch (error) {
    return res.status(403).json({ message: 'Token verification failed' });
  }
};

const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }

    next();
  };
};

// Middleware to validate and sanitize request bodies
const validateAndSanitize = (req, res, next) => {
  if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
    if (req.body && typeof req.body === 'object') {
      // Recursively sanitize all string fields (except password)
      const sanitize = (obj) => {
        Object.keys(obj).forEach(key => {
          // Skip password field - it shouldn't be sanitized, just verified
          if (key === 'password') return;
          
          if (typeof obj[key] === 'string') {
            obj[key] = sanitizeInput(obj[key]);
          } else if (typeof obj[key] === 'object' && obj[key] !== null) {
            sanitize(obj[key]);
          }
        });
      };
      sanitize(req.body);
    }
  }
  next();
};

// Middleware to prevent sensitive data in logs
const preventSensitiveLogging = (req, res, next) => {
  // Store original console.log
  const originalLog = console.log;
  const originalError = console.error;
  
  // Override to filter sensitive data
  console.log = function(...args) {
    const filtered = JSON.stringify(args)
      .replace(/"password"\s*:\s*"[^"]*"/g, '"password": "***REDACTED***"')
      .replace(/"token"\s*:\s*"[^"]*"/g, '"token": "***REDACTED***"');
    
    // Only log if not containing password (unless explicitly needed)
    if (!filtered.includes('password') && !filtered.includes('token')) {
      originalLog.apply(console, args);
    }
  };
  
  console.error = function(...args) {
    const filtered = JSON.stringify(args)
      .replace(/"password"\s*:\s*"[^"]*"/g, '"password": "***REDACTED***"')
      .replace(/"token"\s*:\s*"[^"]*"/g, '"token": "***REDACTED***"');
    
    originalError.apply(console, [filtered]);
  };
  
  next();
};

// Middleware to add security headers
const addSecurityHeaders = (req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self'");
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
};

module.exports = { 
  authenticateToken, 
  authorizeRoles, 
  validateAndSanitize, 
  addSecurityHeaders,
  sanitizeInput,
  preventSensitiveLogging,
  encryptionWrapper
};




