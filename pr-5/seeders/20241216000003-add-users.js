'use strict';

const bcrypt = require('bcrypt');

module.exports = {
  async up(queryInterface, Sequelize) {
    // Hash password for all users (using a default password)
    const defaultPassword = 'password123';
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    // Get existing students to create users for them
    const students = await queryInterface.sequelize.query(
      'SELECT id, name FROM students ORDER BY id',
      { type: Sequelize.QueryTypes.SELECT }
    );

    const users = [];

    // Create users for existing students (role_id = 1 for student)
    for (const student of students) {
      // Split student name into name and surname
      const nameParts = student.name.trim().split(/\s+/);
      const name = nameParts[0];
      const surname = nameParts.slice(1).join(' ') || 'Unknown'; // If no surname, use 'Unknown'
      
      // Generate email from name, surname, and student ID to ensure uniqueness
      const emailBase = `${name.toLowerCase()}.${surname.toLowerCase().replace(/\s+/g, '')}`;
      const email = `${emailBase}${student.id}@student.com`;

      users.push({
        name: name,
        surname: surname,
        email: email,
        role: 1, // student role
        password: hashedPassword,
      });
    }

    // Add one teacher user (role_id = 2)
    users.push({
      name: 'Sarah',
      surname: 'Teacher',
      email: 'sarah.teacher@school.com',
      role: 2, // teacher role
      password: hashedPassword,
    });

    // Add one admin user (role_id = 3)
    users.push({
      name: 'Admin',
      surname: 'User',
      email: 'admin@school.com',
      role: 3, // admin role
      password: hashedPassword,
    });

    await queryInterface.bulkInsert('users', users, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', null, {});
  }
};

