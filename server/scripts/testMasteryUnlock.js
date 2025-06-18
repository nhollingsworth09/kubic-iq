// Script to update the admin user's responseCount to 25 for testing mastery score unlock
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

async function updateAdminResponseCount() {
  try {
    // Find the admin user
    const adminUser = await User.findOne({ where: { isAdmin: true } });
    
    if (!adminUser) {
      console.error('Admin user not found. Please make sure the admin user is created first.');
      process.exit(1);
    }
    
    // Update the responseCount to 25
    adminUser.responseCount = 25;
    await adminUser.save();
    
    console.log('Admin user responseCount updated to 25.');
    console.log(`Admin user details:`);
    console.log(`- Email: ${adminUser.email}`);
    console.log(`- Display Name: ${adminUser.displayName}`);
    console.log(`- Response Count: ${adminUser.responseCount}`);
    console.log(`- Is Admin: ${adminUser.isAdmin}`);
    console.log(`- Mastery Score: ${adminUser.masteryScore !== null ? adminUser.masteryScore.toFixed(1) : 'Not set'}`);
    
    // Set a sample mastery score if not already set
    if (adminUser.masteryScore === null) {
      adminUser.masteryScore = 7.8;
      await adminUser.save();
      console.log('\nSet a sample mastery score of 7.8 for testing.');
    }
    
  } catch (error) {
    console.error('Error updating admin user:', error);
  } finally {
    await sequelize.close();
  }
}

updateAdminResponseCount();
