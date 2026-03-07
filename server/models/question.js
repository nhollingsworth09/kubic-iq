const { DataTypes } = require('sequelize');

module.exports = (sequelize) => sequelize.define('Question', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  text: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  options: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: [],
    validate: {
      isArray(value) {
        if (!Array.isArray(value)) {
          throw new Error('Options must be an array');
        }
        // Only require options for multiple choice questions
        // Student-produced responses can have empty options
      }
    }
  },
  correctAnswer: {
    // Can be an integer (index for multiple choice) or string (for student-produced)
    type: DataTypes.STRING,
    allowNull: false
  },
  questionType: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'multiple-choice',
    validate: {
      isIn: [['multiple-choice', 'student-produced']]
    }
  },
  mu: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 5.0, // Default TrueSkill mean (scaled to 0-10)
    validate: {
      min: 0,
      max: 10
    }
  },
  sigma: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 1.67, // Default TrueSkill standard deviation (scaled)
    validate: {
      min: 0,
      max: 3.33 // Maximum allowed sigma
    }
  },
  tags: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: [],
    validate: {
      isArray(value) {
        if (!Array.isArray(value)) {
          throw new Error('Tags must be an array');
        }
      }
    }
  }
});
