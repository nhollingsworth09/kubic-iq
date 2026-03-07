const express = require('express');
const { TestHistory, User } = require('../models');
const { authMiddleware } = require('../auth');
const router = express.Router();

/**
 * POST /api/test-snapshots
 * Create a complete test snapshot with all questions, answers and time tracking
 */
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
      masteryScoreAfter,
      snapshot
    } = req.body;
    
    const userId = req.user.id;
    
    // Calculate percentage
    const percentage = (correctCount / questionCount) * 100;
    
    // Create test history with complete snapshot
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
      masteryScoreAfter,
      snapshot,
      schemaVersion: 1 // Initial schema version
    });
    
    // Update user's mastery score if provided
    if (masteryScoreBefore !== null && masteryScoreAfter !== null) {
      await User.update(
        { masteryScore: masteryScoreAfter },
        { where: { id: userId } }
      );
    }
    
    console.log(`Created test snapshot with ID: ${testHistory.id}`);
    
    res.json({
      success: true,
      testId: testHistory.id
    });
  } catch (error) {
    console.error('Error saving test snapshot:', error);
    res.status(500).json({
      success: false,
      message: 'Error saving test snapshot',
      error: error.message
    });
  }
});

/**
 * GET /api/test-snapshots/:id
 * Retrieve a complete test snapshot by ID
 */
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const testId = req.params.id;
    const userId = req.user.id;
    
    console.log(`Fetching test snapshot for ID: ${testId} and user: ${userId}`);
    
    const testSnapshot = await TestHistory.findOne({
      where: {
        id: testId,
        userId
      },
      attributes: [
        'id',
        'testType',
        'questionCount',
        'correctCount',
        'percentage',
        'duration',
        'topics',
        'masteryScoreBefore',
        'masteryScoreAfter',
        'masteryScoreChange',
        'snapshot',
        'schemaVersion',
        'createdAt'
      ]
    });
    
    if (!testSnapshot) {
      console.log(`Test snapshot not found for ID: ${testId}`);
      return res.status(404).json({
        success: false,
        message: 'Test snapshot not found'
      });
    }
    
    console.log(`Retrieved test snapshot: ${testSnapshot.id}`);
    
    res.json({
      success: true,
      test: testSnapshot
    });
  } catch (error) {
    console.error('Error retrieving test snapshot:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving test snapshot',
      error: error.message
    });
  }
});

/**
 * GET /api/test-snapshots/user/history
 * Get user's test history with pagination
 */
router.get('/user/history', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 0;
    const limit = parseInt(req.query.limit) || 10;
    const offset = page * limit;
    
    const testHistory = await TestHistory.findAndCountAll({
      where: { userId },
      attributes: [
        'id',
        'testType',
        'questionCount',
        'correctCount',
        'percentage',
        'duration',
        'topics',
        'masteryScoreChange',
        'createdAt'
      ],
      order: [['createdAt', 'DESC']],
      limit,
      offset
    });
    
    res.json({
      success: true,
      tests: testHistory.rows,
      total: testHistory.count,
      page,
      totalPages: Math.ceil(testHistory.count / limit)
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

module.exports = router;
