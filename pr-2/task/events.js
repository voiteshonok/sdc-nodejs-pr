// Event names constants for the Student Management System

// Student-related events
const STUDENT_EVENTS = {
  ADDED: 'studentAdded',
  REMOVED: 'studentRemoved',
  REMOVAL_FAILED: 'studentRemovalFailed',
  RETRIEVED: 'studentRetrieved',
  ALL_RETRIEVED: 'allStudentsRetrieved',
  BY_GROUP_RETRIEVED: 'studentsByGroupRetrieved',
  AVERAGE_AGE_CALCULATED: 'averageAgeCalculated'
};

// Backup-related events
const BACKUP_EVENTS = {
  STARTED: 'backupStarted',
  STOPPED: 'backupStopped',
  COMPLETED: 'backupCompleted',
  FAILED: 'backupFailed',
  SKIPPED: 'backupSkipped',
  ERROR: 'backupError',
  ALREADY_RUNNING: 'backupAlreadyRunning',
  NOT_RUNNING: 'backupNotRunning',
  DIRECTORY_ERROR: 'backupDirectoryError'
};

module.exports = {
  STUDENT_EVENTS,
  BACKUP_EVENTS
};

