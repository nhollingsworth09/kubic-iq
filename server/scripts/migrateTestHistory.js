// Migration script to transfer TestHistory data to the new snapshot format
const { sequelize, TestHistory, UserQuestionHistory, Question } = require('../models');

async function migrateTestHistory() {
  try {
    console.log('Starting test history migration');
    
    // Get all existing test history records
    const tests = await TestHistory.findAll();
    console.log(`Found ${tests.length} test history records to migrate`);
    
    // Process each test
    for (const test of tests) {
      try {
        console.log(`Processing test ID: ${test.id}`);
        
        // Get all user question history for this test
        const questionHistory = await UserQuestionHistory.findAll({
          where: { testId: test.id },
          include: [{ model: Question }]
        });
        
        if (questionHistory.length === 0) {
          console.log(`No question history found for test ID: ${test.id}, skipping`);
          continue;
        }
        
        // Create snapshot structure
        const questions = questionHistory.map(history => ({
          id: history.Question.id,
          text: history.Question.text,
          options: history.Question.options,
          correctAnswer: history.Question.correctAnswer,
          tags: history.Question.tags || [],
          questionType: history.Question.questionType,
          mu: history.Question.mu,
          sigma: history.Question.sigma
        }));
        
        const answers = questionHistory.map(history => ({
          questionId: history.questionId,
          selectedOption: history.selectedOption,
          textAnswer: '', // No way to recover this from old format
          isMarkedForReview: false, // No way to recover this from old format
          isCorrect: history.correct
        }));
        
        // Create a basic time tracking structure since we don't have detailed timing info
        const timeTracking = questions.map(q => ({
          questionId: q.id,
          timeSpent: test.duration / questions.length, // Evenly distribute time
          startTime: null,
          endTime: null,
          visits: 1
        }));
        
        // Estimate test times based on createdAt
        const testEndTime = new Date(test.createdAt).getTime();
        const testStartTime = testEndTime - (test.duration * 1000);
        
        // Create the complete snapshot
        const snapshot = {
          questions,
          answers,
          timeTracking,
          testStartTime,
          testEndTime,
          testDuration: test.duration
        };
        
        // Update the test with the snapshot
        await test.update({
          snapshot,
          schemaVersion: 1
        });
        
        console.log(`Successfully migrated test ID: ${test.id}`);
      } catch (error) {
        console.error(`Error migrating test ID: ${test.id}:`, error);
      }
    }
    
    console.log('Test history migration complete');
  } catch (error) {
    console.error('Error during test history migration:', error);
  } finally {
    await sequelize.close();
  }
}

migrateTestHistory();
