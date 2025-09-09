const express = require('express');
const router = express.Router();
const User = require('../models/user');
const { authenticateToken } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/role');

// All user management routes require admin authentication
router.use(authenticateToken);
router.use(requireAdmin);

// Get all users
router.get('/', async (req, res) => {
    try {
        const users = await User.findAll();
        res.json({
            success: true,
            data: {
                users,
                count: users.length
            }
        });
    } catch (error) {
        console.error('Get all users error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve users',
            error: error.message
        });
    }
});

// Get user by ID
router.get('/:id', async (req, res) => {
    try {
        const userId = parseInt(req.params.id);
        const user = await User.findById(userId);
        
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
        console.error('Get user by ID error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve user',
            error: error.message
        });
    }
});

// Update user
router.put('/:id', async (req, res) => {
    try {
        const userId = parseInt(req.params.id);
        const { username, email, role } = req.body;

        if (!username || !email || !role) {
            return res.status(400).json({
                success: false,
                message: 'Username, email, and role are required'
            });
        }

        if (!['admin', 'user'].includes(role)) {
            return res.status(400).json({
                success: false,
                message: 'Role must be either "admin" or "user"'
            });
        }

        const updated = await User.update(userId, { username, email, role });
        
        if (!updated) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const updatedUser = await User.findById(userId);
        
        res.json({
            success: true,
            message: 'User updated successfully',
            data: {
                user: updatedUser.toJSON()
            }
        });
    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update user',
            error: error.message
        });
    }
});

// Delete user
router.delete('/:id', async (req, res) => {
    try {
        const userId = parseInt(req.params.id);
        
        // Prevent admin from deleting themselves
        if (userId === req.user.id) {
            return res.status(400).json({
                success: false,
                message: 'You cannot delete your own account'
            });
        }

        const deleted = await User.delete(userId);
        
        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            message: 'User deleted successfully'
        });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete user',
            error: error.message
        });
    }
});

module.exports = router;
