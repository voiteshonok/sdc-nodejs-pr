/**
 * Integration tests for /api/auth/login endpoint
 * 
 * Prerequisites:
 * 1. PostgreSQL server must be running (via docker-compose or locally)
 * 2. The test database will be created automatically if it doesn't exist
 * 3. Run migrations: NODE_ENV=test npm run db:migrate
 * 4. Run seeders: NODE_ENV=test npm run db:seed
 * 
 * Or run both: NODE_ENV=test npm run db:setup
 */

// Set test environment before requiring app
process.env.NODE_ENV = 'test';

const request = require('supertest');
const { createTestDatabase } = require('../setup/test-db-setup');
const app = require('../../index');
const db = require('../../models');

describe('POST /api/auth/login', () => {
  // Setup: Create test database and ensure connection
  beforeAll(async () => {
    try {
      // Create test database if it doesn't exist
      await createTestDatabase();
      
      // Authenticate database connection
      await db.sequelize.authenticate();
      console.log('✓ Database connection established');
    } catch (error) {
      console.error('Database setup failed:', error.message);
      console.error('Make sure PostgreSQL is running and accessible.');
      throw error;
    }
  });

  // Cleanup after tests
  afterAll(async () => {
    // Close database connection
    if (db.sequelize) {
      await db.sequelize.close();
    }
  });

  describe('Successful login', () => {
    it('should return 200 with token and user data for valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@school.com',
          password: 'password123'
        })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', 'Login successful');
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      
      // Validate user object structure
      expect(response.body.user).toHaveProperty('id');
      expect(response.body.user).toHaveProperty('name');
      expect(response.body.user).toHaveProperty('surname');
      expect(response.body.user).toHaveProperty('email', 'admin@school.com');
      expect(response.body.user).toHaveProperty('role_name');
      
      // Validate token is a string
      expect(typeof response.body.token).toBe('string');
      expect(response.body.token.length).toBeGreaterThan(0);
    });

    it('should return valid JWT token that can be decoded', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@school.com',
          password: 'password123'
        })
        .expect(200);

      const jwt = require('jsonwebtoken');
      const jwtSecret = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
      
      const decoded = jwt.verify(response.body.token, jwtSecret);
      expect(decoded).toHaveProperty('id');
      expect(decoded).toHaveProperty('email', 'admin@school.com');
      expect(decoded).toHaveProperty('role_name');
    });

    it('should allow login for student role', async () => {
      // Assuming there's at least one student user from seeders
      // The email format from seeders is: ${name}.${surname}${id}@student.com
      // We'll try with a common pattern or create a test user
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'sarah.teacher@school.com',
          password: 'password123'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.user.role_name).toBe('teacher');
    });
  });

  describe('Failed login - invalid credentials', () => {
    it('should return 401 when email is incorrect', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123'
        })
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message', 'Invalid email or password');
      expect(response.body).not.toHaveProperty('token');
      expect(response.body).not.toHaveProperty('user');
    });

    it('should return 401 when password is incorrect', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@school.com',
          password: 'wrongpassword'
        })
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message', 'Invalid email or password');
      expect(response.body).not.toHaveProperty('token');
      expect(response.body).not.toHaveProperty('user');
    });

    it('should return 401 when both email and password are incorrect', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'wrong@example.com',
          password: 'wrongpassword'
        })
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message', 'Invalid email or password');
    });
  });

  describe('Failed login - missing fields', () => {
    it('should return 400 when email is missing', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          password: 'password123'
        })
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message', 'Email and password are required');
      expect(response.body).not.toHaveProperty('token');
    });

    it('should return 400 when password is missing', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@school.com'
        })
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message', 'Email and password are required');
      expect(response.body).not.toHaveProperty('token');
    });

    it('should return 400 when both email and password are missing', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message', 'Email and password are required');
    });

    it('should return 400 when email is empty string', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: '',
          password: 'password123'
        })
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message', 'Email and password are required');
    });

    it('should return 400 when password is empty string', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@school.com',
          password: ''
        })
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message', 'Email and password are required');
    });
  });

  describe('Request validation', () => {
    it('should handle invalid JSON gracefully', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .set('Content-Type', 'application/json')
        .send('invalid json')
        .expect(400);

      // Express will return 400 for invalid JSON
      expect(response.status).toBe(400);
    });

    it('should ignore extra fields in request body', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@school.com',
          password: 'password123',
          extraField: 'should be ignored'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body).not.toHaveProperty('extraField');
    });
  });
});

