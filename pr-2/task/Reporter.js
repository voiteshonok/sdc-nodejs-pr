const fs = require('fs/promises');
const path = require('path');

class Reporter {
  constructor(backupDir = './backups') {
    this.backupDir = backupDir;
  }

  /**
   * Parse timestamp from backup filename
   * Format: YYYY-MM-DD_HH-MM-SS.backup.json
   * The format is created by: toISOString().replace(/[:.]/g, '-').replace('T', '_').slice(0, -5)
   */
  parseTimestampFromFilename(filename) {
    const timestampStr = filename.replace('.backup.json', '');

    const parts = timestampStr.split('_');
    if (parts.length === 2) {
      const datePart = parts[0]; // YYYY-MM-DD
      const timePart = parts[1]; // HH-MM-SS

      const timeParts = timePart.split('-');
      if (timeParts.length === 3) {
        const isoString = `${datePart}T${timeParts.join(':')}`;
        return new Date(isoString);
      }
    }
    return null;
  }

  async getBackupFiles() {
    try {
      const files = await fs.readdir(this.backupDir);
      return files.filter(file => file.endsWith('.backup.json'));
    } catch (err) {
      if (err.code === 'ENOENT') {
        return [];
      }
      throw err;
    }
  }

  async readBackupFile(filename) {
    const filePath = path.join(this.backupDir, filename);
    const content = await fs.readFile(filePath, 'utf8');
    return JSON.parse(content);
  }

  async generateReport() {
    const backupFiles = await this.getBackupFiles();
    
    if (backupFiles.length === 0) {
      return {
        totalBackupFiles: 0,
        latestBackupFile: null,
        latestBackupFileDate: null,
        studentsById: [],
        averageStudentsPerFile: 0
      };
    }

    const backupData = await Promise.all(
      backupFiles.map(async (filename) => {
        const students = await this.readBackupFile(filename);
        const timestamp = this.parseTimestampFromFilename(filename);
        return {
          filename,
          timestamp,
          students: Array.isArray(students) ? students : []
        };
      })
    );

    backupData.sort((a, b) => {
      if (!a.timestamp) return 1;
      if (!b.timestamp) return -1;
      return b.timestamp - a.timestamp;
    });

    const latestBackup = backupData[0];

    const studentsByIdMap = new Map();
    
    backupData.forEach(({ students }) => {
      students.forEach((student) => {
        const studentId = student.id;
        if (!studentsByIdMap.has(studentId)) {
          studentsByIdMap.set(studentId, 0);
        }
        studentsByIdMap.set(studentId, studentsByIdMap.get(studentId) + 1);
      });
    });

    const studentsById = Array.from(studentsByIdMap.entries()).map(([id, amount]) => ({
      id,
      amount
    }));

    studentsById.sort((a, b) => {
      if (b.amount !== a.amount) {
        return b.amount - a.amount;
      }
      return a.id.localeCompare(b.id);
    });

    const totalStudents = backupData.reduce((sum, { students }) => sum + students.length, 0);
    const averageStudentsPerFile = backupFiles.length > 0 
      ? Math.round((totalStudents / backupFiles.length) * 100) / 100 
      : 0;

    return {
      totalBackupFiles: backupFiles.length,
      latestBackupFile: latestBackup.filename,
      latestBackupFileDate: latestBackup.timestamp ? latestBackup.timestamp.toISOString() : null,
      latestBackupFileReadable: latestBackup.timestamp 
        ? latestBackup.timestamp.toLocaleString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
          })
        : null,
      studentsById,
      averageStudentsPerFile
    };
  }


  async printReport() {
    const report = await this.generateReport();

    console.log('\n=== Backup Statistics Report ===\n');
    console.log(`Total backup files: ${report.totalBackupFiles}`);

    if (report.latestBackupFile) {
      console.log(`\nLatest backup file: ${report.latestBackupFile}`);
      if (report.latestBackupFileReadable) {
        console.log(`Created at: ${report.latestBackupFileReadable}`);
      }
    }

    console.log('\nStudents grouped by ID (occurrences across all files):');
    console.log(JSON.stringify(report.studentsById, null, 2));

    console.log(`\nAverage students per file: ${report.averageStudentsPerFile}`);
    console.log('\n================================\n');

    return report;
  }
}

module.exports = { Reporter };

