module.exports = (sequelize, DataTypes) => {
  const Student = sequelize.define('Student', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    age: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 0,
        max: 150,
      },
    },
    group: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  }, {
    tableName: 'students',
    timestamps: false, // Disable createdAt and updatedAt columns
  });

  return Student;
};

