const { Sequelize } = require('sequelize');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './db/database.sqlite',
  logging: false
});

const Question = require('./question')(sequelize);
const UserQuestionHistory = require('./userQuestionHistory')(sequelize);

// Define associations
Question.hasMany(UserQuestionHistory, {
  foreignKey: 'questionId',
  onDelete: 'CASCADE'
});

UserQuestionHistory.belongsTo(Question, {
  foreignKey: 'questionId'
});

module.exports = {
  sequelize,
  Question,
  UserQuestionHistory
};
