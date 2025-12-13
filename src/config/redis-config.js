/**
 * Redis Configuration
 * Redis client setup and connection management
 */

const redis = require('redis');
const config = require('./env-config');
const logger = require('./logger-config');

// Redis key prefixes
const KEY_PREFIXES = {
  SESSION: 'session:',
  RATE_LIMIT: 'ratelimit:',
  CACHE: 'cache:',
  TOKEN: 'token:',
  OTP: 'otp:',
  PAYMENT: 'payment:',
  WEBHOOK: 'webhook:',
  LOCK: 'lock:'
};

// Create Redis client
const client = redis.createClient({
  socket: {
    host: config.redis.host,
    port: config.redis.port,
    reconnectStrategy: (retries) => {
      if (retries > 10) {
        logger.error('Redis reconnection attempts exceeded');
        return new Error('Redis reconnection attempts exceeded');
      }
      const delay = Math.min(retries * 100, 3000);
      logger.warn(`Redis reconnecting in ${delay}ms`);
      return delay;
    }
  },
  password: config.redis.password,
  database: config.redis.db,
  legacyMode: false
});

// Event handlers
client.on('connect', () => {
  logger.info('Redis client connecting...');
});

client.on('ready', () => {
  logger.info('Redis client ready');
});

client.on('error', (err) => {
  logger.error('Redis client error', {
    error: err.message,
    stack: err.stack
  });
});

client.on('reconnecting', () => {
  logger.warn('Redis client reconnecting...');
});

client.on('end', () => {
  logger.warn('Redis client connection closed');
});

/**
 * Connect to Redis
 * @returns {Promise<void>}
 */
const connect = async () => {
  try {
    if (!client.isOpen) {
      await client.connect();
      logger.info('Redis connection established');
    }
  } catch (error) {
    logger.error('Failed to connect to Redis', {
      error: error.message,
      stack: error.stack
    });
    throw error;
  }
};

/**
 * Disconnect from Redis
 * @returns {Promise<void>}
 */
const disconnect = async () => {
  try {
    if (client.isOpen) {
      await client.quit();
      logger.info('Redis connection closed gracefully');
    }
  } catch (error) {
    logger.error('Error closing Redis connection', {
      error: error.message
    });
    throw error;
  }
};

/**
 * Test Redis connection
 * @returns {Promise<boolean>}
 */
const testConnection = async () => {
  try {
    await client.ping();
    logger.info('Redis connection test successful');
    return true;
  } catch (error) {
    logger.error('Redis connection test failed', {
      error: error.message
    });
    return false;
  }
};

/**
 * Set key with expiration
 * @param {string} key - Key
 * @param {string} value - Value
 * @param {number} ttl - Time to live in seconds
 * @returns {Promise<string>}
 */
const setex = async (key, value, ttl) => {
  try {
    return await client.setEx(key, ttl, value);
  } catch (error) {
    logger.error('Redis SETEX error', { key, error: error.message });
    throw error;
  }
};

/**
 * Set key with optional expiration
 * @param {string} key - Key
 * @param {string} value - Value
 * @param {number} ttl - Time to live in seconds (optional)
 * @returns {Promise<string>}
 */
const set = async (key, value, ttl = null) => {
  try {
    if (ttl) {
      return await client.setEx(key, ttl, value);
    }
    return await client.set(key, value);
  } catch (error) {
    logger.error('Redis SET error', { key, error: error.message });
    throw error;
  }
};

/**
 * Get key value
 * @param {string} key - Key
 * @returns {Promise<string|null>}
 */
const get = async (key) => {
  try {
    return await client.get(key);
  } catch (error) {
    logger.error('Redis GET error', { key, error: error.message });
    throw error;
  }
};

/**
 * Delete key
 * @param {string} key - Key
 * @returns {Promise<number>}
 */
const del = async (key) => {
  try {
    return await client.del(key);
  } catch (error) {
    logger.error('Redis DEL error', { key, error: error.message });
    throw error;
  }
};

/**
 * Check if key exists
 * @param {string} key - Key
 * @returns {Promise<number>}
 */
const exists = async (key) => {
  try {
    return await client.exists(key);
  } catch (error) {
    logger.error('Redis EXISTS error', { key, error: error.message });
    throw error;
  }
};

/**
 * Set key expiration
 * @param {string} key - Key
 * @param {number} seconds - Seconds
 * @returns {Promise<number>}
 */
const expire = async (key, seconds) => {
  try {
    return await client.expire(key, seconds);
  } catch (error) {
    logger.error('Redis EXPIRE error', { key, error: error.message });
    throw error;
  }
};

/**
 * Get time to live
 * @param {string} key - Key
 * @returns {Promise<number>}
 */
const ttl = async (key) => {
  try {
    return await client.ttl(key);
  } catch (error) {
    logger.error('Redis TTL error', { key, error: error.message });
    throw error;
  }
};

/**
 * Increment counter
 * @param {string} key - Key
 * @returns {Promise<number>}
 */
const incr = async (key) => {
  try {
    return await client.incr(key);
  } catch (error) {
    logger.error('Redis INCR error', { key, error: error.message });
    throw error;
  }
};

/**
 * Decrement counter
 * @param {string} key - Key
 * @returns {Promise<number>}
 */
const decr = async (key) => {
  try {
    return await client.decr(key);
  } catch (error) {
    logger.error('Redis DECR error', { key, error: error.message });
    throw error;
  }
};

/**
 * Get all keys matching pattern
 * @param {string} pattern - Pattern
 * @returns {Promise<Array>}
 */
const keys = async (pattern) => {
  try {
    return await client.keys(pattern);
  } catch (error) {
    logger.error('Redis KEYS error', { pattern, error: error.message });
    throw error;
  }
};

/**
 * Delete all keys matching pattern
 * @param {string} pattern - Pattern
 * @returns {Promise<number>}
 */
const deletePattern = async (pattern) => {
  try {
    const keysToDelete = await client.keys(pattern);
    if (keysToDelete.length > 0) {
      return await client.del(keysToDelete);
    }
    return 0;
  } catch (error) {
    logger.error('Redis delete pattern error', { pattern, error: error.message });
    throw error;
  }
};

/**
 * Set hash field
 * @param {string} key - Key
 * @param {string} field - Field
 * @param {string} value - Value
 * @returns {Promise<number>}
 */
const hset = async (key, field, value) => {
  try {
    return await client.hSet(key, field, value);
  } catch (error) {
    logger.error('Redis HSET error', { key, field, error: error.message });
    throw error;
  }
};

/**
 * Get hash field
 * @param {string} key - Key
 * @param {string} field - Field
 * @returns {Promise<string|null>}
 */
const hget = async (key, field) => {
  try {
    return await client.hGet(key, field);
  } catch (error) {
    logger.error('Redis HGET error', { key, field, error: error.message });
    throw error;
  }
};

/**
 * Get all hash fields
 * @param {string} key - Key
 * @returns {Promise<Object>}
 */
const hgetall = async (key) => {
  try {
    return await client.hGetAll(key);
  } catch (error) {
    logger.error('Redis HGETALL error', { key, error: error.message });
    throw error;
  }
};

/**
 * Generate prefixed key
 * @param {string} prefix - Prefix type
 * @param {string} identifier - Identifier
 * @returns {string}
 */
const generateKey = (prefix, identifier) => {
  return `${KEY_PREFIXES[prefix] || prefix}${identifier}`;
};

/**
 * Flush all keys (use with caution)
 * @returns {Promise<string>}
 */
const flushAll = async () => {
  try {
    logger.warn('Flushing all Redis keys');
    return await client.flushAll();
  } catch (error) {
    logger.error('Redis FLUSHALL error', { error: error.message });
    throw error;
  }
};

module.exports = {
  client,
  connect,
  disconnect,
  testConnection,
  set,
  setex,
  get,
  del,
  exists,
  expire,
  ttl,
  incr,
  decr,
  keys,
  deletePattern,
  hset,
  hget,
  hgetall,
  generateKey,
  flushAll,
  KEY_PREFIXES
};