/**
 * Redis Connection Test Script
 * Run: node test-redis-connection.js
 */

require('dotenv').config();

const redis = require('redis');

console.log('🔍 Testing Redis Connection...\n');

// Display connection info
console.log('Connection Details:');
console.log('Host:', process.env.REDIS_HOST);
console.log('Port:', process.env.REDIS_PORT);
console.log('Password:', process.env.REDIS_PASSWORD ? '***' : 'NOT SET');
console.log('DB:', process.env.REDIS_DB || '0');
console.log('');

const client = redis.createClient({
  socket: {
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT, 10) || 6379,
    connectTimeout: 5000
  },
  password: process.env.REDIS_PASSWORD || undefined,
  database: parseInt(process.env.REDIS_DB, 10) || 0
});

client.on('error', (err) => {
  console.error('❌ Redis Client Error:', err.message);
});

client.on('connect', () => {
  console.log('⏳ Connecting to Redis...');
});

client.on('ready', () => {
  console.log('✅ Redis connection ready!');
});

async function testConnection() {
  try {
    console.log('⏳ Attempting to connect...');
    
    await client.connect();
    
    // Test basic operations
    console.log('\n📊 Testing Redis Operations:');
    
    // PING
    const pingResult = await client.ping();
    console.log('✓ PING:', pingResult);
    
    // SET
    await client.set('test_key', 'test_value');
    console.log('✓ SET: test_key = test_value');
    
    // GET
    const value = await client.get('test_key');
    console.log('✓ GET: test_key =', value);
    
    // DELETE
    await client.del('test_key');
    console.log('✓ DEL: test_key deleted');
    
    // INFO
    const info = await client.info('server');
    const version = info.match(/redis_version:(.*)/)?.[1];
    console.log('✓ Redis Version:', version);
    
    await client.quit();
    
    console.log('\n✅ Redis connection test PASSED');
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ Redis connection FAILED');
    console.error('Error Type:', error.name);
    console.error('Error Code:', error.code);
    console.error('Error Message:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.error('\n💡 Solution: Redis is not running or not accessible');
      console.error('   - Check if Redis is running: redis-cli ping');
      console.error('   - Verify REDIS_HOST and REDIS_PORT in .env');
      console.error('   - If using Docker: docker-compose up -d redis');
    } else if (error.code === 'ENOTFOUND') {
      console.error('\n💡 Solution: Redis host not found');
      console.error('   - Verify REDIS_HOST in .env is correct');
    } else if (error.message.includes('WRONGPASS')) {
      console.error('\n💡 Solution: Invalid Redis password');
      console.error('   - Verify REDIS_PASSWORD in .env');
    }
    
    process.exit(1);
  }
}

testConnection();