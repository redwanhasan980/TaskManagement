const bcrypt = require('bcryptjs');
const { query } = require('../utils/db');

class User {
    constructor(id, username, email, password, role = 'user') {
        this.id = id;
        this.username = username;
        this.email = email;
        this.password = password;
        this.role = role;
    }

    // Create a new user
    static async create(userData) {
        const { username, email, password, role = 'user' } = userData;
        
        // Hash password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        
        const sql = 'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)';
        const result = await query(sql, [username, email, hashedPassword, role]);
        
        return result.insertId;
    }

    // Find user by email
    static async findByEmail(email) {
        const sql = 'SELECT * FROM users WHERE email = ?';
        const results = await query(sql, [email]);
        
        if (results.length === 0) {
            return null;
        }
        
        const user = results[0];
        return new User(user.id, user.username, user.email, user.password, user.role);
    }

    // Find user by ID
    static async findById(id) {
        const sql = 'SELECT * FROM users WHERE id = ?';
        const results = await query(sql, [id]);
        
        if (results.length === 0) {
            return null;
        }
        
        const user = results[0];
        return new User(user.id, user.username, user.email, user.password, user.role);
    }

    // Find user by username
    static async findByUsername(username) {
        const sql = 'SELECT * FROM users WHERE username = ?';
        const results = await query(sql, [username]);
        
        if (results.length === 0) {
            return null;
        }
        
        const user = results[0];
        return new User(user.id, user.username, user.email, user.password, user.role);
    }

    // Verify password
    async verifyPassword(password) {
        return await bcrypt.compare(password, this.password);
    }

    // Get user info without password
    toJSON() {
        return {
            id: this.id,
            username: this.username,
            email: this.email,
            role: this.role
        };
    }

    // Get all users (admin only)
    static async findAll() {
        const sql = 'SELECT id, username, email, role, created_at FROM users ORDER BY created_at DESC';
        const results = await query(sql);
        return results;
    }

    // Update user
    static async update(id, userData) {
        const { username, email, role } = userData;
        const sql = 'UPDATE users SET username = ?, email = ?, role = ? WHERE id = ?';
        const result = await query(sql, [username, email, role, id]);
        return result.affectedRows > 0;
    }

    // Delete user
    static async delete(id) {
        const sql = 'DELETE FROM users WHERE id = ?';
        const result = await query(sql, [id]);
        return result.affectedRows > 0;
    }

    // Set password reset token
    static async setResetToken(email, resetToken, expiresAt) {
        const sql = 'UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE email = ?';
        const result = await query(sql, [resetToken, expiresAt, email]);
        return result.affectedRows > 0;
    }

    // Find user by reset token
    static async findByResetToken(resetToken) {
        const sql = 'SELECT * FROM users WHERE reset_token = ? AND reset_token_expires > NOW()';
        const results = await query(sql, [resetToken]);
        
        if (results.length === 0) {
            return null;
        }
        
        const user = results[0];
        return new User(user.id, user.username, user.email, user.password, user.role);
    }

    // Clear reset token
    static async clearResetToken(id) {
        const sql = 'UPDATE users SET reset_token = NULL, reset_token_expires = NULL WHERE id = ?';
        const result = await query(sql, [id]);
        return result.affectedRows > 0;
    }

    // Update password
    static async updatePassword(id, newPassword) {
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
        
        const sql = 'UPDATE users SET password = ? WHERE id = ?';
        const result = await query(sql, [hashedPassword, id]);
        return result.affectedRows > 0;
    }

    // Set email verification token
    static async updateVerificationToken(id, verificationToken, expiresAt) {
        const sql = 'UPDATE users SET verification_token = ?, verification_token_expires = ? WHERE id = ?';
        const result = await query(sql, [verificationToken, expiresAt, id]);
        return result.affectedRows > 0;
    }

    // Find user by verification token
    static async findByVerificationToken(verificationToken) {
        const sql = 'SELECT * FROM users WHERE verification_token = ? AND verification_token_expires > NOW()';
        const results = await query(sql, [verificationToken]);
        
        if (results.length === 0) {
            return null;
        }
        
        const user = results[0];
        return new User(user.id, user.username, user.email, user.password, user.role);
    }

    // Verify user email
    static async verifyEmail(id) {
        const sql = 'UPDATE users SET email_verified = TRUE, verification_token = NULL, verification_token_expires = NULL WHERE id = ?';
        const result = await query(sql, [id]);
        return result.affectedRows > 0;
    }

    // Check if email is verified
    static async isEmailVerified(email) {
        const sql = 'SELECT email_verified FROM users WHERE email = ?';
        const results = await query(sql, [email]);
        
        if (results.length === 0) {
            return false;
        }
        
        return results[0].email_verified === 1;
    }
}

module.exports = User;