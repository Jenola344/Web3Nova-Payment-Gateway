/**
 * Create Database Script - Save as create-database.js
 * Run: node create-database.js
 */

require('dotenv').config();
const { Client } = require('pg');

async function createDatabase() {
  console.log('🔧 Database Setup Tool\n');
  
  const dbName = process.env.DB_NAME || 'web3nova_payments_dev';
  
  // Connect to default 'postgres' database
  const client = new Client({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    database: 'postgres', // Connect to default database first
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD
  });

  try {
    console.log('📦 Connecting to PostgreSQL...');
    console.log(`   Host: ${process.env.DB_HOST}`);
    console.log(`   Port: ${process.env.DB_PORT}`);
    console.log(`   User: ${process.env.DB_USER}\n`);
    
    await client.connect();
    console.log('✅ Connected to PostgreSQL\n');

    // Check if database exists
    console.log(`🔍 Checking if database '${dbName}' exists...`);
    const checkResult = await client.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [dbName]
    );

    if (checkResult.rows.length > 0) {
      console.log(`✅ Database '${dbName}' already exists!`);
    } else {
      console.log(`📦 Creating database '${dbName}'...`);
      await client.query(`CREATE DATABASE "${dbName}"`);
      console.log(`✅ Database '${dbName}' created successfully!`);
    }

    await client.end();
    
    console.log('\n✅ Database setup complete!');
    console.log('\nNext steps:');
    console.log('1. Run: node db_connection_test.js');
    console.log('2. Run: npm start\n');
    
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('Code:', error.code);
    
    if (error.code === 'ECONNREFUSED') {
      console.error('\n💡 PostgreSQL is not running!');
      console.error('   Start it with: docker-compose -f docker/docker-compose-dev.yml up -d postgres');
    } else if (error.code === '28P01') {
      console.error('\n💡 Authentication failed!');
      console.error('   Check DB_USER and DB_PASSWORD in .env');
    } else if (error.code === '42P04') {
      console.error('\n💡 Database already exists (this is okay)');
      console.error('   You can proceed with: npm start');
    }
    
    process.exit(1);
  }
}

createDatabase();