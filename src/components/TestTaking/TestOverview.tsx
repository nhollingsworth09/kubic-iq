import React from 'react';
import { useTest } from '../../contexts/TestContext';
import styles from './TestOverview.module.css';

interface TestOverviewProps {
  onClose: () => void;
}

const TestOverview: React.FC<TestOverviewProps> = ({ onClose }) => {
  const { 
    questions, 
    currentQuestionIndex, 
    answers, 
    timeTracking,
    goToQuestion
  } = useTest();

  // Format time display as MM min SS seconds
  const formatTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    
    if (minutes === 0) {
      return `${seconds}s`;
    }
    
    return `${minutes}m ${seconds}s`;
  };

  // Handle click on a question to navigate to it
  const handleQuestionClick = (index: number) => {
    goToQuestion(index);
    onClose();
  };

  // Get the status of each question
  const getQuestionStatuses = () => {
    return questions.map((question, index) => {
      const answer = answers.find(a => a.questionId === question.id);
      const track = timeTracking.find(t => t.questionId === question.id);
      
      let status = 'not-answered';
      if (answer) {
        if (question.questionType === 'multiple-choice' && answer.selectedOption !== undefined) {
          status = 'answered';
        } else if (question.questionType === 'student-produced' && answer.textAnswer) {
          status = 'answered';
        }
      }

      const isMarkedForReview = answer?.isMarkedForReview || false;
      const timeSpent = track ? track.timeSpent : 0;

      return {
        index,
        questionNumber: index + 1,
        status,
        isMarkedForReview,
        timeSpent,
        isCurrent: index === currentQuestionIndex
      };
    });
  };

  const questionStatuses = getQuestionStatuses();

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2>Test Overview</h2>
          <button className={styles.closeButton} onClick={onClose}>×</button>
        </div>
        
        <div className={styles.content}>
          <div className={styles.legend}>
            <div className={styles.legendItem}>
              <span className={`${styles.statusIndicator} ${styles.current}`}></span>
              <span>Current Question</span>
            </div>
            <div className={styles.legendItem}>
              <span className={`${styles.statusIndicator} ${styles.answered}`}></span>
              <span>Answered</span>
            </div>
            <div className={styles.legendItem}>
              <span className={`${styles.statusIndicator} ${styles.notAnswered}`}></span>
              <span>Not Answered</span>
            </div>
            <div className={styles.legendItem}>
              <span className={`${styles.statusIndicator} ${styles.review}`}></span>
              <span>Marked for Review</span>
            </div>
          </div>
          
          <div className={styles.questionsGrid}>
            {questionStatuses.map((q) => (
              <div 
                key={q.index} 
                className={`${styles.questionItem} 
                  ${q.isCurrent ? styles.current : ''} 
                  ${q.status === 'answered' ? styles.answered : styles.notAnswered}
                  ${q.isMarkedForReview ? styles.review : ''}`}
                onClick={() => handleQuestionClick(q.index)}
              >
                <div className={styles.questionNumber}>{q.questionNumber}</div>
                <div className={styles.questionTime}>{formatTime(q.timeSpent)}</div>
              </div>
            ))}
          </div>
        </div>
        
        <div className={styles.footer}>
          <div className={styles.stats}>
            <div>Answered: {questionStatuses.filter(q => q.status === 'answered').length} / {questions.length}</div>
            <div>Marked for Review: {questionStatuses.filter(q => q.isMarkedForReview).length}</div>
          </div>
          <button className={styles.closeButton} onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default TestOverview;
