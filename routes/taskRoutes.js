const express = require("express");
const {
    createTask,
    getAllTasks,
    getAllTasksAdmin,
    getTaskById,
    updateTask,
    deleteTask,
    searchTasks,
    getTaskStats
} = require("../controllers/taskController");
const { authenticateToken } = require('../middleware/auth');
const { requireAdmin, requireUser } = require('../middleware/role');

const router = express.Router();

// All task routes require authentication
router.use(authenticateToken);

// User routes (authenticated users can manage their own tasks)
router.post("/", requireUser, createTask);                    // Create Task
router.get("/", requireUser, getAllTasks);                    // Get User's Tasks
router.get("/search", requireUser, searchTasks);              // Search User's Tasks
router.get("/stats", requireUser, getTaskStats);              // Get Task Statistics
router.get("/:id", requireUser, getTaskById);                 // Get Single Task
router.put("/:id", requireUser, updateTask);                  // Update Task
router.delete("/:id", requireUser, deleteTask);               // Delete Task

// Admin routes (admin can view/manage all tasks)
router.get("/admin/all", requireAdmin, getAllTasksAdmin);     // Get All Tasks (Admin)

module.exports = router;
