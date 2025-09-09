const Task = require("../models/task");
const { validateTaskData } = require("../utils/validators");
const { logger, enhancedLogger } = require('../middleware/logger');

// Create Task
const createTask = async (req, res) => {
    try {
        const error = validateTaskData(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                message: error
            });
        }

        const { title, description, status = "To Do", priority = "Medium" } = req.body;
        
        const taskId = await Task.create({
            title,
            description,
            status,
            priority,
            userId: req.user.id
        });

        const createdTask = await Task.findByIdAndUserId(taskId, req.user.id);

        enhancedLogger.task.created(taskId, req.user.id, title);

        res.status(201).json({
            success: true,
            message: "Task created successfully",
            data: {
                task: createdTask
            }
        });
    } catch (error) {
        logger.error('Task creation failed', {
            event: 'task.create_error',
            error: error.message,
            userId: req.user?.id,
            taskData: req.body,
            timestamp: new Date().toISOString()
        });
        res.status(500).json({
            success: false,
            message: "Failed to create task",
            error: error.message
        });
    }
};

// Get All Tasks for current user
const getAllTasks = async (req, res) => {
    try {
        const { status, priority } = req.query;
        const filters = {};
        
        if (status) filters.status = status;
        if (priority) filters.priority = priority;

        const tasks = await Task.findByUserId(req.user.id, filters);

        res.json({
            success: true,
            data: {
                tasks,
                count: tasks.length
            }
        });
    } catch (error) {
        logger.error('Get all tasks failed', {
            event: 'task.get_all_error',
            error: error.message,
            userId: req.user?.id,
            timestamp: new Date().toISOString()
        });
        res.status(500).json({
            success: false,
            message: "Failed to retrieve tasks",
            error: error.message
        });
    }
};

// Get All Tasks (Admin only)
const getAllTasksAdmin = async (req, res) => {
    try {
        const { status, priority, userId } = req.query;
        const filters = {};
        
        if (status) filters.status = status;
        if (priority) filters.priority = priority;
        if (userId) filters.userId = parseInt(userId);

        const tasks = await Task.findAll(filters);

        res.json({
            success: true,
            data: {
                tasks,
                count: tasks.length
            }
        });
    } catch (error) {
        logger.error('Get all tasks admin failed', {
            event: 'task.get_all_admin_error',
            error: error.message,
            userId: req.user?.id,
            timestamp: new Date().toISOString()
        });
        res.status(500).json({
            success: false,
            message: "Failed to retrieve tasks",
            error: error.message
        });
    }
};

// Get Task By ID
const getTaskById = async (req, res) => {
    try {
        const taskId = parseInt(req.params.id);
        let task;

        if (req.user.role === 'admin') {
            task = await Task.findById(taskId);
        } else {
            task = await Task.findByIdAndUserId(taskId, req.user.id);
        }

        if (!task) {
            return res.status(404).json({
                success: false,
                message: "Task not found"
            });
        }

        res.json({
            success: true,
            data: {
                task
            }
        });
    } catch (error) {
        logger.error('Get task by ID failed', {
            event: 'task.get_by_id_error',
            error: error.message,
            userId: req.user?.id,
            taskId: req.params.id,
            timestamp: new Date().toISOString()
        });
        res.status(500).json({
            success: false,
            message: "Failed to retrieve task",
            error: error.message
        });
    }
};

// Update Task
const updateTask = async (req, res) => {
    try {
        const taskId = parseInt(req.params.id);
        const error = validateTaskData(req.body);
        
        if (error) {
            return res.status(400).json({
                success: false,
                message: error
            });
        }

        const { title, description, status, priority } = req.body;
        let updated;

        if (req.user.role === 'admin') {
            updated = await Task.updateAdmin(taskId, { title, description, status, priority });
        } else {
            updated = await Task.update(taskId, req.user.id, { title, description, status, priority });
        }

        if (!updated) {
            return res.status(404).json({
                success: false,
                message: "Task not found or you don't have permission to update it"
            });
        }

        // Get updated task
        let updatedTask;
        if (req.user.role === 'admin') {
            updatedTask = await Task.findById(taskId);
        } else {
            updatedTask = await Task.findByIdAndUserId(taskId, req.user.id);
        }

        enhancedLogger.task.updated(id, req.user.id, updateData);

        res.json({
            success: true,
            message: "Task updated successfully",
            data: {
                task: updatedTask
            }
        });
    } catch (error) {
        logger.error('Update task failed', {
            event: 'task.update_error',
            error: error.message,
            userId: req.user?.id,
            taskId: req.params.id,
            updateData: req.body,
            timestamp: new Date().toISOString()
        });
        res.status(500).json({
            success: false,
            message: "Failed to update task",
            error: error.message
        });
    }
};

// Delete Task
const deleteTask = async (req, res) => {
    try {
        const taskId = parseInt(req.params.id);
        let deleted;

        if (req.user.role === 'admin') {
            deleted = await Task.deleteAdmin(taskId);
        } else {
            deleted = await Task.delete(taskId, req.user.id);
        }

        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: "Task not found or you don't have permission to delete it"
            });
        }

        enhancedLogger.task.deleted(taskId, req.user.id);

        res.json({
            success: true,
            message: "Task deleted successfully"
        });
    } catch (error) {
        logger.error('Delete task failed', {
            event: 'task.delete_error',
            error: error.message,
            userId: req.user?.id,
            taskId: req.params.id,
            timestamp: new Date().toISOString()
        });
        res.status(500).json({
            success: false,
            message: "Failed to delete task",
            error: error.message
        });
    }
};

// Search tasks by title or description
const searchTasks = async (req, res) => {
    try {
        const { query } = req.query;
        
        if (!query) {
            return res.status(400).json({
                success: false,
                message: "Query parameter is required"
            });
        }

        let tasks;
        if (req.user.role === 'admin') {
            tasks = await Task.findAll();
        } else {
            tasks = await Task.findByUserId(req.user.id);
        }

        const results = tasks.filter(task =>
            task.title.toLowerCase().includes(query.toLowerCase()) ||
            task.description.toLowerCase().includes(query.toLowerCase())
        );

        res.json({
            success: true,
            data: {
                tasks: results,
                count: results.length
            }
        });
    } catch (error) {
        logger.error('Search tasks failed', {
            event: 'task.search_error',
            error: error.message,
            userId: req.user?.id,
            searchQuery: req.query.q,
            timestamp: new Date().toISOString()
        });
        res.status(500).json({
            success: false,
            message: "Failed to search tasks",
            error: error.message
        });
    }
};

// Get task statistics
const getTaskStats = async (req, res) => {
    try {
        let stats;
        
        if (req.user.role === 'admin') {
            // Admin can see all stats
            const allTasks = await Task.findAll();
            stats = {
                total: allTasks.length,
                todo: allTasks.filter(t => t.status === 'To Do').length,
                in_progress: allTasks.filter(t => t.status === 'In Progress').length,
                done: allTasks.filter(t => t.status === 'Done').length
            };
        } else {
            stats = await Task.getStatsByUserId(req.user.id);
        }

        res.json({
            success: true,
            data: {
                stats
            }
        });
    } catch (error) {
        logger.error('Get task stats failed', {
            event: 'task.stats_error',
            error: error.message,
            userId: req.user?.id,
            timestamp: new Date().toISOString()
        });
        res.status(500).json({
            success: false,
            message: "Failed to get task statistics",
            error: error.message
        });
    }
};

module.exports = {
    createTask,
    getAllTasks,
    getAllTasksAdmin,
    getTaskById,
    updateTask,
    deleteTask,
    searchTasks,
    getTaskStats
};
