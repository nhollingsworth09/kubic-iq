const { sequelize, Question } = require('../models');

async function resetQuestions() {
  try {
    // Delete all existing questions
    await Question.destroy({ where: {}, truncate: true });
    console.log('All existing questions have been deleted.');
    
    // Now run the addSampleQuestions script
    require('./addSampleQuestions');
    
  } catch (error) {
    console.error('Error resetting questions:', error);
    await sequelize.close();
  }
}

// Run the function
resetQuestions();
