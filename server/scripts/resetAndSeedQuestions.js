const { sequelize, Question } = require('../models');
const sampleQuestions = require('./sampleQuestions');

async function resetAndSeedQuestions() {
  try {
    console.log('Connecting to database...');
    await sequelize.authenticate();
    
    console.log('Deleting all questions...');
    await Question.destroy({ where: {} });
    
    console.log('Adding sample questions...');
    for (const question of sampleQuestions) {
      await Question.create(question);
    }
    
    console.log(`Successfully reset database and added ${sampleQuestions.length} sample questions.`);
  } catch (error) {
    console.error('Error resetting and seeding questions:', error);
  } finally {
    await sequelize.close();
  }
}

// Run the function
resetAndSeedQuestions();
