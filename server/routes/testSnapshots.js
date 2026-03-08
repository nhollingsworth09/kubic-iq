const express = require('express');
const { TestHistory } = require('../models');
const { User, authMiddleware } = require('../auth');
const { Rating, rate_1vs1 } = require('ts-trueskill');
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

    // Apply TrueSkill updates for each answered question in the snapshot.
    // answer.js is not called in the snapshot-based quiz flow, so all
    // mu/sigma/responseCount updates must happen here at submission.
    let mu = clampValue(user.trueskill_mu || MU0, 0, 10);
    let sigma = clampValue(user.trueskill_sigma || SIGMA0, 0, 3.33);
    let responseCount = user.responseCount || 0;

    if (snapshot && snapshot.questions && snapshot.answers) {
      const questionMap = {};
      for (const q of snapshot.questions) {
        questionMap[q.id] = q;
      }

      const answeredItems = snapshot.answers.filter(
        a => a.isCorrect !== undefined && a.isCorrect !== null
      );

      for (const answer of answeredItems) {
        const question = questionMap[answer.questionId];
        if (!question) continue;

        const userRating = new Rating(mu, sigma, BETA, TAU);
        const questionRating = new Rating(
          clampValue(question.mu || MU0, 0, 10),
          clampValue(question.sigma || SIGMA0, 0, 3.33),
          BETA,
          TAU
        );

        let newUserRating;
        if (answer.isCorrect) {
          [newUserRating] = rate_1vs1(userRating, questionRating);
        } else {
          [, newUserRating] = rate_1vs1(questionRating, userRating);
        }

        mu = clampValue(newUserRating.mu, 0, 10);
        sigma = clampValue(newUserRating.sigma, 0, 3.33);
        responseCount++;
      }
    }

    const newMu = mu;
    const newSigma = sigma;
    const newResponseCount = responseCount;

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

    // Persist updated TrueSkill params, responseCount, and masteryScore.
    await user.update({
      trueskill_mu: newMu,
      trueskill_sigma: newSigma,
      responseCount: newResponseCount,
      ...(masteryScoreAfter !== null && { masteryScore: masteryScoreAfter })
    });

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
