const { getLogger } = require('../pr-2/task/Logger');
const { DatabaseProxyConnector } = require('./DatabaseProxyConnector');
const { loadJSON, saveToJSON } = require('../pr-2/task/utils');
const { Backup } = require('../pr-2/task/Backup');
const { Reporter } = require('../pr-2/task/Reporter');
const { STUDENT_EVENTS, BACKUP_EVENTS } = require('../pr-2/task/events');
const { StudentValidator } = require('./StudentValidator');


const logger = getLogger();

const studentsStorage = new DatabaseProxyConnector();
const backup = new Backup();

const express = require('express')
const app = express()
app.use(express.json())

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

app.get('/api/students', async (req, res) => {
    try {
        const students = await studentsStorage.getAllStudents();
        res.send(students);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
})

app.post('/api/students', async (req, res) => {
    const { isValid, errors, value } = StudentValidator.validate(req.body);

    if (!isValid) {
        return res.status(400).send({ errors });
    }

    try {
        await studentsStorage.createStudent(value);
        const students = await studentsStorage.getAllStudents();
        res.send(students);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
})

// Replace all students is not a typical DB operation; keep simple:
app.put('/api/students', async (req, res) => {
    try {
        const students = req.body.students || [];
        // naive replace: delete all then insert
        const all = await studentsStorage.getAllStudents();
        await Promise.all(all.map(s => studentsStorage.deleteStudent(s.id)));
        await Promise.all(students.map(s => {
            const { isValid, errors, value } = StudentValidator.validate(s);
            if (!isValid) {
                throw new Error(errors.join(', '));
            }
            return studentsStorage.createStudent(value);
        }));
        const fresh = await studentsStorage.getAllStudents();
        res.send(fresh);
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
})

app.get('/api/students/average-age', async (req, res) => {
    try {
        const avg = await studentsStorage.calculateAverageAge();
        res.send(avg.toString());
    } catch (error) {
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

app.get('/api/students/group/:id', async (req, res) => {
    try {
        const group = Number(req.params.id);
        const students = await studentsStorage.getStudentsByGroup(group);
        res.send(students);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
})

// Parameterized routes come LAST
app.get('/api/students/:id', async (req, res) => {
    try {
        const student = await studentsStorage.getStudentById(req.params.id);
        if (!student) {
            return res.status(404).send({ error: `Student with id ${req.params.id} not found` });
        }
        res.send(student);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
})

app.delete('/api/students/:id', async (req, res) => {
    try {
        const removedStudent = await studentsStorage.deleteStudent(req.params.id);
        if (!removedStudent) {
            return res.status(404).send({ error: `Student with id ${req.params.id} not found` });
        }
        res.send(removedStudent);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
})

app.post('/api/students/:id', async (req, res) => {
    const { isValid, errors, value } = StudentValidator.validate(req.body);

    if (!isValid) {
        return res.status(400).send({ errors });
    }

    try {
        const updatedStudent = await studentsStorage.updateStudent(req.params.id, value);
        if (!updatedStudent) {
            return res.status(404).send({ error: `Student with id ${req.params.id} not found` });
        }
        res.send(updatedStudent);
    } catch (error) {
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
        backup.start(() => studentsStorage.getAllStudents(), intervalMs);
        res.send({ 
            success: true, 
            message: 'Backup started successfully',
            intervalMs: intervalMs
        });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
})

app.post('/api/backup/stop', (req, res) => {
    try {
        backup.stop();
        res.send({ 
            success: true, 
            message: 'Backup stopped successfully'
        });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})


function setupStudentStorageEvents(studentsStorage) {
    
    // Set up event listeners
    studentsStorage.on(STUDENT_EVENTS.ADDED, (student) => {
        logger.log(`Event: Student added - ${student.name} (ID: ${student.id})`);
    });

    studentsStorage.on(STUDENT_EVENTS.REMOVED, (student) => {
        logger.log(`Event: Student removed - ${student.name} (ID: ${student.id})`);
    });

    studentsStorage.on(STUDENT_EVENTS.REMOVAL_FAILED, (id, error) => {
        logger.log(`Event: Student removal failed - ${error.message}`);
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
        logger.log(`Event: Backup operation failed - ${message}`);
    });

    backup.on(BACKUP_EVENTS.SKIPPED, ({ skipCount, reason }) => {
        logger.log(`Event: Backup operation skipped - ${reason} (skip count: ${skipCount})`);
    });

    backup.on(BACKUP_EVENTS.ERROR, ({ error, message, skipCount }) => {
        logger.log(`Event: Backup error occurred - ${message}${skipCount ? ` (skip count: ${skipCount})` : ''}`);
    });

    backup.on(BACKUP_EVENTS.ALREADY_RUNNING, () => {
        logger.log('Event: Backup is already running');
    });

    backup.on(BACKUP_EVENTS.NOT_RUNNING, () => {
        logger.log('Event: Backup process is not running');
    });

    backup.on(BACKUP_EVENTS.DIRECTORY_ERROR, ({ error, message }) => {
        logger.log(`Event: Backup directory error - ${message}`);
    });

}

setupStudentStorageEvents(studentsStorage);
setupBackupEvents(backup);

// backup.start(() => studentsStorage.getAllStudents());

logger.log(studentsStorage.getStudentById('3'));