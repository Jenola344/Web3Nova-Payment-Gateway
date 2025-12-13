/**
 * Database Configuration
 * PostgreSQL connection pool configuration
 */

const { Pool } = require('pg');
const config = require('./env-config');
const logger = require('./logger-config');

// Create connection pool
const pool = new Pool({
  host: config.database.host,
  port: config.database.port,
  database: config.database.name,
  user: config.database.user,
  password: config.database.password,
  ssl: config.database.ssl ? { rejectUnauthorized: false } : false,
  min: config.database.poolMin,
  max: config.database.poolMax,
  idleTimeoutMillis: config.database.idleTimeoutMillis,
  connectionTimeoutMillis: config.database.connectionTimeoutMillis,
  // Connection retry settings
  query_timeout: 30000,
  statement_timeout: 30000
});

// Handle pool errors
pool.on('error', (err, client) => {
  logger.error('Unexpected database pool error', {
    error: err.message,
    stack: err.stack
  });
});

// Handle pool connection
pool.on('connect', (client) => {
  logger.info('New database connection established');
});

// Handle pool removal
pool.on('remove', (client) => {
  logger.info('Database connection removed from pool');
});

/**
 * Execute a query
 * @param {string} text - SQL query
 * @param {Array} params - Query parameters
 * @returns {Promise<Object>}
 */
const query = async (text, params = []) => {
  const start = Date.now();
  
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    
    logger.logQuery(text, duration);
    
    return result;
  } catch (error) {
    logger.error('Database query error', {
      query: text,
      params,
      error: error.message,
      stack: error.stack
    });
    throw error;
  }
};

/**
 * Get a client from the pool for transactions
 * @returns {Promise<Object>}
 */
const getClient = async () => {
  const client = await pool.connect();
  
  // Wrap client methods to add logging
  const originalQuery = client.query.bind(client);
  client.query = async (text, params) => {
    const start = Date.now();
    try {
      const result = await originalQuery(text, params);
      const duration = Date.now() - start;
      logger.logQuery(text, duration);
      return result;
    } catch (error) {
      logger.error('Transaction query error', {
        query: text,
        params,
        error: error.message
      });
      throw error;
    }
  };
  
  return client;
};

/**
 * Execute queries in a transaction
 * @param {Function} callback - Transaction callback
 * @returns {Promise<*>}
 */
const transaction = async (callback) => {
  const client = await getClient();
  
  try {
    await client.query('BEGIN');
    logger.debug('Transaction started');
    
    const result = await callback(client);
    
    await client.query('COMMIT');
    logger.debug('Transaction committed');
    
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    logger.error('Transaction rolled back', {
      error: error.message,
      stack: error.stack
    });
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Test database connection
 * @returns {Promise<boolean>}
 */
const testConnection = async () => {
  try {
    const result = await query('SELECT NOW() as current_time');
    logger.info('Database connection test successful', {
      currentTime: result.rows[0].current_time
    });
    return true;
  } catch (error) {
    logger.error('Database connection test failed', {
      error: error.message,
      stack: error.stack
    });
    return false;
  }
};

/**
 * Close all connections in the pool
 * @returns {Promise<void>}
 */
const closePool = async () => {
  try {
    await pool.end();
    logger.info('Database connection pool closed');
  } catch (error) {
    logger.error('Error closing database pool', {
      error: error.message
    });
    throw error;
  }
};

/**
 * Get pool statistics
 * @returns {Object}
 */
const getPoolStats = () => {
  return {
    total: pool.totalCount,
    idle: pool.idleCount,
    waiting: pool.waitingCount
  };
};

/**
 * Execute a parameterized query with named parameters
 * @param {string} text - SQL query with named parameters ($paramName)
 * @param {Object} params - Object with named parameters
 * @returns {Promise<Object>}
 */
const namedQuery = async (text, params = {}) => {
  // Convert named parameters to positional
  let index = 1;
  const values = [];
  const paramMap = {};
  
  // Replace named parameters with $1, $2, etc.
  const queryText = text.replace(/\$(\w+)/g, (match, paramName) => {
    if (!paramMap[paramName]) {
      paramMap[paramName] = index++;
      values.push(params[paramName]);
    }
    return `$${paramMap[paramName]}`;
  });
  
  return query(queryText, values);
};

/**
 * Bulk insert helper
 * @param {string} tableName - Table name
 * @param {Array<Object>} records - Records to insert
 * @param {Array<string>} columns - Column names
 * @returns {Promise<Object>}
 */
const bulkInsert = async (tableName, records, columns) => {
  if (!records || records.length === 0) {
    return { rowCount: 0, rows: [] };
  }
  
  const values = [];
  const placeholders = [];
  
  records.forEach((record, recordIndex) => {
    const recordPlaceholders = [];
    columns.forEach((column, colIndex) => {
      const valueIndex = recordIndex * columns.length + colIndex + 1;
      recordPlaceholders.push(`$${valueIndex}`);
      values.push(record[column]);
    });
    placeholders.push(`(${recordPlaceholders.join(', ')})`);
  });
  
  const queryText = `
    INSERT INTO ${tableName} (${columns.join(', ')})
    VALUES ${placeholders.join(', ')}
    RETURNING *
  `;
  
  return query(queryText, values);
};

module.exports = {
  pool,
  query,
  getClient,
  transaction,
  testConnection,
  closePool,
  getPoolStats,
  namedQuery,
  bulkInsert
};