/**
 * User Role Definitions
 * Defines all user roles and their hierarchical permissions
 */

const ROLES = {
    STUDENT: 'student',
    ADMIN: 'admin',
    SUPER_ADMIN: 'super_admin'
};

const ROLE_HIERARCHY = {
    [ROLES.STUDENT]: 1,
    [ROLES.ADMIN]: 2,
    [ROLES.SUPER_ADMIN]: 3
};

const ROLE_PERMISSIONS = {
    [ROLES.STUDENT]: [
        'read:own_profile',
        'update:own_profile',
        'read:own_payments',
        'create:payment',
        'read:own_enrollment'
    ],
    [ROLES.ADMIN]: [
        'read:own_profile',
        'update:own_profile',
        'read:own_payments',
        'create:payment',
        'read:own_enrollment',
        'read:all_users',
        'read:all_payments',
        'update:payment_status',
        'read:analytics',
        'read:audit_logs',
        'create:user',
        'update:user',
        'send:notifications'
    ],
    [ROLES.SUPER_ADMIN]: [
        'read:own_profile',
        'update:own_profile',
        'read:own_payments',
        'create:payment',
        'read:own_enrollment',
        'read:all_users',
        'read:all_payments',
        'update:payment_status',
        'read:analytics',
        'read:audit_logs',
        'create:user',
        'update:user',
        'delete:user',
        'send:notifications',
        'manage:admins',
        'update:system_settings',
        'access:database',
        'manage:roles'
    ]
};

/**
 * Check if a role has a specific permission
 * @param {string} role - User role
 * @param {string} permission - Permission to check
 * @returns {boolean}
 */
const hasPermission = (role, permission) => {
    const permissions = ROLE_PERMISSIONS[role] || [];
    return permissions.includes(permission);
};

/**
 * Check if a role has higher or equal hierarchy than another
 * @param {string} role1 - First role
 * @param {string} role2 - Second role
 * @returns {boolean}
 */
const hasHigherRole = (role1, role2) => {
    return ROLE_HIERARCHY[role1] >= ROLE_HIERARCHY[role2];
};

/**
 * Validate if a role exists
 * @param {string} role - Role to validate
 * @returns {boolean}
 */
const isValidRole = (role) => {
    return Object.values(ROLES).includes(role);
};

/**
 * Get all permissions for a role
 * @param {string} role - User role
 * @returns {Array<string>}
 */
const getRolePermissions = (role) => {
    return ROLE_PERMISSIONS[role] || [];
};

module.exports = {
    ROLES,
    ROLE_HIERARCHY,
    ROLE_PERMISSIONS,
    hasPermission,
    hasHigherRole,
    isValidRole,
    getRolePermissions
};