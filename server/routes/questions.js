const express = require('express');
const { Question } = require('../models');
const { authMiddleware: authenticateJWT } = require('../auth');
const { Op } = require('sequelize');
const router = express.Router();

// GET /api/questions/random - Fetch random questions with optional topic filter
router.get('/random', authenticateJWT, async (req, res) => {
  try {
    const count = parseInt(req.query.count) || 10;
    const topics = req.query.topics ? req.query.topics.split(',') : [];
    
    console.log(`GET /random: Fetching ${count} random questions, topics: ${topics.join(', ') || 'any'}`);
    
    // Get all questions for filtering (simpler approach for SQLite)
    const allQuestions = await Question.findAll();
    
    if (allQuestions.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No questions available in the database'
      });
    }
    
    console.log(`Found ${allQuestions.length} questions in the database`);
    
    // Filter by topics if specified
    let filteredQuestions = allQuestions;
    if (topics.length > 0) {
      filteredQuestions = allQuestions.filter(question => {
        const questionTags = question.tags || [];
        return topics.some(topic => questionTags.includes(topic));
      });
      console.log(`After filtering by topics, found ${filteredQuestions.length} matching questions`);
    }
    
    // Shuffle the questions (Fisher-Yates algorithm)
    for (let i = filteredQuestions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [filteredQuestions[i], filteredQuestions[j]] = [filteredQuestions[j], filteredQuestions[i]];
    }
    
    // Take the requested number of questions
    const selectedQuestions = filteredQuestions.slice(0, count);
    
    if (selectedQuestions.length < count) {
      console.warn(`Requested ${count} questions but only found ${selectedQuestions.length}`);
    }
    
    // Make sure each question has questionType
    const formattedQuestions = selectedQuestions.map(question => {
      const questionData = question.toJSON();
      return {
        ...questionData,
        questionType: questionData.questionType || 'multiple-choice'
      };
    });
    
    res.json({
      success: true,
      questions: formattedQuestions,
      testType: 'quiz', // Default to quiz type for random questions
      topicsIncluded: topics
    });
  } catch (error) {
    console.error('Error fetching random questions:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching random questions',
      error: error.message
    });
  }
});

// POST /api/questions/fetch - Fetch questions for a test based on criteria
router.post('/fetch', async (req, res) => {
  // Log the request for debugging
  console.log('Questions API request received:', req.body);
  console.log('Authorization header:', req.headers.authorization ? 'Present' : 'Missing');
  
  try {
    // Check for auth token but don't enforce it for now (for testing purposes)
    if (!req.headers.authorization) {
      console.warn('Warning: No authorization token provided. Continuing anyway for testing purposes.');
    }
    
    const { testType, topics, count } = req.body;
    
    if (!testType || !Array.isArray(topics) || !count) {
      console.error('Invalid request parameters:', req.body);
      return res.status(400).json({
        success: false,
        message: 'Missing required parameters: testType, topics, count'
      });
    }

    // Build query based on test type and topics
    let whereClause = {};
      // For exam or if topics array is empty, include all topics
    if (testType === 'exam' || topics.length === 0) {
      // No topic filter for exams, we'll return a mix of all
      whereClause = {};
    } else {      try {
        // For quiz and custom exam, filter by selected topics
        // Note: Op.overlap is Postgres specific - for SQLite we need a different approach
        // This is a simplified version that will work with JSON stored tags
        console.log('Fetching all questions for manual tag filtering');
        const questions = await Question.findAll();
        console.log(`Found ${questions.length} questions in the database`);
        
        const filteredQuestions = questions.filter(question => {
          const questionTags = question.tags || [];
          return topics.some(topic => questionTags.includes(topic));
        }).slice(0, count);
        
        console.log(`After filtering by topics ${topics}, found ${filteredQuestions.length} questions`);
        
        // We'll continue with the rest of the handler now instead of returning early
        // which can cause issues with middleware/error handling
        whereClause = {}; // Set to empty so we don't filter again below
        
        // Create a closure to avoid duplicate code
        const sendFilteredQuestions = () => {
          res.json({
            success: true,
            questions: filteredQuestions,
            testType,
            topicsIncluded: topics
          });
        };
        
        // Store this function for later use
        res.locals.sendFilteredResults = sendFilteredQuestions;
        
      } catch (error) {
        console.error('Error with tag filtering:', error);
        // Fallback to no filtering if there's an error
        whereClause = {};
      }
    }

    // Get questions with appropriate distribution
    // For simplicity, we're just fetching the requested count for now
    // In a real implementation, you would want to get a balanced mix of question types
    // and difficulty levels based on TrueSkill ratings
    
    // Get a mix of multiple choice and student-produced questions
    const multipleChoiceCount = Math.ceil(count * 0.7); // 70% multiple choice
    const studentProducedCount = count - multipleChoiceCount; // 30% student-produced

    // Add a random ordering to ensure we get different questions each time
    const questions = await Question.findAll({
      where: whereClause,
      order: [
        ['id', 'ASC'] // Replace with a random ordering in production
      ],
      limit: count
    });    // If we already have filtered results, send those instead
    if (res.locals.sendFilteredResults) {
      console.log('Using pre-filtered questions');
      return res.locals.sendFilteredResults();
    }
    
    console.log(`Found ${questions.length} questions with database query`);
    
    // If we don't have enough questions, return an error
    if (questions.length < count) {
      return res.status(404).json({
        success: false,
        message: `Not enough questions available. Requested ${count}, but only found ${questions.length}.`
      });
    }

    // Transform questions to add questionType field
    // In a real implementation, this would come from the database
    const transformedQuestions = questions.map((question, index) => {
      const questionData = question.toJSON();
      return {
        ...questionData,
        questionType: index < multipleChoiceCount ? 'multiple-choice' : 'student-produced'
      };
    });

    console.log(`Successfully prepared ${transformedQuestions.length} questions for test`);
    
    res.json({
      success: true,
      questions: transformedQuestions,
      testType,
      topicsIncluded: topics
    });
  } catch (error) {
    console.error('Error fetching questions:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching questions',
      error: error.message
    });
  }
});

module.exports = router;
