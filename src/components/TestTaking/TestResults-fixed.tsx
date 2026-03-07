import React, { useState, useEffect, useMemo, ReactElement } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTest } from '../../contexts/TestContext';
import { useAuth } from '../../contexts/AuthContext';
import styles from './TestResults.module.css';
import { formatTimeMMSS, formatTimeMMmSSs } from '../../utils/timeUtils';

interface QuestionTimeStats {
  averageTimePerQuestion: number;
  longestQuestion: {
    questionId: string;
    questionNumber: number;
    timeSpent: number;
    text: string;
  };
  shortestQuestion: {
    questionId: string;
    questionNumber: number;
    timeSpent: number;
    text: string;
  };
}

interface MasteryData {
  previousScore: number | null;
  newScore: number | null;
  change: number | null;
}

const TestResults: React.FC = (): ReactElement => {
  const navigate = useNavigate();
  const { testId } = useParams<{ testId?: string }>();
  const { user } = useAuth();
  const { 
    questions,
    answers,
    timeTracking,
    testStartTime,
    testEndTime,
    testType,    
    exitTest,
    goToQuestion,
    loadHistoricalTest
  } = useTest();
  
  const [masteryData, setMasteryData] = useState<MasteryData>({
    previousScore: null,
    newScore: null,
    change: null
  });
  
  // Store a snapshot of the test data when the component mounts
  // This ensures we keep the same test state regardless of navigation
  const testSnapshot = useMemo(() => {
    return {
      questions,
      answers,
      timeTracking,
      testStartTime,
      testEndTime,
      testType
    };
  }, [questions, answers, timeTracking, testStartTime, testEndTime, testType]);
  
  // Use the snapshot for calculations
  const calculatedQuestions = testSnapshot.questions;
  const calculatedAnswers = testSnapshot.answers;
  const calculatedTimeTracking = testSnapshot.timeTracking;
  const calculatedTestStartTime = testSnapshot.testStartTime;
  const calculatedTestEndTime = testSnapshot.testEndTime;
  
  // Calculate test statistics
  const calculateTestStats = () => {
    if (!calculatedTestStartTime || !calculatedTestEndTime || !calculatedQuestions.length) {
      return {
        totalTime: 0,
        questionsAnswered: 0,
        correctAnswers: 0,
        questionsMarked: 0
      };
    }

    const totalTime = Math.round((calculatedTestEndTime - calculatedTestStartTime) / 1000);
    const questionsAnswered = calculatedAnswers.filter(a => 
      a.selectedOption !== undefined || (a.textAnswer !== undefined && a.textAnswer !== '')
    ).length;
    const correctAnswers = calculatedAnswers.filter(a => a.isCorrect).length;
    const questionsMarked = calculatedAnswers.filter(a => a.isMarkedForReview).length;

    return {
      totalTime,
      questionsAnswered,
      correctAnswers,
      questionsMarked
    };
  };

  // Calculate time statistics for questions
  const calculateQuestionTimeStats = (): QuestionTimeStats => {
    if (!calculatedTimeTracking.length || !calculatedQuestions.length) {
      return {
        averageTimePerQuestion: 0,
        longestQuestion: {
          questionId: '',
          questionNumber: 0,
          timeSpent: 0,
          text: ''
        },
        shortestQuestion: {
          questionId: '',
          questionNumber: 0,
          timeSpent: 0,
          text: ''
        }
      };
    }

    // Filter out questions with no time spent
    const trackedQuestions = calculatedTimeTracking.filter(q => q.timeSpent > 0);
    
    if (!trackedQuestions.length) {
      return {
        averageTimePerQuestion: 0,
        longestQuestion: {
          questionId: '',
          questionNumber: 0,
          timeSpent: 0,
          text: ''
        },
        shortestQuestion: {
          questionId: '',
          questionNumber: 0,
          timeSpent: 0,
          text: ''
        }
      };
    }

    // Calculate average time
    const totalTimeSpent = trackedQuestions.reduce((sum, q) => sum + q.timeSpent, 0);
    const averageTimePerQuestion = Math.round(totalTimeSpent / trackedQuestions.length);

    // Find longest and shortest questions
    let longestQuestionTrack = trackedQuestions[0];
    let shortestQuestionTrack = trackedQuestions[0];

    trackedQuestions.forEach(q => {
      if (q.timeSpent > longestQuestionTrack.timeSpent) {
        longestQuestionTrack = q;
      }
      if (q.timeSpent < shortestQuestionTrack.timeSpent) {
        shortestQuestionTrack = q;
      }
    });

    // Get question text and number for longest/shortest
    const findQuestionInfo = (questionId: string) => {
      const index = calculatedQuestions.findIndex(q => q.id === questionId);
      return {
        questionNumber: index + 1,
        text: calculatedQuestions[index]?.text || ''
      };
    };

    const longestInfo = findQuestionInfo(longestQuestionTrack.questionId);
    const shortestInfo = findQuestionInfo(shortestQuestionTrack.questionId);

    return {
      averageTimePerQuestion,
      longestQuestion: {
        questionId: longestQuestionTrack.questionId,
        questionNumber: longestInfo.questionNumber,
        timeSpent: Math.round(longestQuestionTrack.timeSpent),
        text: longestInfo.text
      },
      shortestQuestion: {
        questionId: shortestQuestionTrack.questionId,
        questionNumber: shortestInfo.questionNumber,
        timeSpent: Math.round(shortestQuestionTrack.timeSpent),
        text: shortestInfo.text
      }
    };
  };
  // We'll use the timer formatting function for the total time
  // and the detailed MMmSSs format for per-question time statistics

  const stats = calculateTestStats();
  const timeStats = calculateQuestionTimeStats();

  const handleBackToDashboard = () => {
    exitTest();
    navigate('/dashboard');
  };

  const handleQuestionClick = (index: number) => {
    navigate(`/test/review/${index + 1}`);
  };

  const testTypeLabel = testSnapshot.testType === 'quiz' ? 'Custom Quiz' : 
                      testSnapshot.testType === 'custom' ? 'Custom Exam' : 'Mock Exam';

  // When component mounts, calculate mastery score data or fetch it for historical tests
  useEffect(() => {
    // If we have a test ID from the URL, this is a historical test view
    if (testId) {
      // Fetch test details including mastery score impact
      const fetchTestDetails = async () => {
        try {
          const token = localStorage.getItem('token');
          if (!token) return;
          
          console.log(`Fetching details for test ID: ${testId}`);
          
          const response = await fetch(`/api/tests/${testId}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            },
            cache: 'no-store' // Prevent cache issues
          });
          
          if (response.ok) {
            const testData = await response.json();
            if (testData.test) {
              console.log('Mastery data from test history:', {
                before: testData.test.masteryScoreBefore,
                after: testData.test.masteryScoreAfter,
                change: testData.test.masteryScoreChange
              });
              
              setMasteryData({
                previousScore: testData.test.masteryScoreBefore,
                newScore: testData.test.masteryScoreAfter,
                change: testData.test.masteryScoreChange
              });
            } else {
              console.error('Test data missing from response:', testData);
            }
          } else {
            console.error('Failed to fetch test details:', response.status);
          }
        } catch (error) {
          console.error('Error fetching test details:', error);
        }
      };
      
      fetchTestDetails();
    } else if (calculatedTestEndTime) {
      // For newly completed tests, calculate the impact
      // This is a simplified approximation
      const correctCount = calculatedAnswers.filter(a => a.isCorrect).length;
      const correctPercentage = calculatedQuestions.length > 0 ? 
        correctCount / calculatedQuestions.length : 0;
        
      // Simulate mastery score calculation
      const fetchUserData = async () => {
        try {
          const token = localStorage.getItem('token');
          if (!token) return;
          
          const response = await fetch('/api/user/progress', {
            headers: {
              'Authorization': `Bearer ${token}`
            },
            cache: 'no-store' // Prevent cache issues
          });
          
          if (response.ok) {
            const userData = await response.json();
            const currentScore = userData.masteryScore || 7.5;
            
            // Simple formula to estimate mastery impact
            const change = (correctPercentage - 0.5) * 0.4;
            const newScore = Math.min(10, Math.max(0, currentScore + change));
            
            console.log('Calculated mastery data:', {
              previousScore: currentScore,
              newScore: newScore,
              change: change
            });
            
            setMasteryData({
              previousScore: currentScore,
              newScore: newScore,
              change: change
            });
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      };
      
      fetchUserData();
    }
  }, [testId, calculatedTestEndTime, calculatedQuestions.length, calculatedAnswers]);

  // Load historical test data if we have a testId
  useEffect(() => {
    if (testId && calculatedQuestions.length === 0) {
      // Load the historical test data
      loadHistoricalTest(testId);
    }
  }, [testId, calculatedQuestions.length, loadHistoricalTest]);

  return (
    <div className={styles.resultsContainer}>
      <header className={styles.resultsHeader}>
        <h1>Test Results</h1>
        <h2>{testTypeLabel} Summary</h2>
      </header>      <div className={styles.resultsSummary}>        <div className={styles.statCard}>
          <h3>Total Time</h3>
          <div className={styles.statValue}>{formatTimeMMSS(stats.totalTime)}</div>
        </div>        <div className={styles.statCard}>
          <h3>Score</h3>
          <div className={styles.statValue}>{stats.correctAnswers} / {calculatedQuestions.length}</div>
          <div className={styles.statSubtitle}>{Math.round((stats.correctAnswers / calculatedQuestions.length) * 100)}% Correct</div>
        </div>        <div className={styles.statCard}>
          <h3>Mastery Impact</h3>
          <div className={styles.statValue}>
            {masteryData.previousScore !== null && masteryData.newScore !== null ? (
              <>
                <span className={styles.masteryBefore}>{masteryData.previousScore.toFixed(1)}</span>
                <span className={styles.masteryArrow}>→</span>
                <span className={styles.masteryAfter}>{masteryData.newScore.toFixed(1)}</span>
              </>
            ) : (
              <span>Not Available</span>
            )}
          </div>
          <div className={styles.statSubtitle}>
            {masteryData.change !== null && (
              <span className={`${styles.masteryChange} ${masteryData.change >= 0 ? '' : styles.negativeChange}`}>
                {masteryData.change > 0 ? '+' : ''}{masteryData.change.toFixed(1)} points
              </span>
            )}
          </div>
        </div>
      </div>

      <section className={styles.timeAnalysis}>
        <h2>Time Analysis</h2>
        
        <div className={styles.timeStats}>          <div className={styles.timeStat}>
            <h3>Average Time Per Question</h3>
            <p>{formatTimeMMmSSs(timeStats.averageTimePerQuestion)}</p>
          </div>
            <div className={styles.questionTimeStat}>
            <h3>Longest Time Spent</h3>
            <p className={styles.timeValue}>{formatTimeMMmSSs(timeStats.longestQuestion.timeSpent)}</p>
            <div className={styles.questionTimeInfo}>
              <p className={styles.questionNumber}>Question {timeStats.longestQuestion.questionNumber}</p>
              <p className={styles.questionText}>{timeStats.longestQuestion.text}</p>
            </div>
          </div>
            <div className={styles.questionTimeStat}>
            <h3>Shortest Time Spent</h3>
            <p className={styles.timeValue}>{formatTimeMMmSSs(timeStats.shortestQuestion.timeSpent)}</p>
            <div className={styles.questionTimeInfo}>
              <p className={styles.questionNumber}>Question {timeStats.shortestQuestion.questionNumber}</p>
              <p className={styles.questionText}>{timeStats.shortestQuestion.text}</p>
            </div>
          </div>
        </div>
      </section>      <section className={styles.timeTrackingTable}>
        <h2>Question Performance</h2>
        <div className={styles.performanceSummary}>
          <div className={styles.performanceStat}>
            <div className={styles.statLabel}>Correct</div>
            <div className={styles.statBadge} data-type="correct">{stats.correctAnswers}</div>
          </div>
          <div className={styles.performanceStat}>
            <div className={styles.statLabel}>Incorrect</div>
            <div className={styles.statBadge} data-type="incorrect">{stats.questionsAnswered - stats.correctAnswers}</div>
          </div>
          <div className={styles.performanceStat}>
            <div className={styles.statLabel}>Unanswered</div>
            <div className={styles.statBadge} data-type="unanswered">{calculatedQuestions.length - stats.questionsAnswered}</div>
          </div>
        </div>
        <p className={styles.tableInstructions}>Click on any question to review it with the correct answer highlighted</p>
        <table className={styles.questionTable}>
          <thead>
            <tr>              <th>Question</th>
              <th>Time Spent</th>
              <th>Visits</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {calculatedQuestions.map((question, index) => {
              const tracking = calculatedTimeTracking.find(t => t.questionId === question.id);
              const answer = calculatedAnswers.find(a => a.questionId === question.id);
              const isAnswered = answer && (answer.selectedOption !== undefined || 
                (answer.textAnswer !== undefined && answer.textAnswer !== ''));

              return (                <tr 
                  key={question.id}
                  className={`${answer?.isMarkedForReview ? styles.markedQuestion : ''} ${styles.clickableRow}`}
                  onClick={() => handleQuestionClick(index)}
                >
                  <td>{index + 1}. {question.text.substring(0, 60)}...</td>
                  <td>{tracking ? formatTimeMMmSSs(tracking.timeSpent) : '0m 0s'}</td>
                  <td>{tracking?.visits || 0}</td>
                  <td>
                    {!isAnswered ? (
                      <span className={styles.unanswered}>Unanswered</span>
                    ) : answer?.isCorrect ? (
                      <span className={styles.correct}>Correct</span>
                    ) : (
                      <span className={styles.incorrect}>Incorrect</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>

      <div className={styles.actionButtons}>
        <button className={styles.primaryButton} onClick={handleBackToDashboard}>
          Back to Dashboard
        </button>
      </div>
    </div>
  );
};

export default TestResults;
