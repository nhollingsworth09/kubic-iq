import React from 'react';
import { useTest } from '../../../contexts/TestContext';
import styles from './TestOverview.module.css';
import { formatTimeMMmSSs } from '../../../utils/timeUtils';

interface TestOverviewProps {
  onClose: () => void;
  onNavigateToQuestion: (index: number) => void;
}

const TestOverview: React.FC<TestOverviewProps> = ({ onClose, onNavigateToQuestion }) => {
  const { 
    questions, 
    answers, 
    currentQuestionIndex,
    timeTracking
  } = useTest();
  // We'll use the shared formatTimeMMmSSs utility

  // Helper function to get question status
  const getQuestionStatus = (questionId: string) => {
    const answer = answers.find(a => a.questionId === questionId);
    
    if (!answer) return 'unanswered';
    if (answer.isMarkedForReview) return 'review';
    
    // Check if the question has an actual answer (not just marked for review)
    if (
      (answer.selectedOption !== undefined && answer.selectedOption !== null) || 
      (answer.textAnswer !== undefined && answer.textAnswer.trim() !== '')
    ) {
      return 'answered';
    }
    
    return 'unanswered';
  };

  // Helper function to get the time spent on a question
  const getTimeSpent = (questionId: string): number => {
    const tracking = timeTracking.find(t => t.questionId === questionId);
    return tracking ? tracking.timeSpent : 0;
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2>Test Overview</h2>
          <button className={styles.closeButton} onClick={onClose}>&times;</button>
        </div>
        
        <div className={styles.content}>
          <div className={styles.legend}>
            <div className={styles.legendItem}>
              <span className={`${styles.statusIndicator} ${styles.currentQuestion}`}></span>
              <span>Current Question</span>
            </div>
            <div className={styles.legendItem}>
              <span className={`${styles.statusIndicator} ${styles.answered}`}></span>
              <span>Answered</span>
            </div>
            <div className={styles.legendItem}>
              <span className={`${styles.statusIndicator} ${styles.unanswered}`}></span>
              <span>Not Answered</span>
            </div>
            <div className={styles.legendItem}>
              <span className={`${styles.statusIndicator} ${styles.review}`}></span>
              <span>Marked for Review</span>
            </div>
          </div>
          
          <div className={styles.questionsGrid}>
            {questions.map((question, index) => {
              const status = getQuestionStatus(question.id);
              const isCurrent = index === currentQuestionIndex;
              
              return (
                <div 
                  key={question.id} 
                  className={`${styles.questionCard} ${styles[status]} ${isCurrent ? styles.current : ''}`}
                  onClick={() => {
                    onNavigateToQuestion(index);
                    onClose();
                  }}
                >
                  <div className={styles.questionNumber}>{index + 1}</div>
                  <div className={styles.questionType}>
                    {question.questionType === 'multiple-choice' ? 'MC' : 'SPR'}
                  </div>
                  <div className={styles.timeSpent}>
                    {formatTimeMMmSSs(getTimeSpent(question.id))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        <div className={styles.footer}>
          <button className={styles.closeButton} onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default TestOverview;
