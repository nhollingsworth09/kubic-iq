const { Sequelize } = require('sequelize');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './db/database.sqlite',
  logging: false
});

const Question = require('./question')(sequelize);

module.exports = {
  sequelize,
  Question
};
