/**
 * User Model
 * Database operations for users table
 */

const { query, transaction } = require('../config/db-config');
const { NotFoundError, ConflictError } = require('../utils/error-utils');
const logger = require('../config/logger-config');

/**
 * Create new user
 * @param {Object} userData - User data
 * @returns {Promise<Object>}
 */
const create = async (userData) => {
  const {
    email,
    passwordHash,
    fullName,
    phoneNumber,
    role = 'student'
  } = userData;
  
  const sql = `
    INSERT INTO users (email, password_hash, full_name, phone_number, role)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING id, email, full_name, phone_number, role, is_email_verified, 
              is_active, created_at, updated_at
  `;
  
  try {
    const result = await query(sql, [email, passwordHash, fullName, phoneNumber, role]);
    logger.info('User created', { userId: result.rows[0].id, email });
    return result.rows[0];
  } catch (error) {
    if (error.code === '23505') { // Unique violation
      throw new ConflictError('User with this email already exists');
    }
    throw error;
  }
};

/**
 * Find user by ID
 * @param {string} userId - User ID
 * @returns {Promise<Object|null>}
 */
const findById = async (userId) => {
  const sql = `
    SELECT id, email, password_hash, full_name, phone_number, role, 
           is_email_verified, is_active, last_login, created_at, updated_at
    FROM users
    WHERE id = $1
  `;
  
  const result = await query(sql, [userId]);
  return result.rows[0] || null;
};

/**
 * Find user by email
 * @param {string} email - Email address
 * @returns {Promise<Object|null>}
 */
const findByEmail = async (email) => {
  const sql = `
    SELECT id, email, password_hash, full_name, phone_number, role, 
           is_email_verified, is_active, last_login, created_at, updated_at
    FROM users
    WHERE email = $1
  `;
  
  const result = await query(sql, [email]);
  return result.rows[0] || null;
};

/**
 * Update user
 * @param {string} userId - User ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object>}
 */
const update = async (userId, updates) => {
  const allowedFields = ['full_name', 'phone_number', 'is_active'];
  const fields = [];
  const values = [];
  let paramCounter = 1;
  
  Object.keys(updates).forEach(key => {
    if (allowedFields.includes(key)) {
      fields.push(`${key} = $${paramCounter}`);
      values.push(updates[key]);
      paramCounter++;
    }
  });
  
  if (fields.length === 0) {
    throw new Error('No valid fields to update');
  }
  
  values.push(userId);
  
  const sql = `
    UPDATE users
    SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
    WHERE id = $${paramCounter}
    RETURNING id, email, full_name, phone_number, role, is_email_verified, 
              is_active, created_at, updated_at
  `;
  
  const result = await query(sql, values);
  
  if (result.rows.length === 0) {
    throw new NotFoundError('User not found');
  }
  
  logger.info('User updated', { userId, fields: Object.keys(updates) });
  return result.rows[0];
};

/**
 * Update password
 * @param {string} userId - User ID
 * @param {string} passwordHash - New password hash
 * @returns {Promise<boolean>}
 */
const updatePassword = async (userId, passwordHash) => {
  const sql = `
    UPDATE users
    SET password_hash = $1, updated_at = CURRENT_TIMESTAMP
    WHERE id = $2
    RETURNING id
  `;
  
  const result = await query(sql, [passwordHash, userId]);
  
  if (result.rows.length === 0) {
    throw new NotFoundError('User not found');
  }
  
  logger.info('User password updated', { userId });
  return true;
};

/**
 * Update last login
 * @param {string} userId - User ID
 * @returns {Promise<boolean>}
 */
const updateLastLogin = async (userId) => {
  const sql = `
    UPDATE users
    SET last_login = CURRENT_TIMESTAMP
    WHERE id = $1
  `;
  
  await query(sql, [userId]);
  return true;
};

/**
 * Set email verification token
 * @param {string} userId - User ID
 * @param {string} token - Verification token
 * @param {Date} expiresAt - Expiration date
 * @returns {Promise<boolean>}
 */
const setEmailVerificationToken = async (userId, token, expiresAt) => {
  const sql = `
    UPDATE users
    SET email_verification_token = $1,
        email_verification_expires = $2,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = $3
  `;
  
  await query(sql, [token, expiresAt, userId]);
  return true;
};

/**
 * Verify email
 * @param {string} token - Verification token
 * @returns {Promise<Object>}
 */
const verifyEmail = async (token) => {
  const sql = `
    UPDATE users
    SET is_email_verified = true,
        email_verification_token = NULL,
        email_verification_expires = NULL,
        updated_at = CURRENT_TIMESTAMP
    WHERE email_verification_token = $1
      AND email_verification_expires > CURRENT_TIMESTAMP
    RETURNING id, email, full_name
  `;
  
  const result = await query(sql, [token]);
  
  if (result.rows.length === 0) {
    throw new NotFoundError('Invalid or expired verification token');
  }
  
  logger.info('Email verified', { userId: result.rows[0].id });
  return result.rows[0];
};

/**
 * Set password reset token
 * @param {string} email - User email
 * @param {string} token - Reset token
 * @param {Date} expiresAt - Expiration date
 * @returns {Promise<Object>}
 */
const setPasswordResetToken = async (email, token, expiresAt) => {
  const sql = `
    UPDATE users
    SET password_reset_token = $1,
        password_reset_expires = $2,
        updated_at = CURRENT_TIMESTAMP
    WHERE email = $3
    RETURNING id, email, full_name
  `;
  
  const result = await query(sql, [token, expiresAt, email]);
  
  if (result.rows.length === 0) {
    throw new NotFoundError('User not found');
  }
  
  return result.rows[0];
};

/**
 * Verify password reset token
 * @param {string} token - Reset token
 * @returns {Promise<Object>}
 */
const verifyPasswordResetToken = async (token) => {
  const sql = `
    SELECT id, email, full_name
    FROM users
    WHERE password_reset_token = $1
      AND password_reset_expires > CURRENT_TIMESTAMP
  `;
  
  const result = await query(sql, [token]);
  
  if (result.rows.length === 0) {
    throw new NotFoundError('Invalid or expired reset token');
  }
  
  return result.rows[0];
};

/**
 * Reset password with token
 * @param {string} token - Reset token
 * @param {string} passwordHash - New password hash
 * @returns {Promise<Object>}
 */
const resetPassword = async (token, passwordHash) => {
  const sql = `
    UPDATE users
    SET password_hash = $1,
        password_reset_token = NULL,
        password_reset_expires = NULL,
        updated_at = CURRENT_TIMESTAMP
    WHERE password_reset_token = $2
      AND password_reset_expires > CURRENT_TIMESTAMP
    RETURNING id, email
  `;
  
  const result = await query(sql, [passwordHash, token]);
  
  if (result.rows.length === 0) {
    throw new NotFoundError('Invalid or expired reset token');
  }
  
  logger.info('Password reset', { userId: result.rows[0].id });
  return result.rows[0];
};

/**
 * Get all users with pagination
 * @param {Object} options - Query options
 * @returns {Promise<Object>}
 */
const findAll = async (options = {}) => {
  const {
    page = 1,
    limit = 10,
    role = null,
    isActive = null,
    search = null
  } = options;
  
  const offset = (page - 1) * limit;
  const conditions = [];
  const values = [];
  let paramCounter = 1;
  
  if (role) {
    conditions.push(`role = $${paramCounter}`);
    values.push(role);
    paramCounter++;
  }
  
  if (isActive !== null) {
    conditions.push(`is_active = $${paramCounter}`);
    values.push(isActive);
    paramCounter++;
  }
  
  if (search) {
    conditions.push(`(full_name ILIKE $${paramCounter} OR email ILIKE $${paramCounter})`);
    values.push(`%${search}%`);
    paramCounter++;
  }
  
  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  
  const countSql = `SELECT COUNT(*) FROM users ${whereClause}`;
  const dataSql = `
    SELECT id, email, full_name, phone_number, role, is_email_verified, 
           is_active, last_login, created_at
    FROM users
    ${whereClause}
    ORDER BY created_at DESC
    LIMIT $${paramCounter} OFFSET $${paramCounter + 1}
  `;
  
  const countResult = await query(countSql, values);
  const dataResult = await query(dataSql, [...values, limit, offset]);
  
  return {
    users: dataResult.rows,
    pagination: {
      page,
      limit,
      total: parseInt(countResult.rows[0].count, 10),
      totalPages: Math.ceil(countResult.rows[0].count / limit)
    }
  };
};

/**
 * Delete user (soft delete by setting is_active = false)
 * @param {string} userId - User ID
 * @returns {Promise<boolean>}
 */
const softDelete = async (userId) => {
  const sql = `
    UPDATE users
    SET is_active = false, updated_at = CURRENT_TIMESTAMP
    WHERE id = $1
    RETURNING id
  `;
  
  const result = await query(sql, [userId]);
  
  if (result.rows.length === 0) {
    throw new NotFoundError('User not found');
  }
  
  logger.info('User soft deleted', { userId });
  return true;
};

/**
 * Count users by role
 * @returns {Promise<Object>}
 */
const countByRole = async () => {
  const sql = `
    SELECT role, COUNT(*) as count
    FROM users
    WHERE is_active = true
    GROUP BY role
  `;
  
  const result = await query(sql);
  
  const counts = {};
  result.rows.forEach(row => {
    counts[row.role] = parseInt(row.count, 10);
  });
  
  return counts;
};

module.exports = {
  create,
  findById,
  findByEmail,
  update,
  updatePassword,
  updateLastLogin,
  setEmailVerificationToken,
  verifyEmail,
  setPasswordResetToken,
  verifyPasswordResetToken,
  resetPassword,
  findAll,
  softDelete,
  countByRole
};