const express = require('express');
const { Sequelize } = require('sequelize');
const { Question, UserQuestionHistory, sequelize } = require('./models');
const { User, authMiddleware } = require('./auth');
const { Rating, rate_1vs1 } = require('ts-trueskill');
const router = express.Router();
const Op = Sequelize.Op;

// TrueSkill configuration
const MU0 = 5;
const SIGMA0 = 1.67;
const BETA = 1;       // performance variance
const TAU = 0.033;    // dynamics
const K = 3;         // conservativeness factor for mastery score

// Helper function to clamp values
const clampValue = (value, min, max) => Math.min(Math.max(value, min), max);

// POST /api/answer - Process user's answer and return next question
router.post('/', authMiddleware, async (req, res) => {
  const { questionId, selectedOption } = req.body;

  // Validate request body
  if (!questionId || selectedOption === undefined) {
    return res.status(400).json({
      success: false,
      message: 'questionId and selectedOption are required'
    });
  }

  // Start transaction
  const t = await sequelize.transaction();

  try {
    // Fetch question and user
    const [question, user] = await Promise.all([
      Question.findByPk(questionId),
      User.findByPk(req.user.id)
    ]);

    if (!question) {
      await t.rollback();
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    // Check answer correctness
    const correct = selectedOption === question.correctAnswer;

    // Initialize TrueSkill ratings with clamped values
    const userRating = new Rating(
      clampValue(user.trueskill_mu || MU0, 0, 10),
      clampValue(user.trueskill_sigma || SIGMA0, 0, 3.33),
      BETA,
      TAU
    );

    const questionRating = new Rating(
      clampValue(question.mu || MU0, 0, 10),
      clampValue(question.sigma || SIGMA0, 0, 3.33),
      BETA,
      TAU
    );

    // Update ratings based on correctness
    let newUserRating, newQuestionRating;
    if (correct) {
      [newUserRating, newQuestionRating] = rate_1vs1(userRating, questionRating);
    } else {
      [newQuestionRating, newUserRating] = rate_1vs1(questionRating, userRating);
    }

    // Clamp the new ratings to our 0-10 scale
    const newMu = clampValue(newUserRating.mu, 0, 10);
    const newSigma = clampValue(newUserRating.sigma, 0, 3.33);
    const masteryScore = clampValue(newMu - K * newSigma, 0, 10);

    // Update user's ratings and mastery score
    await user.update({
      trueskill_mu: newMu,
      trueskill_sigma: newSigma,
      masteryScore
    }, { transaction: t });

    // Update question's ratings with clamped values
    await question.update({
      mu: clampValue(newQuestionRating.mu, 0, 10),
      sigma: clampValue(newQuestionRating.sigma, 0, 3.33)
    }, { transaction: t });

    // Record the answer in UserQuestionHistory
    await UserQuestionHistory.create({
      userId: user.id,
      questionId: question.id,
      correct,
      selectedOption,
      userRatingBefore: userRating.mu,
      userRatingAfter: newMu,
      questionRatingBefore: questionRating.mu,
      questionRatingAfter: clampValue(newQuestionRating.mu, 0, 10)
    }, { transaction: t });

    // Find next adaptive question within the valid difficulty range
    const nextQuestion = await Question.findOne({
      where: {
        id: {
          [Op.and]: [
            { [Op.ne]: questionId }, // Exclude current question
            {
              [Op.notIn]: sequelize.literal(
                `(SELECT questionId FROM UserQuestionHistories WHERE userId = '${user.id}')`
              )
            }
          ]
        },
        mu: {
          [Op.between]: [
            clampValue(newMu - 1, 0, 10), // Ensure difficulty range stays within 0-10
            clampValue(newMu + 1, 0, 10)
          ]
        }
      },
      order: [
        [sequelize.literal(`ABS(mu - ${newMu})`), 'ASC']
      ],
      attributes: ['id', 'text', 'options', 'tags', 'mu', 'sigma']
    });

    // Commit transaction
    await t.commit();

    // Send response
    res.json({
      success: true,
      correct,
      masteryScore,
      nextQuestion: nextQuestion ? {
        id: nextQuestion.id,
        text: nextQuestion.text,
        options: nextQuestion.options,
        tags: nextQuestion.tags
      } : null
    });

  } catch (error) {
    await t.rollback();
    console.error('Error processing answer:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing answer',
      error: error.message
    });
  }
});

module.exports = router;
