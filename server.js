/**
 * Server Entry Point with Enhanced Error Handling
 */

const app = require('./src/app');
const config = require('./src/config/env-config');
const logger = require('./src/config/logger-config');
const db = require('./src/database/db');
const redis = require('./src/config/redis-config');

// Add process-level error handlers FIRST
process.on('uncaughtException', (error) => {
  console.error('💥 UNCAUGHT EXCEPTION! Shutting down...');
  console.error('Error:', error.message);
  console.error('Stack:', error.stack);
  logger.error('Uncaught Exception', {
    error: error.message,
    stack: error.stack,
    type: error.name
  });
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 UNHANDLED REJECTION! Shutting down...');
  console.error('Reason:', reason);
  console.error('Promise:', promise);
  logger.error('Unhandled Rejection', {
    reason: reason instanceof Error ? reason.message : reason,
    stack: reason instanceof Error ? reason.stack : undefined
  });
  process.exit(1);
});

/**
 * Start the server
 */
const startServer = async () => {
  try {
    console.log('🚀 Starting Web3Nova Payment Gateway...');
    logger.info('Starting Web3Nova Payment Gateway...');
    
    // Validate critical environment variables
    console.log('✓ Validating environment variables...');
    const requiredVars = [
      'DB_HOST', 'DB_PORT', 'DB_NAME', 'DB_USER', 'DB_PASSWORD',
      'REDIS_HOST', 'REDIS_PORT',
      'JWT_SECRET', 'JWT_REFRESH_SECRET',
      'ENCRYPTION_KEY'
    ];
    
    const missing = requiredVars.filter(varName => !process.env[varName]);
    if (missing.length > 0) {
      throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }
    console.log('✓ Environment variables validated');
    
    // Initialize database with timeout
    console.log('📦 Connecting to database...');
    logger.info('Connecting to database...');
    
    const dbTimeout = setTimeout(() => {
      throw new Error('Database connection timeout after 10 seconds');
    }, 10000);
    
    await db.initializeDatabase();
    clearTimeout(dbTimeout);
    
    console.log('✓ Database connected successfully');
    logger.info('Database connected successfully');
    
    // Connect to Redis with timeout
    console.log('📦 Connecting to Redis...');
    logger.info('Connecting to Redis...');
    
    const redisTimeout = setTimeout(() => {
      throw new Error('Redis connection timeout after 10 seconds');
    }, 10000);
    
    await redis.connect();
    clearTimeout(redisTimeout);
    
    console.log('✓ Redis connected successfully');
    logger.info('Redis connected successfully');
    
    // Start HTTP server
    const PORT = config.port;
    console.log(`🌐 Starting HTTP server on port ${PORT}...`);
    
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log('\n✅ SERVER STARTED SUCCESSFULLY!');
      console.log(`📍 Environment: ${config.env}`);
      console.log(`📍 Port: ${PORT}`);
      console.log(`📍 API: http://localhost:${PORT}/api/${config.apiVersion}`);
      console.log(`📍 Health: http://localhost:${PORT}/health\n`);
      
      logger.info(`Server running in ${config.env} mode on port ${PORT}`);
      logger.info(`API available at http://localhost:${PORT}/api/${config.apiVersion}`);
      logger.info(`Health check at http://localhost:${PORT}/health`);
    });
    
    // Attach server to app for graceful shutdown
    app.server = server;
    
    // Handle server errors
    server.on('error', (error) => {
      console.error('❌ Server error:', error.message);
      
      if (error.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} is already in use`);
        logger.error(`Port ${PORT} is already in use`);
      } else if (error.code === 'EACCES') {
        console.error(`❌ Permission denied for port ${PORT}`);
        logger.error(`Permission denied for port ${PORT}`);
      } else {
        console.error('❌ Server error details:', error);
        logger.error('Server error', { error: error.message, code: error.code });
      }
      process.exit(1);
    });
    
    // Log server startup time
    const startupTime = process.uptime();
    console.log(`⚡ Server startup time: ${startupTime.toFixed(2)}s`);
    
  } catch (error) {
    console.error('\n❌ FAILED TO START SERVER');
    console.error('Error Type:', error.name);
    console.error('Error Message:', error.message);
    console.error('Error Stack:', error.stack);
    
    logger.error('Failed to start server', {
      error: error.message,
      stack: error.stack,
      type: error.name
    });
    
    // Attempt to close connections
    try {
      console.log('🔄 Attempting to close database connection...');
      await db.shutdown();
    } catch (dbError) {
      console.error('Error closing database:', dbError.message);
    }
    
    try {
      console.log('🔄 Attempting to close Redis connection...');
      await redis.disconnect();
    } catch (redisError) {
      console.error('Error closing Redis:', redisError.message);
    }
    
    process.exit(1);
  }
};

// Graceful shutdown handler
const gracefulShutdown = async (signal) => {
  console.log(`\n⚠️  ${signal} received. Starting graceful shutdown...`);
  logger.info(`${signal} received. Starting graceful shutdown...`);
  
  // Close server
  if (app.server) {
    console.log('🔄 Closing HTTP server...');
    app.server.close(() => {
      console.log('✓ HTTP server closed');
      logger.info('HTTP server closed');
    });
  }
  
  // Close database connections
  try {
    console.log('🔄 Closing database connection...');
    await db.shutdown();
    console.log('✓ Database connection closed');
  } catch (error) {
    console.error('Error closing database connection:', error.message);
    logger.error('Error closing database connection', { error: error.message });
  }
  
  // Close Redis connection
  try {
    console.log('🔄 Closing Redis connection...');
    await redis.disconnect();
    console.log('✓ Redis connection closed');
  } catch (error) {
    console.error('Error closing Redis connection:', error.message);
    logger.error('Error closing Redis connection', { error: error.message });
  }
  
  console.log('✅ Graceful shutdown completed');
  logger.info('Graceful shutdown completed');
  process.exit(0);
};

// Handle process termination
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Start the server
console.log('🎯 Initializing server...\n');
startServer();

// Export for testing
module.exports = app;