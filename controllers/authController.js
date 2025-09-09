const jwt = require('jsonwebtoken');
const User = require('../models/user');
const { validateEmail, validatePassword } = require('../utils/validators');
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

        // Generate token
        const token = generateToken(userId);

        // Get created user (without password)
        const createdUser = await User.findById(userId);

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: {
                token,
                user: createdUser.toJSON()
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
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

        // Verify password
        const isPasswordValid = await user.verifyPassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Generate token
        const token = generateToken(user.id);

        res.json({
            success: true,
            message: 'Login successful',
            data: {
                token,
                user: user.toJSON()
            }
        });
    } catch (error) {
        console.error('Login error:', error);
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
        console.error('Get profile error:', error);
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
        console.error('Update profile error:', error);
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
        res.json({
            success: true,
            message: 'Logout successful.'
        });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({
            success: false,
            message: 'Logout failed',
            error: error.message
        });
    }
};

module.exports = {
    register,
    login,
    getProfile,
    updateProfile,
    logout
};