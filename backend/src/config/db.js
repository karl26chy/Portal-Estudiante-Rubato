const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function testConnection() {
  try {
    const client = await pool.connect();
    console.log('\u2705 Conexión exitosa a PostgreSQL (Supabase)');
    client.release();
  } catch (error) {
    console.error('\u274C Error de conexión a PostgreSQL:', error.message);
  }
}

module.exports = { pool, testConnection };
