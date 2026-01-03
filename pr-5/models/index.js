const { Sequelize } = require('sequelize');
const config = require('../config/database');

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: dbConfig.dialect,
    logging: dbConfig.logging,
  }
);

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Import models
db.Student = require('./Student')(sequelize, Sequelize);
db.Role = require('./Role')(sequelize, Sequelize);
db.User = require('./User')(sequelize, Sequelize);
db.Subject = require('./Subject')(sequelize, Sequelize);
db.Grade = require('./Grade')(sequelize, Sequelize);

module.exports = db;

