const express = require("express");
require('dotenv').config();

// Import routes
const authRoutes = require("./routes/authRoutes");
const taskRoutes = require("./routes/taskRoutes");
const userRoutes = require("./routes/userRoutes");
const { errorHandler } = require("./middleware/errorHandler");
const { requestLogger, enhancedLogger } = require('./middleware/logger');

// Initialize database connection
const { dbPromise } = require('./utils/db');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger); // Add request logging

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'Task Management API is running',
        timestamp: new Date().toISOString()
    });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/users", userRoutes);

// Welcome route
app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Welcome to Task Management API",
        version: "1.0.0",
        endpoints: {
            auth: "/api/auth",
            tasks: "/api/tasks",
            users: "/api/users",
            health: "/health"
        }
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found',
        path: req.originalUrl
    });
});

// Error Handling Middleware (should be last)
app.use(errorHandler);

// Start Server after database is ready
dbPromise.then(() => {
    app.listen(PORT, () => {
        enhancedLogger.system.startup(PORT, process.env.NODE_ENV || 'development');
        console.log('\n ========================================');
        console.log(` Task Management API Server running at http://localhost:${PORT}`);
        console.log(` Environment: ${process.env.NODE_ENV || 'development'}`);
        console.log(` Health check: http://localhost:${PORT}/health`);
        console.log(` API Documentation: Check README.md`);
        console.log(' ========================================\n');
        console.log(' Ready to handle requests!');
        
    });
}).catch((error) => {
    logger.error('Failed to start server', {
        event: 'system.startup_failed',
        error: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
    });
    console.error(' Failed to start server:', error.message);
    process.exit(1);
});
