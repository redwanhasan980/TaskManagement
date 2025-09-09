const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/user');
const { validateEmail, validatePassword, validateResetToken, validateNewPassword } = require('../utils/validators');
const { sendPasswordResetEmail, sendVerificationEmail } = require('../utils/emailService');
const { logger, enhancedLogger } = require('../middleware/logger');
require('dotenv').config();

// Generate JWT token
const generateToken = (userId) => {
    return jwt.sign(
        { userId },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );
};

// Register new user
const register = async (req, res) => {
    try {
        const { username, email, password, role = 'user' } = req.body;

        // Validation
        if (!username || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Username, email, and password are required'
            });
        }

        if (!validateEmail(email)) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a valid email address'
            });
        }

        if (!validatePassword(password)) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 6 characters long'
            });
        }

        // Check if user already exists
        const existingUserByEmail = await User.findByEmail(email);
        if (existingUserByEmail) {
            return res.status(409).json({
                success: false,
                message: 'User with this email already exists'
            });
        }

        const existingUserByUsername = await User.findByUsername(username);
        if (existingUserByUsername) {
            return res.status(409).json({
                success: false,
                message: 'Username already taken'
            });
        }

        // Only admin can create admin users
        if (role === 'admin' && (!req.user || req.user.role !== 'admin')) {
            return res.status(403).json({
                success: false,
                message: 'Only administrators can create admin accounts'
            });
        }

        // Create user
        const userId = await User.create({ username, email, password, role });

        // Generate verification token
        const verificationToken = crypto.randomBytes(32).toString('hex');
        const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        // Save verification token to user
        await User.updateVerificationToken(userId, verificationToken, verificationExpires);

        // Send verification email
        await sendVerificationEmail(email, verificationToken, username);

        // Log successful registration
        enhancedLogger.auth.register(userId, email, role, req.ip);

        res.status(201).json({
            success: true,
            message: 'User registered successfully! Please check your email for verification instructions.',
            data: {
                userId,
                email,
                message: 'A verification email has been sent. Please verify your account before logging in.'
            }
        });
    } catch (error) {
        logger.error('Registration failed', {
            event: 'auth.register_failed',
            error: error.message,
            stack: error.stack,
            ip: req.ip,
            timestamp: new Date().toISOString()
        });
        res.status(500).json({
            success: false,
            message: 'Registration failed',
            error: error.message
        });
    }
};

// Login user
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validation
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required'
            });
        }

        // Find user by email
        const user = await User.findByEmail(email);
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Check if email is verified
        const isEmailVerified = await User.isEmailVerified(email);
        if (!isEmailVerified) {
            return res.status(403).json({
                success: false,
                message: 'Please verify your email address before logging in. Check your email for verification instructions.'
            });
        }

        // Verify password
        const isPasswordValid = await user.verifyPassword(password);
        if (!isPasswordValid) {
            enhancedLogger.auth.loginFailed(email, 'Invalid password', req.ip, req.get('User-Agent'));
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Generate token
        const token = generateToken(user.id);

        // Log successful login
        enhancedLogger.auth.login(user.id, email, req.ip, req.get('User-Agent'));

        res.json({
            success: true,
            message: 'Login successful',
            data: {
                token,
                user: user.toJSON()
            }
        });
    } catch (error) {
        logger.error('Login failed', {
            event: 'auth.login_error',
            error: error.message,
            stack: error.stack,
            ip: req.ip,
            timestamp: new Date().toISOString()
        });
        res.status(500).json({
            success: false,
            message: 'Login failed',
            error: error.message
        });
    }
};

// Get current user profile
const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            data: {
                user: user.toJSON()
            }
        });
    } catch (error) {
        logger.error('Get profile failed', {
            event: 'auth.get_profile_error',
            error: error.message,
            userId: req.user?.id,
            timestamp: new Date().toISOString()
        });
        res.status(500).json({
            success: false,
            message: 'Failed to get profile',
            error: error.message
        });
    }
};

// Update user profile
const updateProfile = async (req, res) => {
    try {
        const { username, email } = req.body;

        // Validation
        if (!username || !email) {
            return res.status(400).json({
                success: false,
                message: 'Username and email are required'
            });
        }

        if (!validateEmail(email)) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a valid email address'
            });
        }

        // Check if email is already taken by another user
        const existingUser = await User.findByEmail(email);
        if (existingUser && existingUser.id !== req.user.id) {
            return res.status(409).json({
                success: false,
                message: 'Email already taken by another user'
            });
        }

        // Check if username is already taken by another user
        const existingUsername = await User.findByUsername(username);
        if (existingUsername && existingUsername.id !== req.user.id) {
            return res.status(409).json({
                success: false,
                message: 'Username already taken'
            });
        }

        // Update user
        const updated = await User.update(req.user.id, { username, email, role: req.user.role });
        if (!updated) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Get updated user
        const updatedUser = await User.findById(req.user.id);

        res.json({
            success: true,
            message: 'Profile updated successfully',
            data: {
                user: updatedUser.toJSON()
            }
        });
    } catch (error) {
        logger.error('Update profile failed', {
            event: 'auth.update_profile_error',
            error: error.message,
            userId: req.user?.id,
            timestamp: new Date().toISOString()
        });
        res.status(500).json({
            success: false,
            message: 'Failed to update profile',
            error: error.message
        });
    }
};

// Logout (client-side token invalidation)
const logout = async (req, res) => {
    try {
        logger.info('User logged out', {
            event: 'auth.logout',
            userId: req.user?.id,
            ip: req.ip,
            timestamp: new Date().toISOString()
        });
        res.json({
            success: true,
            message: 'Logout successful.'
        });
    } catch (error) {
        logger.error('Logout failed', {
            event: 'auth.logout_error',
            error: error.message,
            userId: req.user?.id,
            timestamp: new Date().toISOString()
        });
        res.status(500).json({
            success: false,
            message: 'Logout failed',
            error: error.message
        });
    }
};

// Request password reset
const requestPasswordReset = async (req, res) => {
    try {
        const { email } = req.body;

        // Validation
        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email is required'
            });
        }

        if (!validateEmail(email)) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a valid email address'
            });
        }

        // Find user by email
        const user = await User.findByEmail(email);
        if (!user) {
            // Don't reveal if user exists or not for security
            return res.json({
                success: true,
                message: 'If an account with that email exists, a password reset link has been sent.'
            });
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

        // Save reset token to database
        await User.setResetToken(email, resetToken, resetTokenExpires);

        // Send password reset email
        const emailSent = await sendPasswordResetEmail(email, resetToken, user.username);
        
        // Always return success since we have console fallback
        enhancedLogger.auth.passwordResetRequest(email, req.ip);
        res.json({
            success: true,
            message: 'Password reset token has been generated. Check your email or server console for the token and Postman instructions.'
        });

    } catch (error) {
        logger.error('Password reset request failed', {
            event: 'auth.password_reset_request_error',
            error: error.message,
            stack: error.stack,
            ip: req.ip,
            timestamp: new Date().toISOString()
        });
        res.status(500).json({
            success: false,
            message: 'Failed to process password reset request',
            error: error.message
        });
    }
};

// Reset password with token
const resetPassword = async (req, res) => {
    try {
        const { resetToken, newPassword } = req.body;

        // Validation
        if (!resetToken) {
            return res.status(400).json({
                success: false,
                message: 'Reset token is required'
            });
        }

        if (!validateResetToken(resetToken)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid reset token format'
            });
        }

        const passwordValidation = validateNewPassword(newPassword);
        if (passwordValidation) {
            return res.status(400).json({
                success: false,
                message: passwordValidation
            });
        }

        // Find user by reset token
        const user = await User.findByResetToken(resetToken);
        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired reset token'
            });
        }

        // Update password
        await User.updatePassword(user.id, newPassword);
        
        // Clear reset token
        await User.clearResetToken(user.id);

        enhancedLogger.auth.passwordReset(user.id, user.email, req.ip);

        res.json({
            success: true,
            message: 'Password has been reset successfully. You can now login with your new password.'
        });

    } catch (error) {
        logger.error('Password reset failed', {
            event: 'auth.password_reset_error',
            error: error.message,
            stack: error.stack,
            ip: req.ip,
            timestamp: new Date().toISOString()
        });
        res.status(500).json({
            success: false,
            message: 'Failed to reset password',
            error: error.message
        });
    }
};

// Verify email with token
const verifyEmail = async (req, res) => {
    try {
        const { token } = req.body;

        // Validation
        if (!token) {
            return res.status(400).json({
                success: false,
                message: 'Verification token is required'
            });
        }

        // Find user by verification token
        const user = await User.findByVerificationToken(token);
        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired verification token'
            });
        }

        // Verify email
        await User.verifyEmail(user.id);

        enhancedLogger.auth.emailVerified(user.id, user.email, req.ip);

        res.json({
            success: true,
            message: 'Email verified successfully! You can now log in to your account.',
            data: {
                email: user.email,
                verified: true
            }
        });

    } catch (error) {
        logger.error('Email verification failed', {
            event: 'auth.email_verification_error',
            error: error.message,
            stack: error.stack,
            ip: req.ip,
            timestamp: new Date().toISOString()
        });
        res.status(500).json({
            success: false,
            message: 'Failed to verify email',
            error: error.message
        });
    }
};

module.exports = {
    register,
    login,
    getProfile,
    updateProfile,
    logout,
    requestPasswordReset,
    resetPassword,
    verifyEmail
};