const express = require('express');
const router = express.Router();
const {
    register,
    login,
    getProfile,
    updateProfile,
    logout
} = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/role');

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes (require authentication)
router.get('/profile', authenticateToken, getProfile);
router.put('/profile', authenticateToken, updateProfile);
router.post('/logout', authenticateToken, logout);

// Admin only routes
router.post('/register/admin', authenticateToken, requireAdmin, register);

module.exports = router;
