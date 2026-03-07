import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTest } from '../../contexts/TestContext';
import TestOverview from './TestOverview/TestOverview';
import styles from './QuestionHeader.module.css';
import { formatTimeMMSS, formatTimeMMmSSs } from '../../utils/timeUtils';

interface QuestionHeaderProps {
  onExit?: () => void;
}

const QuestionHeader: React.FC<QuestionHeaderProps> = ({ onExit }) => {
  const navigate = useNavigate();
  const {
    questions,
    currentQuestionIndex,
    remainingTime,
    testDuration,
    timeTracking
  } = useTest();
  
  const [showOverview, setShowOverview] = useState(false);
  
  // Handle navigation from test overview to specific question
  const handleNavigateToQuestion = (index: number) => {
    navigate(`/test/question/${index + 1}`);
  };
    // Using shared time formatting utilities
  
  // Calculate time spent on current question
  const getCurrentQuestionTimeSpent = () => {
    if (questions.length === 0) return 0;
    
    const currentQuestionId = questions[currentQuestionIndex].id;
    const trackingInfo = timeTracking.find(t => t.questionId === currentQuestionId);
    
    return trackingInfo ? trackingInfo.timeSpent : 0;
  };
  
  return (
    <div className={styles.header}>
      <div className={styles.leftSection}>
        <div className={styles.questionNumber}>
          Question {currentQuestionIndex + 1} of {questions.length}
        </div>
        <div className={styles.questionTime}>
          Time on question: {formatTimeMMmSSs(getCurrentQuestionTimeSpent())}
        </div>
      </div>
      
      <div className={styles.middleSection}>
        <button 
          className={styles.overviewButton}
          onClick={() => setShowOverview(true)}
        >
          Test Overview
        </button>
      </div>
      
      <div className={styles.rightSection}>
        <div className={styles.timerBox}>
          <div className={styles.timerLabel}>Remaining Time:</div>          <div className={styles.timer}>
            {formatTimeMMSS(remainingTime)}
          </div>
        </div>
        
        {onExit && (
          <button 
            className={styles.exitButton}
            onClick={onExit}
          >
            Exit Test
          </button>
        )}
      </div>
        {showOverview && (
        <TestOverview 
          onClose={() => setShowOverview(false)} 
          onNavigateToQuestion={handleNavigateToQuestion}
        />
      )}
    </div>
  );
};

export default QuestionHeader;
