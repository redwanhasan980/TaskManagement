// Validate task data
function validateTaskData(taskData) {
    if (!taskData.title || typeof taskData.title !== "string" || taskData.title.trim().length === 0) {
        return "Task title is required and must be a non-empty string.";
    }

    if (taskData.title.length > 255) {
        return "Task title must be less than 255 characters.";
    }

    if (taskData.description && taskData.description.length > 1000) {
        return "Task description must be less than 1000 characters.";
    }

    if (taskData.status && !["To Do", "In Progress", "Done"].includes(taskData.status)) {
        return "Status must be one of: 'To Do', 'In Progress', 'Done'.";
    }

    if (taskData.priority && !["Low", "Medium", "High"].includes(taskData.priority)) {
        return "Priority must be one of: 'Low', 'Medium', 'High'.";
    }

    return null; // no errors
}

// Validate email format
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Validate password strength
function validatePassword(password) {
    if (!password || typeof password !== 'string') {
        return false;
    }
    
    // Minimum 6 characters
    return password.length >= 6;
}

// Validate username
function validateUsername(username) {
    if (!username || typeof username !== 'string') {
        return false;
    }
    
    // Username should be 3-50 characters, alphanumeric and underscore only
    const usernameRegex = /^[a-zA-Z0-9_]{3,50}$/;
    return usernameRegex.test(username);
}

// Validate user registration data
function validateUserRegistration(userData) {
    const { username, email, password } = userData;

    if (!username || !email || !password) {
        return "Username, email, and password are required.";
    }

    if (!validateUsername(username)) {
        return "Username must be 3-50 characters long and contain only letters, numbers, and underscores.";
    }

    if (!validateEmail(email)) {
        return "Please provide a valid email address.";
    }

    if (!validatePassword(password)) {
        return "Password must be at least 6 characters long.";
    }

    return null; // no errors
}

// Validate pagination parameters
function validatePagination(page, limit) {
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;

    if (pageNum < 1) {
        return { error: "Page must be a positive integer." };
    }

    if (limitNum < 1 || limitNum > 100) {
        return { error: "Limit must be between 1 and 100." };
    }

    return { page: pageNum, limit: limitNum };
}

module.exports = {
    validateTaskData,
    validateEmail,
    validatePassword,
    validateUsername,
    validateUserRegistration,
    validatePagination
};
