const { Sequelize } = require('sequelize');
const dbConfig = require('../../config/database');

/**
 * Creates the test database if it doesn't exist
 * Connects to the default 'postgres' database to create the test database
 */
async function createTestDatabase() {
  const testDbConfig = dbConfig.test;
  
  // Connect to postgres database (default database) to create our test database
  const adminSequelize = new Sequelize({
    database: 'postgres', // Connect to default postgres database
    username: testDbConfig.username,
    password: testDbConfig.password,
    host: testDbConfig.host,
    port: testDbConfig.port,
    dialect: 'postgres',
    logging: false,
  });

  try {
    await adminSequelize.authenticate();
    
    // Check if database exists
    const [results] = await adminSequelize.query(
      `SELECT 1 FROM pg_database WHERE datname = '${testDbConfig.database}'`
    );

    if (results.length === 0) {
      // Database doesn't exist, create it
      await adminSequelize.query(`CREATE DATABASE ${testDbConfig.database}`);
      console.log(`✓ Test database '${testDbConfig.database}' created successfully`);
    } else {
      console.log(`✓ Test database '${testDbConfig.database}' already exists`);
    }
    
    await adminSequelize.close();
    return true;
  } catch (error) {
    console.error('Error creating test database:', error.message);
    throw error;
  }
}

module.exports = { createTestDatabase };

