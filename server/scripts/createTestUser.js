/**
 * This script creates a test user with a known username and password
 */
const { sequelize, UserQuestionHistory, TestHistory } = require('../models');
const { User } = require('../auth');
const bcrypt = require('bcryptjs');

async function createTestUser() {
  try {
    console.log('Creating test user for easy login...');
    
    // Check if test user already exists
    const existingUser = await User.findOne({ where: { email: 'test@example.com' } });
    
    if (existingUser) {
      // Delete all question and test history so the user starts fresh each session
      await UserQuestionHistory.destroy({ where: { userId: existingUser.id } });
      await TestHistory.destroy({ where: { userId: existingUser.id } });

      await existingUser.update({
        trueskill_mu: 7.0,
        trueskill_sigma: 1.67, // Reset to initial sigma — history has been cleared
        masteryScore: 7.0,
        responseCount: 22  // 3 answers away from unlocking mastery score (threshold: 25)
      });
      console.log('Test user already exists. TrueSkill params and mastery score reset.');
    } else {
      // Create the test user
      const hashedPassword = await bcrypt.hash('password123', 10);
      
      await User.create({
        displayName: 'Test User',
        email: 'test@example.com',
        password: hashedPassword,
        trueskill_mu: 7.0,
        trueskill_sigma: 1.67,
        responseCount: 22,  // 3 answers away from unlocking mastery score (threshold: 25)
        masteryScore: 7.0
      });
      
      console.log('Test user created with the following credentials:');
      console.log('Email: test@example.com');
      console.log('Password: password123');
    }
    
  } catch (error) {
    console.error('Error creating test user:', error);
  }
}

// If called directly, run the function right away
if (require.main === module) {
  createTestUser();
}

// Export for use in server startup
module.exports = createTestUser;
