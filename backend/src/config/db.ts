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
  ssl: (process.env.NODE_ENV === 'production' || process.env.DB_HOST?.includes('supabase.com')) ? {
    rejectUnauthorized: false // Required for remote PostgreSQL with self-signed cert
  } : false, // Disable SSL for local development
  
  // Optimized pool configuration for chat workload
  max: 20,                    // Maximum pool size (up from default 10)
  min: 2,                     // Minimum pool size (keep connections warm)
  idleTimeoutMillis: 30000,   // Close idle clients after 30 seconds
  connectionTimeoutMillis: 3000, // Timeout if connection cannot be established in 3s
  allowExitOnIdle: false,     // Don't exit process when all clients idle
  
  // Statement timeout to prevent long-running queries
  statement_timeout: 30000,   // 30 second max query time
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
