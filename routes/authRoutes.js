const express = require('express');
const router = express.Router();
const {
    register,
    login,
    getProfile,
    updateProfile,
    logout,
    requestPasswordReset,
    resetPassword,
    verifyEmail
} = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/role');

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', requestPasswordReset);
router.post('/reset-password', resetPassword);
router.post('/verify-email', verifyEmail);

// Protected routes (require authentication)
router.get('/profile', authenticateToken, getProfile);
router.put('/profile', authenticateToken, updateProfile);
router.post('/logout', authenticateToken, logout);

// Admin only routes
router.post('/register/admin', authenticateToken, requireAdmin, register);

module.exports = router;
