const { Sequelize } = require('sequelize');
const { UserQuestionHistory, TestHistory } = require('../models');
const Op = Sequelize.Op;

/**
 * Updates UserQuestionHistory records with testId after a test is submitted
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateTestAnswers = async (req, res) => {
  try {
    const testId = req.params.id;
    const userId = req.user.id;
    const { answers } = req.body;
    
    if (!Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid answers array is required'
      });
    }
    
    // Verify the test exists and belongs to the user
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
    
    // Update all answers for this test with the testId
    const questionIds = answers.map(a => a.questionId);
    
    // Find all UserQuestionHistory records for these questions that don't have a testId
    // and were created around the same time as the test
    const historyRecords = await UserQuestionHistory.findAll({
      where: {
        userId,
        questionId: { [Op.in]: questionIds },
        testId: null,
        timestamp: {
          [Op.gte]: new Date(test.createdAt.getTime() - 3600000), // 1 hour before test creation
          [Op.lte]: new Date(test.createdAt.getTime() + 60000) // 1 minute after test creation
        }
      }
    });
    
    // Update each record with the testId
    await Promise.all(historyRecords.map(record => 
      record.update({ testId })
    ));
    
    res.json({
      success: true,
      updatedCount: historyRecords.length
    });
  } catch (error) {
    console.error('Error updating test answers:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating test answers',
      error: error.message
    });
  }
};

module.exports = updateTestAnswers;
