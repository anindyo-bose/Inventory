/**
 * Data Isolation Helper
 * 
 * Provides utilities for filtering data based on tenant context.
 * BACKWARD COMPATIBILITY: If tenantId is not set, returns true (existing behavior)
 */

/**
 * Check if a record should be visible to the current user
 * 
 * BACKWARD COMPATIBILITY:
 * - If req.context.isSuperAdmin is true: return true (access all)
 * - If req.context.tenantId exists and record.tenantId matches: return true
 * - If record.tenantId is undefined: return true (old data without tenant)
 * - Otherwise: return false
 * 
 * @param {Object} record - The data record to check
 * @param {Object} reqContext - req.context with userId, tenantId, isSuperAdmin
 * @returns {boolean} Whether the record is accessible
 */
function isAccessible(record, reqContext) {
  // Super Admin can access everything
  if (reqContext?.isSuperAdmin) {
    return true;
  }

  // If record has no tenantId, it's old data - allow access (backward compat)
  if (record?.tenantId === undefined) {
    return true;
  }

  // If user has a tenantId and it matches the record's tenantId, allow
  if (reqContext?.tenantId && record.tenantId === reqContext.tenantId) {
    return true;
  }

  // Otherwise, deny
  return false;
}

/**
 * Filter array of records by accessibility
 * 
 * @param {Array} records - Array of records to filter
 * @param {Object} reqContext - req.context
 * @returns {Array} Filtered records
 */
function filterAccessible(records, reqContext) {
  if (!Array.isArray(records)) {
    return [];
  }
  return records.filter(record => isAccessible(record, reqContext));
}

/**
 * Ensure a record belongs to the user's tenant or they are Super Admin
 * Throws error if not accessible
 * 
 * @param {Object} record - The record to check
 * @param {Object} reqContext - req.context
 * @param {string} recordType - Name of record type for error message
 * @throws {Error} With message and status
 */
function ensureAccessible(record, reqContext, recordType = 'Record') {
  if (!isAccessible(record, reqContext)) {
    const error = new Error(`${recordType} not found`);
    error.status = 404;
    throw error;
  }
}

/**
 * Add tenantId to a new record if user is in a tenant
 * 
 * BACKWARD COMPATIBILITY:
 * - If user has tenantId, add it to the record
 * - If user doesn't have tenantId (older flow), don't add it
 * 
 * @param {Object} record - New record to enhance
 * @param {Object} reqContext - req.context
 * @returns {Object} Record with tenantId if applicable
 */
function addTenantId(record, reqContext) {
  // Super Admin creating records doesn't bind them to a tenant
  // Regular users' records are bound to their current tenant if they're in one
  if (reqContext?.tenantId && !reqContext?.isSuperAdmin) {
    record.tenantId = reqContext.tenantId;
  }
  return record;
}

module.exports = {
  isAccessible,
  filterAccessible,
  ensureAccessible,
  addTenantId
};
