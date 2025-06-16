require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { sequelize, signup, login, getMe, authMiddleware } = require('./auth');
const questionsRouter = require('./questions');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Auth routes
app.post('/api/auth/signup', signup);
app.post('/api/auth/login', login);
app.get('/api/auth/me', authMiddleware, getMe);

// Questions routes
app.use('/api/admin/questions', questionsRouter);

// Create database tables and start server
const PORT = process.env.PORT || 3001;

async function startServer() {
  try {
    // Create db directory if it doesn't exist
    const fs = require('fs');
    if (!fs.existsSync('./db')) {
      fs.mkdirSync('./db');
    }

    // Sync database
    await sequelize.sync();
    console.log('Database synced successfully');

    // Start server
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Unable to start server:', error);
  }
}

startServer();
