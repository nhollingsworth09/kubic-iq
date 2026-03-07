const express = require('express');
const { Sequelize } = require('sequelize');
const { TestHistory, UserQuestionHistory, Question } = require('./models');
const { authMiddleware } = require('./auth');
const router = express.Router();
const Op = Sequelize.Op;

// POST /api/tests - Save test results
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { 
      testType, 
      questionCount, 
      correctCount, 
      duration, 
      topics, 
      masteryScoreChange, 
      masteryScoreBefore, 
      masteryScoreAfter 
    } = req.body;
    
    const userId = req.user.id;
    
    // Calculate percentage
    const percentage = (correctCount / questionCount) * 100;
    
    // Create test history record
    const testHistory = await TestHistory.create({
      userId,
      testType,
      questionCount,
      correctCount,
      percentage,
      duration,
      topics,
      masteryScoreChange,
      masteryScoreBefore,
      masteryScoreAfter
    });
    
    res.json({
      success: true,
      test: testHistory
    });
  } catch (error) {
    console.error('Error saving test history:', error);
    res.status(500).json({
      success: false,
      message: 'Error saving test history',
      error: error.message
    });
  }
});

// GET /api/tests - Get user's test history
router.get('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get user's test history (most recent first)
    const testHistory = await TestHistory.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
      limit: 10  // Only get the 10 most recent tests
    });
    
    res.json({
      success: true,
      tests: testHistory
    });
  } catch (error) {
    console.error('Error fetching test history:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching test history',
      error: error.message
    });
  }
});

// GET /api/tests/:id - Get test details by ID with questions and answers 
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const testId = req.params.id;
    const userId = req.user.id;
    
    console.log(`Fetching test data for ID: ${testId} and user: ${userId}`);
    
    // Find the test with detailed attributes
    const test = await TestHistory.findOne({
      where: {
        id: testId,
        userId
      },
      // Make sure we get all the fields we need for the test report
      attributes: [
        'id', 
        'testType', 
        'questionCount', 
        'correctCount', 
        'percentage', 
        'duration', 
        'createdAt',
        'masteryScoreBefore',
        'masteryScoreAfter',
        'masteryScoreChange',
        'topics'
      ]
    });
    
    if (!test) {
      console.log(`Test not found for ID: ${testId}`);
      return res.status(404).json({
        success: false,
        message: 'Test not found'
      });
    }
    
    // Log successful test lookup
    console.log(`Found test: ${test.id}, mastery change: ${test.masteryScoreChange}`);
    
    // Get question history for this test with all needed details
    const questionHistory = await UserQuestionHistory.findAll({
      where: {
        userId,
        testId
      },
      include: [
        {
          model: Question,
          attributes: ['id', 'text', 'options', 'correctAnswer', 'mu', 'sigma', 'tags', 'questionType']
        }
      ],
      // Make sure all fields needed for analysis are included
      attributes: [
        'id', 
        'questionId', 
        'userId', 
        'testId', 
        'selectedOption', 
        'textAnswer', 
        'correct',
        'createdAt'
      ]
    });
    
    res.json({
      success: true,
      test,
      questionHistory
    });
  } catch (error) {
    console.error('Error getting test details:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting test details',
      error: error.message
    });
  }
});

// PUT /api/tests/:id/answers - Update answers with testId after test submission
const updateTestAnswers = require('./routes/updateTestAnswers');
router.put('/:id/answers', authMiddleware, updateTestAnswers);

module.exports = router;
