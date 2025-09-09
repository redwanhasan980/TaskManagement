const { logger } = require('./logger');

const errorHandler = (err, req, res, next) => {
    // Log the error with comprehensive details
    logger.error('Error occurred:', {
        message: err.message,
        stack: err.stack,
        url: req.url,
        method: req.method,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        timestamp: new Date().toISOString()
    });

    // MySQL/Database errors
    if (err.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({
            success: false,
            message: 'Duplicate entry. This record already exists.'
        });
    }

    if (err.code === 'ER_NO_SUCH_TABLE') {
        return res.status(500).json({
            success: false,
            message: 'Database table not found. Please run database setup.'
        });
    }

    if (err.code && err.code.startsWith('ER_')) {
        return res.status(500).json({
            success: false,
            message: 'Database error occurred'
        });
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            success: false,
            message: 'Invalid token'
        });
    }

    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
            success: false,
            message: 'Token expired'
        });
    }

    // Validation errors
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            success: false,
            message: err.message
        });
    }

    // Default error
    const statusCode = err.statusCode || err.status || 500;
    res.status(statusCode).json({
        success: false,
        message: statusCode === 500 ? 'Internal server error' : err.message,
        ...(process.env.NODE_ENV === 'development' && { error: err.message })
    });
};

module.exports = { errorHandler };
