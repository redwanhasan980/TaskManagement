# Task Management API

A complete **Task Management REST API** built with **Node.js + Express.js** featuring authentication, authorization, and MySQL database integration.

## 🚀 Features

### Core Functionality

- ✅ **Complete CRUD operations** for tasks
- ✅ **User authentication** with JWT tokens
- ✅ **Role-based authorization** (Admin/User)
- ✅ **MySQL database integration** with raw SQL queries
- ✅ **Secure password hashing** with bcrypt
- ✅ **Input validation** and error handling
- ✅ **Task filtering** by status and priority
- ✅ **Search functionality** for tasks
- ✅ **Task statistics** and analytics

### Security & Authentication

- 🔐 JWT-based authentication
- 🛡️ Password hashing with bcrypt
- 🔒 Role-based access control (RBAC)
- 🚫 Protected routes
- ✅ Input validation and sanitization

### Database Schema

- 👥 **Users table**: username, email, password, role
- 📝 **Tasks table**: title, description, status, priority, user association
- 🔗 **Proper relationships**: One-to-many (User → Tasks)
- 🗄️ **Raw MySQL queries** (no ORM)

## 📋 Quick Start

### 1. Prerequisites

- Node.js (v14 or higher)
- MySQL database
- npm or yarn

### 2. Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd TaskManagement

# Install dependencies
npm install
```

### 3. Environment Setup

Create a `.env` file in the root directory:

```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=task_management
DB_PORT=3306

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=24h

# Server Configuration
PORT=3000
NODE_ENV=development
```

### 4. Start XAMPP & Launch App

```bash
# 1. Start XAMPP Control Panel
# 2. Start Apache and MySQL services
# 3. Start the application
npm start
```

**That's it!** The app will automatically:

- ✅ Create the database if it doesn't exist
- ✅ Create all tables and indexes
- ✅ Insert default admin user
- ✅ Be ready to use immediately

The API will be available at `http://localhost:3000`

## 📡 API Endpoints

### Authentication

- `POST /api/auth/register` → Register new user
- `POST /api/auth/login` → User login
- `GET /api/auth/profile` → Get user profile
- `PUT /api/auth/profile` → Update profile
- `POST /api/auth/logout` → Logout

### Tasks (Protected Routes)

- `POST /api/tasks` → Create task
- `GET /api/tasks` → Get user's tasks
- `GET /api/tasks/:id` → Get specific task
- `PUT /api/tasks/:id` → Update task
- `DELETE /api/tasks/:id` → Delete task
- `GET /api/tasks/search?query=term` → Search tasks
- `GET /api/tasks/stats` → Get task statistics

### Admin Only

- `GET /api/tasks/admin/all` → Get all tasks (admin)
- `GET /api/users` → Manage users
- `POST /api/auth/register/admin` → Create admin user

## 🔐 Default Admin Account

For testing purposes, a default admin account is created:

- **Email**: admin@example.com
- **Password**: admin123
- **Role**: admin

## 📝 Usage Examples

### 1. Register a New User

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "email": "john@example.com",
    "password": "password123"
  }'
```

### 2. Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

### 3. Create a Task

```bash
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "Complete project",
    "description": "Finish the task management API",
    "status": "To Do",
    "priority": "High"
  }'
```

### 4. Get All Tasks

```bash
curl -X GET http://localhost:3000/api/tasks \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 🗄️ Database Schema

### Users Table

```sql
id (INT, AUTO_INCREMENT, PRIMARY KEY)
username (VARCHAR(50), UNIQUE, NOT NULL)
email (VARCHAR(100), UNIQUE, NOT NULL)
password (VARCHAR(255), NOT NULL)
role (ENUM: 'admin', 'user', DEFAULT: 'user')
created_at (TIMESTAMP)
updated_at (TIMESTAMP)
```

### Tasks Table

```sql
id (INT, AUTO_INCREMENT, PRIMARY KEY)
title (VARCHAR(255), NOT NULL)
description (TEXT)
status (ENUM: 'To Do', 'In Progress', 'Done')
priority (ENUM: 'Low', 'Medium', 'High')
user_id (INT, FOREIGN KEY → users.id)
created_at (TIMESTAMP)
updated_at (TIMESTAMP)
```

## 📁 Project Structure

```
TaskManagement/
├── controllers/           # Request handlers
│   ├── authController.js  # Authentication logic
│   └── taskController.js  # Task management logic
├── middleware/            # Custom middleware
│   ├── auth.js           # JWT authentication
│   ├── role.js           # Role-based authorization
│   └── errorHandler.js   # Global error handling
├── models/               # Data models
│   ├── user.js          # User model
│   └── task.js          # Task model
├── routes/               # API routes
│   ├── authRoutes.js    # Authentication routes
│   ├── taskRoutes.js    # Task routes
│   └── userRoutes.js    # User management routes
├── utils/                # Utility functions
│   ├── db.js            # Database connection & auto-setup
│   └── validators.js    # Input validation
├── .env                 # Environment variables
├── server.js           # Application entry point
├── postman_collection.json # API testing collection
└── package.json        # Dependencies
```

## 🛠️ Technologies Used

- **Backend**: Node.js, Express.js
- **Database**: MySQL
- **Authentication**: JSON Web Tokens (JWT)
- **Password Hashing**: bcrypt
- **Validation**: Custom validators
- **Environment**: dotenv

## 📖 API Documentation

For detailed API documentation with examples, see [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)

## 🧪 Testing with Postman

1. Import the API endpoints into Postman
2. Set up environment variables:
   - `baseUrl`: `http://localhost:3000`
   - `authToken`: Your JWT token after login
3. Start with registering a user, then login to get a token
4. Use the token in Authorization header for protected routes

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🆘 Support

If you encounter any issues:

1. Check the API documentation
2. Verify your environment variables
3. Ensure MySQL is running
4. Check the console for error messages

---
