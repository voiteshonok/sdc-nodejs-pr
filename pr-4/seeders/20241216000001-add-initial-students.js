'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('students', [
      {
        name: 'John Doe',
        age: 20,
        group: 2,
      },
      {
        name: 'Jane Smith',
        age: 23,
        group: 3,
      },
      {
        name: 'Mike Johnson',
        age: 18,
        group: 2,
      },
      {
        name: 'JSG asdf',
        age: 23,
        group: 3,
      },
      {
        name: 'Mike jordan',
        age: 18,
        group: 2,
      },
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('students', null, {});
  }
};

