import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTest } from '../../contexts/TestContext';
import styles from './TestLayout.module.css';
import { formatTimeMMSS } from '../../utils/timeUtils';
import TestOverview from './TestOverview/TestOverview';
import ConfirmDialog from './ConfirmDialog/ConfirmDialog';

interface TestLayoutProps {
  children: React.ReactNode;
  showSidebar?: boolean;
}

export const TestLayout: React.FC<TestLayoutProps> = ({ children, showSidebar = false }) => {
  const navigate = useNavigate();
  const { 
    remainingTime,
    submitTest,
    exitTest,
    questions,
    currentQuestionIndex,
    goToQuestion
  } = useTest();
  // Using the shared formatTimeMMSS utility for the timer
  
  // State for showing the test overview modal
  const [showOverview, setShowOverview] = useState(false);
  
  // State for confirm dialogs (exit and submit)
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  // Handle navigation from test overview to specific question
  const handleNavigateToQuestion = (index: number) => {
    navigate(`/test/question/${index + 1}`);
  };

  // Exit confirmation with custom dialog
  const handleExitClick = () => {
    setShowExitConfirm(true);
  };

  const confirmExit = () => {
    exitTest();
    navigate('/dashboard');
  };

  // Submit confirmation with custom dialog
  const handleSubmitClick = () => {
    setShowSubmitConfirm(true);
  };

  const confirmSubmit = () => {
    submitTest().then(() => {
      navigate('/test/results');
    });
  };

  return (
    <div className={styles.testContainer}>
      {/* Header with timer */}      <header className={styles.testHeader}>
        <div className={styles.left}>
          <button 
            className={styles.overviewButton} 
            onClick={() => setShowOverview(true)}
          >
            Test Overview
          </button>
          <button className={styles.linkButton}>Formula Sheets</button>
        </div>
        <div className={styles.center}>          
          <span className={`${styles.timer} ${remainingTime < 300 ? styles.timerWarning : ''}`}>
            {formatTimeMMSS(remainingTime)}
          </span>
        </div>
        <div className={styles.right}>
          <button className={styles.submitButton} onClick={handleSubmitClick}>
            Submit Test
          </button>
          <button className={styles.exitButton} onClick={handleExitClick}>
            Exit Practice
          </button>
        </div>
      </header>

      {/* Main content area with optional sidebar */}
      <div className={`${styles.testContent} ${showSidebar ? styles.withSidebar : ''}`}>
        {showSidebar && (
          <aside className={styles.testSidebar}>
            <div className={styles.questionProgress}>
              <h3>Questions ({currentQuestionIndex + 1} of {questions.length})</h3>
              <div className={styles.questionNav}>
                {questions.map((_, index) => (
                  <div
                    key={index}
                    className={`${styles.questionDot} ${
                      index === currentQuestionIndex ? styles.active : ''
                    }`}
                    onClick={() => navigate(`/test/question/${index + 1}`)}
                  >
                    {index + 1}
                  </div>
                ))}
              </div>
            </div>
          </aside>
        )}

        {/* Main question area */}        <main className={styles.testMain}>
          {children}
        </main>
      </div>

      {/* Test Overview Modal */}
      {showOverview && (
        <TestOverview 
          onClose={() => setShowOverview(false)} 
          onNavigateToQuestion={handleNavigateToQuestion} 
        />
      )}

      {/* Custom Confirm Dialogs */}
      <ConfirmDialog
        isOpen={showExitConfirm}
        title="Exit Test"
        message="Are you sure you want to exit? Your progress will be lost."
        onConfirm={confirmExit}
        onCancel={() => setShowExitConfirm(false)}
      />

      <ConfirmDialog
        isOpen={showSubmitConfirm}
        title="Submit Test"
        message="Are you sure you want to submit your test?"
        onConfirm={confirmSubmit}
        onCancel={() => setShowSubmitConfirm(false)}
      />
    </div>
  );
};
