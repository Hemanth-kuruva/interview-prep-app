const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'interview_prep_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
});

// Test database connectivity
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log(`[DB] Connected successfully to MySQL database: ${process.env.DB_NAME || 'interview_prep_db'}`);
    connection.release();
  } catch (error) {
    console.error('[DB ERROR] Failed to connect to MySQL database:', error.message);
    console.error('Make sure MySQL is running and the database has been initialized with backend/schema.sql');
  }
}

testConnection();

module.exports = pool;
