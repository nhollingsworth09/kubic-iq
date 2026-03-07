const express = require('express');
const { User } = require('./auth');
const { TestHistory } = require('./models');
const { authMiddleware } = require('./auth');
const router = express.Router();

// Minimum number of answers needed to show mastery score
const MIN_ANSWERS = 25;

// GET /api/user/progress - Get user's progress information
router.get('/progress', authMiddleware, async (req, res) => {  try {
    const user = await User.findByPk(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Get recent test history if mastery score is unlocked
    let recentTests = [];
    if (user.responseCount >= MIN_ANSWERS) {
      recentTests = await TestHistory.findAll({
        where: { userId: user.id },
        order: [['createdAt', 'DESC']],
        limit: 5 // Get 5 most recent tests
      });
    }
      
    res.json({
      success: true,
      responseCount: user.responseCount || 0,
      masteryScore: user.responseCount >= MIN_ANSWERS ? user.masteryScore : null,
      requiredAnswers: MIN_ANSWERS,
      recentTests: recentTests
    });
  } catch (error) {
    console.error('Error fetching user progress:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user progress',
      error: error.message
    });
  }
});

module.exports = router;
