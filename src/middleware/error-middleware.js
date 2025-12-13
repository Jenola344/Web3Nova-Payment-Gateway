const { formatErrorResponse, isOperationalError, logError } = require('../utils/error-utils');
const logger = require('../config/logger-config');
const config = require('../config/env-config');

const errorHandler = (err, req, res, next) => {
  logError(err, {
    method: req.method,
    url: req.originalUrl,
    userId: req.user?.id,
    ip: req.ip
  }, logger);
  
  const statusCode = err.statusCode || 500;
  const includeStack = config.isDevelopment();
  
  res.status(statusCode).json(formatErrorResponse(err, includeStack));
};

const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    error: {
      message: 'Route not found',
      code: 'NOT_FOUND',
      path: req.originalUrl
    }
  });
};

module.exports = { errorHandler, notFoundHandler };
