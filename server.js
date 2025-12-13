/**
 * Server Entry Point
 * Initializes database, Redis, and starts the HTTP server
 */

const app = require('./src/app');
const config = require('./src/config/env-config');
const logger = require('./src/config/logger-config');
const db = require('./src/database/db');
const redis = require('./src/config/redis-config');

/**
 * Start the server
 */
const startServer = async () => {
  try {
    logger.info('Starting Web3Nova Payment Gateway...');
    
    // Initialize database
    logger.info('Connecting to database...');
    await db.initializeDatabase();
    logger.info('Database connected successfully');
    
    // Connect to Redis
    logger.info('Connecting to Redis...');
    await redis.connect();
    logger.info('Redis connected successfully');
    
    // Start HTTP server
    const PORT = config.port;
    const server = app.listen(PORT, () => {
      logger.info(`Server running in ${config.env} mode on port ${PORT}`);
      logger.info(`API available at http://localhost:${PORT}/api/${config.apiVersion}`);
      logger.info(`Health check at http://localhost:${PORT}/health`);
    });
    
    // Attach server to app for graceful shutdown
    app.server = server;
    
    // Handle server errors
    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        logger.error(`Port ${PORT} is already in use`);
      } else {
        logger.error('Server error', { error: error.message });
      }
      process.exit(1);
    });
    
  } catch (error) {
    logger.error('Failed to start server', {
      error: error.message,
      stack: error.stack
    });
    process.exit(1);
  }
};

// Start the server
startServer();

// Export for testing
module.exports = app;