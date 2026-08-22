const { Pool } = require('pg');
require('dotenv').config();

const sslConfig = process.env.NODE_ENV === 'production' || process.env.DB_SSL === 'true'
  ? { rejectUnauthorized: false }
  : false;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: sslConfig
});

async function testConnection() {
  try {
    const client = await pool.connect();
    console.log('✅ Conexión exitosa a PostgreSQL');
    client.release();
  } catch (error) {
    console.error('❌ Error de conexión a PostgreSQL:', error.message);
  }
}

module.exports = { pool, testConnection };
