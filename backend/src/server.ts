import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import apiRoutes from './routes'; // Import main router
import { testConnection } from './config/db';
import logger, { stream } from './config/logger';
import { requestLogger, errorLogger } from './middleware/logger';
import { initSentry, Sentry } from './config/sentry';

// Load environment variables
dotenv.config();

// Initialize Sentry for error tracking
initSentry();

const app = express();
const PORT = parseInt(process.env.PORT || '3001', 10);

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3001',
    ...(process.env.CORS_ALLOWED_ORIGINS ? process.env.CORS_ALLOWED_ORIGINS.split(',') : []),
    process.env.FRONTEND_URL || 'http://localhost:3000'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-User-ID', 'X-User-Role'],
  optionsSuccessStatus: 200
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10), // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  }
});
app.use('/api/', limiter);

// Logging - Use Winston stream for Morgan
app.use(morgan('combined', { stream }));

// Custom request/response logger
app.use(requestLogger);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// API Routes
app.use('/api', apiRoutes);

// Serve uploads directory
import path from 'path';
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Global error handler
app.use(errorLogger);
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  logger.error('Unhandled error', {
    error: {
      message: err.message,
      stack: err.stack,
      status: err.status || 500,
    },
  });

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler
app.use('*', (_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Start server
if (require.main === module) {
  app.listen(PORT, '0.0.0.0', async () => {
    logger.info(`EduLearn API server running on port ${PORT}`);
    logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
    logger.info(`CORS enabled for: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);

    // Test database connection
    try {
      await testConnection();
      logger.info('Database connection successful');
    } catch (error: any) {
      logger.error('Database connection failed', {
        error: {
          message: error.message,
          stack: error.stack,
        },
      });
    }
  });
}

export default app;
