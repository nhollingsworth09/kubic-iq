require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { sequelize, signup, login, getMe, authMiddleware } = require('./auth');
const questionsRouter = require('./questions');
const questionsFetchRouter = require('./routes/questions');
const answerRouter = require('./answer');
const userProgressRouter = require('./userProgress');
const testsRouter = require('./tests');
const testSnapshotsRouter = require('./routes/testSnapshots');

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
app.use('/api/questions', questionsFetchRouter);

// Answer routes
app.use('/api/answer', answerRouter);

// User progress routes
app.use('/api/user', userProgressRouter);

// Tests history routes
app.use('/api/tests', testsRouter);

// Test snapshots routes (new snapshot-based approach)
app.use('/api/test-snapshots', testSnapshotsRouter);

// Create database tables and start server
const PORT = process.env.PORT || 3001;

async function startServer() {
  try {    // Create db directory if it doesn't exist
    const fs = require('fs');
    if (!fs.existsSync('./db')) {
      fs.mkdirSync('./db');
    }
    
    // Sync database WITHOUT force option to preserve data
    await sequelize.sync();
    console.log('Database synced successfully');
    
    // Check if database is empty and needs initialization
    const { Question } = require('./models');
    const questionCount = await Question.count();
    
    if (questionCount === 0) {
      console.log('No questions found in database. Running initialization...');
      const initializeDatabase = require('./scripts/initializeDatabase');
      await initializeDatabase();
    } else {
      console.log(`Found ${questionCount} existing questions in database.`);
      // Ensure default dev accounts exist (idempotent)
      const createTestUser = require('./scripts/createTestUser');
      const createAdminUser = require('./scripts/createAdmin');
      await createTestUser();
      await createAdminUser();
    }

    // Print dev account credentials for easy reference
    console.log('');
    console.log('--- Dev Accounts ---');
    console.log('Admin  | Email: admin@kubic.com    | Password: admin');
    console.log('User   | Email: test@example.com  | Password: password123');
    console.log('--------------------');
    console.log('');

    // Start server
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Unable to start server:', error);
  }
}

startServer();
