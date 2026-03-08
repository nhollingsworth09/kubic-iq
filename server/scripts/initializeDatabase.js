/**
 * Script to initialize the database with tables and sample data
 * This script should be run after a database reset
 */
const { sequelize, Question } = require('../models');
const sampleQuestions = require('./sampleQuestions');
const { User } = require('../auth');

// Try to require bcryptjs and uuid, or handle their absence
let bcrypt, uuidv4;
try {
  bcrypt = require('bcryptjs');
} catch (err) {
  try {
    // Try to require bcrypt as fallback (some systems have this instead)
    bcrypt = require('bcrypt');
  } catch (bcryptErr) {
    console.error('Neither bcryptjs nor bcrypt modules found. Please install with: npm install bcryptjs');
    console.error('Continuing with a simple fallback encryption...');
    // Simple fallback "encryption" (not secure, just to allow script to continue)
    bcrypt = {
      hash: async (password) => 'fallback_' + password
    };
  }
}

try {
  const { v4 } = require('uuid');
  uuidv4 = v4;
} catch (err) {
  console.error('uuid module not found. Please install it with: npm install uuid');
  console.error('Continuing with a simple fallback UUID generator...');
  // Simple fallback UUID generator
  uuidv4 = () => 'fallback_' + Date.now() + '_' + Math.random().toString(36).substring(2, 15);
}

async function initializeDatabase() {
  try {
    console.log('Connecting to database...');
    await sequelize.authenticate();
    
    // Force sync to recreate all tables
    console.log('Creating database tables...');
    await sequelize.sync({ force: true });
    
    console.log('Adding sample questions...');
    for (const question of sampleQuestions) {
      await Question.create(question);
    }
    
    console.log(`Successfully added ${sampleQuestions.length} sample questions.`);
    
    // Create admin user
    console.log('Creating admin user...');
    const hashedPassword = await bcrypt.hash('admin', 10);
    await User.create({
      id: uuidv4(),
      email: 'admin@kubic.com',
      password: hashedPassword,
      displayName: 'Admin User',
      isAdmin: true,
      trueskill_mu: 7.0,
      trueskill_sigma: 1.67,
      masteryScore: 5.0,
      responseCount: 30 // Set above 25 to show mastery score
    });
    
    console.log('Admin user created successfully.');

    // Create test user
    console.log('Creating test user...');
    const hashedTestPassword = await bcrypt.hash('password123', 10);
    await User.create({
      id: uuidv4(),
      email: 'test@example.com',
      password: hashedTestPassword,
      displayName: 'Test User',
      isAdmin: false,
      trueskill_mu: 7.0,
      trueskill_sigma: 1.67,
      masteryScore: 5.0,
      responseCount: 30
    });

    console.log('Test user created successfully.');
    
    console.log('Database initialization complete!');
    return true;
  } catch (error) {
    console.error('Error initializing database:', error);
    return false;
  } finally {
    await sequelize.close();
  }
}

// Run the function if this script is executed directly
if (require.main === module) {
  initializeDatabase().then(success => {
    process.exit(success ? 0 : 1);
  });
}

// Export for use in other scripts
module.exports = initializeDatabase;
