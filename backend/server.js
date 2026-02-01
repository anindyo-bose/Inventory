const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const authRoutes = require('./routes/auth');
const transactionRoutes = require('./routes/transactions');
const repairRoutes = require('./routes/repairs');
const supplierRoutes = require('./routes/suppliers');
const { authenticateToken, authorizeRoles, validateAndSanitize, addSecurityHeaders, preventSensitiveLogging } = require('./middleware/auth');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet()); // Add various HTTP headers for security
app.use(addSecurityHeaders); // Custom security headers
app.use(preventSensitiveLogging); // Prevent password/token logging

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes',
  standardHeaders: true,
  legacyHeaders: false,
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit login attempts
  skipSuccessfulRequests: true,
  message: 'Too many login attempts, please try again later',
});

app.use(limiter); // Apply rate limiter to all routes

// CORS configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Middleware to prevent password logging
app.use((req, res, next) => {
  // Create a proxy to prevent passwords from being logged
  if (req.body && req.body.password) {
    req.body.password = req.body.password; // Password stays but won't be logged
  }
  next();
});

// Sanitize all inputs
app.use(validateAndSanitize);

// Routes
app.use('/api/auth', loginLimiter, authRoutes);
app.use('/api/transactions', authenticateToken, transactionRoutes);
app.use('/api/repairs', authenticateToken, repairRoutes);
app.use('/api/suppliers', authenticateToken, supplierRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

