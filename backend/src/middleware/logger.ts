import { Request, Response, NextFunction } from 'express';
import logger from '../config/logger';

// Generate unique request ID
const generateRequestId = (): string => {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Request logging middleware
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
    const requestId = generateRequestId();
    const startTime = Date.now();

    // Attach request ID to request object for tracking
    (req as any).requestId = requestId;

    // Log request
    logger.info('Incoming request', {
        requestId,
        method: req.method,
        url: req.url,
        ip: req.ip || req.socket.remoteAddress,
        userAgent: req.get('user-agent'),
        userId: (req as any).user?.id,
    });

    // Capture the original send function
    const originalSend = res.send;

    // Override send to log response
    res.send = function (data: any): Response {
        const duration = Date.now() - startTime;

        logger.info('Outgoing response', {
            requestId,
            method: req.method,
            url: req.url,
            statusCode: res.statusCode,
            duration: `${duration}ms`,
            userId: (req as any).user?.id,
        });

        // Log slow requests (>1s)
        if (duration > 1000) {
            logger.warn('Slow request detected', {
                requestId,
                method: req.method,
                url: req.url,
                duration: `${duration}ms`,
            });
        }

        return originalSend.call(this, data);
    };

    next();
};

// Error logging middleware
export const errorLogger = (err: any, req: Request, res: Response, next: NextFunction) => {
    const requestId = (req as any).requestId;

    logger.error('Request error', {
        requestId,
        method: req.method,
        url: req.url,
        error: {
            message: err.message,
            stack: err.stack,
            status: err.status || 500,
        },
        userId: (req as any).user?.id,
    });

    next(err);
};
