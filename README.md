# Attendify - Attendance Management System

A full-stack attendance management system built with React.js, Node.js, Express, and MongoDB.

## Features

- User Authentication with JWT
- Role-Based Access Control (Super Admin, Admin, HR Manager, Supervisor, Employee)
- Attendance Tracking
- Leave Request Management
- Responsive UI with Tailwind CSS
- Secure API endpoints
- MongoDB Database Integration

## Tech Stack

### Frontend
- React.js
- Tailwind CSS
- React Router
- Context API for state management

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- Role-based Middleware

## Project Structure

```
Attendify/
│── backend/                # Node.js Backend
│   ├── models/            # Database models
│   ├── routes/            # API routes
│   ├── controllers/       # Request handlers
│   ├── middleware/        # JWT & RBAC
│   ├── config/           # Configurations
│   ├── utils/            # Helper functions
│   ├── server.js         # Entry point
│── frontend/              # React.js Frontend
│   ├── src/              
│   │   ├── components/   # UI components
│   │   ├── pages/        # Role-specific pages
│   │   ├── context/      # Global state
│   │   ├── utils/        # Helper functions
│   │   ├── App.js        # Main entry
```

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm run install-all
   ```
3. Create .env file in the backend directory with:
   ```
   MONGODB_URI=your_mongodb_uri
   JWT_SECRET=your_jwt_secret
   PORT=5000
   ```
4. Start the development servers:
   ```bash
   npm start
   ```

## Available Scripts

- `npm run install-all`: Install dependencies for both frontend and backend
- `npm start`: Start both frontend and backend development servers

## API Endpoints

### Authentication
- POST /api/auth/register - Register a new user
- POST /api/auth/login - Login user

### Users
- GET /api/users - Get all users (Admin only)
- GET /api/users/:id - Get user by ID
- PUT /api/users/:id - Update user
- DELETE /api/users/:id - Delete user

### Attendance
- POST /api/attendance - Mark attendance
- GET /api/attendance - Get attendance records
- GET /api/attendance/:userId - Get user attendance

## License

ISC 