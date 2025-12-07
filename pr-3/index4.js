const { getLogger } = require('../pr-2/task/Logger');
const { StudentsStorage } = require('../pr-2/task/StudentsStorage');
const { loadJSON, saveToJSON } = require('../pr-2/task/utils');
const { Backup } = require('../pr-2/task/Backup');
const { Reporter } = require('../pr-2/task/Reporter');
const { STUDENT_EVENTS, BACKUP_EVENTS } = require('../pr-2/task/events');


const logger = getLogger();

const studentsStorage = new StudentsStorage();
const backup = new Backup();

const express = require('express')
const app = express()
app.use(express.json())
const port = 3000

app.get('/api/students', (req, res) => {
    res.send(studentsStorage.getAllStudents());
})

app.post('/api/students', (req, res) => {
    studentsStorage.addStudent(req.body.name, req.body.age, req.body.group);
    res.send(studentsStorage.getAllStudents());
})

app.put('/api/students', (req, res) => {
    studentsStorage.replaceStudents(req.body.students);
    res.send(studentsStorage.getAllStudents());
})

app.get('/api/students/average-age', (req, res) => {
    res.send(studentsStorage.calculateAverageAge());
})

// Specific routes must come BEFORE parameterized routes
app.post('/api/students/save', async (req, res) => {
    try {
        const result = await studentsStorage.saveToJSON(req.body.filePath);
        res.send(result);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
})

app.post('/api/students/load', async (req, res) => {
    try {
        const result = await studentsStorage.loadFromJSON(req.body.filePath);
        res.send(result);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
})

app.get('/api/students/group/:id', (req, res) => {
    res.send(studentsStorage.getStudentsByGroup(req.params.id));
})

// Parameterized routes come LAST
app.get('/api/students/:id', (req, res) => {
    res.send(studentsStorage.getStudentById(req.params.id));
})

app.delete('/api/students/:id', (req, res) => {
    try {
        const removedStudent = studentsStorage.removeStudent(req.params.id);
        res.send(removedStudent);
    } catch (error) {
        res.status(404).send({ error: error.message });
    }
})

app.post('/api/students/:id', (req, res) => {
    try {
        const updatedStudent = studentsStorage.changeStudent(req.params.id, req.body.name, req.body.age, req.body.group);
        res.send(updatedStudent);
    } catch (error) {
        res.status(404).send({ error: error.message });
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

app.post('/api/backup/start', (req, res) => {
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

    // Use the methods - events will be emitted automatically
    logger.log(studentsStorage.getAllStudents());
    studentsStorage.addStudent('new', 23, 'new');

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