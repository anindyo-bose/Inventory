/**
 * Tenant Management Routes
 * 
 * SUPER ADMIN ONLY - These endpoints allow Super Admins to:
 * - Create new tenants
 * - List all tenants
 * - Assign/remove users from tenants
 * - Manage tenant-specific user roles
 * 
 * BACKWARD COMPATIBILITY: These are entirely new endpoints.
 * Existing routes are not modified or renamed.
 */

const express = require('express');
const { body, param, validationResult } = require('express-validator');
const router = express.Router();
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const tenantContextMiddleware = require('../middleware/tenantContext');

/**
 * IMPORTANT: These will be populated by server.js on startup
 * They are shared references to the data stores
 */
let tenantsStore = [];
let membershipsStore = [];
let usersStore = [];

/**
 * Initialize stores (called from server.js)
 */
function initializeTenantRoutes(tenants, memberships, users) {
  tenantsStore = tenants;
  membershipsStore = memberships;
  usersStore = users;
}

// ==================== SUPER ADMIN: Tenant Management ====================

/**
 * POST /tenants
 * Create a new tenant (Super Admin only)
 * 
 * BACKWARD COMPATIBILITY: New endpoint, doesn't affect existing flows
 */
router.post(
  '/',
  authenticateToken,
  authorizeRoles('super_admin'),
  [
    body('name')
      .trim()
      .notEmpty()
      .withMessage('Tenant name is required')
      .isLength({ min: 3, max: 100 })
      .withMessage('Name must be 3-100 characters'),
    body('slug')
      .trim()
      .notEmpty()
      .withMessage('Slug is required')
      .matches(/^[a-z0-9-]+$/)
      .withMessage('Slug can only contain lowercase letters, numbers, and hyphens')
      .isLength({ min: 3, max: 50 })
      .withMessage('Slug must be 3-50 characters')
  ],
  (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { name, slug } = req.body;

      // Check if slug already exists
      if (tenantsStore.some(t => t.slug === slug)) {
        return res.status(409).json({ message: 'Slug already exists' });
      }

      // Create new tenant
      const newId = tenantsStore.length ? Math.max(...tenantsStore.map(t => t.id)) + 1 : 1;
      const newTenant = {
        id: newId,
        name,
        slug,
        status: 'active',
        createdAt: new Date().toISOString()
      };

      tenantsStore.push(newTenant);

      res.status(201).json({
        message: 'Tenant created successfully',
        tenant: newTenant
      });
    } catch (error) {
      console.error('Create tenant error:', error);
      res.status(500).json({ message: 'Server error while creating tenant' });
    }
  }
);

/**
 * GET /tenants
 * List all tenants (Super Admin only)
 * 
 * BACKWARD COMPATIBILITY: New endpoint
 */
router.get(
  '/',
  authenticateToken,
  authorizeRoles('super_admin'),
  (req, res) => {
    try {
      res.json({
        tenants: tenantsStore,
        total: tenantsStore.length
      });
    } catch (error) {
      console.error('List tenants error:', error);
      res.status(500).json({ message: 'Server error while listing tenants' });
    }
  }
);

/**
 * GET /tenants/:tenantId
 * Get tenant details (Super Admin only)
 * 
 * BACKWARD COMPATIBILITY: New endpoint
 */
router.get(
  '/:tenantId',
  authenticateToken,
  authorizeRoles('super_admin'),
  [param('tenantId').isInt().withMessage('Invalid tenant ID')],
  (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const tenant = tenantsStore.find(t => t.id === parseInt(req.params.tenantId));
      if (!tenant) {
        return res.status(404).json({ message: 'Tenant not found' });
      }

      // Get members of this tenant
      const members = membershipsStore
        .filter(m => m.tenantId === tenant.id)
        .map(m => {
          const user = usersStore.find(u => u.id === m.userId);
          return {
            userId: m.userId,
            username: user?.username,
            email: user?.email,
            tenantRole: m.role,
            joinedAt: m.createdAt
          };
        });

      res.json({
        tenant,
        members,
        memberCount: members.length
      });
    } catch (error) {
      console.error('Get tenant error:', error);
      res.status(500).json({ message: 'Server error while fetching tenant' });
    }
  }
);

// ==================== SUPER ADMIN: User Membership Management ====================

/**
 * POST /tenants/:tenantId/users
 * Assign a user to a tenant (Super Admin only)
 * 
 * Body: { userId, role: 'admin' | 'manager' | 'viewer' }
 * 
 * BACKWARD COMPATIBILITY: New endpoint
 */
router.post(
  '/:tenantId/users',
  authenticateToken,
  authorizeRoles('super_admin'),
  [
    param('tenantId').isInt().withMessage('Invalid tenant ID'),
    body('userId').isInt().withMessage('User ID must be an integer'),
    body('role')
      .isIn(['admin', 'manager', 'viewer'])
      .withMessage('Role must be admin, manager, or viewer')
  ],
  (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { userId, role } = req.body;
      const tenantId = parseInt(req.params.tenantId);

      // Verify tenant exists
      const tenant = tenantsStore.find(t => t.id === tenantId);
      if (!tenant) {
        return res.status(404).json({ message: 'Tenant not found' });
      }

      // Verify user exists
      const user = usersStore.find(u => u.id === userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Check if user already has membership in this tenant
      const existingMembership = membershipsStore.find(
        m => m.userId === userId && m.tenantId === tenantId
      );
      if (existingMembership) {
        return res.status(409).json({ message: 'User is already a member of this tenant' });
      }

      // Create membership
      const newMembership = {
        userId,
        tenantId,
        role,
        createdAt: new Date().toISOString()
      };

      membershipsStore.push(newMembership);

      res.status(201).json({
        message: 'User assigned to tenant successfully',
        membership: newMembership
      });
    } catch (error) {
      console.error('Assign user to tenant error:', error);
      res.status(500).json({ message: 'Server error while assigning user' });
    }
  }
);

/**
 * PATCH /tenants/:tenantId/users/:userId
 * Update user's role in a tenant (Super Admin or Tenant Admin)
 * 
 * Body: { role: 'admin' | 'manager' | 'viewer' }
 * 
 * BACKWARD COMPATIBILITY: New endpoint
 */
router.patch(
  '/:tenantId/users/:userId',
  authenticateToken,
  authorizeRoles('super_admin'),
  [
    param('tenantId').isInt().withMessage('Invalid tenant ID'),
    param('userId').isInt().withMessage('Invalid user ID'),
    body('role')
      .isIn(['admin', 'manager', 'viewer'])
      .withMessage('Role must be admin, manager, or viewer')
  ],
  (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { role } = req.body;
      const tenantId = parseInt(req.params.tenantId);
      const userId = parseInt(req.params.userId);

      // Find membership
      const membership = membershipsStore.find(
        m => m.userId === userId && m.tenantId === tenantId
      );
      if (!membership) {
        return res.status(404).json({ message: 'User is not a member of this tenant' });
      }

      // Update role
      membership.role = role;

      res.json({
        message: 'User role updated successfully',
        membership
      });
    } catch (error) {
      console.error('Update user role error:', error);
      res.status(500).json({ message: 'Server error while updating user role' });
    }
  }
);

/**
 * DELETE /tenants/:tenantId/users/:userId
 * Remove user from a tenant (Super Admin only)
 * 
 * BACKWARD COMPATIBILITY: New endpoint
 */
router.delete(
  '/:tenantId/users/:userId',
  authenticateToken,
  authorizeRoles('super_admin'),
  [
    param('tenantId').isInt().withMessage('Invalid tenant ID'),
    param('userId').isInt().withMessage('Invalid user ID')
  ],
  (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const tenantId = parseInt(req.params.tenantId);
      const userId = parseInt(req.params.userId);

      // Find and remove membership
      const index = membershipsStore.findIndex(
        m => m.userId === userId && m.tenantId === tenantId
      );
      if (index === -1) {
        return res.status(404).json({ message: 'User is not a member of this tenant' });
      }

      membershipsStore.splice(index, 1);

      res.json({ message: 'User removed from tenant successfully' });
    } catch (error) {
      console.error('Remove user from tenant error:', error);
      res.status(500).json({ message: 'Server error while removing user' });
    }
  }
);

// ==================== Regular Users: View Own Tenants ====================

/**
 * GET /my-tenants
 * List tenants assigned to current user (all roles)
 * 
 * BACKWARD COMPATIBILITY: New endpoint
 * Users can see which tenants they belong to and their role in each
 */
router.get(
  '/user/my-tenants',
  authenticateToken,
  (req, res) => {
    try {
      const userId = req.user.id;

      // Get all memberships for this user
      const userMemberships = membershipsStore.filter(m => m.userId === userId);

      // Get tenant details for each membership
      const tenantList = userMemberships
        .map(m => {
          const tenant = tenantsStore.find(t => t.id === m.tenantId);
          return {
            ...tenant,
            userRole: m.role,
            joinedAt: m.createdAt
          };
        })
        .filter(t => t && t.status === 'active'); // Only active tenants

      res.json({
        tenants: tenantList,
        total: tenantList.length
      });
    } catch (error) {
      console.error('Get user tenants error:', error);
      res.status(500).json({ message: 'Server error while fetching user tenants' });
    }
  }
);

module.exports = router;
module.exports.initializeTenantRoutes = initializeTenantRoutes;
