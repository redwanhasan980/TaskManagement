const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const path = require('path');
const fs = require('fs');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
}

// Define log format
const logFormat = winston.format.combine(
    winston.format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss.SSS'
    }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
);

// Define console format for development
const consoleFormat = winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp({
        format: 'HH:mm:ss'
    }),
    winston.format.printf(({ timestamp, level, message, ...meta }) => {
        let metaStr = '';
        if (Object.keys(meta).length > 0) {
            metaStr = ` ${JSON.stringify(meta, null, 2)}`;
        }
        return `[${timestamp}] ${level}: ${message}${metaStr}`;
    })
);

// Create Winston logger
const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: logFormat,
    defaultMeta: {
        service: 'task-management-api',
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development'
    },
    transports: [
        // Console transport for development
        new winston.transports.Console({
            format: consoleFormat,
            level: process.env.NODE_ENV === 'production' ? 'warn' : 'debug'
        }),

        // Error log file (daily rotation)
        new DailyRotateFile({
            filename: path.join(logsDir, 'error-%DATE%.log'),
            datePattern: 'YYYY-MM-DD',
            level: 'error',
            maxSize: '20m',
            maxFiles: '14d',
            format: winston.format.combine(
                logFormat,
                winston.format.printf(info => {
                    return JSON.stringify({
                        timestamp: info.timestamp,
                        level: info.level,
                        message: info.message,
                        service: info.service,
                        environment: info.environment,
                        stack: info.stack,
                        ...info
                    }, null, 2);
                })
            )
        }),

        // Application log file (daily rotation)
        new DailyRotateFile({
            filename: path.join(logsDir, 'application-%DATE%.log'),
            datePattern: 'YYYY-MM-DD',
            maxSize: '20m',
            maxFiles: '30d',
            format: winston.format.combine(
                logFormat,
                winston.format.printf(info => {
                    return JSON.stringify({
                        timestamp: info.timestamp,
                        level: info.level,
                        message: info.message,
                        service: info.service,
                        environment: info.environment,
                        ...info
                    }, null, 2);
                })
            )
        }),

        // Access log file for requests (daily rotation)
        new DailyRotateFile({
            filename: path.join(logsDir, 'access-%DATE%.log'),
            datePattern: 'YYYY-MM-DD',
            maxSize: '20m',
            maxFiles: '30d',
            level: 'http',
            format: winston.format.combine(
                logFormat,
                winston.format.printf(info => {
                    return JSON.stringify({
                        timestamp: info.timestamp,
                        type: 'access',
                        method: info.method,
                        url: info.url,
                        statusCode: info.statusCode,
                        responseTime: info.responseTime,
                        userAgent: info.userAgent,
                        ip: info.ip,
                        userId: info.userId,
                        service: info.service,
                        environment: info.environment
                    }, null, 2);
                })
            )
        })
    ],
    // Handle uncaught exceptions and rejections
    exceptionHandlers: [
        new winston.transports.File({
            filename: path.join(logsDir, 'exceptions.log'),
            format: logFormat
        })
    ],
    rejectionHandlers: [
        new winston.transports.File({
            filename: path.join(logsDir, 'rejections.log'),
            format: logFormat
        })
    ]
});

// Custom log levels for HTTP requests
winston.addColors({
    error: 'red',
    warn: 'yellow',
    info: 'cyan',
    http: 'green',
    debug: 'blue'
});

// Request logging middleware
const requestLogger = (req, res, next) => {
    const start = Date.now();
    
    // Log request start
    logger.http('Incoming request', {
        method: req.method,
        url: req.originalUrl,
        userAgent: req.get('User-Agent'),
        ip: req.ip || req.connection.remoteAddress,
        userId: req.user?.id || null,
        headers: process.env.NODE_ENV === 'development' ? req.headers : undefined,
        body: process.env.NODE_ENV === 'development' && req.method !== 'GET' ? 
            (req.body && !req.body.password ? req.body : '[REDACTED]') : undefined
    });

    // Override res.end to log response
    const originalEnd = res.end;
    res.end = function(chunk, encoding) {
        const responseTime = Date.now() - start;
        
        // Log response
        logger.http('Request completed', {
            method: req.method,
            url: req.originalUrl,
            statusCode: res.statusCode,
            responseTime: `${responseTime}ms`,
            userAgent: req.get('User-Agent'),
            ip: req.ip || req.connection.remoteAddress,
            userId: req.user?.id || null,
            contentLength: res.get('Content-Length') || 0
        });

        // Call original end
        originalEnd.call(this, chunk, encoding);
    };

    next();
};

// Enhanced logging methods
const enhancedLogger = {
    // Authentication events
    auth: {
        login: (userId, email, ip, userAgent) => {
            logger.info('User login successful', {
                event: 'auth.login',
                userId,
                email,
                ip,
                userAgent,
                timestamp: new Date().toISOString()
            });
        },
        loginFailed: (email, reason, ip, userAgent) => {
            logger.warn('User login failed', {
                event: 'auth.login_failed',
                email,
                reason,
                ip,
                userAgent,
                timestamp: new Date().toISOString()
            });
        },
        register: (userId, email, role, ip) => {
            logger.info('User registration successful', {
                event: 'auth.register',
                userId,
                email,
                role,
                ip,
                timestamp: new Date().toISOString()
            });
        },
        passwordReset: (userId, email, ip) => {
            logger.info('Password reset successful', {
                event: 'auth.password_reset',
                userId,
                email,
                ip,
                timestamp: new Date().toISOString()
            });
        },
        passwordResetRequest: (email, ip) => {
            logger.info('Password reset requested', {
                event: 'auth.password_reset_request',
                email,
                ip,
                timestamp: new Date().toISOString()
            });
        },
        emailVerified: (userId, email, ip) => {
            logger.info('Email verification successful', {
                event: 'auth.email_verified',
                userId,
                email,
                ip,
                timestamp: new Date().toISOString()
            });
        }
    },

    // Task events
    task: {
        created: (taskId, userId, title) => {
            logger.info('Task created', {
                event: 'task.created',
                taskId,
                userId,
                title,
                timestamp: new Date().toISOString()
            });
        },
        updated: (taskId, userId, changes) => {
            logger.info('Task updated', {
                event: 'task.updated',
                taskId,
                userId,
                changes,
                timestamp: new Date().toISOString()
            });
        },
        deleted: (taskId, userId) => {
            logger.info('Task deleted', {
                event: 'task.deleted',
                taskId,
                userId,
                timestamp: new Date().toISOString()
            });
        }
    },

    // Security events
    security: {
        unauthorized: (ip, userAgent, attemptedResource) => {
            logger.warn('Unauthorized access attempt', {
                event: 'security.unauthorized',
                ip,
                userAgent,
                attemptedResource,
                timestamp: new Date().toISOString()
            });
        },
        invalidToken: (ip, userAgent) => {
            logger.warn('Invalid token provided', {
                event: 'security.invalid_token',
                ip,
                userAgent,
                timestamp: new Date().toISOString()
            });
        }
    },

    // Database events
    database: {
        connected: () => {
            logger.info('Database connection established', {
                event: 'database.connected',
                timestamp: new Date().toISOString()
            });
        },
        error: (error, query = null) => {
            logger.error('Database error occurred', {
                event: 'database.error',
                error: error.message,
                stack: error.stack,
                query,
                timestamp: new Date().toISOString()
            });
        }
    },

    // Email events
    email: {
        sent: (type, recipient, messageId) => {
            logger.info('Email sent successfully', {
                event: 'email.sent',
                type,
                recipient,
                messageId,
                timestamp: new Date().toISOString()
            });
        },
        failed: (type, recipient, error) => {
            logger.error('Email sending failed', {
                event: 'email.failed',
                type,
                recipient,
                error: error.message,
                timestamp: new Date().toISOString()
            });
        }
    },

    // System events
    system: {
        startup: (port, environment) => {
            logger.info('Application started successfully', {
                event: 'system.startup',
                port,
                environment,
                nodeVersion: process.version,
                platform: process.platform,
                memory: process.memoryUsage(),
                timestamp: new Date().toISOString()
            });
        },
        shutdown: (reason) => {
            logger.info('Application shutdown initiated', {
                event: 'system.shutdown',
                reason,
                uptime: process.uptime(),
                timestamp: new Date().toISOString()
            });
        }
    }
};

module.exports = {
    logger,
    requestLogger,
    enhancedLogger
};
