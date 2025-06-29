import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432,
  // Only use SSL for production/remote databases
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false // Required for remote PostgreSQL with self-signed cert
  } : false // Disable SSL for local development
});

// Test database connection
pool.on('connect', () => {
  console.log('✅ Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('❌ PostgreSQL connection error:', err);
});

// Test the connection on startup
export const testConnection = async () => {
  try {
    const client = await pool.connect();
    console.log('🔍 Testing database connection...');
    const result = await client.query('SELECT NOW()');
    console.log('✅ Database connection successful:', result.rows[0]);
    client.release();
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
};

export const query = (text: string, params?: any[]) => pool.query(text, params);
