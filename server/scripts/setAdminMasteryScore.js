// Script to update the admin user's masteryScore for testing
const { DataTypes } = require('sequelize');
const { sequelize } = require('../models');
require('dotenv').config();

// Define User model (need to define it here as it's in auth.js)
const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  email: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  displayName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  trueskill_mu: {
    type: DataTypes.FLOAT,
    defaultValue: 5.0
  },
  trueskill_sigma: {
    type: DataTypes.FLOAT,
    defaultValue: 1.67
  },
  masteryScore: {
    type: DataTypes.FLOAT,
    defaultValue: null
  },
  responseCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false
  },
  isAdmin: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
});

async function updateAdminMasteryScore() {
  try {
    // Find the admin user
    const adminUser = await User.findOne({ where: { isAdmin: true } });
    
    if (!adminUser) {
      console.error('Admin user not found. Please make sure the admin user is created first.');
      process.exit(1);
    }
    
    // Ensure responseCount is at least 25
    if (adminUser.responseCount < 25) {
      adminUser.responseCount = 25;
      console.log('Setting responseCount to 25 to unlock mastery score');
    }
    
    // Set a mastery score for testing (a value between 0-10)
    const testMasteryScore = 8.5; // You can change this value as needed
    adminUser.masteryScore = testMasteryScore;
    
    await adminUser.save();
    
    console.log(`Admin user masteryScore updated to ${testMasteryScore}.`);
    console.log(`Admin user details:`);
    console.log(`- Email: ${adminUser.email}`);
    console.log(`- Display Name: ${adminUser.displayName}`);
    console.log(`- Response Count: ${adminUser.responseCount}`);
    console.log(`- Is Admin: ${adminUser.isAdmin}`);
    console.log(`- Mastery Score: ${adminUser.masteryScore}`);
    
  } catch (error) {
    console.error('Error updating admin user:', error);
  } finally {
    await sequelize.close();
  }
}

updateAdminMasteryScore();
