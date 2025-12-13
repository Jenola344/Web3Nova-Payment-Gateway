const redis = require('../config/redis-config');
const { rateLimitResponse } = require('../utils/response-utils');
const config = require('../config/env-config');

const rateLimiter = (options = {}) => {
  const {
    windowMs = config.rateLimit.windowMs,
    maxRequests = config.rateLimit.maxRequests,
    keyGenerator = (req) => req.ip
  } = options;
  
  return async (req, res, next) => {
    try {
      const key = redis.generateKey('RATE_LIMIT', keyGenerator(req));
      const current = await redis.incr(key);
      
      if (current === 1) {
        await redis.expire(key, Math.ceil(windowMs / 1000));
      }
      
      res.setHeader('X-RateLimit-Limit', maxRequests);
      res.setHeader('X-RateLimit-Remaining', Math.max(0, maxRequests - current));
      
      if (current > maxRequests) {
        return rateLimitResponse(res);
      }
      
      next();
    } catch (error) {
      next(); // Fail open on error
    }
  };
};

module.exports = { rateLimiter };