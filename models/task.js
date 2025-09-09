const { query } = require('../utils/db');

class Task {
    constructor(id, title, description = "", status = "To Do", priority = "Medium", userId) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.status = status;
        this.priority = priority;
        this.userId = userId;
    }

    // Create a new task
    static async create(taskData) {
        const { title, description = "", status = "To Do", priority = "Medium", userId } = taskData;
        
        const sql = 'INSERT INTO tasks (title, description, status, priority, user_id) VALUES (?, ?, ?, ?, ?)';
        const result = await query(sql, [title, description, status, priority, userId]);
        
        return result.insertId;
    }

    // Find all tasks for a specific user
    static async findByUserId(userId, filters = {}) {
        let sql = 'SELECT * FROM tasks WHERE user_id = ?';
        const params = [userId];

        // Add status filter if provided
        if (filters.status) {
            sql += ' AND status = ?';
            params.push(filters.status);
        }

        // Add priority filter if provided
        if (filters.priority) {
            sql += ' AND priority = ?';
            params.push(filters.priority);
        }

        sql += ' ORDER BY created_at DESC';
        
        const results = await query(sql, params);
        return results.map(task => new Task(
            task.id,
            task.title,
            task.description,
            task.status,
            task.priority,
            task.user_id
        ));
    }

    // Find all tasks (admin only)
    static async findAll(filters = {}) {
        let sql = `
            SELECT t.*, u.username, u.email 
            FROM tasks t 
            JOIN users u ON t.user_id = u.id
            WHERE 1=1
        `;
        const params = [];

        // Add status filter if provided
        if (filters.status) {
            sql += ' AND t.status = ?';
            params.push(filters.status);
        }

        // Add priority filter if provided
        if (filters.priority) {
            sql += ' AND t.priority = ?';
            params.push(filters.priority);
        }

        // Add user filter if provided
        if (filters.userId) {
            sql += ' AND t.user_id = ?';
            params.push(filters.userId);
        }

        sql += ' ORDER BY t.created_at DESC';
        
        const results = await query(sql, params);
        return results;
    }

    // Find task by ID and user ID
    static async findByIdAndUserId(id, userId) {
        const sql = 'SELECT * FROM tasks WHERE id = ? AND user_id = ?';
        const results = await query(sql, [id, userId]);
        
        if (results.length === 0) {
            return null;
        }
        
        const task = results[0];
        return new Task(
            task.id,
            task.title,
            task.description,
            task.status,
            task.priority,
            task.user_id
        );
    }

    // Find task by ID (admin only)
    static async findById(id) {
        const sql = 'SELECT * FROM tasks WHERE id = ?';
        const results = await query(sql, [id]);
        
        if (results.length === 0) {
            return null;
        }
        
        const task = results[0];
        return new Task(
            task.id,
            task.title,
            task.description,
            task.status,
            task.priority,
            task.user_id
        );
    }

    // Update task
    static async update(id, userId, taskData) {
        const { title, description, status, priority } = taskData;
        
        const sql = 'UPDATE tasks SET title = ?, description = ?, status = ?, priority = ? WHERE id = ? AND user_id = ?';
        const result = await query(sql, [title, description, status, priority, id, userId]);
        
        return result.affectedRows > 0;
    }

    // Update task (admin - can update any task)
    static async updateAdmin(id, taskData) {
        const { title, description, status, priority } = taskData;
        
        const sql = 'UPDATE tasks SET title = ?, description = ?, status = ?, priority = ? WHERE id = ?';
        const result = await query(sql, [title, description, status, priority, id]);
        
        return result.affectedRows > 0;
    }

    // Delete task
    static async delete(id, userId) {
        const sql = 'DELETE FROM tasks WHERE id = ? AND user_id = ?';
        const result = await query(sql, [id, userId]);
        
        return result.affectedRows > 0;
    }

    // Delete task (admin - can delete any task)
    static async deleteAdmin(id) {
        const sql = 'DELETE FROM tasks WHERE id = ?';
        const result = await query(sql, [id]);
        
        return result.affectedRows > 0;
    }

    // Get task statistics for a user
    static async getStatsByUserId(userId) {
        const sql = `
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN status = 'To Do' THEN 1 ELSE 0 END) as todo,
                SUM(CASE WHEN status = 'In Progress' THEN 1 ELSE 0 END) as in_progress,
                SUM(CASE WHEN status = 'Done' THEN 1 ELSE 0 END) as done
            FROM tasks 
            WHERE user_id = ?
        `;
        const results = await query(sql, [userId]);
        return results[0];
    }
}

module.exports = Task;
