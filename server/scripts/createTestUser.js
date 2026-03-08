/**
 * This script creates a test user with a known username and password
 */
const { sequelize } = require('../models');
const { User } = require('../auth');
const bcrypt = require('bcryptjs');

async function createTestUser() {
  try {
    console.log('Creating test user for easy login...');
    
    // Check if test user already exists
    const existingUser = await User.findOne({ where: { email: 'test@example.com' } });
    
    if (existingUser) {
      await existingUser.update({
        trueskill_mu: 7.0,
        trueskill_sigma: 1.0, // 7.0 - 2*1.0 = 5.0 — consistent with K=2 formula
        masteryScore: 5.0,
        responseCount: 30
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
        trueskill_sigma: 1.0, // 7.0 - 2*1.0 = 5.0 — consistent with K=2 formula
        responseCount: 30,
        masteryScore: 5.0
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
