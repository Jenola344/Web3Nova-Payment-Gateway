const redis = require('../config/redis-config');
const logger = require('../config/logger-config');

const redisService = {
  async set(key, value, ttl = null) {
    return await redis.set(key, JSON.stringify(value), ttl);
  },
  
  async get(key) {
    const value = await redis.get(key);
    return value ? JSON.parse(value) : null;
  },
  
  async del(key) {
    return await redis.del(key);
  },
  
  async cachePayment(paymentId, data, ttl = 3600) {
    const key = redis.generateKey('PAYMENT', paymentId);
    return await this.set(key, data, ttl);
  },
  
  async getCachedPayment(paymentId) {
    const key = redis.generateKey('PAYMENT', paymentId);
    return await this.get(key);
  }
};

module.exports = redisService;