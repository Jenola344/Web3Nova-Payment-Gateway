/**
 * Cryptography Utilities
 * AES-256 encryption, hashing, and secure token generation
 */

const crypto = require('crypto');

const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32; // 256 bits
const IV_LENGTH = 16; // 128 bits
const AUTH_TAG_LENGTH = 16;
const SALT_LENGTH = 32;

/**
 * Encrypt data using AES-256-GCM
 * @param {string} text - Text to encrypt
 * @param {string} encryptionKey - Encryption key (32 bytes)
 * @returns {string} Encrypted data with IV and auth tag
 */
const encrypt = (text, encryptionKey) => {
  try {
    // Generate random IV
    const iv = crypto.randomBytes(IV_LENGTH);
    
    // Create cipher
    const cipher = crypto.createCipheriv(
      ALGORITHM,
      Buffer.from(encryptionKey, 'hex'),
      iv
    );
    
    // Encrypt
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    // Get auth tag
    const authTag = cipher.getAuthTag();
    
    // Return IV + encrypted data + auth tag
    return iv.toString('hex') + ':' + encrypted + ':' + authTag.toString('hex');
  } catch (error) {
    throw new Error(`Encryption failed: ${error.message}`);
  }
};

/**
 * Decrypt data using AES-256-GCM
 * @param {string} encryptedData - Encrypted data with IV and auth tag
 * @param {string} encryptionKey - Encryption key (32 bytes)
 * @returns {string} Decrypted text
 */
const decrypt = (encryptedData, encryptionKey) => {
  try {
    // Split IV, encrypted data, and auth tag
    const parts = encryptedData.split(':');
    
    if (parts.length !== 3) {
      throw new Error('Invalid encrypted data format');
    }
    
    const iv = Buffer.from(parts[0], 'hex');
    const encrypted = parts[1];
    const authTag = Buffer.from(parts[2], 'hex');
    
    // Create decipher
    const decipher = crypto.createDecipheriv(
      ALGORITHM,
      Buffer.from(encryptionKey, 'hex'),
      iv
    );
    
    // Set auth tag
    decipher.setAuthTag(authTag);
    
    // Decrypt
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    throw new Error(`Decryption failed: ${error.message}`);
  }
};

/**
 * Generate random encryption key
 * @returns {string} Hex-encoded encryption key
 */
const generateEncryptionKey = () => {
  return crypto.randomBytes(KEY_LENGTH).toString('hex');
};

/**
 * Generate random initialization vector
 * @returns {string} Hex-encoded IV
 */
const generateIV = () => {
  return crypto.randomBytes(IV_LENGTH).toString('hex');
};

/**
 * Hash data using SHA-256
 * @param {string} data - Data to hash
 * @returns {string} Hex-encoded hash
 */
const hash = (data) => {
  return crypto.createHash('sha256').update(data).digest('hex');
};

/**
 * Hash data with salt using SHA-256
 * @param {string} data - Data to hash
 * @param {string} salt - Salt (optional, will be generated if not provided)
 * @returns {Object} Object with hash and salt
 */
const hashWithSalt = (data, salt = null) => {
  const useSalt = salt || crypto.randomBytes(SALT_LENGTH).toString('hex');
  const hashedData = crypto
    .createHash('sha256')
    .update(data + useSalt)
    .digest('hex');
  
  return {
    hash: hashedData,
    salt: useSalt
  };
};

/**
 * Verify hash with salt
 * @param {string} data - Original data
 * @param {string} hashedData - Hashed data to verify
 * @param {string} salt - Salt used in hashing
 * @returns {boolean}
 */
const verifyHash = (data, hashedData, salt) => {
  const result = hashWithSalt(data, salt);
  return result.hash === hashedData;
};

/**
 * Generate HMAC signature
 * @param {string} data - Data to sign
 * @param {string} secret - Secret key
 * @returns {string} Hex-encoded HMAC
 */
const generateHMAC = (data, secret) => {
  return crypto.createHmac('sha256', secret).update(data).digest('hex');
};

/**
 * Verify HMAC signature
 * @param {string} data - Original data
 * @param {string} signature - HMAC signature to verify
 * @param {string} secret - Secret key
 * @returns {boolean}
 */
const verifyHMAC = (data, signature, secret) => {
  const expectedSignature = generateHMAC(data, secret);
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
};

/**
 * Generate secure random token
 * @param {number} length - Token length in bytes (default: 32)
 * @returns {string} Hex-encoded token
 */
const generateToken = (length = 32) => {
  return crypto.randomBytes(length).toString('hex');
};

/**
 * Generate secure random OTP
 * @param {number} length - OTP length (default: 6)
 * @returns {string} Numeric OTP
 */
const generateOTP = (length = 6) => {
  const digits = '0123456789';
  let otp = '';
  
  for (let i = 0; i < length; i++) {
    const randomIndex = crypto.randomInt(0, digits.length);
    otp += digits[randomIndex];
  }
  
  return otp;
};

/**
 * Generate UUID v4
 * @returns {string} UUID
 */
const generateUUID = () => {
  return crypto.randomUUID();
};

/**
 * Constant-time string comparison
 * @param {string} a - First string
 * @param {string} b - Second string
 * @returns {boolean}
 */
const timingSafeEqual = (a, b) => {
  try {
    return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
  } catch (error) {
    return false;
  }
};

/**
 * Generate webhook signature
 * @param {Object} payload - Webhook payload
 * @param {string} secret - Webhook secret
 * @returns {string} Signature
 */
const generateWebhookSignature = (payload, secret) => {
  const payloadString = typeof payload === 'string' 
    ? payload 
    : JSON.stringify(payload);
  
  return generateHMAC(payloadString, secret);
};

/**
 * Verify webhook signature
 * @param {Object} payload - Webhook payload
 * @param {string} signature - Received signature
 * @param {string} secret - Webhook secret
 * @returns {boolean}
 */
const verifyWebhookSignature = (payload, signature, secret) => {
  const payloadString = typeof payload === 'string' 
    ? payload 
    : JSON.stringify(payload);
  
  return verifyHMAC(payloadString, signature, secret);
};

/**
 * Mask sensitive data
 * @param {string} data - Data to mask
 * @param {number} visibleStart - Number of visible characters at start
 * @param {number} visibleEnd - Number of visible characters at end
 * @returns {string} Masked data
 */
const maskSensitiveData = (data, visibleStart = 4, visibleEnd = 4) => {
  if (!data || data.length <= visibleStart + visibleEnd) {
    return data;
  }
  
  const start = data.substring(0, visibleStart);
  const end = data.substring(data.length - visibleEnd);
  const masked = '*'.repeat(data.length - visibleStart - visibleEnd);
  
  return start + masked + end;
};

module.exports = {
  encrypt,
  decrypt,
  generateEncryptionKey,
  generateIV,
  hash,
  hashWithSalt,
  verifyHash,
  generateHMAC,
  verifyHMAC,
  generateToken,
  generateOTP,
  generateUUID,
  timingSafeEqual,
  generateWebhookSignature,
  verifyWebhookSignature,
  maskSensitiveData
};