/**
 * Transaction Model
 * Database operations for transactions table
 */

const { query } = require('../config/db-config');
const { NotFoundError } = require('../utils/error-utils');
const logger = require('../config/logger-config');

/**
 * Create new transaction
 * @param {Object} transactionData - Transaction data
 * @returns {Promise<Object>}
 */
const create = async (transactionData) => {
  const {
    paymentId,
    userId,
    transactionType,
    amount,
    status = 'initiated',
    transactionReference,
    externalReference,
    paymentMethod,
    currency = 'NGN',
    description,
    metadata = {},
    ipAddress,
    userAgent
  } = transactionData;
  
  const sql = `
    INSERT INTO transactions (
      payment_id, user_id, transaction_type, amount, status,
      transaction_reference, external_reference, payment_method,
      currency, description, metadata, ip_address, user_agent
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
    RETURNING *
  `;
  
  const result = await query(sql, [
    paymentId,
    userId,
    transactionType,
    amount,
    status,
    transactionReference,
    externalReference,
    paymentMethod,
    currency,
    description,
    JSON.stringify(metadata),
    ipAddress,
    userAgent
  ]);
  
  logger.info('Transaction created', {
    transactionId: result.rows[0].id,
    type: transactionType,
    amount
  });
  
  return result.rows[0];
};

/**
 * Find transaction by ID
 * @param {string} transactionId - Transaction ID
 * @returns {Promise<Object|null>}
 */
const findById = async (transactionId) => {
  const sql = `SELECT * FROM transactions WHERE id = $1`;
  const result = await query(sql, [transactionId]);
  return result.rows[0] || null;
};

/**
 * Find by transaction reference
 * @param {string} reference - Transaction reference
 * @returns {Promise<Object|null>}
 */
const findByReference = async (reference) => {
  const sql = `SELECT * FROM transactions WHERE transaction_reference = $1`;
  const result = await query(sql, [reference]);
  return result.rows[0] || null;
};

/**
 * Find by external reference
 * @param {string} externalRef - External reference
 * @returns {Promise<Object|null>}
 */
const findByExternalReference = async (externalRef) => {
  const sql = `SELECT * FROM transactions WHERE external_reference = $1`;
  const result = await query(sql, [externalRef]);
  return result.rows[0] || null;
};

/**
 * Find transactions by payment ID
 * @param {string} paymentId - Payment ID
 * @returns {Promise<Array>}
 */
const findByPaymentId = async (paymentId) => {
  const sql = `
    SELECT * FROM transactions 
    WHERE payment_id = $1 
    ORDER BY created_at DESC
  `;
  const result = await query(sql, [paymentId]);
  return result.rows;
};

/**
 * Find transactions by user ID
 * @param {string} userId - User ID
 * @returns {Promise<Array>}
 */
const findByUserId = async (userId) => {
  const sql = `
    SELECT * FROM transactions 
    WHERE user_id = $1 
    ORDER BY created_at DESC
  `;
  const result = await query(sql, [userId]);
  return result.rows;
};

/**
 * Update transaction status
 * @param {string} transactionId - Transaction ID
 * @param {string} status - New status
 * @param {Object} additionalData - Additional data
 * @returns {Promise<Object>}
 */
const updateStatus = async (transactionId, status, additionalData = {}) => {
  const fields = ['status = $1'];
  const values = [status];
  let paramCounter = 2;
  
  if (status === 'successful') {
    fields.push(`completed_at = CURRENT_TIMESTAMP`);
  } else if (status === 'failed') {
    fields.push(`failed_at = CURRENT_TIMESTAMP`);
  }
  
  if (additionalData.errorMessage) {
    fields.push(`error_message = $${paramCounter}`);
    values.push(additionalData.errorMessage);
    paramCounter++;
  }
  
  values.push(transactionId);
  
  const sql = `
    UPDATE transactions
    SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
    WHERE id = $${paramCounter}
    RETURNING *
  `;
  
  const result = await query(sql, values);
  
  if (result.rows.length === 0) {
    throw new NotFoundError('Transaction not found');
  }
  
  logger.info('Transaction status updated', { transactionId, status });
  return result.rows[0];
};

/**
 * Get all transactions with pagination
 * @param {Object} options - Query options
 * @returns {Promise<Object>}
 */
const findAll = async (options = {}) => {
  const { page = 1, limit = 10, status = null, type = null } = options;
  const offset = (page - 1) * limit;
  const conditions = [];
  const values = [];
  let paramCounter = 1;
  
  if (status) {
    conditions.push(`status = $${paramCounter}`);
    values.push(status);
    paramCounter++;
  }
  
  if (type) {
    conditions.push(`transaction_type = $${paramCounter}`);
    values.push(type);
    paramCounter++;
  }
  
  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  
  const countSql = `SELECT COUNT(*) FROM transactions ${whereClause}`;
  const dataSql = `
    SELECT * FROM transactions
    ${whereClause}
    ORDER BY created_at DESC
    LIMIT $${paramCounter} OFFSET $${paramCounter + 1}
  `;
  
  const countResult = await query(countSql, values);
  const dataResult = await query(dataSql, [...values, limit, offset]);
  
  return {
    transactions: dataResult.rows,
    pagination: {
      page,
      limit,
      total: parseInt(countResult.rows[0].count, 10),
      totalPages: Math.ceil(countResult.rows[0].count / limit)
    }
  };
};

module.exports = {
  create,
  findById,
  findByReference,
  findByExternalReference,
  findByPaymentId,
  findByUserId,
  updateStatus,
  findAll
};