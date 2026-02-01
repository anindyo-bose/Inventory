/**
 * Tenant Model
 * 
 * Represents an organization/tenant in the multi-tenancy system.
 * Each tenant has its own isolated data.
 * 
 * BACKWARD COMPATIBILITY: This is a new model that doesn't affect existing code.
 */

class Tenant {
  constructor(id, name, slug, status = 'active', createdAt = new Date().toISOString()) {
    this.id = id;
    this.name = name;
    this.slug = slug; // URL-friendly identifier (e.g., 'demo-corp')
    this.status = status; // 'active' | 'suspended'
    this.createdAt = createdAt;
  }
}

module.exports = Tenant;
