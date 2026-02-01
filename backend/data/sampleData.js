/**
 * Sample Development Data for Multi-Tenancy
 * 
 * This file provides default data for development/testing purposes.
 * It is loaded on server startup only in development environment.
 * 
 * BACKWARD COMPATIBILITY: This is optional and environment-based.
 * The application works normally without this data.
 * Load this in development only via NODE_ENV=development
 */

const Tenant = require('../models/tenant');
const Membership = require('../models/membership');

const sampleData = {
  // Sample tenants
  tenants: [
    new Tenant(1, 'Demo Corp', 'demo-corp', 'active', new Date('2024-01-15').toISOString()),
    new Tenant(2, 'Test Organization', 'test-org', 'active', new Date('2024-01-20').toISOString()),
    new Tenant(3, 'Acme Inc', 'acme-inc', 'active', new Date('2024-02-01').toISOString()),
  ],

  // Sample memberships linking users to tenants
  // Structure: { userId, tenantId, role }
  memberships: [
    // Super Admin (id: 1) has access to all tenants
    new Membership(1, 1, 'admin'),
    new Membership(1, 2, 'admin'),
    new Membership(1, 3, 'admin'),
    
    // Admin user (id: 2): tenant admin in Demo Corp, manager in Test Org
    new Membership(2, 1, 'admin'),
    new Membership(2, 2, 'manager'),
    
    // Regular user (id: 3): viewer in Demo Corp
    new Membership(3, 1, 'viewer'),
    
    // Viewer user (id: 4): viewer in Test Org
    new Membership(4, 2, 'viewer'),
    
    // NEW TENANT MAPPINGS - Acme Inc
    // John (id: 5): admin in Acme Inc
    new Membership(5, 3, 'admin'),
    
    // Jane (id: 6): manager in Acme Inc
    new Membership(6, 3, 'manager'),
    
    // Bob (id: 7): viewer in Acme Inc
    new Membership(7, 3, 'viewer'),
  ],
};

/**
 * Initialize sample data into the provided stores
 * 
 * @param {Array} tenantsStore - Reference to tenants array
 * @param {Array} membershipsStore - Reference to memberships array
 * @returns {void}
 */
function initializeSampleData(tenantsStore, membershipsStore) {
  if (process.env.NODE_ENV !== 'development') {
    return;
  }

  // Only initialize if stores are empty
  if (tenantsStore.length === 0) {
    tenantsStore.push(...sampleData.tenants);
    console.log('✓ Initialized sample tenants');
  }

  if (membershipsStore.length === 0) {
    membershipsStore.push(...sampleData.memberships);
    console.log('✓ Initialized sample memberships');
  }
}

module.exports = { sampleData, initializeSampleData };
