/**
 * Database Connection Test Script
 * Run: node test-db-connection.js
 */

require('dotenv').config();

const { Pool } = require('pg');

console.log('🔍 Testing Database Connection...\n');

// Display connection info (masked)
console.log('Connection Details:');
console.log('Host:', process.env.DB_HOST);
console.log('Port:', process.env.DB_PORT);
console.log('Database:', process.env.DB_NAME);
console.log('User:', process.env.DB_USER);
console.log('Password:', process.env.DB_PASSWORD ? '***' + process.env.DB_PASSWORD.slice(-4) : 'NOT SET');
console.log('');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT, 10) || 5432,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  connectionTimeoutMillis: 5000
});

async function testConnection() {
  try {
    console.log('⏳ Attempting to connect...');
    
    const client = await pool.connect();
    console.log('✅ Successfully connected to database!');
    
    const result = await client.query('SELECT NOW() as current_time, version() as version');
    console.log('\n📊 Database Info:');
    console.log('Current Time:', result.rows[0].current_time);
    console.log('Version:', result.rows[0].version.split(',')[0]);
    
    // Test table access
    try {
      const tableCheck = await client.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        ORDER BY table_name
      `);
      
      console.log('\n📋 Available Tables:');
      if (tableCheck.rows.length === 0) {
        console.log('⚠️  No tables found. Run migrations first!');
      } else {
        tableCheck.rows.forEach(row => {
          console.log('  -', row.table_name);
        });
      }
    } catch (tableError) {
      console.log('\n⚠️  Could not list tables:', tableError.message);
    }
    
    client.release();
    await pool.end();
    
    console.log('\n✅ Database connection test PASSED');
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ Database connection FAILED');
    console.error('Error Type:', error.name);
    console.error('Error Code:', error.code);
    console.error('Error Message:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.error('\n💡 Solution: Database is not running or not accessible');
      console.error('   - Check if PostgreSQL is running');
      console.error('   - Verify DB_HOST and DB_PORT in .env');
    } else if (error.code === 'ENOTFOUND') {
      console.error('\n💡 Solution: Database host not found');
      console.error('   - Verify DB_HOST in .env is correct');
    } else if (error.code === '28P01') {
      console.error('\n💡 Solution: Authentication failed');
      console.error('   - Verify DB_USER and DB_PASSWORD in .env');
    } else if (error.code === '3D000') {
      console.error('\n💡 Solution: Database does not exist');
      console.error('   - Create database:', process.env.DB_NAME);
    }
    
    process.exit(1);
  }
}

testConnection();