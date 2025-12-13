const { generateCSRFToken } = require('../services/security-service');
const redis = require('../config/redis-config');
const { ERROR_CODES } = require('../constants/error-codes');

const generateCSRF = async (req, res, next) => {
  if (req.user) {
    const token = generateCSRFToken();
    const key = redis.generateKey('CSRF', req.user.id);
    await redis.setex(key, token, 3600);
    res.locals.csrfToken = token;
  }
  next();
};

const verifyCSRF = async (req, res, next) => {
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method) && req.user) {
    const token = req.headers['x-csrf-token'];
    
    if (!token) {
      return res.status(403).json({
        success: false,
        error: ERROR_CODES.CSRF_TOKEN_INVALID
      });
    }
    
    const key = redis.generateKey('CSRF', req.user.id);
    const storedToken = await redis.get(key);
    
    if (token !== storedToken) {
      return res.status(403).json({
        success: false,
        error: ERROR_CODES.CSRF_TOKEN_INVALID
      });
    }
  }
  next();
};

module.exports = { generateCSRF, verifyCSRF };