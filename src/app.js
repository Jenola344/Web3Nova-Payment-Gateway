/**
 * Express Application Configuration
 * Main application setup and middleware configuration
 */

const express = require('express');
const helmet = require('helmet');
const corsMiddleware = require('./middleware/cors-middleware');
const { errorHandler, notFoundHandler } = require('./middleware/error-middleware');
const { sanitizeRequestBody, sanitizeRequestQuery } = require('./middleware/sanitizer');
const { rateLimiter } = require('./middleware/rate-limiter');
const config = require('./config/env-config');
const logger = require('./config/logger-config');

// Import routes
const authRoutes = require('./routes/auth-routes');
const paymentRoutes = require('./routes/payment-routes');
const userRoutes = require('./routes/user-routes');
const adminRoutes = require('./routes/admin-routes');
const webhookRoutes = require('./routes/webhook-routes');

// Create Express app
const app = express();

// Trust proxy (for rate limiting and IP detection behind proxy)
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", 'data:', 'https:'],
        },
    },
    hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
    }
}));

// CORS middleware
app.use(corsMiddleware);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Input sanitization
app.use(sanitizeRequestBody);
app.use(sanitizeRequestQuery);

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.logRequest(req, res, duration);
  });
  
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: config.env,
    version: process.env.npm_package_version || '1.0.0'
  });
});

// API version endpoint
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'Web3Nova Payment Gateway API',
    version: config.apiVersion,
  });
});

// Global rate limiter for all routes
app.use('/api', rateLimiter());

// Mount routes
app.use(`/api/${config.apiVersion}/auth`, authRoutes);
app.use(`/api/${config.apiVersion}/payments`, paymentRoutes);
app.use(`/api/${config.apiVersion}/users`, userRoutes);
app.use(`/api/${config.apiVersion}/admin`, adminRoutes);
app.use(`/api/${config.apiVersion}/webhooks`, webhookRoutes);

// 404 handler
app.use(notFoundHandler);

// Global error handler (must be last)
app.use(errorHandler);

// Graceful shutdown handler
const gracefulShutdown = async (signal) => {
    logger.info(`${signal} received. Starting graceful shutdown...`);
  
    // Close server
    if (app.server) {
        app.server.close(() => {
        logger.info('HTTP server closed');
        });
    }
    
    // Close database connections
    try {
        const db = require('./database/db');
        await db.shutdown();
    } catch (error) {
        logger.error('Error closing database connection', { error: error.message });
    }
    
    // Close Redis connection
    try {
        const redis = require('./config/redis-config');
        await redis.disconnect();
    } catch (error) {
        logger.error('Error closing Redis connection', { error: error.message });
    }
    
    logger.info('Graceful shutdown completed');
    process.exit(0);
};

// Handle process termination
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception', {
    error: error.message,
    stack: error.stack
  });
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection', {
    reason,
    promise
  });
  process.exit(1);
});

module.exports = app;