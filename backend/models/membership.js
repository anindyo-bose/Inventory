/**
 * Membership Model
 * 
 * Represents a user's membership in a tenant.
 * Links users to tenants with tenant-specific roles.
 * 
 * BACKWARD COMPATIBILITY: This is a new model that doesn't affect existing code.
 */

class Membership {
  constructor(userId, tenantId, role = 'viewer', createdAt = new Date().toISOString()) {
    this.userId = userId;
    this.tenantId = tenantId;
    this.role = role; // 'admin' | 'manager' | 'viewer'
    this.createdAt = createdAt;
  }
}

module.exports = Membership;
