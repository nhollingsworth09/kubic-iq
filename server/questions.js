const express = require('express');
const { Question } = require('./models');
const { authMiddleware: authenticateJWT, adminMiddleware: authorizeAdmin } = require('./auth');
const { body, param, validationResult } = require('express-validator');
const router = express.Router();

// Validation middleware
const validateQuestion = [
  body('text').notEmpty().withMessage('Question text is required'),
  body('options').isArray({ min: 2 }).withMessage('At least 2 options are required'),
  body('correctAnswer').isInt({ min: 0 }).withMessage('Valid correct answer index is required'),
  body('tags').isArray().withMessage('Tags must be an array'),
  body('mu').optional().isFloat({ min: 0 }).withMessage('mu must be a positive number'),
  body('sigma').optional().isFloat({ min: 0 }).withMessage('sigma must be a positive number')
];

// Helper function to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false, 
      errors: errors.array() 
    });
  }
  next();
};

// GET /api/admin/questions - List all questions
router.get('/', 
  authenticateJWT,
  authorizeAdmin,
  async (req, res) => {
    try {
      const questions = await Question.findAll({
        order: [['createdAt', 'DESC']]
      });
      
      res.json({
        success: true,
        questions
      });
    } catch (error) {
      console.error('Error fetching questions:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching questions',
        error: error.message
      });
    }
  }
);

// POST /api/admin/questions - Create new question
router.post('/',
  authenticateJWT,
  authorizeAdmin,
  validateQuestion,
  handleValidationErrors,
  async (req, res) => {
    const t = await Question.sequelize.transaction();

    try {
      const { text, options, correctAnswer, tags, mu, sigma } = req.body;

      // TODO: Add additional validation for correctAnswer being within options array bounds
      if (correctAnswer >= options.length) {
        await t.rollback();
        return res.status(400).json({
          success: false,
          message: 'Correct answer index must be within options array bounds'
        });
      }

      const question = await Question.create({
        text,
        options,
        correctAnswer,
        tags,
        ...(mu !== undefined && { mu }),
        ...(sigma !== undefined && { sigma })
      }, { transaction: t });

      await t.commit();

      res.status(201).json({
        success: true,
        question
      });
    } catch (error) {
      await t.rollback();
      console.error('Error creating question:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating question',
        error: error.message
      });
    }
  }
);

// PUT /api/admin/questions/:id - Update question
router.put('/:id',
  authenticateJWT,
  authorizeAdmin,
  param('id').isUUID().withMessage('Invalid question ID'),
  validateQuestion,
  handleValidationErrors,
  async (req, res) => {
    const t = await Question.sequelize.transaction();

    try {
      const { id } = req.params;
      const { text, options, correctAnswer, tags, mu, sigma } = req.body;

      const question = await Question.findByPk(id);
      if (!question) {
        await t.rollback();
        return res.status(404).json({
          success: false,
          message: 'Question not found'
        });
      }

      // TODO: Add additional validation for correctAnswer being within options array bounds
      if (correctAnswer >= options.length) {
        await t.rollback();
        return res.status(400).json({
          success: false,
          message: 'Correct answer index must be within options array bounds'
        });
      }

      await question.update({
        text,
        options,
        correctAnswer,
        tags,
        ...(mu !== undefined && { mu }),
        ...(sigma !== undefined && { sigma })
      }, { transaction: t });

      await t.commit();

      res.json({
        success: true,
        question
      });
    } catch (error) {
      await t.rollback();
      console.error('Error updating question:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating question',
        error: error.message
      });
    }
  }
);

// DELETE /api/admin/questions/:id - Delete question
router.delete('/:id',
  authenticateJWT,
  authorizeAdmin,
  param('id').isUUID().withMessage('Invalid question ID'),
  handleValidationErrors,
  async (req, res) => {
    const t = await Question.sequelize.transaction();

    try {
      const { id } = req.params;
      
      const question = await Question.findByPk(id);
      if (!question) {
        await t.rollback();
        return res.status(404).json({
          success: false,
          message: 'Question not found'
        });
      }

      await question.destroy({ transaction: t });
      await t.commit();

      res.json({
        success: true,
        message: 'Question deleted successfully'
      });
    } catch (error) {
      await t.rollback();
      console.error('Error deleting question:', error);
      res.status(500).json({
        success: false,
        message: 'Error deleting question',
        error: error.message
      });
    }
  }
);

module.exports = router;
