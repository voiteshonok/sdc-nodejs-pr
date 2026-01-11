'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('roles', [
      {
        role_id: 1,
        role_name: 'student',
      },
      {
        role_id: 2,
        role_name: 'teacher',
      },
      {
        role_id: 3,
        role_name: 'admin',
      },
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('roles', null, {});
  }
};

