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
}

module.exports = User;