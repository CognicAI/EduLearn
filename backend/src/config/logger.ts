import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import path from 'path';

// Define log levels
const levels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4,
};

// Define colors for each level
const colors = {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    http: 'magenta',
    debug: 'white',
};

// Tell winston about the colors
winston.addColors(colors);

// Define log format
const format = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
);

// Define console format for development
const consoleFormat = winston.format.combine(
    winston.format.colorize({ all: true }),
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.printf(
        (info) => `${info.timestamp} ${info.level}: ${info.message}${info.stack ? '\n' + info.stack : ''}`
    )
);

// Determine log level based on environment
const level = () => {
    const env = process.env.NODE_ENV || 'development';
    const isDevelopment = env === 'development';
    return isDevelopment ? 'debug' : process.env.LOG_LEVEL || 'info';
};

// Create logs directory path
const logsDir = path.join(process.cwd(), 'logs');

// Define transports
const transports = [
    // Console transport
    new winston.transports.Console({
        format: process.env.NODE_ENV === 'production' ? format : consoleFormat,
    }),

    // Daily rotate file transport for all logs
    new DailyRotateFile({
        filename: path.join(logsDir, 'app-%DATE%.log'),
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true,
        maxSize: '20m',
        maxFiles: '14d',
        format: format,
    }),

    // Daily rotate file transport for errors only
    new DailyRotateFile({
        level: 'error',
        filename: path.join(logsDir, 'error-%DATE%.log'),
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true,
        maxSize: '20m',
        maxFiles: '30d',
        format: format,
    }),
];

// Create the logger
const logger = winston.createLogger({
    level: level(),
    levels,
    format,
    transports,
    exitOnError: false,
});

// Create a stream object for Morgan
export const stream = {
    write: (message: string) => {
        logger.http(message.trim());
    },
};

export default logger;
