/**
 * Webhook Log Model
 * Database operations for webhook_logs table
 */

const { query } = require('../config/db-config');

/**
 * Create webhook log
 * @param {Object} logData - Webhook log data
 * @returns {Promise<Object>}
 */
const create = async (logData) => {
  const {
    provider,
    eventType,
    payload,
    signature,
    signatureValid = false
  } = logData;
  
  const sql = `
    INSERT INTO webhook_logs (
      provider, event_type, payload, signature, signature_valid
    )
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
  `;
  
  const result = await query(sql, [
    provider,
    eventType,
    JSON.stringify(payload),
    signature,
    signatureValid
  ]);
  
  return result.rows[0];
};

/**
 * Update webhook log status
 * @param {string} logId - Log ID
 * @param {string} status - Status
 * @param {Object} processingResult - Processing result
 * @param {string} errorMessage - Error message
 * @returns {Promise<Object>}
 */
const updateStatus = async (logId, status, processingResult = null, errorMessage = null) => {
  const sql = `
    UPDATE webhook_logs
    SET status = $1,
        processing_result = $2,
        error_message = $3,
        processed_at = CURRENT_TIMESTAMP
    WHERE id = $4
    RETURNING *
  `;
  
  const result = await query(sql, [
    status,
    processingResult ? JSON.stringify(processingResult) : null,
    errorMessage,
    logId
  ]);
  
  return result.rows[0];
};

/**
 * Find webhook logs
 * @param {Object} options - Query options
 * @returns {Promise<Object>}
 */
const findAll = async (options = {}) => {
  const { page = 1, limit = 20, provider = null, status = null } = options;
  const offset = (page - 1) * limit;
  const conditions = [];
  const values = [];
  let paramCounter = 1;
  
  if (provider) {
    conditions.push(`provider = $${paramCounter}`);
    values.push(provider);
    paramCounter++;
  }
  
  if (status) {
    conditions.push(`status = $${paramCounter}`);
    values.push(status);
    paramCounter++;
  }
  
  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  
  const countSql = `SELECT COUNT(*) FROM webhook_logs ${whereClause}`;
  const dataSql = `
    SELECT * FROM webhook_logs
    ${whereClause}
    ORDER BY created_at DESC
    LIMIT $${paramCounter} OFFSET $${paramCounter + 1}
  `;
  
  const countResult = await query(countSql, values);
  const dataResult = await query(dataSql, [...values, limit, offset]);
  
  return {
    logs: dataResult.rows,
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
  updateStatus,
  findAll
};