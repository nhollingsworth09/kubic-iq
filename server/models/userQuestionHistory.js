const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const UserQuestionHistory = sequelize.define('UserQuestionHistory', {
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
    },    questionId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Questions',
        key: 'id',
        onDelete: 'CASCADE'
      }
    },
    selectedOption: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    correct: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    userRatingBefore: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    userRatingAfter: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    questionRatingBefore: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    questionRatingAfter: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    timestamp: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  });

  return UserQuestionHistory;
};
