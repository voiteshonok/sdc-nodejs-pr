// Student Management System

const { getLogger } = require('./Logger');
const { StudentsStorage } = require('./StudentsStorage');
const { loadJSON, saveToJSON } = require('./utils');
const { Backup } = require('./Backup');
const { Reporter } = require('./Reporter');
const { STUDENT_EVENTS, BACKUP_EVENTS } = require('./events');


const args = process.argv.slice(2);

const isVerbose = args.includes("--verbose");
const isQuiet = args.includes("--quiet");

const logger = getLogger(isVerbose, isQuiet);


function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  try {
    const studentsStorage = new StudentsStorage();
    
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

    await sleep(2000);

    const backup = new Backup();
    
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
    
    backup.start(() => studentsStorage.getAllStudents());

    logger.log(studentsStorage.getStudentsByGroup(2));

    await saveToJSON(studentsStorage.getAllStudents(), './students.json');

    await sleep(2000);

    logger.log(studentsStorage.calculateAverageAge());
    logger.log(studentsStorage.getStudentById('5'));

    const newStudents = await loadJSON('./students.json');
    logger.log(newStudents);

    studentsStorage.removeStudent('4');
    await sleep(2000);
    logger.log(studentsStorage.getAllStudents());
    
    await sleep(1000);
    backup.stop();
    
    // Generate backup statistics report
    await sleep(1000);
    const reporter = new Reporter('./backups');
    await reporter.printReport();
  } catch (err) {
    logger.log("Error in main execution:", err);
    process.exit(1);
  }
}

main();


