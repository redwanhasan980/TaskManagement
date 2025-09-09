# Task Management API

A complete **Enterprise-Grade Task Management REST API** built with **Node.js + Express.js** featuring authentication, email verification, password reset, and MySQL database integration with professional logging.

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
- 📧 **Email verification** for new registrations
- 🔑 **Password reset** with email tokens
- ⏰ Token expiration and security

### Email Integration

- 📧 **Email verification** for user registration
- 🔑 **Password reset emails** with secure tokens
- 📬 **Gmail integration** with App Password support
- 🎯 **Postman-ready instructions** in emails
- 🔄 **Fallback console logging** for development

### Enterprise Logging

- 📊 **Winston logging system** with structured JSON logs
- 📁 **Daily rotating log files** with retention policies
- 🔍 **Event-based logging** (auth, tasks, email, system events)
- 📈 **Performance monitoring** and request tracking
- 🚨 **Error tracking** with stack traces and context

### Database Schema

- 👥 **Users table**: username, email, password, role, email verification
- 📝 **Tasks table**: title, description, status, priority, user association
- � **Security tokens**: reset tokens, verification tokens with expiration
- �🔗 **Proper relationships**: One-to-many (User → Tasks)
- 🗄️ **Raw MySQL queries** (no ORM)
- 🔄 **Auto-schema updates** for new features

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

# Email Configuration (Gmail)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=your-email@gmail.com

# Server Configuration
PORT=3000
NODE_ENV=development
```

**Note**: For email functionality, you need to:

1. Enable 2FA on your Gmail account
2. Generate an App Password for this application
3. Use the App Password (not your regular password) in `EMAIL_PASS`

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
- ✅ Insert default admin user (with verified email)
- ✅ Add email verification columns to existing installations
- ✅ Set up enterprise logging with daily rotation
- ✅ Be ready to use immediately

The API will be available at `http://localhost:3000`

## 📧 Email Verification Flow

### New User Registration

1. **Register**: User registers with email/password
2. **Verification Email**: System sends email with verification token
3. **Email Verification**: User uses Postman to verify email with token
4. **Login**: User can now login after email verification

### Development Mode

If email is not configured, verification tokens are displayed in the console with Postman instructions.

## 📡 API Endpoints

### Authentication

- `POST /api/auth/register` → Register new user (sends verification email)
- `POST /api/auth/verify-email` → Verify email with token
- `POST /api/auth/login` → User login (requires verified email)
- `GET /api/auth/profile` → Get user profile
- `PUT /api/auth/profile` → Update profile
- `POST /api/auth/logout` → Logout
- `POST /api/auth/forgot-password` → Request password reset
- `POST /api/auth/reset-password` → Reset password with token

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
- `POST /api/auth/register/admin` → Create admin user

## 🔐 Default Admin Account

For testing purposes, a default admin account is created:

- **Email**: admin@example.com
- **Password**: admin123
- **Role**: admin
- **Email Verified**: ✅ Yes (pre-verified)

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

**Response**: User created, verification email sent.

### 2. Verify Email

Check your email or console for the verification token, then:

```bash
curl -X POST http://localhost:3000/api/auth/verify-email \
  -H "Content-Type: application/json" \
  -d '{
    "token": "your-verification-token-from-email"
  }'
```

### 3. Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

**Note**: Login requires verified email.

### 4. Password Reset

```bash
# Request reset
curl -X POST http://localhost:3000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com"
  }'

# Reset with token from email
curl -X POST http://localhost:3000/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "resetToken": "your-reset-token-from-email",
    "newPassword": "newpassword123"
  }'
```

### 5. Create a Task

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

### 6. Get All Tasks

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
email_verified (BOOLEAN, DEFAULT: FALSE)
verification_token (VARCHAR(255), NULL)
verification_token_expires (TIMESTAMP, NULL)
reset_token (VARCHAR(255), NULL)
reset_token_expires (TIMESTAMP, NULL)
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
│   ├── authController.js  # Authentication logic + email verification
│   └── taskController.js  # Task management logic
├── middleware/            # Custom middleware
│   ├── auth.js           # JWT authentication
│   ├── role.js           # Role-based authorization
│   ├── errorHandler.js   # Global error handling
│   └── logger.js         # Winston enterprise logging
├── models/               # Data models
│   ├── user.js          # User model with email verification
│   └── task.js          # Task model
├── routes/               # API routes
│   ├── authRoutes.js    # Authentication routes + verification
│   └── taskRoutes.js    # Task routes
├── utils/                # Utility functions
│   ├── db.js            # Database connection & auto-setup
│   ├── validators.js    # Input validation
│   └── emailService.js  # Email sending (Gmail integration)
├── logs/                 # Log files (auto-generated)
│   ├── application-YYYY-MM-DD.log
│   ├── error-YYYY-MM-DD.log
│   └── access-YYYY-MM-DD.log
├── .env                 # Environment variables
├── server.js           # Application entry point
└── package.json        # Dependencies
```

## 🛠️ Technologies Used

- **Backend**: Node.js, Express.js
- **Database**: MySQL with auto-schema management
- **Authentication**: JSON Web Tokens (JWT)
- **Password Hashing**: bcrypt
- **Email Service**: nodemailer with Gmail integration
- **Logging**: Winston with daily rotating files
- **Validation**: Custom validators
- **Environment**: dotenv

## 📊 Enterprise Features

### Logging System

- **Winston Logger**: Professional logging with structured JSON
- **Daily Rotation**: Automatic log file rotation with retention policies
- **Multiple Log Levels**: Application, Error, and Access logs
- **Event Tracking**: Auth events, task operations, email events, system events
- **Performance Monitoring**: Request timing and memory usage

### Email System

- **Gmail Integration**: SMTP with App Password support
- **Token-based Security**: Secure verification and reset tokens
- **Development Fallback**: Console logging when email isn't configured
- **Postman Integration**: Email templates include API usage instructions

### Security Features

- **Email Verification**: Required for new user accounts
- **Password Reset**: Secure token-based password recovery
- **Token Expiration**: Verification tokens (24h), Reset tokens (1h)
- **Input Validation**: Comprehensive validation for all inputs
- **Role-based Access**: Admin and user role separation

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
