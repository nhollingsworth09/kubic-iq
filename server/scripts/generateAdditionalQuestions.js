/**
 * Script to generate additional questions to reach 44 questions total
 * for testing the exam functionality
 */

const fs = require('fs');
const path = require('path');

// Get existing questions
const sampleQuestions = require('./sampleQuestions');

// We need 44 questions, so generate additional if needed
const additionalQuestionsNeeded = 44 - sampleQuestions.length;

if (additionalQuestionsNeeded <= 0) {
  console.log(`Already have ${sampleQuestions.length} questions, no additional questions needed.`);
  process.exit(0);
}

console.log(`Generating ${additionalQuestionsNeeded} additional questions...`);

// Generate additional questions
const additionalQuestions = [];

// Topics for variety
const topics = [
  'Algebra',
  'Advanced Math',
  'Problem Solving and Data Analysis',
  'Geometry & Trigonometry',
  'Statistics & Probability'
];

// Create multiple choice questions
for (let i = 0; i < Math.ceil(additionalQuestionsNeeded * 0.7); i++) {
  const topicIndex = i % topics.length;
  additionalQuestions.push({
    text: `Generated multiple choice question #${i+1}: If x^2 + ${i+3}x + ${i*2+1} = 0, what is the value of x?`,
    options: [`${-i-1}`, `${-i-2}`, `${i}`, `${i+1}`],
    correctAnswer: `${i % 4}`, // Rotate through options
    questionType: "multiple-choice",
    tags: [topics[topicIndex], `Subtopic ${i % 3 + 1}`],
    mu: 5.0 + (i % 5) * 0.1, // Vary difficulty slightly
    sigma: 1.5
  });
}

// Create student-produced response questions
const remainingQuestions = additionalQuestionsNeeded - additionalQuestions.length;
for (let i = 0; i < remainingQuestions; i++) {
  const topicIndex = i % topics.length;
  additionalQuestions.push({
    text: `Generated student-produced response question #${i+1}: What is the value of ${i+1}^2 + ${i+2}?`,
    options: [], // Empty for student-produced
    correctAnswer: `${(i+1)*(i+1) + (i+2)}`,
    questionType: "student-produced",
    tags: [topics[topicIndex], `Subtopic ${i % 3 + 1}`],
    mu: 5.0 + (i % 5) * 0.1, // Vary difficulty slightly
    sigma: 1.5
  });
}

// Combine original and new questions
const allQuestions = [...sampleQuestions, ...additionalQuestions];

// Write back to file
const updatedContent = `/**
 * Sample questions for the SAT test-taking system
 * Includes both multiple-choice and student-produced responses
 * Each question has tags for topics/subtopics and TrueSkill values (mu, sigma)
 * Total questions: ${allQuestions.length}
 */

const sampleQuestions = ${JSON.stringify(allQuestions, null, 2)};

module.exports = sampleQuestions;
`;

fs.writeFileSync(
  path.join(__dirname, 'sampleQuestions.js'),
  updatedContent
);

console.log(`Successfully updated sampleQuestions.js with ${allQuestions.length} total questions.`);
