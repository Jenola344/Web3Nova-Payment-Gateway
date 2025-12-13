/**
 * Database Migration Script
 * Run all database migrations
 */

const db = require('../src/database/db');
const logger = require('../src/config/logger-config');

const runMigrations = async () => {
  try {
    console.log('Starting database migrations...\n');
    
    await db.runMigrations();
    
    console.log('\n All migrations completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error(' Migration failed:', error.message);
    logger.error('Migration failed', { error: error.message, stack: error.stack });
    process.exit(1);
  }
};

runMigrations();