/**
 * Logger Configuration
 * Winston logger setup with file rotation
 */

const winston = require('winston');
const path = require('path');
const fs = require('fs');
const config = require('./env-config');

// Create logs directory if it doesn't exist
const logsDir = path.join(process.cwd(), config.logging.directory);
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Custom format for console output
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let msg = `${timestamp} [${level}]: ${message}`;
    
    // Add metadata if present
    if (Object.keys(meta).length > 0) {
      msg += `\n${JSON.stringify(meta, null, 2)}`;
    }
    
    return msg;
  })
);

// Custom format for file output
const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Create Winston logger instance
const logger = winston.createLogger({
  level: config.logging.level,
  format: fileFormat,
  defaultMeta: {
    service: 'web3nova-payment-gateway',
    environment: config.env
  },
  transports: [
    // Error log file
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      maxsize: 10485760, // 10MB
      maxFiles: 5,
      format: fileFormat
    }),
    
    // Combined log file
    new winston.transports.File({
      filename: path.join(logsDir, 'combined.log'),
      maxsize: 10485760, // 10MB
      maxFiles: 5,
      format: fileFormat
    }),
    
    // Payment-specific log file
    new winston.transports.File({
      filename: path.join(logsDir, 'payment.log'),
      level: 'info',
      maxsize: 10485760, // 10MB
      maxFiles: 5,
      format: fileFormat
    }),
    
    // Audit log file
    new winston.transports.File({
      filename: path.join(logsDir, 'audit.log'),
      level: 'info',
      maxsize: 10485760, // 10MB
      maxFiles: 10,
      format: fileFormat
    })
  ],
  
  // Handle uncaught exceptions
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join(logsDir, 'exceptions.log'),
      maxsize: 10485760,
      maxFiles: 5
    })
  ],
  
  // Handle unhandled rejections
  rejectionHandlers: [
    new winston.transports.File({
      filename: path.join(logsDir, 'rejections.log'),
      maxsize: 10485760,
      maxFiles: 5
    })
  ]
});

// Add console transport in development
if (config.isDevelopment()) {
  logger.add(
    new winston.transports.Console({
      format: consoleFormat
    })
  );
}

/**
 * Log payment event
 * @param {string} event - Event name
 * @param {Object} data - Event data
 */
logger.logPayment = (event, data) => {
  logger.info(`Payment Event: ${event}`, {
    event,
    ...data,
    category: 'payment'
  });
};

/**
 * Log audit event
 * @param {string} action - Action performed
 * @param {Object} data - Audit data
 */
logger.logAudit = (action, data) => {
  logger.info(`Audit: ${action}`, {
    action,
    ...data,
    category: 'audit',
    timestamp: new Date().toISOString()
  });
};

/**
 * Log authentication event
 * @param {string} event - Event name
 * @param {Object} data - Event data
 */
logger.logAuth = (event, data) => {
  logger.info(`Auth Event: ${event}`, {
    event,
    ...data,
    category: 'authentication'
  });
};

/**
 * Log database query
 * @param {string} query - SQL query
 * @param {number} duration - Query duration in ms
 */
logger.logQuery = (query, duration) => {
  if (config.isDevelopment()) {
    logger.debug(`Database Query: ${query}`, {
      query,
      duration: `${duration}ms`,
      category: 'database'
    });
  }
};

/**
 * Log API request
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {number} duration - Request duration in ms
 */
logger.logRequest = (req, res, duration) => {
  const logData = {
    method: req.method,
    url: req.originalUrl,
    statusCode: res.statusCode,
    duration: `${duration}ms`,
    ip: req.ip,
    userAgent: req.get('user-agent'),
    userId: req.user?.id,
    category: 'api'
  };
  
  if (res.statusCode >= 400) {
    logger.warn('API Request Failed', logData);
  } else {
    logger.info('API Request', logData);
  }
};

/**
 * Log webhook event
 * @param {string} provider - Webhook provider
 * @param {Object} data - Webhook data
 */
logger.logWebhook = (provider, data) => {
  logger.info(`Webhook: ${provider}`, {
    provider,
    ...data,
    category: 'webhook'
  });
};

/**
 * Log security event
 * @param {string} event - Security event
 * @param {Object} data - Event data
 */
logger.logSecurity = (event, data) => {
  logger.warn(`Security Event: ${event}`, {
    event,
    ...data,
    category: 'security'
  });
};

/**
 * Create child logger with additional metadata
 * @param {Object} metadata - Additional metadata
 * @returns {Object} Child logger
 */
logger.createChild = (metadata) => {
  return logger.child(metadata);
};

module.exports = logger;