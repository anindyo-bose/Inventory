/**
 * Tenant Context Middleware
 * 
 * BACKWARD COMPATIBILITY: 
 * - Non-tenant JWTs work fine (tenantId and role fields are undefined)
 * - Existing code checks "if (req.context.tenantId)" before using it
 * - Super Admin has isSuperAdmin=true and can access all tenants
 * - Regular users have isSuperAdmin=false
 * 
 * This middleware:
 * 1. Extracts tenantId, role, and isSuperAdmin from JWT
 * 2. Never accepts these from request body/params (security)
 * 3. Attaches them to req.context for use in routes
 */

/**
 * Attach tenant context from JWT to request
 * 
 * req.context will have:
 * {
 *   userId: number,
 *   tenantId: number | undefined (if present in JWT),
 *   role: string | undefined (tenant-specific role if present),
 *   isSuperAdmin: boolean
 * }
 */
const tenantContextMiddleware = (req, res, next) => {
  // Initialize context with user info from JWT (set by authenticateToken)
  req.context = {
    userId: req.user?.id,
    isSuperAdmin: req.user?.role === 'super_admin', // Super Admin can access all tenants
    tenantId: req.user?.tenantId, // From JWT if available (optional)
    role: req.user?.tenantRole, // Tenant-specific role if available (optional)
  };

  // SECURITY: Never accept tenantId from request body, params, or query
  // Always use what's in the JWT (set by authentication)
  if (req.body?.tenantId) {
    delete req.body.tenantId; // Remove if someone tries to inject it
  }

  next();
};

module.exports = tenantContextMiddleware;
