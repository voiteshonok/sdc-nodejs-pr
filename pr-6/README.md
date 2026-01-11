# Students Management System - Assignment 5

A full-stack web application for managing students with authentication, role-based access control, and grade tracking.

## Features

- 🔐 **JWT Authentication** - Secure login and registration
- 👥 **User Roles** - Student, Teacher, and Admin with different permissions
- 📚 **Student Management** - CRUD operations for students
- 📖 **Subjects & Grades** - Track subjects and student grades
- 🛡️ **Role-Based Access Control** - Endpoints protected by user roles
- 🎨 **Modern Frontend** - Responsive UI with login, registration, and student management pages

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL 15 (via Docker)
- **ORM**: Sequelize
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcrypt
- **Validation**: Joi
- **Frontend**: HTML, CSS, JavaScript

## Project Structure

```
pr-5/
├── config/
│   └── database.js          # Database configuration
├── migrations/              # Database migrations
│   ├── 20241216000001-create-students.js
│   ├── 20241216000002-create-roles.js
│   ├── 20241216000003-create-users.js
│   ├── 20241216000004-create-subjects.js
│   └── 20241216000005-create-grades.js
├── models/                  # Sequelize models
│   ├── Student.js
│   ├── User.js
│   ├── Role.js
│   ├── Subject.js
│   └── Grade.js
├── seeders/                 # Database seeders
│   ├── 20241216000001-add-initial-students.js
│   ├── 20241216000002-add-initial-roles.js
│   ├── 20241216000003-add-users.js
│   ├── 20241216000004-add-initial-subjects.js
│   └── 20241216000005-add-initial-grades.js
├── src/
│   ├── auth/
│   │   ├── Auth.controller.js      # Authentication controller
│   │   ├── auth.middleware.js      # JWT authentication middleware
│   │   ├── roleGuard.middleware.js # Role-based access control
│   │   └── roles.js                # Role definitions and utilities
│   ├── services/
│   │   └── UserService.js          # User and student service
│   └── utils/
│       └── StudentValidator.js     # Student validation with Joi
├── frontend/
│   ├── login.html           # Login page
│   ├── register.html        # Registration page
│   ├── students.html        # Student management page
│   └── roleGuard.js         # Frontend role utilities
├── index.js                 # Main server file
├── docker-compose.yml       # Docker configuration
└── package.json

```

## Setup Instructions

### 1. Install Dependencies

From the `pr-5` directory:

```bash
cd pr-5
npm install
```

### 2. Start PostgreSQL with Docker

```bash
docker-compose up -d
```

This starts a PostgreSQL 15 container:
- **Host**: `localhost`
- **Port**: `5433` (host) → `5432` (container)
- **Database**: `students_db`
- **User**: `postgres`
- **Password**: `postgres`

**Note**: Make sure Docker is running. If the container stops, restart it with:
```bash
docker-compose up -d
```

### 3. Run Migrations and Seed Data

```bash
npm run db:setup
```

This will:
- Create all tables (students, users, roles, subjects, grades)
- Insert initial data:
  - 3 roles: student, teacher, admin
  - 5 initial students
  - Users for all students + 1 teacher + 1 admin
  - 5 subjects (Mathematics, Physics, Chemistry, Computer Science, English)
  - Grades for all students

**Available commands**:
- `npm run db:migrate` - Apply migrations only
- `npm run db:seed` - Apply seeders only
- `npm run db:migrate:undo` - Undo last migration
- `npm run db:seed:undo` - Undo all seeders
- `npm run db:setup` - Run migrations and seeders

**To reset database**:
```bash
npm run db:seed:undo
npx sequelize-cli db:migrate:undo:all
npm run db:setup
```

### 4. Start the Backend Server

```bash
node index.js
```

The backend will start on:
- **URL**: `http://localhost:3000`
- The server will print all users on startup

## API Endpoints

### Authentication Endpoints

- `POST /api/auth/login` - Login (returns JWT token)
  - Body: `{ "email": "user@example.com", "password": "password123" }`
  - Response: `{ "success": true, "token": "...", "user": {...} }`

- `POST /api/auth/register` - Register new student
  - Body: `{ "name": "John", "surname": "Doe", "email": "john@example.com", "password": "password123", "age": 20, "group": 2 }`
  - Response: `{ "success": true, "message": "Registration successful", "user": {...} }`

### Student Endpoints (All require authentication)

- `GET /api/students` - List all students (requires authentication)
- `POST /api/students` - Create student (requires teacher/admin role)
- `PUT /api/students` - Replace all students (requires teacher/admin role)
- `GET /api/students/:id` - Get student by ID (requires authentication)
- `POST /api/students/:id` - Update student (requires teacher/admin role)
- `DELETE /api/students/:id` - Delete student (requires admin role only)
- `GET /api/students/average-age` - Get average age (requires authentication)
- `GET /api/students/group/:id` - Get students by group (requires teacher/admin role)

### Backup Endpoints

- `GET /api/backup/status` - Get backup status
- `POST /api/backup/start` - Start automatic backups
- `POST /api/backup/stop` - Stop automatic backups

## User Roles and Permissions

### Student Role
- ✅ View students list
- ❌ Cannot add, edit, or delete students

### Teacher Role
- ✅ View students list
- ✅ Add new students
- ✅ Edit existing students
- ❌ Cannot delete students

### Admin Role
- ✅ View students list
- ✅ Add new students
- ✅ Edit existing students
- ✅ Delete students

## Frontend

### Access the Application

1. Start the backend server: `node index.js`
2. Open your browser and navigate to: `http://localhost:3000`
3. You'll be redirected to the login page

### Default Users

After running seeders, you can login with:

**Student**:
- Email: `john.doe1@student.com`
- Password: `password123`

**Teacher**:
- Email: `sarah.teacher@school.com`
- Password: `password123`

**Admin**:
- Email: `admin@school.com`
- Password: `password123`

### Frontend Pages

- **Login Page** (`/` or `/login.html`) - User authentication
- **Register Page** (`/register.html`) - New user registration
- **Students Page** (`/students.html`) - Student management (requires authentication)

### Frontend Features

- JWT token stored in localStorage
- Automatic token validation
- Role-based UI (buttons shown/hidden based on user role)
- Responsive design
- Real-time error handling

## Authentication Flow

1. User registers or logs in
2. Backend issues JWT token containing user info (id, name, email, role_name)
3. Frontend stores token in localStorage
4. All API requests include token in `Authorization: Bearer <token>` header
5. Backend middleware validates token and extracts user info
6. Role-based middleware checks permissions

## Database Schema

### Tables

- **students** - Student information (id, name, age, group)
- **users** - User accounts (id, name, surname, email, role, password)
- **roles** - User roles (role_id, role_name)
- **subjects** - Subject information (id, subject_name)
- **grades** - Student grades (id, subject_id, student_id, grade, evaluated_at)

### Relationships

- Users → Roles (many-to-one)
- Grades → Subjects (many-to-one)
- Grades → Students (many-to-one)

## Environment Variables

Create a `.env` file (optional) to override defaults:

```env
DB_HOST=localhost
DB_PORT=5433
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=students_db
JWT_SECRET=your-secret-key-change-in-production
NODE_ENV=development
```

## Security Features

- ✅ Password hashing with bcrypt (10 salt rounds)
- ✅ JWT token authentication
- ✅ Role-based access control
- ✅ Protected endpoints with middleware
- ✅ Input validation with Joi
- ✅ SQL injection protection (via Sequelize ORM)

## Troubleshooting

### Database Connection Error

If you see `ECONNREFUSED 127.0.0.1:5433`:
1. Check if Docker is running: `docker ps`
2. Start the container: `docker-compose up -d`
3. Wait a few seconds for database to initialize
4. Verify connection: `docker exec students_postgres psql -U postgres -d students_db -c "SELECT 1;"`

### Reset Database

To completely reset the database:
```bash
# Stop containers
docker-compose down

# Remove volume (deletes all data)
docker volume rm pr-5_postgres_data

# Start fresh
docker-compose up -d
sleep 5
npm run db:setup
```

### Migration Issues

If migrations fail:
```bash
# Check migration status
npx sequelize-cli db:migrate:status

# Undo all migrations
npx sequelize-cli db:migrate:undo:all

# Run migrations again
npm run db:migrate
```

## Development

### Project Dependencies

- `express` - Web framework
- `sequelize` - ORM for PostgreSQL
- `sequelize-cli` - Database migrations
- `pg` - PostgreSQL client
- `jsonwebtoken` - JWT token generation/verification
- `bcrypt` - Password hashing
- `joi` - Input validation
- `dotenv` - Environment variables

### Code Structure

- **Controllers**: Handle business logic (`Auth.controller.js`)
- **Services**: Database operations (`UserService.js`)
- **Middleware**: Authentication and authorization (`auth.middleware.js`, `roleGuard.middleware.js`)
- **Models**: Database models (Sequelize)
- **Validators**: Input validation (`StudentValidator.js`)

## Testing

This project uses [Jest](https://jestjs.io/) for unit testing. Tests are located in the `tests/` directory and follow the same structure as the source code.

### Running Tests

Run all tests:
```bash
npm test
```

Run tests in watch mode (automatically reruns tests when files change):
```bash
npm run test:watch
```

Run tests with coverage report:
```bash
npm run test:coverage
```

### Test Structure

- `tests/src/services/` - Unit tests for service classes (e.g., `UserService`)
- `tests/src/auth/` - Unit tests for authentication controllers
- `tests/src/utils/` - Unit tests for utility classes (e.g., `StudentValidator`)

### Test Coverage

The test suite covers:
- **AuthController** - Login and registration logic
- **UserService** - User database operations and password verification
- **StudentValidator** - Input validation for student data

Coverage reports are generated in the `coverage/` directory when running `npm run test:coverage`.

## Logging

The application uses **Winston** for comprehensive logging with environment-based configuration.

### Features

- **Environment-based logging**:
  - **Production** (`NODE_ENV=production`): Logs are written to files in the `logs/` directory
    - `logs/combined.log` - All logs (info, error, warn, debug, fatal)
    - `logs/error.log` - Only errors and fatal messages
  - **Development** (default): Logs are printed to console with colorized output

- **Log levels**: `info`, `error`, `warn`, `debug`, `fatal`
- **Structured logging**: JSON format in production, human-readable format in development
- **Automatic log rotation**: Logs are organized by date
- **Stack traces**: Error logs include full stack traces

### Usage

The logger is available throughout the application via the `Logger` utility class:

```javascript
const { getLogger } = require('./src/utils/Logger');
const logger = getLogger();

logger.info('Info message');
logger.error('Error message');
logger.warn('Warning message');
logger.debug('Debug message');
logger.fatal('Fatal error');
```

### Log Files Location

In production mode, log files are stored in the `logs/` directory (automatically created if it doesn't exist).

## API Documentation (Swagger)

The API is fully documented using **Swagger/OpenAPI** specification with interactive documentation.

### Accessing the Documentation

Once the server is running, access the Swagger UI at:
- **URL**: `http://localhost:3000/api-docs`

### Features

- **Interactive API documentation**: Test endpoints directly from the browser
- **Request/Response schemas**: Detailed documentation of all request and response formats
- **Authentication support**: JWT Bearer token authentication integrated
- **Example requests**: Sample data provided for easy testing
- **Multiple response codes**: All possible responses are documented

### Documented Endpoints

- **Authentication**: `/api/auth/login`, `/api/auth/register`
- **Students**: `/api/students` (GET, POST, PUT)

### Authentication in Swagger UI

1. First, use the `/api/auth/login` endpoint to obtain a JWT token
2. Click the "Authorize" button at the top of the Swagger UI
3. Enter your token in the format: `Bearer <your-token>`
4. All protected endpoints will now use this token for authentication

## Server Monitoring

The application includes **Express Status Monitor** for real-time server resource monitoring.

### Accessing the Monitoring Dashboard

Once the server is running, access the monitoring dashboard at:
- **URL**: `http://localhost:3000/status`

### Metrics Tracked

- **CPU Usage**: Real-time CPU utilization
- **Memory Usage**: RAM consumption
- **System Load**: Server load average
- **Event Loop**: Node.js event loop delay
- **Heap Memory**: JavaScript heap memory usage
- **Response Time**: Average request response times
- **Requests Per Second (RPS)**: API request throughput
- **HTTP Status Codes**: Distribution of response status codes

### Features

- **Real-time updates**: Dashboard updates automatically via WebSocket
- **Historical data**: Multiple time spans (1s, 5s, 15s intervals)
- **Visual charts**: Easy-to-read graphs and metrics
- **No authentication required**: Monitoring dashboard is publicly accessible

## License

ISC
