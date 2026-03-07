import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface Question {
  id: string;
  text: string;
  options?: string[];
  correctAnswer: string | number; // Can be number (index) for multiple-choice or string for student-produced
  mu: number;
  sigma: number;
  tags: string[];
  questionType: 'multiple-choice' | 'student-produced';
}

interface QuestionTimeTracking {
  questionId: string;
  timeSpent: number;
  startTime: number | null;
  endTime: number | null;
  visits: number;
}

interface Answer {
  questionId: string;
  selectedOption?: number;
  textAnswer?: string;
  isMarkedForReview: boolean;
  isCorrect?: boolean;
}

interface TestContextValue {
  testId: string | null;
  testType: 'quiz' | 'custom' | 'exam' | null;
  questions: Question[];
  currentQuestionIndex: number;
  answers: Answer[];
  timeTracking: QuestionTimeTracking[];
  testStartTime: number | null;
  testEndTime: number | null;
  testDuration: number; // in seconds
  remainingTime: number;
  isTestComplete: boolean;
  loading: boolean;
  error: string | null;
  
  // Navigation functions
  goToNextQuestion: () => void;
  goToPreviousQuestion: () => void;
  goToQuestion: (index: number) => void;
  
  // Answer management
  setAnswer: (answer: { selectedOption?: number; textAnswer?: string }) => void;
  toggleMarkForReview: () => void;
  
  // Test control functions
  startTest: (testType: 'quiz' | 'custom' | 'exam', topics: string[], questionCount: number) => Promise<void>;
  submitTest: () => Promise<void>;
  exitTest: () => void;
  loadHistoricalTest: (testId: string) => Promise<void>;
}

const TestContext = createContext<TestContextValue | undefined>(undefined);

interface TestProviderProps {
  children: ReactNode;
}

const MINUTE_IN_SECONDS = 60;
const DEFAULT_TEST_DURATION = 70 * MINUTE_IN_SECONDS; // 70 minutes in seconds

export const TestProvider: React.FC<TestProviderProps> = ({ children }) => {
  // Test state
  const [testId, setTestId] = useState<string | null>(null);
  const [testType, setTestType] = useState<'quiz' | 'custom' | 'exam' | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [timeTracking, setTimeTracking] = useState<QuestionTimeTracking[]>([]);
  const [testStartTime, setTestStartTime] = useState<number | null>(null);
  const [testEndTime, setTestEndTime] = useState<number | null>(null);
  const [testDuration, setTestDuration] = useState<number>(DEFAULT_TEST_DURATION);
  const [remainingTime, setRemainingTime] = useState<number>(DEFAULT_TEST_DURATION);
  const [isTestComplete, setIsTestComplete] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(null);

  // Initialize time tracking for a question
  const initializeTimeTrackingForQuestion = (questionId: string) => {
    return {
      questionId,
      timeSpent: 0,
      startTime: null,
      endTime: null,
      visits: 0,
    };
  };

  // Start tracking time for the current question
  useEffect(() => {
    if (!testStartTime || isTestComplete) return;

    // Only proceed if we have questions
    if (questions.length === 0 || currentQuestionIndex >= questions.length) return;

    const currentQuestionId = questions[currentQuestionIndex].id;
    
    // Find existing time tracking for the current question or initialize a new one
    let currentTracking = timeTracking.find(t => t.questionId === currentQuestionId);
    
    if (!currentTracking) {
      currentTracking = initializeTimeTrackingForQuestion(currentQuestionId);
      setTimeTracking([...timeTracking, currentTracking]);
      return;
    }

    // Update time tracking for previously active question (if any)
    const updatedTracking = timeTracking.map(track => {
      if (track.startTime && !track.endTime) {
        const timeSpent = track.timeSpent + (Date.now() - track.startTime) / 1000;
        return {
          ...track,
          endTime: Date.now(),
          timeSpent: timeSpent
        };
      }
      return track;
    });

    // Start tracking time for the current question
    const newTracking = updatedTracking.map(track => {
      if (track.questionId === currentQuestionId) {
        return {
          ...track,
          startTime: Date.now(),
          endTime: null,
          visits: track.visits + 1
        };
      }
      return track;
    });

    setTimeTracking(newTracking);
  }, [currentQuestionIndex, questions, testStartTime, isTestComplete]);

  // Timer functionality
  useEffect(() => {
    // Don't start timer if test is not started or is already complete
    if (!testStartTime || isTestComplete || testDuration <= 0) return;

    // Calculate initial remaining time based on start time and duration
    const calculateRemainingTime = () => {
      const elapsedTime = Math.round((Date.now() - testStartTime) / 1000);
      return Math.max(0, testDuration - elapsedTime);
    };

    // Set initial remaining time
    setRemainingTime(calculateRemainingTime());

    // Create timer interval to update remaining time every second
    const interval = setInterval(() => {
      const newRemainingTime = calculateRemainingTime();
      setRemainingTime(newRemainingTime);

      // Auto submit when time is up
      if (newRemainingTime <= 0) {
        clearInterval(interval);
        submitTest();
      }
    }, 1000);

    setTimerInterval(interval);

    // Clean up interval on unmount
    return () => {
      clearInterval(interval);
      setTimerInterval(null);
    };
  }, [testStartTime, testDuration, isTestComplete]);

  // Navigation functions
  const goToNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const goToQuestion = (index: number) => {
    if (index >= 0 && index < questions.length) {
      setCurrentQuestionIndex(index);
    }
  };

  // Answer management
  const setAnswer = (answer: { selectedOption?: number; textAnswer?: string }) => {
    if (questions.length === 0 || isTestComplete) return;

    const currentQuestion = questions[currentQuestionIndex];
    const existingAnswerIndex = answers.findIndex(a => a.questionId === currentQuestion.id);

    if (existingAnswerIndex >= 0) {
      const updatedAnswers = [...answers];
      updatedAnswers[existingAnswerIndex] = {
        ...updatedAnswers[existingAnswerIndex],
        selectedOption: answer.selectedOption,
        textAnswer: answer.textAnswer,
      };
      setAnswers(updatedAnswers);
    } else {
      setAnswers([
        ...answers,
        {
          questionId: currentQuestion.id,
          selectedOption: answer.selectedOption,
          textAnswer: answer.textAnswer,
          isMarkedForReview: false,
        },
      ]);
    }
    
    // Submit answer to API with testId if we're taking a test (not reviewing)
    if (testId && !isTestComplete) {
      submitAnswerToApi(currentQuestion.id, answer.selectedOption, answer.textAnswer);
    }
  };

  const toggleMarkForReview = () => {
    if (questions.length === 0 || isTestComplete) return;

    const currentQuestion = questions[currentQuestionIndex];
    const existingAnswerIndex = answers.findIndex(a => a.questionId === currentQuestion.id);

    if (existingAnswerIndex >= 0) {
      const updatedAnswers = [...answers];
      updatedAnswers[existingAnswerIndex] = {
        ...updatedAnswers[existingAnswerIndex],
        isMarkedForReview: !updatedAnswers[existingAnswerIndex].isMarkedForReview,
      };
      setAnswers(updatedAnswers);
    } else {
      setAnswers([
        ...answers,
        {
          questionId: currentQuestion.id,
          isMarkedForReview: true,
        },
      ]);
    }
  };
  
  // Fetch questions from the server based on test configuration
  const fetchQuestions = async (testType: 'quiz' | 'custom' | 'exam', topics: string[], count: number): Promise<Question[]> => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }
      
      const response = await fetch('/api/questions/fetch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ testType, topics, count }),
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          throw new Error('Authentication error: Your session has expired. Please log in again.');
        }
        
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch questions');
      }

      const data = await response.json();
      return data.questions;
    } catch (error) {
      console.error('Error fetching questions:', error);
      throw error;
    }
  };

  // Start a new test with the given configuration
  const startTest = async (testType: 'quiz' | 'custom' | 'exam', topics: string[], questionCount: number) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log(`Starting ${testType} with ${questionCount} questions on topics:`, topics);

      // Fetch questions
      console.log("Fetching questions from API...");
      const fetchedQuestions = await fetchQuestions(testType, topics, questionCount);
      console.log(`Successfully fetched ${fetchedQuestions.length} questions:`, fetchedQuestions);
      
      // We only keep the last quiz config if it was successful
      // If we got here, the quiz was started successfully so we can keep the config

      // Calculate test duration based on number of questions
      const calculatedDuration = Math.ceil((70 / 44) * questionCount * MINUTE_IN_SECONDS);
      
      // Initialize test state
      const startTime = Date.now();
      
      setTestId(`test-${startTime}`);
      setTestType(testType);
      setQuestions(fetchedQuestions);
      setCurrentQuestionIndex(0);
      setAnswers([]);
      setTimeTracking([]);
      setTestStartTime(startTime);
      setTestEndTime(null);
      setTestDuration(calculatedDuration);
      setRemainingTime(calculatedDuration);
      setIsTestComplete(false);
      
      // Initialize time tracking for first question
      if (fetchedQuestions.length > 0) {
        setTimeTracking([
          {
            questionId: fetchedQuestions[0].id,
            timeSpent: 0,
            startTime: Date.now(),
            endTime: null,
            visits: 1
          }
        ]);
      }
    } catch (error: any) {
      setError(error.message || 'Failed to start test');
    } finally {
      setLoading(false);
    }
  };
  
  // Evaluate answer correctness
  const evalAnswers = () => {
    return answers.map(answer => {
      const question = questions.find(q => q.id === answer.questionId);
      if (!question) return answer;
      
      let isCorrect = false;
      
      if (question.questionType === 'multiple-choice' && answer.selectedOption !== undefined) {
        // For multiple choice, check if selected option matches correct answer
        isCorrect = answer.selectedOption === question.correctAnswer;
      } else if (question.questionType === 'student-produced' && answer.textAnswer) {
        // For student-produced, check if text answer matches correct answer
        isCorrect = answer.textAnswer.trim().toLowerCase() === String(question.correctAnswer).trim().toLowerCase();
      }
      
      return {
        ...answer,
        isCorrect
      };
    });
  };

  const submitTest = async () => {
    if (!testId || questions.length === 0) return;

    try {
      setLoading(true);
      
      // Calculate final time spent on each question
      const finalTimeTracking = timeTracking.map(track => {
        if (track.startTime && !track.endTime) {
          return {
            ...track,
            endTime: Date.now(),
            timeSpent: track.timeSpent + (Date.now() - (track.startTime || 0)) / 1000,
          };
        }
        return track;
      });

      const endTime = Date.now();
      
      // Process, grade and submit answers
      const evaluatedAnswers = evalAnswers();

      // Update test state with graded answers
      setAnswers(evaluatedAnswers);
      setTimeTracking(finalTimeTracking);
      setTestEndTime(endTime);
      setIsTestComplete(true);

      // Clear timer
      if (timerInterval) {
        clearInterval(timerInterval);
        setTimerInterval(null);
      }
      
      try {
        // Only save completed tests (not ones that were exited)
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No authentication token found');
        
        // Calculate duration in seconds
        const duration = Math.round((endTime - (testStartTime || 0)) / 1000);
        
        // Count correct answers
        const correctCount = evaluatedAnswers.filter(a => a.isCorrect).length;
        
        // Extract topics from questions
        const topics = Array.from(new Set(questions.flatMap(q => q.tags))); 
        
        // Get user data to calculate mastery score changes
        const userResponse = await fetch('/api/user/progress', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!userResponse.ok) {
          throw new Error('Failed to fetch user data');
        }
        
        const userData = await userResponse.json();
        
        // Calculate mastery score impact (simple approximation)
        // In a real app, you would get this from the backend after test processing
        const masteryScoreBefore = userData.masteryScore || null;
        // Simplified formula - this is an approximation
        const masteryScoreChange = masteryScoreBefore !== null ? 
          (correctCount / questions.length - 0.5) * 0.2 : null;
        const masteryScoreAfter = masteryScoreBefore !== null ?
          Math.min(10, Math.max(0, masteryScoreBefore + masteryScoreChange)) : null;
            
        // Submit test results to backend with mastery score data
        const response = await fetch('/api/tests', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            testType,
            questionCount: questions.length,
            correctCount,
            duration,
            topics,
            masteryScoreChange,
            masteryScoreBefore,
            masteryScoreAfter,
            answers: evaluatedAnswers.map(a => ({
              questionId: a.questionId,
              selectedOption: a.selectedOption,
              textAnswer: a.textAnswer,
              isCorrect: a.isCorrect
            }))
          })
        });
        
        if (!response.ok) {
          throw new Error('Failed to save test results');
        }
        
        const testResult = await response.json();
        const savedTestId = testResult.test?.id;
        
        if (savedTestId) {
          // Update all answers with the testId for reference
          try {
            await fetch(`/api/tests/${savedTestId}/answers`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({
                answers: evaluatedAnswers.map(a => ({
                  questionId: a.questionId
                }))
              })
            });
          } catch (error) {
            console.error('Error updating answers with testId:', error);
            // Continue even if this fails
          }
        }
        
        console.log('Test submitted successfully');
      } catch (error: any) {
        console.error('Error submitting test:', error);
        // Continue with the process even if saving fails
      }

      // Navigate to results page would be handled by the component
    } catch (error: any) {
      setError(error.message || 'Failed to submit test');
    } finally {
      setLoading(false);
    }
  };

  const exitTest = () => {
    // Clean up test state
    if (timerInterval) {
      clearInterval(timerInterval);
      setTimerInterval(null);
    }

    // Reset all state
    setTestId(null);
    setTestType(null);
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setAnswers([]);
    setTimeTracking([]);
    setTestStartTime(null);
    setTestEndTime(null);
    setTestDuration(DEFAULT_TEST_DURATION);
    setRemainingTime(DEFAULT_TEST_DURATION);
    setIsTestComplete(false);
    setError(null);
  };

  // Load historical test data
  const loadHistoricalTest = async (testId: string) => {
    if (!testId) return;
    
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token found');
      
      // Fetch test data by ID
      const response = await fetch(`/api/tests/${testId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to load test data');
      }
      
      const data = await response.json();
      
      if (data.success && data.test && data.questionHistory) {
        // Map question history to our data structure
        const questions: Question[] = data.questionHistory.map((qh: any) => qh.Question);
        
        // Create answers from history
        const answers: Answer[] = data.questionHistory.map((qh: any) => ({
          questionId: qh.questionId,
          selectedOption: qh.selectedOption,
          textAnswer: qh.textAnswer || '',
          isMarkedForReview: false,
          isCorrect: qh.correct
        }));
        
        // Create basic time tracking (we don't have detailed info)
        const timeTracking: QuestionTimeTracking[] = questions.map(q => ({
          questionId: q.id,
          timeSpent: data.test.duration / questions.length, // Estimate equal time per question
          startTime: null,
          endTime: null,
          visits: 1
        }));
        
        setTestId(testId);
        setTestType(data.test.testType);
        setQuestions(questions);
        setAnswers(answers);
        setTimeTracking(timeTracking);
        setTestStartTime(new Date(data.test.createdAt).getTime());
        setTestEndTime(new Date(data.test.createdAt).getTime() + (data.test.duration * 1000));
        setIsTestComplete(true);
      }
    } catch (error) {
      console.error('Error loading test data:', error);
      setError('Failed to load test data');
    } finally {
      setLoading(false);
    }
  };
  
  // Submit answer with testId to API when answering during a test
  const submitAnswerToApi = async (questionId: string, selectedOption: number | undefined, textAnswer: string | undefined) => {
    if (!testId || isTestComplete) return;
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }
      
      // Only submit if we have a valid answer
      if (selectedOption !== undefined || (textAnswer !== undefined && textAnswer !== '')) {
        await fetch('/api/answer', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ 
            questionId, 
            selectedOption: selectedOption !== undefined ? selectedOption : -1,
            testId 
          }),
        });
      }
    } catch (error) {
      console.error('Error submitting answer to API:', error);
      // Don't throw, just log - we don't want to interrupt the user's test
    }
  };

  // Create context value
  const contextValue: TestContextValue = {
    testId,
    testType,
    questions,
    currentQuestionIndex,
    answers,
    timeTracking,
    testStartTime,
    testEndTime,
    testDuration,
    remainingTime,
    isTestComplete,
    loading,
    error,
    
    goToNextQuestion,
    goToPreviousQuestion,
    goToQuestion,
    
    setAnswer,
    toggleMarkForReview,
    startTest,
    submitTest,
    exitTest,
    loadHistoricalTest,
  };

  return (
    <TestContext.Provider value={contextValue}>
      {children}
    </TestContext.Provider>
  );
};

export const useTest = (): TestContextValue => {
  const context = useContext(TestContext);
  if (!context) {
    throw new Error('useTest must be used within a TestProvider');
  }
  return context;
};
