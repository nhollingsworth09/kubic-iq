const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { DataTypes } = require('sequelize');
const { sequelize } = require('./models');

// Define User model
const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  email: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  displayName: {
    type: DataTypes.STRING,
    allowNull: false
  },  trueskill_mu: {
    type: DataTypes.FLOAT,
    defaultValue: 5.0, // Default TrueSkill mean (scaled to 0-10)
    validate: {
      min: 0,
      max: 10
    }
  },
  trueskill_sigma: {
    type: DataTypes.FLOAT,
    defaultValue: 1.67, // Default TrueSkill standard deviation (scaled)
    validate: {
      min: 0,
      max: 3.33 // Maximum allowed sigma
    }
  },  masteryScore: {
    type: DataTypes.FLOAT,
    defaultValue: null, // Initially null until MIN_ANSWERS threshold is met
    validate: {
      min: 0,
      max: 10
    }
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

// Authentication middleware
const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.id);
    
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Admin middleware
const adminMiddleware = (req, res, next) => {
  if (!req.user.isAdmin) {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

// Auth routes handlers
const signup = async (req, res) => {
  try {
    const { email, password, displayName } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      email,
      password: hashedPassword,
      displayName
    });

    // Generate JWT
    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        masteryScore: user.masteryScore
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating user', error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        masteryScore: user.masteryScore,
        isAdmin: user.isAdmin
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error logging in', error: error.message });
  }
};

const getMe = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    res.json({
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      masteryScore: user.masteryScore,
      isAdmin: user.isAdmin
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user', error: error.message });
  }
};

// TODO: Add password reset functionality
// TODO: Add email verification
// TODO: Add rate limiting for login attempts
// TODO: Add session management

module.exports = {
  User,
  authMiddleware,
  adminMiddleware,
  signup,
  login,
  getMe,
  sequelize
};
