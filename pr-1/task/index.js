// Student Management System

const { getLogger } = require('./Logger');
const { StudentsStorage } = require('./StudentsStorage');
const { loadJSON, saveToJSON } = require('./utils');


const args = process.argv.slice(2);

const isVerbose = args.includes("--verbose");
const isQuiet = args.includes("--quiet");

const logger = getLogger(isVerbose, isQuiet);

const studentsStorage = new StudentsStorage();
logger.log(studentsStorage.getAllStudents());
studentsStorage.addStudent('new', 23, 'new');

logger.log(studentsStorage.getStudentsByGroup(2));

saveToJSON(studentsStorage.getAllStudents(), './students.json');

logger.log(studentsStorage.calculateAverageAge());
logger.log(studentsStorage.getStudentById('5'));

const newStudents = loadJSON('./students.json');
logger.log(newStudents);

studentsStorage.removeStudent('4');
logger.log(studentsStorage.getAllStudents());


