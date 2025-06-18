// Script to check the admin user's current properties
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

async function checkAdminUser() {
  try {
    // Find the admin user
    const adminUser = await User.findOne({ where: { isAdmin: true } });
    
    if (!adminUser) {
      console.error('Admin user not found. Please make sure the admin user is created first.');
      process.exit(1);
    }
    
    console.log(`Admin user details:`);
    console.log(`- Email: ${adminUser.email}`);
    console.log(`- Display Name: ${adminUser.displayName}`);
    console.log(`- Response Count: ${adminUser.responseCount || 0}`);
    console.log(`- Is Admin: ${adminUser.isAdmin}`);
    console.log(`- Mastery Score: ${adminUser.masteryScore !== null ? adminUser.masteryScore.toFixed(1) : 'Not set'}`);
    console.log(`- Created At: ${adminUser.createdAt}`);
    
    // Check if responseCount is enough to see mastery score
    if ((adminUser.responseCount || 0) < 25) {
      console.log('\nNote: responseCount is below 25, so mastery score will be hidden in the UI.');
      console.log('Run the testMasteryUnlock.js script to set responseCount to 25.');
    }
    
  } catch (error) {
    console.error('Error checking admin user:', error);
  } finally {
    await sequelize.close();
  }
}

checkAdminUser();
