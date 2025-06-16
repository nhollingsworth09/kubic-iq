require('dotenv').config();
const { Sequelize, DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');

// Initialize Sequelize with SQLite
const dbPath = path.join(__dirname, '..', 'db', 'database.sqlite');
console.log('Database path:', dbPath);

if (!fs.existsSync(path.join(__dirname, '..', 'db'))) {
  console.log('Creating db directory');
  fs.mkdirSync(path.join(__dirname, '..', 'db'));
}

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: dbPath,
  logging: console.log
});

// Define User model to match existing table
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
    defaultValue: null,
    allowNull: true
  },
  isAdmin: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  responseCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: true
  }
}, {
  timestamps: true
});

async function fixDatabaseAndCreateAdmin() {
  try {
    // Connect to the database
    await sequelize.authenticate();
    console.log('Connected to the database');
    
    // Check if responseCount column exists
    try {
      await sequelize.query('SELECT responseCount FROM Users LIMIT 1');
      console.log('responseCount column already exists');
    } catch (error) {
      if (error.message.includes('no such column')) {
        console.log('Adding responseCount column to Users table');
        await sequelize.query('ALTER TABLE Users ADD COLUMN responseCount INTEGER DEFAULT 0');
        console.log('Added responseCount column');
      } else {
        throw error;
      }
    }
    
    // Find or create admin user
    const adminUser = {
      email: 'admin@kubic.com',
      password: await bcrypt.hash('admin123', 10),
      displayName: 'Admin User',
      isAdmin: true,
      trueskill_mu: 5.0,
      trueskill_sigma: 1.67,
      responseCount: 30, // Set above threshold to show mastery score
      masteryScore: 5.0
    };
    
    // Check if admin exists
    const existingAdmin = await User.findOne({ where: { email: adminUser.email } });
    
    if (existingAdmin) {
      console.log('Admin user exists, updating credentials');
      await existingAdmin.update({
        password: adminUser.password,
        isAdmin: true,
        responseCount: 30
      });
      console.log('Admin user updated');
    } else {
      console.log('Creating admin user');
      await User.create(adminUser);
      console.log('Admin user created');
    }
    
    // Verify admin user
    const verifyAdmin = await User.findOne({ where: { email: adminUser.email } });
    console.log('Admin user in database:', {
      id: verifyAdmin.id,
      email: verifyAdmin.email,
      isAdmin: verifyAdmin.isAdmin,
      responseCount: verifyAdmin.responseCount,
      masteryScore: verifyAdmin.masteryScore
    });
    
    console.log('Database and admin user setup complete');
    
  } catch (error) {
    console.error('Error in setup:', error);
  } finally {
    await sequelize.close();
    console.log('Database connection closed');
  }
}

fixDatabaseAndCreateAdmin();
