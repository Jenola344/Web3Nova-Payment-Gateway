/**
 * Environment Configuration
 * Centralized environment variables with validation
 */

require('dotenv').config();

const requiredEnvVars = [
  'NODE_ENV',
  'PORT',
  'DB_HOST',
  'DB_PORT',
  'POSTGRES_DB',
  'POSTGRES_USER',
  'POSTGRES_PASSWORD',
  'REDIS_HOST',
  'REDIS_PORT',
  'JWT_SECRET',
  'JWT_REFRESH_SECRET',
  'ENCRYPTION_KEY'
];

/**
 * Validate required environment variables
 */
const validateEnv = () => {
  const missing = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}\n` +
      `Please check your .env file`
    );
  }
};

// Validate on module load
validateEnv();

const config = {
    // Application
    env: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT, 10) || 5000,
    apiVersion: process.env.API_VERSION || 'v1',
    
    // Database
    database: {
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT, 10) || 5432,
        name: process.env.DB_NAME,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        ssl: process.env.DB_SSL === 'true',
        poolMin: parseInt(process.env.DB_POOL_MIN, 10) || 2,
        poolMax: parseInt(process.env.DB_POOL_MAX, 10) || 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 5000
    },
    
    // Redis
    redis: {
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT, 10) || 6379,
        password: process.env.REDIS_PASSWORD || undefined,
        db: parseInt(process.env.REDIS_DB, 10) || 0,
        retryStrategy: (times) => {
        return Math.min(times * 50, 2000);
        }
    },
    
    // JWT
    jwt: {
        secret: process.env.JWT_SECRET,
        refreshSecret: process.env.JWT_REFRESH_SECRET,
        expiresIn: process.env.JWT_EXPIRES_IN || '15m',
        refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
        issuer: 'web3nova-payment-system',
        audience: 'web3nova-users'
    },
    
    // Monnify
    monnify: {
        apiKey: process.env.MONNIFY_API_KEY,
        secretKey: process.env.MONNIFY_SECRET_KEY,
        contractCode: process.env.MONNIFY_CONTRACT_CODE,
        baseUrl: process.env.MONNIFY_BASE_URL || 'https://sandbox.monnify.com',
        webhookSecret: process.env.MONNIFY_WEBHOOK_SECRET
    },
    
    // AWS
    aws: {
        region: process.env.AWS_REGION || 'us-east-1',
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        s3Bucket: process.env.AWS_S3_BUCKET,
        sesFromEmail: process.env.AWS_SES_FROM_EMAIL
    },
    
    // Encryption
    encryption: {
        key: process.env.ENCRYPTION_KEY,
        algorithm: 'aes-256-gcm'
    },
    
    // Rate Limiting
    rateLimit: {
        windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 900000, // 15 minutes
        maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 100
    },
    
    // CORS
    cors: {
        origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
        credentials: true,
        optionsSuccessStatus: 200
    },
    
    // Frontend
    frontend: {
        url: process.env.FRONTEND_URL || 'http://localhost:3000'
    },
    
    // Payment Configuration
    payment: {
        stage1Percent: parseInt(process.env.PAYMENT_STAGE_1_PERCENT, 10) || 20,
        stage2Percent: parseInt(process.env.PAYMENT_STAGE_2_PERCENT, 10) || 20,
        stage3Percent: parseInt(process.env.PAYMENT_STAGE_3_PERCENT, 10) || 10,
        expiryDays: parseInt(process.env.PAYMENT_EXPIRY_DAYS, 10) || 7,
        currency: 'NGN'
    },
    
    // Logging
    logging: {
        level: process.env.LOG_LEVEL || 'info',
        directory: process.env.LOG_DIRECTORY || 'logs',
        maxFiles: process.env.LOG_MAX_FILES || '14d',
        maxSize: process.env.LOG_MAX_SIZE || '20m'
    },
    
    // Email Configuration (Fallback to console in development)
    email: {
        provider: process.env.EMAIL_PROVIDER || 'aws-ses',
        from: process.env.EMAIL_FROM || 'noreply@web3nova.com',
        replyTo: process.env.EMAIL_REPLY_TO || 'support@web3nova.com'
    },
    
    // SMS Configuration
    sms: {
        provider: process.env.SMS_PROVIDER || 'twilio',
        from: process.env.SMS_FROM
    },
    
    // Feature Flags
    features: {
        enableWebSocket: process.env.ENABLE_WEBSOCKET !== 'false',
        enableEmailNotifications: process.env.ENABLE_EMAIL_NOTIFICATIONS !== 'false',
        enableSMSNotifications: process.env.ENABLE_SMS_NOTIFICATIONS === 'true',
        enableAuditLog: process.env.ENABLE_AUDIT_LOG !== 'false'
    }
};

/**
 * Check if running in production
 */
config.isProduction = () => config.env === 'production';

/**
 * Check if running in development
 */
config.isDevelopment = () => config.env === 'development';

/**
 * Check if running in test
 */
config.isTest = () => config.env === 'test';

/**
 * Get full database connection string
 */
config.getDatabaseUrl = () => {
    const { host, port, name, user, password } = config.database;
    return `postgresql://${user}:${password}@${host}:${port}/${name}`;
};

/**
 * Get Redis connection URL
 */
config.getRedisUrl = () => {
    const { host, port, password } = config.redis;
    if (password) {
        return `redis://:${password}@${host}:${port}`;
    }
    return `redis://${host}:${port}`;
};

module.exports = config;