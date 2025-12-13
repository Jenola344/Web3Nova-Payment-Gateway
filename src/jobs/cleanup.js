const logger = require('../config/logger-config');

const cleanupOldLogs = async () => {
  try {
    logger.info('Running cleanup job...');
    
    // Add cleanup logic here
    // e.g., delete old audit logs, sessions, etc.
    
    logger.info('Cleanup completed');
  } catch (error) {
    logger.error('Cleanup job failed', { error: error.message });
  }
};

module.exports = { cleanupOldLogs };