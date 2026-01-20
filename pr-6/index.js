const { getLogger } = require('./src/utils/Logger');
const { UserService } = require('./src/services/UserService');
const { loadJSON, saveToJSON } = require('../pr-2/task/utils');
const { Backup } = require('../pr-2/task/Backup');
const { Reporter } = require('../pr-2/task/Reporter');
const { STUDENT_EVENTS, BACKUP_EVENTS } = require('../pr-2/task/events');
const { StudentValidator } = require('./src/utils/StudentValidator');
const { AuthController } = require('./src/auth/Auth.controller');
const { authenticateToken } = require('./src/auth/auth.middleware');
const { requireTeacherOrAdmin, requireAdmin } = require('./src/auth/roleGuard.middleware');


const logger = getLogger();

const userService = new UserService();
const backup = new Backup();
const jwtSecret = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const authController = new AuthController(userService, jwtSecret);
const authMiddleware = authenticateToken(jwtSecret);

const express = require('express')
const path = require('path')
const compression = require('compression')
const swaggerUi = require('swagger-ui-express')
const swaggerJsdoc = require('swagger-jsdoc')
const app = express()

// Enable compression middleware - compress all responses
app.use(compression())

app.use(express.json())

// Swagger configuration
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Students Management System API',
            version: '1.0.0',
            description: 'API documentation for the Students Management System',
        },
        servers: [
            {
                url: 'http://localhost:3000',
                description: 'Development server',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: 'Enter JWT token obtained from /api/auth/login'
                }
            }
        },
        security: [
            {
                bearerAuth: []
            }
        ]
    },
    apis: ['./index.js'], // Path to the API files
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Express Status Monitor - protected for admins only
// Apply authentication and admin role check before the status monitor
const expressStatusMonitor = require('express-status-monitor');
const statusMonitorConfig = {
    title: 'Server Status Monitor',
    path: '/status',
    spans: [{
        interval: 1,     // Every second
        retention: 60    // Keep 60 data points
    }, {
        interval: 5,     // Every 5 seconds
        retention: 60    // Keep 60 data points
    }, {
        interval: 15,    // Every 15 seconds
        retention: 60    // Keep 60 data points
    }],
    chartVisibility: {
        cpu: true,
        mem: true,
        load: true,
        eventLoop: true,
        heap: true,
        responseTime: true,
        rps: true,
        statusCodes: true
    },
    healthChecks: []
};

// Protect /status endpoint - require authentication and admin role
app.use('/status', authMiddleware, requireAdmin);
app.use(expressStatusMonitor(statusMonitorConfig));

// Serve static files from frontend directory
app.use(express.static(path.join(__dirname, 'frontend')))

// Enable CORS for frontend
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

const port = 3000

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'login.html'));
});

// Auth endpoints
/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: User login
 *     description: Authenticate a user with email and password. Returns a JWT token upon successful authentication.
 *     tags: [Authentication]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: student@example.com
 *                 description: User's email address
 *               password:
 *                 type: string
 *                 format: password
 *                 example: password123
 *                 description: User's password
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Login successful
 *                 token:
 *                   type: string
 *                   description: JWT authentication token
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     name:
 *                       type: string
 *                       example: John
 *                     surname:
 *                       type: string
 *                       example: Doe
 *                     email:
 *                       type: string
 *                       example: student@example.com
 *                     role_name:
 *                       type: string
 *                       example: student
 *       400:
 *         description: Bad request - Missing required fields
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Email and password are required
 *       401:
 *         description: Unauthorized - Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Invalid email or password
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Internal server error
 */
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const result = await authController.login(email, password);
        if (result.success) {
            logger.info(`Login successful for email: ${email}`);
        } else {
            logger.warn(`Login failed for email: ${email} - ${result.message}`);
        }
        res.status(result.code).send({
            success: result.success,
            message: result.message,
            ...(result.token && { token: result.token }),
            ...(result.user && { user: result.user })
        });
    } catch (error) {
        logger.error('Login error:', error.message, error.stack);
        res.status(500).send({ error: error.message });
    }
})

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: User registration
 *     description: Register a new user account. All fields are required. The user will be created with the 'student' role.
 *     tags: [Authentication]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - surname
 *               - email
 *               - password
 *               - age
 *               - group
 *             properties:
 *               name:
 *                 type: string
 *                 example: John
 *                 description: User's first name
 *               surname:
 *                 type: string
 *                 example: Doe
 *                 description: User's last name
 *               email:
 *                 type: string
 *                 format: email
 *                 example: student@example.com
 *                 description: User's email address (must be unique)
 *               password:
 *                 type: string
 *                 format: password
 *                 example: password123
 *                 description: User's password
 *               age:
 *                 type: integer
 *                 example: 20
 *                 description: User's age
 *               group:
 *                 type: integer
 *                 example: 1
 *                 description: Student group number
 *     responses:
 *       201:
 *         description: Registration successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Registration successful
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     name:
 *                       type: string
 *                       example: John
 *                     surname:
 *                       type: string
 *                       example: Doe
 *                     email:
 *                       type: string
 *                       example: student@example.com
 *                     role_name:
 *                       type: string
 *                       example: student
 *       400:
 *         description: Bad request - Missing required fields
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "All fields are required: email, password, name, surname, age, group"
 *       409:
 *         description: Conflict - User with this email already exists
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: User with this email already exists
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Internal server error
 */
app.post('/api/auth/register', async (req, res) => {
    try {
        const { name, surname, email, password, age, group } = req.body;
        const result = await authController.register(email, password, name, surname, age, group);
        if (result.success) {
            logger.info(`Registration successful for email: ${email}`);
        } else {
            logger.warn(`Registration failed for email: ${email} - ${result.message}`);
        }
        res.status(result.code).send({
            success: result.success,
            message: result.message,
            ...(result.user && { user: result.user })
        });
    } catch (error) {
        logger.error('Registration error:', error.message, error.stack);
        res.status(500).send({ error: error.message });
    }
})

/**
 * @swagger
 * /api/students:
 *   get:
 *     summary: Get all students
 *     description: Retrieve a list of all students. Requires authentication.
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved list of students
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 1
 *                   name:
 *                     type: string
 *                     example: John Doe
 *                   age:
 *                     type: integer
 *                     example: 20
 *                   group:
 *                     type: integer
 *                     example: 1
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Internal server error
 */
app.get('/api/students', authMiddleware, async (req, res) => {
    try {
        const students = await userService.getAllStudents();
        logger.debug(`Retrieved ${students.length} students`);
        res.send(students);
    } catch (error) {
        logger.error('Error fetching students:', error.message, error.stack);
        res.status(500).send({ error: error.message });
    }
})

/**
 * @swagger
 * /api/students:
 *   post:
 *     summary: Create a new student
 *     description: Create a new student. Requires authentication and Teacher or Admin role.
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - age
 *               - group
 *             properties:
 *               name:
 *                 type: string
 *                 maxLength: 100
 *                 example: John Doe
 *                 description: Student's full name
 *               age:
 *                 type: integer
 *                 minimum: 0
 *                 maximum: 150
 *                 example: 20
 *                 description: Student's age
 *               group:
 *                 type: integer
 *                 minimum: 1
 *                 example: 1
 *                 description: Student's group number
 *     responses:
 *       200:
 *         description: Student created successfully. Returns updated list of all students.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 1
 *                   name:
 *                     type: string
 *                     example: John Doe
 *                   age:
 *                     type: integer
 *                     example: 20
 *                   group:
 *                     type: integer
 *                     example: 1
 *       400:
 *         description: Bad request - Validation errors
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["name is required", "age must be between 0 and 150"]
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Forbidden - Requires Teacher or Admin role
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Internal server error
 */
app.post('/api/students', authMiddleware, requireTeacherOrAdmin, async (req, res) => {
    const { isValid, errors, value } = StudentValidator.validate(req.body);

    if (!isValid) {
        return res.status(400).send({ errors });
    }

    try {
        await userService.createStudent(value);
        logger.info(`Student created: ${value.name} ${value.surname}`);
        const students = await userService.getAllStudents();
        res.send(students);
    } catch (error) {
        logger.error('Error creating student:', error.message, error.stack);
        res.status(500).send({ error: error.message });
    }
})

/**
 * @swagger
 * /api/students:
 *   put:
 *     summary: Replace all students
 *     description: Replace the entire students collection with a new set. All existing students are deleted and replaced with the new ones. Requires authentication and Teacher or Admin role.
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - students
 *             properties:
 *               students:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - name
 *                     - age
 *                     - group
 *                   properties:
 *                     name:
 *                       type: string
 *                       maxLength: 100
 *                       example: John Doe
 *                       description: Student's full name
 *                     age:
 *                       type: integer
 *                       minimum: 0
 *                       maximum: 150
 *                       example: 20
 *                       description: Student's age
 *                     group:
 *                       type: integer
 *                       minimum: 1
 *                       example: 1
 *                       description: Student's group number
 *     responses:
 *       200:
 *         description: Students replaced successfully. Returns new list of all students.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 1
 *                   name:
 *                     type: string
 *                     example: John Doe
 *                   age:
 *                     type: integer
 *                     example: 20
 *                   group:
 *                     type: integer
 *                     example: 1
 *       400:
 *         description: Bad request - Validation errors or invalid data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: name is required, age must be between 0 and 150
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Forbidden - Requires Teacher or Admin role
 *       500:
 *         description: Internal server error
 */
// Replace all students is not a typical DB operation; keep simple:
app.put('/api/students', authMiddleware, requireTeacherOrAdmin, async (req, res) => {
    try {
        const students = req.body.students || [];
        // naive replace: delete all then insert
        const all = await userService.getAllStudents();
        await Promise.all(all.map(s => userService.deleteStudent(s.id)));
        await Promise.all(students.map(s => {
            const { isValid, errors, value } = StudentValidator.validate(s);
            if (!isValid) {
                throw new Error(errors.join(', '));
            }
            return userService.createStudent(value);
        }));
        const fresh = await userService.getAllStudents();
        logger.info(`Replaced all students. New count: ${fresh.length}`);
        res.send(fresh);
    } catch (error) {
        logger.error('Error replacing students:', error.message, error.stack);
        res.status(400).send({ error: error.message });
    }
})

app.get('/api/students/average-age', authMiddleware, async (req, res) => {
    try {
        const avg = await userService.calculateAverageAge();
        logger.debug(`Average age calculated: ${avg}`);
        res.send(avg.toString());
    } catch (error) {
        logger.error('Error calculating average age:', error.message, error.stack);
        res.status(500).send({ error: error.message });
    }
})

// Specific routes must come BEFORE parameterized routes
// app.post('/api/students/save', async (req, res) => {
//     try {
//         const result = await studentsStorage.saveToJSON(req.body.filePath);
//         res.send(result);
//     } catch (error) {
//         res.status(500).send({ error: error.message });
//     }
// })

// app.post('/api/students/load', async (req, res) => {
//     try {
//         const result = await studentsStorage.loadFromJSON(req.body.filePath);
//         res.send(result);
//     } catch (error) {
//         res.status(500).send({ error: error.message });
//     }
// })

app.get('/api/students/group/:id', authMiddleware, requireTeacherOrAdmin, async (req, res) => {
    try {
        const group = Number(req.params.id);
        const students = await userService.getStudentsByGroup(group);
        res.send(students);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
})

// Parameterized routes come LAST
app.get('/api/students/:id', authMiddleware, async (req, res) => {
    try {
        const student = await userService.getStudentById(req.params.id);
        if (!student) {
            return res.status(404).send({ error: `Student with id ${req.params.id} not found` });
        }
        res.send(student);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
})

app.delete('/api/students/:id', authMiddleware, requireAdmin, async (req, res) => {
    try {
        const removedStudent = await userService.deleteStudent(req.params.id);
        if (!removedStudent) {
            logger.warn(`Attempt to delete non-existent student: ${req.params.id}`);
            return res.status(404).send({ error: `Student with id ${req.params.id} not found` });
        }
        logger.info(`Student deleted: ${req.params.id}`);
        res.send(removedStudent);
    } catch (error) {
        logger.error(`Error deleting student ${req.params.id}:`, error.message, error.stack);
        res.status(500).send({ error: error.message });
    }
})

app.post('/api/students/:id', authMiddleware, requireTeacherOrAdmin, async (req, res) => {
    const { isValid, errors, value } = StudentValidator.validate(req.body);

    if (!isValid) {
        return res.status(400).send({ errors });
    }

    try {
        const updatedStudent = await userService.updateStudent(req.params.id, value);
        if (!updatedStudent) {
            logger.warn(`Attempt to update non-existent student: ${req.params.id}`);
            return res.status(404).send({ error: `Student with id ${req.params.id} not found` });
        }
        logger.info(`Student updated: ${req.params.id}`);
        res.send(updatedStudent);
    } catch (error) {
        logger.error(`Error updating student ${req.params.id}:`, error.message, error.stack);
        res.status(500).send({ error: error.message });
    }
})


// Backup API endpoints
app.get('/api/backup/status', (req, res) => {
    const status = backup.getStatus();
    res.send({
        status: status.running ? 'running' : 'stopped',
        ...status
    });
})

app.post('/api/backup/start', async (req, res) => {
    try {
        const intervalMs = req.body.intervalMs || 1000;
        backup.start(() => userService.getAllStudents(), intervalMs);
        logger.info(`Backup started with interval: ${intervalMs}ms`);
        res.send({ 
            success: true, 
            message: 'Backup started successfully',
            intervalMs: intervalMs
        });
    } catch (error) {
        logger.error('Error starting backup:', error.message, error.stack);
        res.status(500).send({ error: error.message });
    }
})

app.post('/api/backup/stop', (req, res) => {
    try {
        backup.stop();
        logger.info('Backup stopped');
        res.send({ 
            success: true, 
            message: 'Backup stopped successfully'
        });
    } catch (error) {
        logger.error('Error stopping backup:', error.message, error.stack);
        res.status(500).send({ error: error.message });
    }
})

// Only start server if this file is run directly
if (require.main === module) {
  app.listen(port, async () => {
      logger.info(`Server started - listening on port ${port}`)
      logger.info(`Server monitoring dashboard available at http://localhost:${port}/status`)
      logger.info(`API documentation available at http://localhost:${port}/api-docs`)
      
      // Print all users on startup
      try {
          const users = await userService.getAllUsers();
          logger.info('\n=== All Users ===');
          logger.info(`Total users: ${users.length}\n`);
          users.forEach(user => {
              logger.debug(`ID: ${user.id} | Name: ${user.name} ${user.surname} | Email: ${user.email} | Role: ${user.role_name}`);
          });
          logger.info('================\n');
      } catch (error) {
          logger.error('Error fetching users on startup:', error.message);
      }
  })
}


function setupStudentStorageEvents(studentsStorage) {
    
    // Set up event listeners
    studentsStorage.on(STUDENT_EVENTS.ADDED, (student) => {
        logger.log(`Event: Student added - ${student.name} (ID: ${student.id})`);
    });

    studentsStorage.on(STUDENT_EVENTS.REMOVED, (student) => {
        logger.log(`Event: Student removed - ${student.name} (ID: ${student.id})`);
    });

    studentsStorage.on(STUDENT_EVENTS.REMOVAL_FAILED, (id, error) => {
        logger.error(`Event: Student removal failed - ${error.message}`);
    });

    studentsStorage.on(STUDENT_EVENTS.ALL_RETRIEVED, (students) => {
        logger.log(`Event: All students retrieved (count: ${students.length})`);
    });

    studentsStorage.on(STUDENT_EVENTS.BY_GROUP_RETRIEVED, ({ group, students }) => {
        logger.log(`Event: Students by group ${group} retrieved (count: ${students.length})`);
    });

    studentsStorage.on(STUDENT_EVENTS.RETRIEVED, ({ id, student }) => {
        if (student) {
        logger.log(`Event: Student retrieved by ID ${id} - ${student.name}`);
        } else {
        logger.log(`Event: Student not found by ID ${id}`);
        }
    });

    studentsStorage.on(STUDENT_EVENTS.AVERAGE_AGE_CALCULATED, (averageAge) => {
        logger.log(`Event: Average age calculated - ${averageAge}`);
    });

}

function setupBackupEvents(backup) {

    // Set up backup event listeners
    backup.on(BACKUP_EVENTS.STARTED, ({ intervalMs }) => {
        logger.log(`Event: Backup process started (interval: ${intervalMs}ms)`);
    });

    backup.on(BACKUP_EVENTS.STOPPED, () => {
        logger.log('Event: Backup process stopped');
    });

    backup.on(BACKUP_EVENTS.COMPLETED, ({ filename, filePath, timestamp }) => {
        logger.log(`Event: Backup operation completed successfully - ${filename}`);
    });

    backup.on(BACKUP_EVENTS.FAILED, ({ error, message }) => {
        logger.error(`Event: Backup operation failed - ${message}`);
    });

    backup.on(BACKUP_EVENTS.SKIPPED, ({ skipCount, reason }) => {
        logger.warn(`Event: Backup operation skipped - ${reason} (skip count: ${skipCount})`);
    });

    backup.on(BACKUP_EVENTS.ERROR, ({ error, message, skipCount }) => {
        logger.error(`Event: Backup error occurred - ${message}${skipCount ? ` (skip count: ${skipCount})` : ''}`);
    });

    backup.on(BACKUP_EVENTS.ALREADY_RUNNING, () => {
        logger.log('Event: Backup is already running');
    });

    backup.on(BACKUP_EVENTS.NOT_RUNNING, () => {
        logger.log('Event: Backup process is not running');
    });

    backup.on(BACKUP_EVENTS.DIRECTORY_ERROR, ({ error, message }) => {
        logger.error(`Event: Backup directory error - ${message}`);
    });

}

setupStudentStorageEvents(userService);
setupBackupEvents(backup);

// backup.start(() => studentsStorage.getAllStudents());

// Export app for testing
module.exports = app;