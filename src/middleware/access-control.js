/**
 * Access Control Middleware
 * Role-based access control (RBAC)
 */

const { hasPermission, hasHigherRole, ROLES } = require('../constants/roles');
const { forbiddenResponse } = require('../utils/response-utils');
const logger = require('../config/logger-config');

/**
 * Require specific role(s)
 * @param {Array<string>|string} allowedRoles - Allowed roles
 * @returns {Function}
 */
const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return forbiddenResponse(res, 'Authentication required');
    }
    
    const userRole = req.user.role;
    
    if (!allowedRoles.includes(userRole)) {
      logger.logSecurity('access_denied', {
        userId: req.user.id,
        requiredRoles: allowedRoles,
        userRole
      });
      
      return forbiddenResponse(res, 'Access denied. Insufficient permissions.');
    }
    
    next();
  };
};

/**
 * Require specific permission
 * @param {string} permission - Required permission
 * @returns {Function}
 */
const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return forbiddenResponse(res, 'Authentication required');
    }
    
    const userRole = req.user.role;
    
    if (!hasPermission(userRole, permission)) {
      logger.logSecurity('permission_denied', {
        userId: req.user.id,
        requiredPermission: permission,
        userRole
      });
      
      return forbiddenResponse(res, 'Access denied. Insufficient permissions.');
    }
    
    next();
  };
};

/**
 * Require admin role (admin or super_admin)
 */
const requireAdmin = requireRole(ROLES.ADMIN, ROLES.SUPER_ADMIN);

/**
 * Require super admin role
 */
const requireSuperAdmin = requireRole(ROLES.SUPER_ADMIN);

/**
 * Check if user owns the resource
 * @param {string} userIdParam - Request parameter name containing user ID
 * @returns {Function}
 */
const requireOwnership = (userIdParam = 'userId') => {
  return (req, res, next) => {
    if (!req.user) {
      return forbiddenResponse(res, 'Authentication required');
    }
    
    const resourceUserId = req.params[userIdParam] || req.body[userIdParam];
    
    // Allow if user owns the resource or is admin
    if (req.user.id === resourceUserId || 
        hasHigherRole(req.user.role, ROLES.STUDENT)) {
      return next();
    }
    
    logger.logSecurity('ownership_violation', {
      userId: req.user.id,
      resourceUserId
    });
    
    return forbiddenResponse(res, 'Access denied. You can only access your own resources.');
  };
};

/**
 * Check ownership or admin access
 * @param {string} userIdParam - Request parameter name containing user ID
 * @returns {Function}
 */
const requireOwnershipOrAdmin = (userIdParam = 'userId') => {
  return (req, res, next) => {
    if (!req.user) {
      return forbiddenResponse(res, 'Authentication required');
    }
    
    const resourceUserId = req.params[userIdParam] || req.body[userIdParam];
    
    // Allow if user owns resource or is admin/super_admin
    if (req.user.id === resourceUserId || 
        [ROLES.ADMIN, ROLES.SUPER_ADMIN].includes(req.user.role)) {
      return next();
    }
    
    return forbiddenResponse(res, 'Access denied.');
  };
};

module.exports = {
  requireRole,
  requirePermission,
  requireAdmin,
  requireSuperAdmin,
  requireOwnership,
  requireOwnershipOrAdmin
};