const express = require('express');
const { User } = require('./auth');
const { authMiddleware } = require('./auth');
const router = express.Router();

// Minimum number of answers needed to show mastery score
const MIN_ANSWERS = 25;

// GET /api/user/progress - Get user's progress information
router.get('/progress', authMiddleware, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.json({
      success: true,
      responseCount: user.responseCount || 0,
      masteryScore: user.masteryScore,
      requiredAnswers: MIN_ANSWERS
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
