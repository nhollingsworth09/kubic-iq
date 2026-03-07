const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const TestHistory = sequelize.define('TestHistory', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    testType: {
      type: DataTypes.ENUM('quiz', 'custom', 'exam'),
      allowNull: false
    },
    // Basic test metrics (for quick queries without parsing the snapshot)
    questionCount: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    correctCount: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    percentage: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    duration: {
      type: DataTypes.INTEGER,  // duration in seconds
      allowNull: false
    },
    topics: {
      type: DataTypes.JSON,
      allowNull: false
    },
    // Mastery score tracking
    masteryScoreChange: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    masteryScoreBefore: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    masteryScoreAfter: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    // Complete test snapshot (questions, answers, time tracking)
    snapshot: {
      type: DataTypes.JSON,
      allowNull: false,
      comment: 'Complete snapshot of the test including questions, answers, and time tracking'
    },
    // Schema version for future compatibility
    schemaVersion: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  });

  // Define associations
  TestHistory.associate = (models) => {
    if (models.User) {
      TestHistory.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user'
      });
    }
  };

  return TestHistory;
};
