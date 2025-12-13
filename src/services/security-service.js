/**
 * Security Service
 * Centralized security operations and encryption
 */

const {
  encrypt,
  decrypt,
  hash,
  generateToken,
  generateOTP,
  generateHMAC,
  verifyHMAC,
  maskSensitiveData
} = require('../utils/crypto-utils');
const config = require('../config/env-config');
const logger = require('../config/logger-config');

/**
 * Encrypt sensitive data
 * @param {string} data - Data to encrypt
 * @returns {string}
 */
const encryptData = (data) => {
  try {
    return encrypt(data, config.encryption.key);
  } catch (error) {
    logger.error('Encryption failed', { error: error.message });
    throw new Error('Data encryption failed');
  }
};

/**
 * Decrypt sensitive data
 * @param {string} encryptedData - Encrypted data
 * @returns {string}
 */
const decryptData = (encryptedData) => {
  try {
    return decrypt(encryptedData, config.encryption.key);
  } catch (error) {
    logger.error('Decryption failed', { error: error.message });
    throw new Error('Data decryption failed');
  }
};

/**
 * Hash sensitive data
 * @param {string} data - Data to hash
 * @returns {string}
 */
const hashData = (data) => {
  return hash(data);
};

/**
 * Generate secure token
 * @param {number} length - Token length
 * @returns {string}
 */
const generateSecureToken = (length = 32) => {
  return generateToken(length);
};

/**
 * Generate OTP code
 * @param {number} length - OTP length
 * @returns {string}
 */
const generateOTPCode = (length = 6) => {
  return generateOTP(length);
};

/**
 * Generate signature for data
 * @param {*} data - Data to sign
 * @param {string} secret - Secret key
 * @returns {string}
 */
const signData = (data, secret) => {
  const dataString = typeof data === 'string' ? data : JSON.stringify(data);
  return generateHMAC(dataString, secret);
};

/**
 * Verify data signature
 * @param {*} data - Original data
 * @param {string} signature - Signature to verify
 * @param {string} secret - Secret key
 * @returns {boolean}
 */
const verifySignature = (data, signature, secret) => {
  const dataString = typeof data === 'string' ? data : JSON.stringify(data);
  return verifyHMAC(dataString, signature, secret);
};

/**
 * Mask credit card number
 * @param {string} cardNumber - Card number
 * @returns {string}
 */
const maskCardNumber = (cardNumber) => {
  return maskSensitiveData(cardNumber, 4, 4);
};

/**
 * Mask email address
 * @param {string} email - Email address
 * @returns {string}
 */
const maskEmail = (email) => {
  const [username, domain] = email.split('@');
  if (username.length <= 3) {
    return `${username[0]}***@${domain}`;
  }
  return `${username.substring(0, 3)}***@${domain}`;
};

/**
 * Mask phone number
 * @param {string} phone - Phone number
 * @returns {string}
 */
const maskPhoneNumber = (phone) => {
  return maskSensitiveData(phone, 3, 3);
};

/**
 * Sanitize user input
 * @param {string} input - User input
 * @returns {string}
 */
const sanitizeInput = (input) => {
  if (!input) return '';
  
  // Remove potentially dangerous characters
  return input
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .trim();
};

/**
 * Validate IP address
 * @param {string} ip - IP address
 * @returns {boolean}
 */
const isValidIP = (ip) => {
  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
  const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
  
  return ipv4Regex.test(ip) || ipv6Regex.test(ip);
};

/**
 * Generate CSRF token
 * @returns {string}
 */
const generateCSRFToken = () => {
  return generateToken(32);
};

/**
 * Validate request origin
 * @param {string} origin - Request origin
 * @returns {boolean}
 */
const isValidOrigin = (origin) => {
  const allowedOrigins = config.cors.origin;
  return allowedOrigins.includes(origin);
};

/**
 * Check if request is from trusted source
 * @param {string} ipAddress - IP address
 * @param {string} userAgent - User agent
 * @returns {boolean}
 */
const isTrustedSource = (ipAddress, userAgent) => {
  // Add custom logic for trusted sources
  // This is a placeholder implementation
  
  if (!ipAddress || !userAgent) {
    return false;
  }
  
  // Check for common bot patterns (can be expanded)
  const botPatterns = [
    /bot/i,
    /crawler/i,
    /spider/i,
    /scraper/i
  ];
  
  const isBot = botPatterns.some(pattern => pattern.test(userAgent));
  
  if (isBot) {
    logger.logSecurity('bot_detected', { ipAddress, userAgent });
    return false;
  }
  
  return true;
};

/**
 * Log security event
 * @param {string} event - Security event
 * @param {Object} data - Event data
 */
const logSecurityEvent = (event, data) => {
  logger.logSecurity(event, data);
};

module.exports = {
  encryptData,
  decryptData,
  hashData,
  generateSecureToken,
  generateOTPCode,
  signData,
  verifySignature,
  maskCardNumber,
  maskEmail,
  maskPhoneNumber,
  sanitizeInput,
  isValidIP,
  generateCSRFToken,
  isValidOrigin,
  isTrustedSource,
  logSecurityEvent
};