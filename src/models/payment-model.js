/**
 * Payment Model
 * Database operations for payments table
 */

const { query } = require('../config/db-config');
const { NotFoundError } = require('../utils/error-utils');
const logger = require('../config/logger-config');

/**
 * Create new payment
 * @param {Object} paymentData - Payment data
 * @returns {Promise<Object>}
 */
const create = async (paymentData) => {
  const {
    userId,
    enrollmentId,
    paymentReference,
    amount,
    stage,
    paymentDescription,
    customerName,
    customerEmail,
    customerPhone,
    expiresAt,
    metadata = {}
  } = paymentData;
  
  const sql = `
    INSERT INTO payments (
      user_id, enrollment_id, payment_reference, amount, stage,
      payment_description, customer_name, customer_email, customer_phone,
      expires_at, metadata
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    RETURNING *
  `;
  
  const result = await query(sql, [
    userId,
    enrollmentId,
    paymentReference,
    amount,
    stage,
    paymentDescription,
    customerName,
    customerEmail,
    customerPhone,
    expiresAt,
    JSON.stringify(metadata)
  ]);
  
  logger.logPayment('payment_created', {
    paymentId: result.rows[0].id,
    userId,
    amount,
    stage
  });
  
  return result.rows[0];
};

/**
 * Find payment by ID
 * @param {string} paymentId - Payment ID
 * @returns {Promise<Object|null>}
 */
const findById = async (paymentId) => {
  const sql = `
    SELECT p.*, 
           u.full_name as user_name, u.email as user_email,
           e.skill, e.scholarship_type
    FROM payments p
    INNER JOIN users u ON p.user_id = u.id
    INNER JOIN enrollments e ON p.enrollment_id = e.id
    WHERE p.id = $1
  `;
  
  const result = await query(sql, [paymentId]);
  return result.rows[0] || null;
};

/**
 * Find payment by reference
 * @param {string} paymentReference - Payment reference
 * @returns {Promise<Object|null>}
 */
const findByReference = async (paymentReference) => {
  const sql = `
    SELECT p.*, 
           u.full_name as user_name, u.email as user_email,
           e.skill, e.scholarship_type
    FROM payments p
    INNER JOIN users u ON p.user_id = u.id
    INNER JOIN enrollments e ON p.enrollment_id = e.id
    WHERE p.payment_reference = $1
  `;
  
  const result = await query(sql, [paymentReference]);
  return result.rows[0] || null;
};

/**
 * Find payment by Monnify transaction reference
 * @param {string} monnifyRef - Monnify transaction reference
 * @returns {Promise<Object|null>}
 */
const findByMonnifyReference = async (monnifyRef) => {
  const sql = `
    SELECT *
    FROM payments
    WHERE monnify_transaction_ref = $1
  `;
  
  const result = await query(sql, [monnifyRef]);
  return result.rows[0] || null;
};

/**
 * Find payments by user ID
 * @param {string} userId - User ID
 * @returns {Promise<Array>}
 */
const findByUserId = async (userId) => {
  const sql = `
    SELECT p.*, e.skill
    FROM payments p
    INNER JOIN enrollments e ON p.enrollment_id = e.id
    WHERE p.user_id = $1
    ORDER BY p.created_at DESC
  `;
  
  const result = await query(sql, [userId]);
  return result.rows;
};

/**
 * Find payments by enrollment ID
 * @param {string} enrollmentId - Enrollment ID
 * @returns {Promise<Array>}
 */
const findByEnrollmentId = async (enrollmentId) => {
  const sql = `
    SELECT *
    FROM payments
    WHERE enrollment_id = $1
    ORDER BY stage ASC
  `;
  
  const result = await query(sql, [enrollmentId]);
  return result.rows;
};

/**
 * Update payment
 * @param {string} paymentId - Payment ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object>}
 */
const update = async (paymentId, updates) => {
  const allowedFields = [
    'status',
    'monnify_transaction_ref',
    'payment_method',
    'payment_url',
    'checkout_url',
    'transaction_fee',
    'paid_at',
    'error_message',
    'retry_count',
    'metadata'
  ];
  
  const fields = [];
  const values = [];
  let paramCounter = 1;
  
  Object.keys(updates).forEach(key => {
    if (allowedFields.includes(key)) {
      let value = updates[key];
      
      // Convert metadata to JSON string
      if (key === 'metadata' && typeof value === 'object') {
        value = JSON.stringify(value);
      }
      
      fields.push(`${key} = $${paramCounter}`);
      values.push(value);
      paramCounter++;
    }
  });
  
  if (fields.length === 0) {
    throw new Error('No valid fields to update');
  }
  
  values.push(paymentId);
  
  const sql = `
    UPDATE payments
    SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
    WHERE id = $${paramCounter}
    RETURNING *
  `;
  
  const result = await query(sql, values);
  
  if (result.rows.length === 0) {
    throw new NotFoundError('Payment not found');
  }
  
  logger.logPayment('payment_updated', {
    paymentId,
    fields: Object.keys(updates)
  });
  
  return result.rows[0];
};

/**
 * Update payment status
 * @param {string} paymentId - Payment ID
 * @param {string} status - Payment status
 * @param {Object} additionalData - Additional data to update
 * @returns {Promise<Object>}
 */
const updateStatus = async (paymentId, status, additionalData = {}) => {
  const updates = { status, ...additionalData };
  
  if (status === 'completed') {
    updates.paid_at = new Date();
  }
  
  return update(paymentId, updates);
};

/**
 * Mark payment as expired
 * @returns {Promise<number>}
 */
const markExpiredPayments = async () => {
  const sql = `
    UPDATE payments
    SET status = 'expired',
        updated_at = CURRENT_TIMESTAMP
    WHERE status = 'pending'
      AND expires_at < CURRENT_TIMESTAMP
    RETURNING id
  `;
  
  const result = await query(sql);
  
  if (result.rows.length > 0) {
    logger.info('Payments marked as expired', {
      count: result.rows.length
    });
  }
  
  return result.rows.length;
};

/**
 * Get all payments with pagination
 * @param {Object} options - Query options
 * @returns {Promise<Object>}
 */
const findAll = async (options = {}) => {
  const {
    page = 1,
    limit = 10,
    status = null,
    stage = null,
    userId = null,
    startDate = null,
    endDate = null
  } = options;
  
  const offset = (page - 1) * limit;
  const conditions = [];
  const values = [];
  let paramCounter = 1;
  
  if (status) {
    conditions.push(`p.status = $${paramCounter}`);
    values.push(status);
    paramCounter++;
  }
  
  if (stage) {
    conditions.push(`p.stage = $${paramCounter}`);
    values.push(stage);
    paramCounter++;
  }
  
  if (userId) {
    conditions.push(`p.user_id = $${paramCounter}`);
    values.push(userId);
    paramCounter++;
  }
  
  if (startDate) {
    conditions.push(`p.created_at >= $${paramCounter}`);
    values.push(startDate);
    paramCounter++;
  }
  
  if (endDate) {
    conditions.push(`p.created_at <= $${paramCounter}`);
    values.push(endDate);
    paramCounter++;
  }
  
  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  
  const countSql = `
    SELECT COUNT(*) 
    FROM payments p
    ${whereClause}
  `;
  
  const dataSql = `
    SELECT p.*, 
           u.full_name as user_name, u.email as user_email,
           e.skill, e.scholarship_type
    FROM payments p
    INNER JOIN users u ON p.user_id = u.id
    INNER JOIN enrollments e ON p.enrollment_id = e.id
    ${whereClause}
    ORDER BY p.created_at DESC
    LIMIT $${paramCounter} OFFSET $${paramCounter + 1}
  `;
  
  const countResult = await query(countSql, values);
  const dataResult = await query(dataSql, [...values, limit, offset]);
  
  return {
    payments: dataResult.rows,
    pagination: {
      page,
      limit,
      total: parseInt(countResult.rows[0].count, 10),
      totalPages: Math.ceil(countResult.rows[0].count / limit)
    }
  };
};

/**
 * Get payment statistics
 * @returns {Promise<Object>}
 */
const getStatistics = async () => {
  const sql = `
    SELECT 
      COUNT(*) as total_payments,
      COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_payments,
      COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_payments,
      COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_payments,
      SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END) as total_revenue,
      AVG(CASE WHEN status = 'completed' THEN amount END) as average_payment,
      COUNT(CASE WHEN stage = 1 THEN 1 END) as stage_1_payments,
      COUNT(CASE WHEN stage = 2 THEN 1 END) as stage_2_payments,
      COUNT(CASE WHEN stage = 3 THEN 1 END) as stage_3_payments
    FROM payments
  `;
  
  const result = await query(sql);
  return result.rows[0];
};

/**
 * Get recent payments
 * @param {number} limit - Number of payments to retrieve
 * @returns {Promise<Array>}
 */
const getRecent = async (limit = 10) => {
  const sql = `
    SELECT p.*, 
           u.full_name as user_name, u.email as user_email,
           e.skill
    FROM payments p
    INNER JOIN users u ON p.user_id = u.id
    INNER JOIN enrollments e ON p.enrollment_id = e.id
    ORDER BY p.created_at DESC
    LIMIT $1
  `;
  
  const result = await query(sql, [limit]);
  return result.rows;
};

/**
 * Delete payment
 * @param {string} paymentId - Payment ID
 * @returns {Promise<boolean>}
 */
const deleteById = async (paymentId) => {
  const sql = `
    DELETE FROM payments
    WHERE id = $1
    RETURNING id
  `;
  
  const result = await query(sql, [paymentId]);
  
  if (result.rows.length === 0) {
    throw new NotFoundError('Payment not found');
  }
  
  logger.logPayment('payment_deleted', { paymentId });
  return true;
};

module.exports = {
  create,
  findById,
  findByReference,
  findByMonnifyReference,
  findByUserId,
  findByEnrollmentId,
  update,
  updateStatus,
  markExpiredPayments,
  findAll,
  getStatistics,
  getRecent,
  deleteById
};