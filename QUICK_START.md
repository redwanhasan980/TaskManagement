# 🚀 Ultra-Quick Setup Guide

## Step 1: Start XAMPP

1. Open **XAMPP Control Panel**
2. Click **Start** for **Apache**
3. Click **Start** for **MySQL**
4. Both should show green "Running" status

## Step 2: Launch Your API

```bash
npm start
```

**That's it!** 🎉 Your app automatically:
- ✅ Creates the database
- ✅ Creates all tables  
- ✅ Inserts default admin user
- ✅ Ready to use!

## Step 3: Test the API

Open browser or Postman and test:

- Health check: `http://localhost:3000/health`
- Login: `POST http://localhost:3000/api/auth/login`

## Default Admin Account

- **Email**: `admin@example.com`
- **Password**: `admin123`
- **Role**: admin

## Quick Postman Test

1. **Login** (POST `http://localhost:3000/api/auth/login`):

```json
{
  "email": "admin@example.com",
  "password": "admin123"
}
```

2. Copy the `token` from response

3. **Create Task** (POST `http://localhost:3000/api/tasks`):

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

4. **Get Tasks** (GET `http://localhost:3000/api/tasks`):

```
Headers: Authorization: Bearer YOUR_TOKEN
```

## 🎉 That's it!

Your Task Management API is now running with XAMPP!
