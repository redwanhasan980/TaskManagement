# Task Management API Documentation

A complete Node.js REST API for task management with authentication and authorization.

## Table of Contents

- [Setup](#setup)
- [Authentication](#authentication)
- [API Endpoints](#api-endpoints)
- [Database Schema](#database-schema)
- [Error Handling](#error-handling)
- [Postman Examples](#postman-examples)

## Setup

### 1. Environment Variables

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

### 2. Database Setup

1. Create MySQL database:

```sql
CREATE DATABASE task_management;
```

2. Run the schema file:

```bash
mysql -u root -p task_management < db_schema.sql
```

### 3. Start the Server

```bash
npm install
npm start
```

The API will be available at `http://localhost:3000`

## Authentication

This API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### Default Admin Account

- **Username**: admin
- **Email**: admin@example.com
- **Password**: admin123
- **Role**: admin

## API Endpoints

### Health Check

- **GET** `/health` - Check API status

### Authentication Endpoints

#### Register User

- **POST** `/api/auth/register`
- **Body**:

```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "password123"
}
```

#### Login

- **POST** `/api/auth/login`
- **Body**:

```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Get Profile

- **GET** `/api/auth/profile`
- **Headers**: `Authorization: Bearer <token>`

#### Update Profile

- **PUT** `/api/auth/profile`
- **Headers**: `Authorization: Bearer <token>`
- **Body**:

```json
{
  "username": "john_updated",
  "email": "john.updated@example.com"
}
```

#### Logout

- **POST** `/api/auth/logout`
- **Headers**: `Authorization: Bearer <token>`

### Task Endpoints

All task endpoints require authentication.

#### Create Task

- **POST** `/api/tasks`
- **Headers**: `Authorization: Bearer <token>`
- **Body**:

```json
{
  "title": "Complete project",
  "description": "Finish the task management API",
  "status": "To Do",
  "priority": "High"
}
```

#### Get All Tasks (User's Own)

- **GET** `/api/tasks`
- **Headers**: `Authorization: Bearer <token>`
- **Query Parameters**:
  - `status`: Filter by status (To Do, In Progress, Done)
  - `priority`: Filter by priority (Low, Medium, High)

#### Get Task by ID

- **GET** `/api/tasks/:id`
- **Headers**: `Authorization: Bearer <token>`

#### Update Task

- **PUT** `/api/tasks/:id`
- **Headers**: `Authorization: Bearer <token>`
- **Body**:

```json
{
  "title": "Updated task title",
  "description": "Updated description",
  "status": "In Progress",
  "priority": "Medium"
}
```

#### Delete Task

- **DELETE** `/api/tasks/:id`
- **Headers**: `Authorization: Bearer <token>`

#### Search Tasks

- **GET** `/api/tasks/search?query=project`
- **Headers**: `Authorization: Bearer <token>`

#### Get Task Statistics

- **GET** `/api/tasks/stats`
- **Headers**: `Authorization: Bearer <token>`

### Admin Endpoints

These endpoints require admin role.

#### Get All Tasks (Admin)

- **GET** `/api/tasks/admin/all`
- **Headers**: `Authorization: Bearer <admin-token>`

#### Register Admin User

- **POST** `/api/auth/register/admin`
- **Headers**: `Authorization: Bearer <admin-token>`
- **Body**:

```json
{
  "username": "new_admin",
  "email": "admin2@example.com",
  "password": "password123",
  "role": "admin"
}
```

#### User Management

- **GET** `/api/users` - Get all users
- **GET** `/api/users/:id` - Get user by ID
- **PUT** `/api/users/:id` - Update user
- **DELETE** `/api/users/:id` - Delete user

## Database Schema

### Users Table

```sql
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'user') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Tasks Table

```sql
CREATE TABLE tasks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status ENUM('To Do', 'In Progress', 'Done') DEFAULT 'To Do',
    priority ENUM('Low', 'Medium', 'High') DEFAULT 'Medium',
    user_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

## Error Handling

All API responses follow this format:

### Success Response

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    // Response data
  }
}
```

### Error Response

```json
{
  "success": false,
  "message": "Error description",
  "error": "ERROR_CODE"
}
```

### Common Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `500` - Internal Server Error

## Postman Examples

### 1. Register a New User

```
POST http://localhost:3000/api/auth/register
Content-Type: application/json

{
  "username": "testuser",
  "email": "test@example.com",
  "password": "password123"
}
```

### 2. Login

```
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "password123"
}
```

### 3. Create a Task

```
POST http://localhost:3000/api/tasks
Content-Type: application/json
Authorization: Bearer YOUR_JWT_TOKEN

{
  "title": "Learn Node.js",
  "description": "Complete Node.js tutorial",
  "status": "To Do",
  "priority": "High"
}
```

### 4. Get All Tasks

```
GET http://localhost:3000/api/tasks
Authorization: Bearer YOUR_JWT_TOKEN
```

### 5. Update a Task

```
PUT http://localhost:3000/api/tasks/1
Content-Type: application/json
Authorization: Bearer YOUR_JWT_TOKEN

{
  "title": "Learn Node.js - Updated",
  "description": "Complete advanced Node.js tutorial",
  "status": "In Progress",
  "priority": "High"
}
```

### 6. Delete a Task

```
DELETE http://localhost:3000/api/tasks/1
Authorization: Bearer YOUR_JWT_TOKEN
```

## Features

✅ **Authentication & Authorization**

- JWT-based authentication
- Role-based access control (Admin/User)
- Password hashing with bcrypt
- Protected routes

✅ **Task Management**

- CRUD operations for tasks
- Task filtering by status and priority
- Task search functionality
- Task statistics

✅ **User Management**

- User registration and login
- Profile management
- Admin user management

✅ **Database Integration**

- MySQL database with proper schema
- Core SQL queries (no ORM)
- Data validation
- Error handling

✅ **Security**

- Input validation
- SQL injection prevention
- Secure password handling
- JWT token expiration

✅ **API Design**

- RESTful endpoints
- Consistent response format
- Comprehensive error handling
- CORS support
