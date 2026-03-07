const { TestHistory, UserQuestionHistory } = require('../models');
const { Question } = require('../models');
const { authMiddleware } = require('../auth');

// Get test details by ID
async function getTestById(req, res) {
  try {
    const testId = req.params.id;
    const userId = req.user.id;
    
    // Find the test
    const test = await TestHistory.findOne({
      where: {
        id: testId,
        userId
      }
    });
    
    if (!test) {
      return res.status(404).json({
        success: false,
        message: 'Test not found'
      });
    }
    
    // Get question history for this test
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
}

module.exports = getTestById;
