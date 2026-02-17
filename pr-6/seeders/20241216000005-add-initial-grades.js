'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Get existing students from database
    const students = await queryInterface.sequelize.query(
      'SELECT id, name FROM students ORDER BY id',
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (students.length === 0) {
      console.log('No students found. Skipping grades seeding.');
      return;
    }

    // Create grades for all existing students across different subjects
    const grades = [];
    
    students.forEach((student, index) => {
      const studentId = student.id;
      

      const subjectIds = [
        (index % 5) + 1,   
        ((index + 1) % 5) + 1, 
        ((index + 2) % 5) + 1 
      ];
      
      // Create grades with different scores and dates
      subjectIds.forEach((subjectId, gradeIndex) => {
        const baseGrade = 75 + (index * 3) + (gradeIndex * 2);
        const grade = Math.min(100, baseGrade); 
        
        grades.push({
          subject_id: subjectId,
          student_id: studentId,
          grade: grade,
          evaluated_at: new Date(`2024-12-${String(gradeIndex + 1).padStart(2, '0')}`)
        });
      });
    });

    await queryInterface.bulkInsert('grades', grades, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('grades', null, {});
  }
};

