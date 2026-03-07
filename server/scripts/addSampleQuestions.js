const { sequelize, Question } = require('../models');

// Sample math questions with topics and subtopics
const sampleQuestions = [
  // Multiple choice questions
  {
    text: "Two nearby trees are perpendicular to the ground, which is flat. One of these trees is 10 feet tall and has a shadow that is 5 feet long. At the same time, the shadow of the other tree is 2 feet long. How tall, in feet, is the other tree?",
    options: ["3", "4", "8", "27"],
    correctAnswer: "1", // B (4 feet)
    questionType: "multiple-choice",
    tags: ["Geometry & Trigonometry", "Angles and triangles", "Similar triangles"],
    mu: 5.2,
    sigma: 1.5
  },
  {
    text: "If 2x + 3y = 12 and 3x - y = 11, what is the value of x?",
    options: ["3", "4", "5", "7"],
    correctAnswer: "2", // C (5)
    questionType: "multiple-choice",
    tags: ["Algebra", "Linear equations in two variables", "Systems of linear equations"],
    mu: 4.8,
    sigma: 1.3
  },
  {
    text: "The function f(x) = ax^2 + bx + c, where a, b, and c are constants and a ≠ 0, has zeros at x = -3 and x = 2. Which of the following is a possible equation for f(x)?",
    options: ["f(x) = x^2 - x - 6", "f(x) = x^2 + x - 6", "f(x) = x^2 + 2x - 8", "f(x) = x^2 - 5x + 6"],
    correctAnswer: "0", // A
    questionType: "multiple-choice",
    tags: ["Advanced Math", "Quadratic equations", "Polynomial expressions"],
    mu: 6.5,
    sigma: 1.8
  },
  {
    text: "If f(x) = 3x - 2 and g(x) = x^2 + 1, what is the value of f(g(2))?",
    options: ["13", "16", "19", "25"],
    correctAnswer: "1", // B (16)
    questionType: "multiple-choice",
    tags: ["Advanced Math", "Function notation and transformations"],
    mu: 6.2,
    sigma: 1.7
  },
  {
    text: "A data set has a mean of 20 and a standard deviation of 5. If each value in the data set is increased by 3, which of the following statements is true?",
    options: [
      "The mean becomes 23 and the standard deviation remains 5",
      "The mean becomes 23 and the standard deviation becomes 8",
      "The mean and standard deviation both increase by 3",
      "The mean and standard deviation both remain unchanged"
    ],
    correctAnswer: "0", // A
    questionType: "multiple-choice",
    tags: ["Problem Solving & Data Analysis", "Statistics"],
    mu: 5.5,
    sigma: 1.6
  },
  {
    text: "The line with equation y = mx + b passes through the points (2, 7) and (4, 13). What is the value of m?",
    options: ["2", "3", "4", "5"],
    correctAnswer: "1", // B (3)
    questionType: "multiple-choice",
    tags: ["Algebra", "Linear equations in two variables"],
    mu: 4.5,
    sigma: 1.4
  },
  {
    text: "In triangle ABC, the measure of angle A is 45°, the measure of angle B is 60°, and the length of side AB is 8 units. What is the length of side AC?",
    options: ["4√2", "8√2", "8", "4√3"],
    correctAnswer: "0", // A (4√2)
    questionType: "multiple-choice",
    tags: ["Geometry & Trigonometry", "Angles and triangles", "Trigonometric functions and identities"],
    mu: 7.1,
    sigma: 1.9
  },
  {
    text: "A circle has radius 6 cm. What is the length of an arc that subtends a central angle of 60 degrees?",
    options: ["2π", "6π/3", "2π√3", "6π"],
    correctAnswer: "1", // B (6π/3 = 2π)
    questionType: "multiple-choice",
    tags: ["Geometry & Trigonometry", "Circles"],
    mu: 5.8,
    sigma: 1.6
  },
  {
    text: "If log₃(x) = 4, what is the value of x?",
    options: ["12", "64", "81", "243"],
    correctAnswer: "2", // C (81)
    questionType: "multiple-choice",
    tags: ["Advanced Math", "Exponential functions"],
    mu: 6.7,
    sigma: 1.7
  },
  {
    text: "A bag contains 5 red marbles and 8 blue marbles. If two marbles are drawn at random without replacement, what is the probability that both are red?",
    options: ["5/13", "5/26", "10/39", "25/169"],
    correctAnswer: "2", // C (10/39)
    questionType: "multiple-choice",
    tags: ["Problem Solving & Data Analysis", "Probability"],
    mu: 5.9,
    sigma: 1.5
  },
  {
    text: "The expression (x² + 6x + 9) / (x + 3) is equivalent to which of the following for all values of x where the expression is defined?",
    options: ["x", "x + 3", "x - 3", "x² + 9"],
    correctAnswer: "1", // B (x + 3)
    questionType: "multiple-choice",
    tags: ["Advanced Math", "Rational expressions", "Polynomial expressions"],
    mu: 5.3,
    sigma: 1.4
  },
  {
    text: "If the point (3, k) lies on the graph of y = 2x - 5, what is the value of k?",
    options: ["1", "2", "3", "6"],
    correctAnswer: "0", // A (1)
    questionType: "multiple-choice",
    tags: ["Algebra", "Linear equations in two variables"],
    mu: 4.2,
    sigma: 1.2
  },
  
  // Student-produced response questions (no options, correctAnswer is a string)
  {
    text: "In the xy-plane, the y-intercept of the line with equation y = -6x - 32 is (0, b). What is the value of b?",
    options: [],
    correctAnswer: "-32",
    questionType: "student-produced",
    tags: ["Algebra", "Linear equations in two variables"],
    mu: 4.5,
    sigma: 1.3
  },
  {
    text: "The function f is defined as f(x) = 3x² + kx + 7, where k is a constant. If f(2) = 19, what is the value of k?",
    options: [],
    correctAnswer: "-2",
    questionType: "student-produced",
    tags: ["Advanced Math", "Polynomial expressions", "Quadratic equations"],
    mu: 5.7,
    sigma: 1.6
  },
  {
    text: "If 8^x = 2^(2x+3), what is the value of x?",
    options: [],
    correctAnswer: "3",
    questionType: "student-produced",
    tags: ["Advanced Math", "Exponential functions"],
    mu: 6.8,
    sigma: 1.9
  },
  {
    text: "A right triangle has legs of length 5 and 12. What is the length of the hypotenuse?",
    options: [],
    correctAnswer: "13",
    questionType: "student-produced",
    tags: ["Geometry & Trigonometry", "Angles and triangles"],
    mu: 4.9,
    sigma: 1.4
  },
  {
    text: "The average (arithmetic mean) of 6 consecutive integers is 10.5. What is the smallest of these integers?",
    options: [],
    correctAnswer: "8",
    questionType: "student-produced",
    tags: ["Problem Solving & Data Analysis", "Statistics"],
    mu: 5.1,
    sigma: 1.5
  },
  {
    text: "A circle has center (3, 4) and passes through the point (0, 0). What is the area of the circle?",
    options: [],
    correctAnswer: "25π",
    questionType: "student-produced",
    tags: ["Geometry & Trigonometry", "Circles", "Coordinate geometry"],
    mu: 6.3,
    sigma: 1.7
  },
  {
    text: "If sin(θ) = 0.8, what is the value of cos(θ)? Give your answer to the nearest hundredth.",
    options: [],
    correctAnswer: "0.6",
    questionType: "student-produced",
    tags: ["Geometry & Trigonometry", "Trigonometric functions and identities"],
    mu: 5.6,
    sigma: 1.6
  },
  {
    text: "If f(x) = x² - 4 and g(x) = 3x + 1, what is the value of f(g(2))?",
    options: [],
    correctAnswer: "45",
    questionType: "student-produced",
    tags: ["Advanced Math", "Function notation and transformations"],
    mu: 6.1,
    sigma: 1.7
  }
];

// Function to add sample questions to the database
async function addSampleQuestions() {
  try {
    await sequelize.sync();
    
    // Check if questions already exist
    const count = await Question.count();
    if (count > 0) {
      console.log(`Database already has ${count} questions. Skipping sample data creation.`);
      return;
    }
    
    // Insert questions
    for (const question of sampleQuestions) {
      await Question.create(question);
    }
    
    console.log(`Successfully added ${sampleQuestions.length} sample questions to the database.`);
  } catch (error) {
    console.error('Error adding sample questions:', error);
  } finally {
    await sequelize.close();
  }
}

// Run the function
addSampleQuestions();
