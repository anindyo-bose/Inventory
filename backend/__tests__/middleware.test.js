const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const jwt = require('jsonwebtoken');

describe('Auth Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      headers: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    next = jest.fn();
  });

  describe('authenticateToken', () => {
    test('should reject request without authorization header', () => {
      authenticateToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Access token required' });
      expect(next).not.toHaveBeenCalled();
    });

    test('should reject request without token in bearer format', () => {
      req.headers.authorization = 'InvalidFormat';
      
      authenticateToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Access token required' });
      expect(next).not.toHaveBeenCalled();
    });

    test('should reject request with invalid token', () => {
      req.headers.authorization = 'Bearer invalidtoken';
      
      authenticateToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ message: 'Invalid or expired token' });
      expect(next).not.toHaveBeenCalled();
    });

    test('should accept valid token and call next', () => {
      const validToken = jwt.sign(
        { id: 1, username: 'testuser', role: 'user' },
        'test-secret-key-for-testing'
      );
      req.headers.authorization = `Bearer ${validToken}`;
      
      authenticateToken(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(req.user).toBeDefined();
      expect(req.user.username).toBe('testuser');
    });

    test('should extract user data from valid token', () => {
      const userData = {
        id: 123,
        username: 'john',
        email: 'john@example.com',
        role: 'admin'
      };
      const validToken = jwt.sign(userData, 'test-secret-key-for-testing');
      req.headers.authorization = `Bearer ${validToken}`;
      
      authenticateToken(req, res, next);

      expect(req.user.id).toBe(123);
      expect(req.user.email).toBe('john@example.com');
      expect(req.user.role).toBe('admin');
    });
  });

  describe('authorizeRoles', () => {
    test('should reject when user is not authenticated', () => {
      const authorize = authorizeRoles('admin');
      req.user = undefined;
      
      authorize(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Authentication required' });
      expect(next).not.toHaveBeenCalled();
    });

    test('should reject when user role is not authorized', () => {
      const authorize = authorizeRoles('admin', 'super_admin');
      req.user = { id: 1, role: 'viewer' };
      
      authorize(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ message: 'Insufficient permissions' });
      expect(next).not.toHaveBeenCalled();
    });

    test('should allow access when user has required role', () => {
      const authorize = authorizeRoles('admin', 'super_admin');
      req.user = { id: 1, role: 'admin' };
      
      authorize(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    test('should allow access when user has any of multiple required roles', () => {
      const authorize = authorizeRoles('admin', 'viewer', 'user');
      req.user = { id: 1, role: 'user' };
      
      authorize(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    test('should handle single role authorization', () => {
      const authorize = authorizeRoles('super_admin');
      req.user = { id: 1, role: 'super_admin' };
      
      authorize(req, res, next);

      expect(next).toHaveBeenCalled();
    });
  });
});
