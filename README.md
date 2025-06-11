# EduLearn - Learning Management System

A modern, full-stack Learning Management System built with Next.js, Node.js, Express, and PostgreSQL.

## Architecture

- **Frontend**: Next.js 13+ with App Router, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Node.js + Express with TypeScript
- **Database**: PostgreSQL with connection pooling
- **Authentication**: JWT-based with role-based access control

## Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL 12+
- npm or yarn

### Installation

1. **Clone and install dependencies**:
   ```bash
   npm run setup
   ```

2. **Database Setup**:
   ```bash
   # Create PostgreSQL database
   createdb edulearn_db
   
   # Run the database initialization script
   psql -d edulearn_db -f supabase/migrations/20250611161614_smooth_wood.sql
   ```

3. **Environment Configuration**:
   ```bash
   # Frontend environment
   cp .env.local.example .env.local
   
   # Backend environment
   cd backend
   cp .env.example .env
   # Edit backend/.env with your database credentials
   ```

4. **Start the application**:
   ```bash
   # Terminal 1: Start backend API
   npm run backend:dev
   
   # Terminal 2: Start frontend
   npm run dev
   ```

## Demo Credentials

The application comes with pre-configured demo accounts:

- **Student**: `student@demo.com` / `password123`
- **Teacher**: `teacher@demo.com` / `password123`
- **Admin**: `admin@demo.com` / `password123`

## Features

### Authentication & Authorization
- JWT-based authentication
- Role-based access control (Student, Teacher, Admin)
- Secure password hashing with bcrypt
- Token refresh mechanism

### User Roles

#### Students
- View and enroll in courses
- Track learning progress
- Submit assignments
- View grades and feedback

#### Teachers
- Create and manage courses
- Manage student enrollments
- Create and grade assignments
- View student analytics

#### Administrators
- Manage all users and courses
- System-wide analytics
- Platform configuration

### Security Features
- Input validation and sanitization
- Rate limiting
- CORS protection
- Helmet security headers
- SQL injection prevention

## API Documentation

The backend API is available at `http://localhost:3001/api`

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/refresh` - Refresh access token

### Health Check
- `GET /api/health` - API status

## Development

### Project Structure

```
edulearn-lms/
├── app/                 # Next.js app directory
├── components/          # React components
├── lib/                # Utilities and configurations
├── backend/            # Express API server
│   ├── src/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── services/
│   │   └── types/
│   └── database/
└── supabase/migrations/ # Database schema
```

### Available Scripts

- `npm run dev` - Start frontend development server
- `npm run backend:dev` - Start backend development server
- `npm run setup` - Install all dependencies
- `npm run build` - Build for production

## Database Schema

The application uses PostgreSQL with the following main tables:

- **users** - User accounts and profiles
- **courses** - Course information
- **enrollments** - Student course enrollments
- **assignments** - Course assignments
- **submissions** - Assignment submissions

## Environment Variables

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

### Backend (.env)
```
PORT=3001
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_NAME=edulearn_db
DB_USER=postgres
DB_PASSWORD=your_password
JWT_SECRET=your-jwt-secret
JWT_REFRESH_SECRET=your-refresh-secret
FRONTEND_URL=http://localhost:3000
```

## Production Deployment

1. Set up PostgreSQL database
2. Configure environment variables
3. Build the frontend: `npm run build`
4. Build the backend: `cd backend && npm run build`
5. Start the production servers
6. Configure reverse proxy (nginx recommended)
7. Enable HTTPS

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details