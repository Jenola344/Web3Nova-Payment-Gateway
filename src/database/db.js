/**
 * Database Connection
 * Main database connection and initialization
 */

const { pool, testConnection, closePool } = require('../config/db-config');
const logger = require('../config/logger-config');
const fs = require('fs').promises;
const path = require('path');

/**
 * Initialize database
 * Run migrations and seed data if needed
 */
const initializeDatabase = async () => {
    try {
        logger.info('Initializing database...');
        
        // Test connection
        const isConnected = await testConnection();
        
        if (!isConnected) {
        throw new Error('Failed to connect to database');
        }
        
        logger.info('Database initialized successfully');
        return true;
    } catch (error) {
        logger.error('Database initialization failed', {
        error: error.message,
        stack: error.stack
        });
        throw error;
    }
};

/**
 * Run database migrations
 */
const runMigrations = async () => {
    try {
        logger.info('Running database migrations...');
        
        const migrationsDir = path.join(__dirname, 'migrations');
        const migrationFiles = await fs.readdir(migrationsDir);
        
        // Sort migration files
        const sortedMigrations = migrationFiles
        .filter(file => file.endsWith('.sql'))
        .sort();
        
        for (const file of sortedMigrations) {
            const filePath = path.join(migrationsDir, file);
            const sql = await fs.readFile(filePath, 'utf8');
            
            logger.info(`Running migration: ${file}`);
            
            await pool.query(sql);
            
            logger.info(`Migration completed: ${file}`);
        }
        
        logger.info('All migrations completed successfully');
        return true;
    } catch (error) {
        logger.error('Migration failed', {
        error: error.message,
        stack: error.stack
        });
        throw error;
    }
};

/**
 * Seed database with initial data
 */
const seedDatabase = async () => {
  try {
    logger.info('Seeding database...');
    
    const seedsDir = path.join(__dirname, 'seeds');
    const seedFiles = await fs.readdir(seedsDir);
    
    for (const file of seedFiles) {
      if (file.endsWith('.sql')) {
        const filePath = path.join(seedsDir, file);
        const sql = await fs.readFile(filePath, 'utf8');
        
        logger.info(`Running seed: ${file}`);
        
        await pool.query(sql);
        
        logger.info(`Seed completed: ${file}`);
      }
    }
    
    logger.info('Database seeding completed successfully');
    return true;
  } catch (error) {
    logger.error('Database seeding failed', {
      error: error.message,
      stack: error.stack
    });
    throw error;
  }
};

/**
 * Reset database (drop all tables)
 * WARNING: This will delete all data!
 */
const resetDatabase = async () => {
  try {
    logger.warn('Resetting database - ALL DATA WILL BE LOST!');
    
    // Drop all tables
    const dropTablesQuery = `
      DROP SCHEMA public CASCADE;
      CREATE SCHEMA public;
      GRANT ALL ON SCHEMA public TO postgres;
      GRANT ALL ON SCHEMA public TO public;
    `;
    
    await pool.query(dropTablesQuery);
    
    logger.info('Database reset completed');
    return true;
  } catch (error) {
    logger.error('Database reset failed', {
      error: error.message,
      stack: error.stack
    });
    throw error;
  }
};

/**
 * Get database statistics
 */
const getDatabaseStats = async () => {
  try {
    const queries = {
      totalUsers: 'SELECT COUNT(*) as count FROM users',
      totalPayments: 'SELECT COUNT(*) as count FROM payments',
      totalTransactions: 'SELECT COUNT(*) as count FROM transactions',
      totalEnrollments: 'SELECT COUNT(*) as count FROM enrollments',
      completedPayments: "SELECT COUNT(*) as count FROM payments WHERE status = 'completed'",
      pendingPayments: "SELECT COUNT(*) as count FROM payments WHERE status = 'pending'"
    };
    
    const stats = {};
    
    for (const [key, query] of Object.entries(queries)) {
      const result = await pool.query(query);
      stats[key] = parseInt(result.rows[0].count, 10);
    }
    
    return stats;
  } catch (error) {
    logger.error('Failed to get database stats', {
      error: error.message
    });
    throw error;
  }
};

/**
 * Health check for database
 */
const healthCheck = async () => {
  try {
    const result = await pool.query('SELECT NOW() as time, version() as version');
    
    return {
      status: 'healthy',
      timestamp: result.rows[0].time,
      version: result.rows[0].version,
      poolStats: {
        total: pool.totalCount,
        idle: pool.idleCount,
        waiting: pool.waitingCount
      }
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error.message
    };
  }
};

/**
 * Graceful shutdown
 */
const shutdown = async () => {
  try {
    logger.info('Shutting down database connection...');
    await closePool();
    logger.info('Database connection closed');
  } catch (error) {
    logger.error('Error during database shutdown', {
      error: error.message
    });
    throw error;
  }
};

// Handle process termination
process.on('SIGINT', async () => {
  await shutdown();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await shutdown();
  process.exit(0);
});

module.exports = {
  pool,
  initializeDatabase,
  runMigrations,
  seedDatabase,
  resetDatabase,
  getDatabaseStats,
  healthCheck,
  shutdown
};