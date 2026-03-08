const express = require('express');
const { TestHistory } = require('../models');
const { User, authMiddleware } = require('../auth');
const router = express.Router();

// TrueSkill configuration — must match answer.js
const MU0 = 7.0;        // Optimistic prior — SAT prep students skew above mid-scale
const SIGMA0 = 1.67;
const BETA = 1;
const TAU = 0.033;
const K = 2;            // masteryScore = μ - K*σ (95% CI)
const MIN_ANSWERS = 25;
const clampValue = (value, min, max) => Math.min(Math.max(value, min), max);

/**
 * POST /api/test-snapshots
 * Create a complete test snapshot with all questions, answers and time tracking.
 * Mastery score is computed server-side using TrueSkill — client-supplied values ignored.
 */
router.post('/', authMiddleware, async (req, res) => {
  try {
    const {
      testType,
      questionCount,
      correctCount,
      duration,
      topics,
      snapshot
    } = req.body;

    const userId = req.user.id;

    // Fetch current user state before any updates
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Snapshot the user's mastery score before this test
    const masteryScoreBefore = user.responseCount >= MIN_ANSWERS ? user.masteryScore : null;

    // μ/σ/responseCount are already current — answer.js updated them per-question during the test.
    // Re-applying TrueSkill here would double-count every answer.
    const newMu = user.trueskill_mu;
    const newSigma = user.trueskill_sigma;
    const newResponseCount = user.responseCount;

    // Compute new mastery score (only surfaced once MIN_ANSWERS threshold is met)
    const rawMastery = clampValue(newMu - K * newSigma, 0, 10);
    const masteryScoreAfter = newResponseCount >= MIN_ANSWERS ? rawMastery : null;
    const masteryScoreChange = masteryScoreBefore !== null && masteryScoreAfter !== null
      ? masteryScoreAfter - masteryScoreBefore
      : null;

    // Calculate percentage
    const percentage = (correctCount / questionCount) * 100;

    // Persist the test history record with server-computed mastery values
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
      schemaVersion: 1
    });

    // Only masteryScore needs persisting — trueskill_mu, trueskill_sigma, and responseCount
    // are already up-to-date from per-answer updates in answer.js.
    if (masteryScoreAfter !== null) {
      await user.update({ masteryScore: masteryScoreAfter });
    }

    console.log(`Created test snapshot with ID: ${testHistory.id}, masteryScoreAfter: ${masteryScoreAfter}`);

    res.json({
      success: true,
      testId: testHistory.id,
      masteryScoreBefore,
      masteryScoreAfter,
      masteryScoreChange
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
