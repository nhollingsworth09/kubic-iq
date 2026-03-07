/**
 * This script checks if there are any questions in the database.
 * If not, it seeds the database with sample questions.
 */
const { sequelize, Question } = require('../models');
const sampleQuestions = require('./sampleQuestions');

async function checkAndSeedQuestions() {
  try {
    console.log('Checking if questions exist in database...');
    
    // Check if there are any questions
    const count = await Question.count();
    
    if (count === 0) {
      console.log('No questions found. Seeding database with sample questions...');
      
      // Add sample questions
      for (const question of sampleQuestions) {
        await Question.create(question);
      }
      
      console.log(`Successfully seeded database with ${sampleQuestions.length} sample questions.`);
    } else {
      console.log(`Database already has ${count} questions. No seeding needed.`);
    }
    
    return true;
  } catch (error) {
    console.error('Error checking/seeding questions:', error);
    return false;
  }
}

// Export for use in server startup
module.exports = checkAndSeedQuestions;
