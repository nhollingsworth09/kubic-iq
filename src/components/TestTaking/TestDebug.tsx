import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTest } from '../../contexts/TestContext';
import styles from './TestDebug.module.css';

/**
 * Test component to directly launch a test without going through
 * the MasteryDashboard
 */
const TestDebug: React.FC = () => {
  const navigate = useNavigate();
  const { startTest, loading, error } = useTest();
  
  // Function to start a quiz with predefined parameters
  const handleStartQuiz = async () => {
    try {
      console.log("Starting quiz from debug component...");
      await startTest('quiz', ['Algebra', 'Advanced Math'], 5);
      navigate('/test/question/1');
    } catch (err) {
      console.error("Failed to start quiz:", err);
    }
  };
  
  // Function to start a custom exam with predefined parameters
  const handleStartCustomExam = async () => {
    try {
      console.log("Starting custom exam from debug component...");
      await startTest('custom', ['Algebra', 'Advanced Math', 'Problem Solving & Data Analysis'], 10);
      navigate('/test/question/1');
    } catch (err) {
      console.error("Failed to start custom exam:", err);
    }
  };
  
  // Function to start a mock exam with predefined parameters
  const handleStartMockExam = async () => {
    try {
      console.log("Starting mock exam from debug component...");
      await startTest('exam', ['Algebra', 'Advanced Math', 'Problem Solving & Data Analysis', 'Geometry & Trigonometry'], 15);
      navigate('/test/question/1');
    } catch (err) {
      console.error("Failed to start mock exam:", err);
    }
  };
  
  return (
    <div className={styles.debugContainer}>
      <h1>Test System Debug</h1>
      <p>Use the buttons below to directly launch different test types:</p>
      
      <div className={styles.buttonContainer}>
        <button 
          className={styles.testButton}
          onClick={handleStartQuiz}
          disabled={loading}
        >
          Start Test Quiz (5 questions)
        </button>
        
        <button 
          className={styles.testButton}
          onClick={handleStartCustomExam}
          disabled={loading}
        >
          Start Custom Exam (10 questions)
        </button>
        
        <button 
          className={styles.testButton}
          onClick={handleStartMockExam}
          disabled={loading}
        >
          Start Mock Exam (15 questions)
        </button>
      </div>
      
      {loading && (
        <div className={styles.loadingMessage}>
          <p>Loading test...</p>
        </div>
      )}
      
      {error && (
        <div className={styles.errorMessage}>
          <h3>Error</h3>
          <p>{error}</p>
        </div>
      )}
      
      <button 
        className={styles.backButton}
        onClick={() => navigate('/dashboard')}
      >
        Back to Dashboard
      </button>
    </div>
  );
};

export default TestDebug;
