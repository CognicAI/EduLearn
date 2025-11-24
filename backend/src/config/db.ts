import { Pool } from 'pg';
import dotenv from 'dotenv';
import logger from './logger';

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
  logger.info('Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  logger.error('PostgreSQL connection error', {
    error: {
      message: err.message,
      stack: err.stack,
    },
  });
});

// Test the connection on startup
export const testConnection = async () => {
  try {
    const client = await pool.connect();
    logger.info('Testing database connection...');
    const result = await client.query('SELECT NOW()');
    logger.info('Database connection successful', {
      timestamp: result.rows[0].now,
    });
    client.release();
    return true;
  } catch (error: any) {
    logger.error('Database connection failed', {
      error: {
        message: error.message,
        stack: error.stack,
      },
    });
    throw error;
  }
};

// Enhanced query function with performance logging
export const query = async (text: string, params?: any[]) => {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;

    // Log slow queries (> 1 second)
    if (duration > 1000) {
      logger.warn('Slow query detected', {
        query: text.substring(0, 100), // Truncate long queries
        duration: `${duration}ms`,
        params: params?.length,
      });
    }

    logger.debug('Database query executed', {
      duration: `${duration}ms`,
      rows: result.rowCount,
    });

    return result;
  } catch (error: any) {
    const duration = Date.now() - start;
    logger.error('Database query failed', {
      query: text.substring(0, 100),
      duration: `${duration}ms`,
      error: {
        message: error.message,
        code: error.code,
      },
    });
    throw error;
  }
};
