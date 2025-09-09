# 🚀 Ultra-Quick Setup Guide

## Step 1: Start XAMPP

1. Open **XAMPP Control Panel**
2. Click **Start** for **Apache**
3. Click **Start** for **MySQL**
4. Both should show green "Running" status

## Step 2: Configure Email (Optional)

For email verification and password reset:

1. Enable 2FA on your Gmail account
2. Generate an App Password
3. Update `.env` file:

```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=your-email@gmail.com
```

**Skip this for testing** - tokens will appear in console!

## Step 3: Launch Your API

```bash
npm start
```

**That's it!** 🎉 Your app automatically:

- ✅ Creates the database
- ✅ Creates all tables with email verification
- ✅ Inserts default admin user (pre-verified)
- ✅ Sets up enterprise logging
- ✅ Ready to use!

## Step 4: Test the API

Open browser or Postman and test:

- Health check: `http://localhost:3000/health`
- Login: `POST http://localhost:3000/api/auth/login`

## Default Admin Account

- **Email**: `admin@example.com`
- **Password**: `admin123`
- **Role**: admin
- **Email Verified**: ✅ Pre-verified

## Quick Postman Test

### For Admin (Skip Email Verification)

1. **Login** (POST `http://localhost:3000/api/auth/login`):

```json
{
  "email": "admin@example.com",
  "password": "admin123"
}
```

### For New Users (Email Verification Required)

1. **Register** (POST `http://localhost:3000/api/auth/register`):

```json
{
  "username": "testuser",
  "email": "test@example.com",
  "password": "password123"
}
```

2. **Check Console/Email** for verification token

3. **Verify Email** (POST `http://localhost:3000/api/auth/verify-email`):

```json
{
  "token": "verification-token-from-console"
}
```

4. **Login** (POST `http://localhost:3000/api/auth/login`):

```json
{
  "email": "test@example.com",
  "password": "password123"
}
```

5. Copy the `token` from response

6. **Create Task** (POST `http://localhost:3000/api/tasks`):

```json
Headers: Authorization: Bearer YOUR_TOKEN
Body:
{
  "title": "My First Task",
  "description": "Testing the API",
  "status": "To Do",
  "priority": "High"
}
```

7. **Get Tasks** (GET `http://localhost:3000/api/tasks`):

```
Headers: Authorization: Bearer YOUR_TOKEN
```

## 🔑 Password Reset Test

1. **Request Reset** (POST `http://localhost:3000/api/auth/forgot-password`):

```json
{
  "email": "test@example.com"
}
```

2. **Check Console/Email** for reset token

3. **Reset Password** (POST `http://localhost:3000/api/auth/reset-password`):

```json
{
  "resetToken": "reset-token-from-console",
  "newPassword": "newpassword123"
}
```

## 📊 Enterprise Features

- **Winston Logging**: Check `logs/` folder for detailed logs
- **Email Integration**: Gmail SMTP with fallback console logging
- **Auto-Schema**: Database updates automatically for new features
- **Email Verification**: Required for new user registrations

## 🎉 That's it!

Your Enterprise Task Management API is now running with:

- ✅ Email verification system
- ✅ Password reset functionality
- ✅ Professional logging
- ✅ Complete CRUD operations
- ✅ Role-based authorization
