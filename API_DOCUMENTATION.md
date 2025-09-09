# Task Management API Documentation

A complete Enterprise-Grade Node.js REST API for task management with email verification, password reset, and professional logging.

## Table of Contents

- [Setup](#setup)
- [Authentication & Email Verification](#authentication--email-verification)
- [Password Reset](#password-reset)
- [API Endpoints](#api-endpoints)
- [Database Schema](#database-schema)
- [Logging System](#logging-system)
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

# Email Configuration (Gmail)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=your-email@gmail.com

# Server Configuration
PORT=3000
NODE_ENV=development
```

### 2. Email Setup (Gmail)

1. Enable 2-Factor Authentication on your Gmail account
2. Generate an App Password for this application
3. Use the App Password in `EMAIL_PASS` (not your regular password)

### 3. Automatic Database Setup

The application automatically:

- Creates the database if it doesn't exist
- Creates all tables with proper schema
- Adds email verification columns to existing installations
- Creates default admin user with verified email
- Sets up indexes for optimal performance

**No manual database setup required!**

## Authentication & Email Verification

This API uses JWT (JSON Web Tokens) with email verification for secure authentication.

### Authentication Flow

1. **Register** → User creates account
2. **Email Verification** → User verifies email with token
3. **Login** → User can login with verified email
4. **Access Protected Routes** → Use JWT token in headers

### Default Admin Account

- **Email**: admin@example.com
- **Password**: admin123
- **Role**: admin
- **Email Verified**: ✅ Pre-verified

## Password Reset

Secure password reset with email tokens:

1. **Request Reset** → User enters email
2. **Reset Email** → System sends reset token
3. **Reset Password** → User resets with token

## API Endpoints

### Health Check

- **GET** `/health` - Check API status

### Authentication Endpoints

#### Register User

- **POST** `/api/auth/register`
- **Description**: Creates new user account and sends verification email
- **Body**:

```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "user"
}
```

**Response**:

```json
{
  "success": true,
  "message": "User registered successfully! Please check your email for verification instructions.",
  "data": {
    "userId": 123,
    "email": "john@example.com",
    "message": "A verification email has been sent. Please verify your account before logging in."
  }
}
```

#### Verify Email

- **POST** `/api/auth/verify-email`
- **Description**: Verifies email address with token from email
- **Body**:

```json
{
  "token": "verification-token-from-email"
}
```

**Response**:

```json
{
  "success": true,
  "message": "Email verified successfully! You can now log in to your account.",
  "data": {
    "email": "john@example.com",
    "verified": true
  }
}
```

#### Login

- **POST** `/api/auth/login`
- **Description**: Login with verified email (requires email verification)
- **Body**:

```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response**:

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "jwt-token-here",
    "user": {
      "id": 123,
      "username": "john_doe",
      "email": "john@example.com",
      "role": "user"
    }
  }
}
```

#### Request Password Reset

- **POST** `/api/auth/forgot-password`
- **Description**: Sends password reset email with token
- **Body**:

```json
{
  "email": "john@example.com"
}
```

#### Reset Password

- **POST** `/api/auth/reset-password`
- **Description**: Resets password using token from email
- **Body**:

```json
{
  "resetToken": "reset-token-from-email",
  "newPassword": "newpassword123"
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

#### User Management (Removed)

**Note**: User management endpoints have been removed to eliminate redundant code. Use the auth endpoints for profile management.

## Database Schema

### Users Table

```sql
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'user') DEFAULT 'user',
    email_verified BOOLEAN DEFAULT FALSE,
    verification_token VARCHAR(255) NULL,
    verification_token_expires TIMESTAMP NULL,
    reset_token VARCHAR(255) NULL,
    reset_token_expires TIMESTAMP NULL,
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

## Logging System

### Winston Enterprise Logging

The application uses Winston for professional logging with:

- **Daily Rotating Files**: Automatic log rotation with retention policies
- **Multiple Log Levels**: Application, Error, and Access logs
- **Structured JSON**: Machine-readable log format
- **Event Tracking**: Detailed event logging for all operations

### Log Files

```
logs/
├── application-YYYY-MM-DD.log  # General application logs
├── error-YYYY-MM-DD.log        # Error logs only
└── access-YYYY-MM-DD.log       # HTTP request logs
```

### Log Events

#### Authentication Events

- `auth.register` - User registration
- `auth.login` - Successful login
- `auth.login_failed` - Failed login attempt
- `auth.email_verified` - Email verification
- `auth.password_reset_request` - Password reset requested
- `auth.password_reset` - Password reset completed

#### Task Events

- `task.created` - Task creation
- `task.updated` - Task update
- `task.deleted` - Task deletion
- `task.search` - Task search performed

#### Email Events

- `email.sent` - Email sent successfully
- `email.failed` - Email sending failed

#### System Events

- `system.startup` - Application startup
- `system.error` - System errors

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

**Response**: User created, verification email sent.

### 2. Verify Email

Check your email or console for verification token, then:

```
POST http://localhost:3000/api/auth/verify-email
Content-Type: application/json

{
  "token": "verification-token-from-email"
}
```

### 3. Login (requires verified email)

```
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "password123"
}
```

### 4. Password Reset Flow

#### Request Reset:

```
POST http://localhost:3000/api/auth/forgot-password
Content-Type: application/json

{
  "email": "test@example.com"
}
```

#### Reset Password:

```
POST http://localhost:3000/api/auth/reset-password
Content-Type: application/json

{
  "resetToken": "reset-token-from-email",
  "newPassword": "newpassword123"
}
```

### 5. Create a Task

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

### 6. Get All Tasks

```
GET http://localhost:3000/api/tasks
Authorization: Bearer YOUR_JWT_TOKEN
```

### 7. Update a Task

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

### 8. Delete a Task

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
- **Email verification** for new registrations
- **Password reset** with secure tokens

✅ **Email Integration**

- Gmail SMTP integration with App Password
- Email verification for new users
- Password reset emails with tokens
- Postman-ready instructions in emails
- Development fallback to console logging

✅ **Task Management**

- CRUD operations for tasks
- Task filtering by status and priority
- Task search functionality
- Task statistics

✅ **User Management**

- User registration with email verification
- Profile management
- Admin user management
- Email verification status tracking

✅ **Database Integration**

- MySQL database with auto-schema management
- Core SQL queries (no ORM)
- Data validation
- Error handling
- **Auto-migration** for new features

✅ **Enterprise Logging**

- Winston professional logging system
- Daily rotating log files with retention
- Structured JSON log format
- Event-based tracking (auth, tasks, email, system)
- Performance monitoring and error tracking

✅ **Security**

- Input validation
- SQL injection prevention
- Secure password handling
- JWT token expiration
- **Email verification requirement**
- **Secure token-based password reset**

✅ **API Design**

- RESTful endpoints
- Consistent response format
- Comprehensive error handling
- CORS support
- **Professional logging and monitoring**
