/**
 * Audit Log Model
 * Database operations for audit_logs table
 */

const { query } = require('../config/db-config');

/**
 * Create audit log entry
 * @param {Object} logData - Audit log data
 * @returns {Promise<Object>}
 */
const create = async (logData) => {
  const {
    userId,
    action,
    entityType,
    entityId,
    oldValues = null,
    newValues = null,
    ipAddress,
    userAgent,
    requestMethod,
    requestPath,
    statusCode,
    metadata = {}
  } = logData;
  
  const sql = `
    INSERT INTO audit_logs (
      user_id, action, entity_type, entity_id, old_values,
      new_values, ip_address, user_agent, request_method,
      request_path, status_code, metadata
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
    RETURNING *
  `;
  
  const result = await query(sql, [
    userId || null,
    action,
    entityType,
    entityId || null,
    oldValues ? JSON.stringify(oldValues) : null,
    newValues ? JSON.stringify(newValues) : null,
    ipAddress || null,
    userAgent || null,
    requestMethod || null,
    requestPath || null,
    statusCode || null,
    JSON.stringify(metadata)
  ]);
  
  return result.rows[0];
};

/**
 * Find audit logs by user ID
 * @param {string} userId - User ID
 * @param {Object} options - Query options
 * @returns {Promise<Object>}
 */
const findByUserId = async (userId, options = {}) => {
  const { page = 1, limit = 20 } = options;
  const offset = (page - 1) * limit;
  
  const countSql = `SELECT COUNT(*) FROM audit_logs WHERE user_id = $1`;
  const dataSql = `
    SELECT * FROM audit_logs
    WHERE user_id = $1
    ORDER BY created_at DESC
    LIMIT $2 OFFSET $3
  `;
  
  const countResult = await query(countSql, [userId]);
  const dataResult = await query(dataSql, [userId, limit, offset]);
  
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

/**
 * Find audit logs by entity
 * @param {string} entityType - Entity type
 * @param {string} entityId - Entity ID
 * @returns {Promise<Array>}
 */
const findByEntity = async (entityType, entityId) => {
  const sql = `
    SELECT * FROM audit_logs
    WHERE entity_type = $1 AND entity_id = $2
    ORDER BY created_at DESC
  `;
  
  const result = await query(sql, [entityType, entityId]);
  return result.rows;
};

/**
 * Get all audit logs with filters
 * @param {Object} options - Query options
 * @returns {Promise<Object>}
 */
const findAll = async (options = {}) => {
  const {
    page = 1,
    limit = 20,
    action = null,
    entityType = null,
    userId = null,
    startDate = null,
    endDate = null
  } = options;
  
  const offset = (page - 1) * limit;
  const conditions = [];
  const values = [];
  let paramCounter = 1;
  
  if (action) {
    conditions.push(`action = $${paramCounter}`);
    values.push(action);
    paramCounter++;
  }
  
  if (entityType) {
    conditions.push(`entity_type = $${paramCounter}`);
    values.push(entityType);
    paramCounter++;
  }
  
  if (userId) {
    conditions.push(`user_id = $${paramCounter}`);
    values.push(userId);
    paramCounter++;
  }
  
  if (startDate) {
    conditions.push(`created_at >= $${paramCounter}`);
    values.push(startDate);
    paramCounter++;
  }
  
  if (endDate) {
    conditions.push(`created_at <= $${paramCounter}`);
    values.push(endDate);
    paramCounter++;
  }
  
  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  
  const countSql = `SELECT COUNT(*) FROM audit_logs ${whereClause}`;
  const dataSql = `
    SELECT * FROM audit_logs
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

/**
 * Get audit statistics
 * @returns {Promise<Object>}
 */
const getStatistics = async () => {
  const sql = `
    SELECT 
      COUNT(*) as total_logs,
      COUNT(DISTINCT user_id) as unique_users,
      COUNT(CASE WHEN action = 'login' THEN 1 END) as login_attempts,
      COUNT(CASE WHEN action = 'payment_completed' THEN 1 END) as completed_payments,
      COUNT(CASE WHEN action = 'payment_failed' THEN 1 END) as failed_payments
    FROM audit_logs
    WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
  `;
  
  const result = await query(sql);
  return result.rows[0];
};

module.exports = {
  create,
  findByUserId,
  findByEntity,
  findAll,
  getStatistics
};