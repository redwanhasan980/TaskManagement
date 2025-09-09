function validateTaskData(taskData) {
  if (!taskData.title || typeof taskData.title !== "string") {
    return "Task title is required and must be a string.";
  }

  if (taskData.status && !["To Do", "In Progress", "Completed"].includes(taskData.status)) {
    return "Status must be one of: 'To Do', 'In Progress', 'Completed'.";
  }

  return null; // no errors
}

module.exports = { validateTaskData };
