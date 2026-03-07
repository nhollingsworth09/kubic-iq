import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './TestHistoryList.module.css';
import { formatTimeMMSS } from '../../../utils/timeUtils';

interface Test {
  id: string;
  testType: 'quiz' | 'custom' | 'exam';
  questionCount: number;
  correctCount: number;
  percentage: number;
  duration: number;
  topics: string[];
  createdAt: string;
  masteryScoreChange?: number | null;
  masteryScoreBefore?: number | null;
  masteryScoreAfter?: number | null;
}

interface TestHistoryListProps {
  tests: Test[];
}

const TestHistoryList: React.FC<TestHistoryListProps> = ({ tests }) => {
  const navigate = useNavigate();
  if (!tests || tests.length === 0) {
    return (
      <div className={styles.emptyState}>
        <p>No tests completed yet. Take a quiz or exam to see your results here!</p>
      </div>
    );
  }

  const getTestTypeLabel = (type: string): string => {
    switch (type) {
      case 'quiz': return 'Custom Quiz';
      case 'custom': return 'Custom Exam';
      case 'exam': return 'Mock Exam';
      default: return 'Test';
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className={styles.historyContainer}>
      <h3 className={styles.historyTitle}>Recent Tests</h3>
      
      <div className={styles.testList}>
        {tests.map(test => (          <div key={test.id} className={styles.testItem}>
            <div className={styles.testHeader}>
              <span className={styles.testType}>{getTestTypeLabel(test.testType)}</span>
              <span className={styles.testDate}>{formatDate(test.createdAt)}</span>
            </div>
            
            <div className={styles.testStats}>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>Score</span>
                <span className={`${styles.statValue} ${test.percentage >= 70 ? styles.highScore : styles.lowScore}`}>
                  {Math.round(test.percentage)}%
                </span>
              </div>
              
              <div className={styles.statItem}>
                <span className={styles.statLabel}>Questions</span>
                <span className={styles.statValue}>
                  {test.correctCount}/{test.questionCount}
                </span>
              </div>
              
              <div className={styles.statItem}>
                <span className={styles.statLabel}>Time</span>
                <span className={styles.statValue}>{formatTimeMMSS(test.duration)}</span>
              </div>
            </div>
            
            {test.masteryScoreChange !== undefined && test.masteryScoreChange !== null && (
              <div className={styles.masteryChange}>
                <span className={styles.masteryLabel}>Mastery Impact</span>
                <span className={`${styles.masteryValue} ${test.masteryScoreChange > 0 ? styles.positiveChange : test.masteryScoreChange < 0 ? styles.negativeChange : ''}`}>
                  {test.masteryScoreChange > 0 ? '+' : ''}{test.masteryScoreChange.toFixed(2)}
                </span>
              </div>
            )}
            
            <div className={styles.testTopics}>
              {test.topics.slice(0, 3).map((topic, idx) => (
                <span key={idx} className={styles.topicTag}>{topic}</span>
              ))}
              {test.topics.length > 3 && (
                <span className={styles.moreTopics}>+{test.topics.length - 3} more</span>
              )}
            </div>
            
            <div className={styles.testActions}>
              <button 
                className={styles.viewResultsButton}
                onClick={() => navigate(`/test/history/${test.id}`)}
              >
                View Results
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TestHistoryList;
