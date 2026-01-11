module.exports = (sequelize, DataTypes) => {
  const Grade = sequelize.define('Grade', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
    },
    subject_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'subjects',
        key: 'id',
      },
    },
    student_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'students',
        key: 'id',
      },
    },
    grade: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 0,
        max: 100,
      },
    },
    evaluated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  }, {
    tableName: 'grades',
    timestamps: false, // Disable createdAt and updatedAt columns
  });

  return Grade;
};



