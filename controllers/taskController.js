const Task = require("../models/task");
const generateId = require("../utils/idGenerator");
const { validateTaskData } = require("../utils/validators");

let tasks = []; // in-memory storage

// Create Task
function createTask(req, res) {
  const error = validateTaskData(req.body);
  if (error) return res.status(400).json({ error });

  const { title, description, status } = req.body;
  const newTask = new Task(generateId(), title, description, status || "To Do");
  tasks.push(newTask);

  res.status(201).json({ message: "Task created successfully", task: newTask });
}

// Get All Tasks
function getAllTasks(req, res) {
  res.json(tasks);
}

// Get Task By ID
function getTaskById(req, res) {
  const task = tasks.find((t) => t.id === parseInt(req.params.id));
  if (!task) return res.status(404).json({ error: "Task not found" });

  res.json(task);
}

// Update Task
function updateTask(req, res) {
  const task = tasks.find((t) => t.id === parseInt(req.params.id));
  if (!task) return res.status(404).json({ error: "Task not found" });

  const error = validateTaskData(req.body);
  if (error) return res.status(400).json({ error });

  const { title, description, status } = req.body;
  task.title = title || task.title;
  task.description = description || task.description;
  task.status = status || task.status;

  res.json({ message: "Task updated successfully", task });
}

// Delete Task
function deleteTask(req, res) {
  const taskIndex = tasks.findIndex((t) => t.id === parseInt(req.params.id));
  if (taskIndex === -1) return res.status(404).json({ error: "Task not found" });

  tasks.splice(taskIndex, 1);
  res.json({ message: "Task deleted successfully" });
}

// Search tasks by title or description

function searchTask (req, res, next)  {
  try {
    const { query } = req.query; // e.g., /api/tasks/search?query=milk
    if (!query) {
      return res.status(400).json({ message: "Query parameter is required" });
    }

    const result = tasks.filter(
      (task) =>
        task.title.toLowerCase().includes(query.toLowerCase()) ||
        task.description.toLowerCase().includes(query.toLowerCase())
    );

    res.json(result);
  } catch (error) {
    next(error);
  }
};


module.exports = {
  createTask,
  getAllTasks,
  getTaskById,
  updateTask,
  deleteTask,
  searchTask,
};
