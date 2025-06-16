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
    validate: {
      isArray(value) {
        if (!Array.isArray(value)) {
          throw new Error('Options must be an array');
        }
        if (value.length < 2) {
          throw new Error('At least 2 options are required');
        }
      }
    }
  },
  correctAnswer: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 0
    }
  },  mu: {
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
