/**
 * Database Seeding Script
 * Seed initial data
 */

const db = require('../src/database/db');
const logger = require('../src/config/logger-config');

const seedDatabase = async () => {
  try {
    console.log('Starting database seeding...\n');
    
    await db.seedDatabase();
    
    console.log('\nDatabase seeding completed successfully!');
    console.log('\nDefault Admin Credentials:');
    console.log('Email: admin@web3nova.com');
    console.log('Password: Admin@123456');
    
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error.message);
    logger.error('Seeding failed', { error: error.message, stack: error.stack });
    process.exit(1);
  }
};

seedDatabase();