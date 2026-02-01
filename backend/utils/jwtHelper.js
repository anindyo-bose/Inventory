/**
 * JWT Helper Functions
 * 
 * BACKWARD COMPATIBILITY:
 * - generateAuthToken includes tenantId and tenantRole ONLY when available
 * - Old tokens without these fields continue to work
 * - Existing middleware checks for these optionally
 */

const jwt = require('jsonwebtoken');

/**
 * Generate JWT token with optional tenant information
 * 
 * @param {Object} user - User object with id, username, email, role, name
 * @param {Object} options - Additional options
 *   - tenantId (optional): Tenant ID for user's current session
 *   - tenantRole (optional): User's role in the tenant
 * @returns {string} JWT token
 */
function generateAuthToken(user, options = {}) {
  const payload = {
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role, // Always include global role
    name: user.name,
    iat: Math.floor(Date.now() / 1000)
  };

  // Only add tenant info if provided (optional fields)
  if (options.tenantId) {
    payload.tenantId = options.tenantId;
  }
  if (options.tenantRole) {
    payload.tenantRole = options.tenantRole;
  }

  return jwt.sign(
    payload,
    process.env.JWT_SECRET || 'your-secret-key-change-in-production',
    { expiresIn: '24h' }
  );
}

/**
 * Verify token signature and return decoded payload
 * 
 * @param {string} token - JWT token
 * @returns {Object} Decoded token payload
 * @throws {Error} If token is invalid
 */
function verifyToken(token) {
  return jwt.verify(
    token,
    process.env.JWT_SECRET || 'your-secret-key-change-in-production'
  );
}

module.exports = {
  generateAuthToken,
  verifyToken
};
