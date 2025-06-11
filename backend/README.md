# EduLearn Backend API

A robust Node.js + Express backend for the EduLearn Learning Management System with TypeScript, PostgreSQL, and JWT authentication.

## Features

- **Authentication & Authorization**: JWT-based auth with role-based access control
- **Database**: PostgreSQL with connection pooling
- **Security**: Helmet, CORS, rate limiting, input validation
- **TypeScript**: Full type safety and modern ES features
- **Validation**: Request validation with Joi
- **Logging**: Morgan for HTTP request logging
- **Error Handling**: Centralized error handling middleware

## Quick Start

### Prerequisites

- Node.js 18+ 
- PostgreSQL 12+
- npm or yarn

### Installation

1. **Install dependencies**:
   ```bash
   cd backend
   npm install
   ```

2. **Environment Setup**:
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials and JWT secrets
   ```

3. **Database Setup**:
   ```bash
   # Create database
   createdb edulearn_db
   
   # Run initialization script
   psql -d edulearn_db -f database/init.sql
   ```

4. **Start Development Server**:
   ```bash
   npm run dev
   ```

The API will be available at `http://localhost:3001`

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user (protected)
- `POST /api/auth/refresh` - Refresh access token

### Health Check

- `GET /api/health` - API health status

## Database Schema

### Users Table
- `id` (UUID, Primary Key)
- `email` (Unique)
- `first_name`, `last_name`
- `password_hash`
- `role` (student, teacher, admin)
- `avatar`, `created_at`, `updated_at`, `last_login`

### Demo Credentials

The database is seeded with demo users:

- **Student**: `student@demo.com` / `password123`
- **Teacher**: `teacher@demo.com` / `password123`  
- **Admin**: `admin@demo.com` / `password123`

## Security Features

- **Password Hashing**: bcrypt with salt rounds
- **JWT Tokens**: Separate access and refresh tokens
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **Input Validation**: Joi schema validation
- **CORS**: Configured for frontend origin
- **Helmet**: Security headers

## Development

### Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm test` - Run tests
- `npm run lint` - Run ESLint

### Project Structure

```
backend/
├── src/
│   ├── config/          # Database and JWT configuration
│   ├── controllers/     # Route controllers
│   ├── middleware/      # Auth, validation, error handling
│   ├── routes/          # API routes
│   ├── services/        # Business logic
│   ├── types/           # TypeScript type definitions
│   └── server.ts        # Express app setup
├── database/
│   └── init.sql         # Database schema and seed data
└── dist/                # Compiled JavaScript (generated)
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3001` |
| `NODE_ENV` | Environment | `development` |
| `DB_HOST` | PostgreSQL host | `localhost` |
| `DB_PORT` | PostgreSQL port | `5432` |
| `DB_NAME` | Database name | `edulearn_db` |
| `DB_USER` | Database user | `postgres` |
| `DB_PASSWORD` | Database password | - |
| `JWT_SECRET` | JWT access token secret | - |
| `JWT_REFRESH_SECRET` | JWT refresh token secret | - |
| `JWT_EXPIRES_IN` | Access token expiry | `15m` |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token expiry | `7d` |
| `FRONTEND_URL` | Frontend URL for CORS | `http://localhost:3000` |

## Production Deployment

1. Set `NODE_ENV=production`
2. Use strong JWT secrets
3. Configure PostgreSQL with SSL
4. Set up reverse proxy (nginx)
5. Enable HTTPS
6. Configure proper CORS origins
7. Set up monitoring and logging

## API Response Format

All API responses follow this structure:

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    // Response data
  }
}
```

Error responses:

```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    // Validation errors if applicable
  ]
}
```