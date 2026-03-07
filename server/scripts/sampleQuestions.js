/**
 * Sample questions for the SAT test-taking system
 * Includes both multiple-choice and student-produced responses
 * Each question has tags for topics/subtopics and TrueSkill values (mu, sigma)
 * Total questions: 44
 */

const sampleQuestions = [
  {
    "text": "Two nearby trees are perpendicular to the ground, which is flat. One of these trees is 10 feet tall and has a shadow that is 5 feet long. At the same time, the shadow of the other tree is 2 feet long. How tall, in feet, is the other tree?",
    "options": [
      "3",
      "4",
      "8",
      "27"
    ],
    "correctAnswer": "1",
    "questionType": "multiple-choice",
    "tags": [
      "Geometry & Trigonometry",
      "Angles and triangles",
      "Similar triangles"
    ],
    "mu": 5.2,
    "sigma": 1.5
  },
  {
    "text": "If 2x + 3y = 12 and 3x - y = 11, what is the value of x?",
    "options": [
      "3",
      "4",
      "5",
      "7"
    ],
    "correctAnswer": "2",
    "questionType": "multiple-choice",
    "tags": [
      "Algebra",
      "Linear equations in two variables",
      "Systems of linear equations"
    ],
    "mu": 4.8,
    "sigma": 1.3
  },
  {
    "text": "The function f(x) = ax^2 + bx + c, where a, b, and c are constants and a ≠ 0, has zeros at x = -3 and x = 2. Which of the following is a possible equation for f(x)?",
    "options": [
      "f(x) = x^2 - x - 6",
      "f(x) = x^2 + x - 6",
      "f(x) = x^2 + 2x - 8",
      "f(x) = x^2 - 5x + 6"
    ],
    "correctAnswer": "0",
    "questionType": "multiple-choice",
    "tags": [
      "Advanced Math",
      "Quadratic equations",
      "Polynomial expressions"
    ],
    "mu": 6.5,
    "sigma": 1.8
  },
  {
    "text": "If f(x) = 3x - 2 and g(x) = x^2 + 1, what is the value of f(g(2))?",
    "options": [
      "13",
      "16",
      "19",
      "25"
    ],
    "correctAnswer": "1",
    "questionType": "multiple-choice",
    "tags": [
      "Advanced Math",
      "Function notation and transformations"
    ],
    "mu": 6.2,
    "sigma": 1.7
  },
  {
    "text": "A data set has a mean of 20 and a standard deviation of 5. If each value in the data set is increased by 3, which of the following statements is true?",
    "options": [
      "The mean becomes 23 and the standard deviation remains 5",
      "The mean becomes 23 and the standard deviation becomes 8",
      "The mean and standard deviation both increase by 3",
      "The mean and standard deviation both remain unchanged"
    ],
    "correctAnswer": "0",
    "questionType": "multiple-choice",
    "tags": [
      "Problem Solving & Data Analysis",
      "Statistics"
    ],
    "mu": 5.5,
    "sigma": 1.4
  },
  {
    "text": "If the point (3, k) lies on the line with equation 2x + y = 9, what is the value of k?",
    "options": [
      "0",
      "2",
      "3",
      "6"
    ],
    "correctAnswer": "1",
    "questionType": "multiple-choice",
    "tags": [
      "Algebra",
      "Linear equations in two variables"
    ],
    "mu": 4.5,
    "sigma": 1.2
  },
  {
    "text": "The population of a town was 12,500 in 2010 and is growing at a rate of 3% per year. Which of the following expressions gives the approximate population of the town in 2020?",
    "options": [
      "12,500 + 3,750",
      "12,500 × 1.3",
      "12,500 × 1.03^10",
      "12,500 × 0.97^10"
    ],
    "correctAnswer": "2",
    "questionType": "multiple-choice",
    "tags": [
      "Problem Solving & Data Analysis",
      "Percentages",
      "Exponential functions"
    ],
    "mu": 5.8,
    "sigma": 1.6
  },
  {
    "text": "In the xy-plane, line l passes through the origin and has slope -2. Which of the following points lies on line l?",
    "options": [
      "(4, -8)",
      "(4, 8)",
      "(-8, 4)",
      "(8, -4)"
    ],
    "correctAnswer": "0",
    "questionType": "multiple-choice",
    "tags": [
      "Algebra",
      "Linear equations in two variables",
      "Coordinate geometry"
    ],
    "mu": 4.7,
    "sigma": 1.3
  },
  {
    "text": "If (x-2)^2 = 9, what is the sum of all possible values of x?",
    "options": [
      "0",
      "2",
      "4",
      "5"
    ],
    "correctAnswer": "2",
    "questionType": "multiple-choice",
    "tags": [
      "Algebra",
      "Quadratic equations"
    ],
    "mu": 5.3,
    "sigma": 1.4
  },
  {
    "text": "A circle in the xy-plane has center (0, 0) and passes through the point (0, 5). Which of the following points also lies on the circle?",
    "options": [
      "(3, 4)",
      "(4, 3)",
      "(5, 0)",
      "(-3, -4)"
    ],
    "correctAnswer": "2",
    "questionType": "multiple-choice",
    "tags": [
      "Geometry & Trigonometry",
      "Circles",
      "Coordinate geometry"
    ],
    "mu": 5,
    "sigma": 1.3
  },
  {
    "text": "If 3x + 2y = 15 and 2x - 3y = -4, what is the value of x?",
    "options": [],
    "correctAnswer": "3",
    "questionType": "student-produced",
    "tags": [
      "Algebra",
      "Systems of linear equations"
    ],
    "mu": 5,
    "sigma": 1.4
  },
  {
    "text": "The average (arithmetic mean) of 6 numbers is 8. If one of the numbers is removed, the average of the remaining 5 numbers is 7. What is the value of the removed number?",
    "options": [],
    "correctAnswer": "13",
    "questionType": "student-produced",
    "tags": [
      "Problem Solving & Data Analysis",
      "Statistics",
      "Averages"
    ],
    "mu": 5.7,
    "sigma": 1.5
  },
  {
    "text": "A rectangle has a perimeter of 30 units and an area of 56 square units. What is the length of the longer side of the rectangle?",
    "options": [],
    "correctAnswer": "8",
    "questionType": "student-produced",
    "tags": [
      "Geometry & Trigonometry",
      "Angles and triangles",
      "Area and perimeter"
    ],
    "mu": 6,
    "sigma": 1.6
  },
  {
    "text": "What is the least positive integer that is divisible by both 8 and 15?",
    "options": [],
    "correctAnswer": "120",
    "questionType": "student-produced",
    "tags": [
      "Advanced Math",
      "Number theory",
      "LCM and GCD"
    ],
    "mu": 5.4,
    "sigma": 1.4
  },
  {
    "text": "If $f(x) = 2x^2 - 5x + 3$ and $f(a) = 0$, what is the value of $f(a+2)$?",
    "options": [],
    "correctAnswer": "10",
    "questionType": "student-produced",
    "tags": [
      "Advanced Math",
      "Quadratic functions",
      "Function notation"
    ],
    "mu": 7.2,
    "sigma": 1.9
  },
  {
    "text": "Generated multiple choice question #1: If x^2 + 3x + 1 = 0, what is the value of x?",
    "options": [
      "-1",
      "-2",
      "0",
      "1"
    ],
    "correctAnswer": "0",
    "questionType": "multiple-choice",
    "tags": [
      "Algebra",
      "Subtopic 1"
    ],
    "mu": 5,
    "sigma": 1.5
  },
  {
    "text": "Generated multiple choice question #2: If x^2 + 4x + 3 = 0, what is the value of x?",
    "options": [
      "-2",
      "-3",
      "1",
      "2"
    ],
    "correctAnswer": "1",
    "questionType": "multiple-choice",
    "tags": [
      "Advanced Math",
      "Subtopic 2"
    ],
    "mu": 5.1,
    "sigma": 1.5
  },
  {
    "text": "Generated multiple choice question #3: If x^2 + 5x + 5 = 0, what is the value of x?",
    "options": [
      "-3",
      "-4",
      "2",
      "3"
    ],
    "correctAnswer": "2",
    "questionType": "multiple-choice",
    "tags": [
      "Problem Solving and Data Analysis",
      "Subtopic 3"
    ],
    "mu": 5.2,
    "sigma": 1.5
  },
  {
    "text": "Generated multiple choice question #4: If x^2 + 6x + 7 = 0, what is the value of x?",
    "options": [
      "-4",
      "-5",
      "3",
      "4"
    ],
    "correctAnswer": "3",
    "questionType": "multiple-choice",
    "tags": [
      "Geometry & Trigonometry",
      "Subtopic 1"
    ],
    "mu": 5.3,
    "sigma": 1.5
  },
  {
    "text": "Generated multiple choice question #5: If x^2 + 7x + 9 = 0, what is the value of x?",
    "options": [
      "-5",
      "-6",
      "4",
      "5"
    ],
    "correctAnswer": "0",
    "questionType": "multiple-choice",
    "tags": [
      "Statistics & Probability",
      "Subtopic 2"
    ],
    "mu": 5.4,
    "sigma": 1.5
  },
  {
    "text": "Generated multiple choice question #6: If x^2 + 8x + 11 = 0, what is the value of x?",
    "options": [
      "-6",
      "-7",
      "5",
      "6"
    ],
    "correctAnswer": "1",
    "questionType": "multiple-choice",
    "tags": [
      "Algebra",
      "Subtopic 3"
    ],
    "mu": 5,
    "sigma": 1.5
  },
  {
    "text": "Generated multiple choice question #7: If x^2 + 9x + 13 = 0, what is the value of x?",
    "options": [
      "-7",
      "-8",
      "6",
      "7"
    ],
    "correctAnswer": "2",
    "questionType": "multiple-choice",
    "tags": [
      "Advanced Math",
      "Subtopic 1"
    ],
    "mu": 5.1,
    "sigma": 1.5
  },
  {
    "text": "Generated multiple choice question #8: If x^2 + 10x + 15 = 0, what is the value of x?",
    "options": [
      "-8",
      "-9",
      "7",
      "8"
    ],
    "correctAnswer": "3",
    "questionType": "multiple-choice",
    "tags": [
      "Problem Solving and Data Analysis",
      "Subtopic 2"
    ],
    "mu": 5.2,
    "sigma": 1.5
  },
  {
    "text": "Generated multiple choice question #9: If x^2 + 11x + 17 = 0, what is the value of x?",
    "options": [
      "-9",
      "-10",
      "8",
      "9"
    ],
    "correctAnswer": "0",
    "questionType": "multiple-choice",
    "tags": [
      "Geometry & Trigonometry",
      "Subtopic 3"
    ],
    "mu": 5.3,
    "sigma": 1.5
  },
  {
    "text": "Generated multiple choice question #10: If x^2 + 12x + 19 = 0, what is the value of x?",
    "options": [
      "-10",
      "-11",
      "9",
      "10"
    ],
    "correctAnswer": "1",
    "questionType": "multiple-choice",
    "tags": [
      "Statistics & Probability",
      "Subtopic 1"
    ],
    "mu": 5.4,
    "sigma": 1.5
  },
  {
    "text": "Generated multiple choice question #11: If x^2 + 13x + 21 = 0, what is the value of x?",
    "options": [
      "-11",
      "-12",
      "10",
      "11"
    ],
    "correctAnswer": "2",
    "questionType": "multiple-choice",
    "tags": [
      "Algebra",
      "Subtopic 2"
    ],
    "mu": 5,
    "sigma": 1.5
  },
  {
    "text": "Generated multiple choice question #12: If x^2 + 14x + 23 = 0, what is the value of x?",
    "options": [
      "-12",
      "-13",
      "11",
      "12"
    ],
    "correctAnswer": "3",
    "questionType": "multiple-choice",
    "tags": [
      "Advanced Math",
      "Subtopic 3"
    ],
    "mu": 5.1,
    "sigma": 1.5
  },
  {
    "text": "Generated multiple choice question #13: If x^2 + 15x + 25 = 0, what is the value of x?",
    "options": [
      "-13",
      "-14",
      "12",
      "13"
    ],
    "correctAnswer": "0",
    "questionType": "multiple-choice",
    "tags": [
      "Problem Solving and Data Analysis",
      "Subtopic 1"
    ],
    "mu": 5.2,
    "sigma": 1.5
  },
  {
    "text": "Generated multiple choice question #14: If x^2 + 16x + 27 = 0, what is the value of x?",
    "options": [
      "-14",
      "-15",
      "13",
      "14"
    ],
    "correctAnswer": "1",
    "questionType": "multiple-choice",
    "tags": [
      "Geometry & Trigonometry",
      "Subtopic 2"
    ],
    "mu": 5.3,
    "sigma": 1.5
  },
  {
    "text": "Generated multiple choice question #15: If x^2 + 17x + 29 = 0, what is the value of x?",
    "options": [
      "-15",
      "-16",
      "14",
      "15"
    ],
    "correctAnswer": "2",
    "questionType": "multiple-choice",
    "tags": [
      "Statistics & Probability",
      "Subtopic 3"
    ],
    "mu": 5.4,
    "sigma": 1.5
  },
  {
    "text": "Generated multiple choice question #16: If x^2 + 18x + 31 = 0, what is the value of x?",
    "options": [
      "-16",
      "-17",
      "15",
      "16"
    ],
    "correctAnswer": "3",
    "questionType": "multiple-choice",
    "tags": [
      "Algebra",
      "Subtopic 1"
    ],
    "mu": 5,
    "sigma": 1.5
  },
  {
    "text": "Generated multiple choice question #17: If x^2 + 19x + 33 = 0, what is the value of x?",
    "options": [
      "-17",
      "-18",
      "16",
      "17"
    ],
    "correctAnswer": "0",
    "questionType": "multiple-choice",
    "tags": [
      "Advanced Math",
      "Subtopic 2"
    ],
    "mu": 5.1,
    "sigma": 1.5
  },
  {
    "text": "Generated multiple choice question #18: If x^2 + 20x + 35 = 0, what is the value of x?",
    "options": [
      "-18",
      "-19",
      "17",
      "18"
    ],
    "correctAnswer": "1",
    "questionType": "multiple-choice",
    "tags": [
      "Problem Solving and Data Analysis",
      "Subtopic 3"
    ],
    "mu": 5.2,
    "sigma": 1.5
  },
  {
    "text": "Generated multiple choice question #19: If x^2 + 21x + 37 = 0, what is the value of x?",
    "options": [
      "-19",
      "-20",
      "18",
      "19"
    ],
    "correctAnswer": "2",
    "questionType": "multiple-choice",
    "tags": [
      "Geometry & Trigonometry",
      "Subtopic 1"
    ],
    "mu": 5.3,
    "sigma": 1.5
  },
  {
    "text": "Generated multiple choice question #20: If x^2 + 22x + 39 = 0, what is the value of x?",
    "options": [
      "-20",
      "-21",
      "19",
      "20"
    ],
    "correctAnswer": "3",
    "questionType": "multiple-choice",
    "tags": [
      "Statistics & Probability",
      "Subtopic 2"
    ],
    "mu": 5.4,
    "sigma": 1.5
  },
  {
    "text": "Generated multiple choice question #21: If x^2 + 23x + 41 = 0, what is the value of x?",
    "options": [
      "-21",
      "-22",
      "20",
      "21"
    ],
    "correctAnswer": "0",
    "questionType": "multiple-choice",
    "tags": [
      "Algebra",
      "Subtopic 3"
    ],
    "mu": 5,
    "sigma": 1.5
  },
  {
    "text": "Generated student-produced response question #1: What is the value of 1^2 + 2?",
    "options": [],
    "correctAnswer": "3",
    "questionType": "student-produced",
    "tags": [
      "Algebra",
      "Subtopic 1"
    ],
    "mu": 5,
    "sigma": 1.5
  },
  {
    "text": "Generated student-produced response question #2: What is the value of 2^2 + 3?",
    "options": [],
    "correctAnswer": "7",
    "questionType": "student-produced",
    "tags": [
      "Advanced Math",
      "Subtopic 2"
    ],
    "mu": 5.1,
    "sigma": 1.5
  },
  {
    "text": "Generated student-produced response question #3: What is the value of 3^2 + 4?",
    "options": [],
    "correctAnswer": "13",
    "questionType": "student-produced",
    "tags": [
      "Problem Solving and Data Analysis",
      "Subtopic 3"
    ],
    "mu": 5.2,
    "sigma": 1.5
  },
  {
    "text": "Generated student-produced response question #4: What is the value of 4^2 + 5?",
    "options": [],
    "correctAnswer": "21",
    "questionType": "student-produced",
    "tags": [
      "Geometry & Trigonometry",
      "Subtopic 1"
    ],
    "mu": 5.3,
    "sigma": 1.5
  },
  {
    "text": "Generated student-produced response question #5: What is the value of 5^2 + 6?",
    "options": [],
    "correctAnswer": "31",
    "questionType": "student-produced",
    "tags": [
      "Statistics & Probability",
      "Subtopic 2"
    ],
    "mu": 5.4,
    "sigma": 1.5
  },
  {
    "text": "Generated student-produced response question #6: What is the value of 6^2 + 7?",
    "options": [],
    "correctAnswer": "43",
    "questionType": "student-produced",
    "tags": [
      "Algebra",
      "Subtopic 3"
    ],
    "mu": 5,
    "sigma": 1.5
  },
  {
    "text": "Generated student-produced response question #7: What is the value of 7^2 + 8?",
    "options": [],
    "correctAnswer": "57",
    "questionType": "student-produced",
    "tags": [
      "Advanced Math",
      "Subtopic 1"
    ],
    "mu": 5.1,
    "sigma": 1.5
  },
  {
    "text": "Generated student-produced response question #8: What is the value of 8^2 + 9?",
    "options": [],
    "correctAnswer": "73",
    "questionType": "student-produced",
    "tags": [
      "Problem Solving and Data Analysis",
      "Subtopic 2"
    ],
    "mu": 5.2,
    "sigma": 1.5
  }
];

module.exports = sampleQuestions;
