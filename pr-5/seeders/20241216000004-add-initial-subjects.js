'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('subjects', [
      {
        id: 1,
        subject_name: 'Mathematics',
      },
      {
        id: 2,
        subject_name: 'Physics',
      },
      {
        id: 3,
        subject_name: 'Chemistry',
      },
      {
        id: 4,
        subject_name: 'Computer Science',
      },
      {
        id: 5,
        subject_name: 'English',
      },
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('subjects', null, {});
  }
};

