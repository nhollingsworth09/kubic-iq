import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTest } from '../../contexts/TestContext';
import styles from './TestStarter.module.css';

const TestStarter: React.FC = () => {
  const navigate = useNavigate();
  const { testType } = useParams<{ testType: string }>();
  const { startTest, loading, error } = useTest();
  // Local state for error handling
  const [localError, setLocalError] = useState<string | null>(null);
  
  // Get the test configuration from localStorage (set by MasteryDashboard)
  const [config, setConfig] = useState<{
    type: 'quiz' | 'custom' | 'exam';
    topics: string[];
    numQuestions: number;
  } | null>(null);
  useEffect(() => {
    // Get saved config from localStorage
    const savedConfig = localStorage.getItem('lastQuizConfig');
    
    if (savedConfig) {
      try {
        const parsedConfig = JSON.parse(savedConfig);
        setConfig(parsedConfig);
        
        // Clear the config from localStorage to prevent it from being reused
        // if the user navigates back to this page after a test fails
        localStorage.removeItem('lastQuizConfig');
      } catch (err) {
        console.error('Error parsing saved quiz config:', err);
      }
    }
  }, []); useEffect(() => {
    // Start test when config is loaded
    const startTestProcess = async () => {
      if (config && !loading && !error) {
        try {
          console.log("Starting test with config:", config);
          
          // Check if token exists in localStorage before starting test
          const token = localStorage.getItem('token');
          if (!token) {            // If no token, redirect to login and display error
            console.error('No authentication token found');
            setLocalError('No authentication token found. Please log in again.');
            navigate('/login');
            return;
          }
          
          console.log("Calling startTest function...");
          await startTest(config.type, config.topics, config.numQuestions);
          console.log("Test started successfully, navigating to first question");
          
          // Navigate to first question
          navigate('/test/question/1');
        } catch (err: any) {          console.error('Failed to start test:', err);
          setLocalError(err.message || "Failed to start test");
          
          // If error is authentication related, redirect to login
          if (err.message && (
              err.message.includes('unauthorized') || 
              err.message.includes('authentication') ||
              err.message.includes('token')
            )) {
            navigate('/login');
          }
        }
      }
    };
      startTestProcess();
  }, [config, startTest, navigate, loading, error, setLocalError]);

  // Show loading state
  return (
    <div className={styles.starterContainer}>
      <div className={styles.loaderCard}>
        <div className={styles.spinner}></div>
        <h2>Preparing Your {config?.type === 'quiz' ? 'Quiz' : 'Exam'}</h2>
        <p>Loading questions and setting up your session...</p>        {(error || localError) && (
          <div className={styles.errorMessage}>
            <p>Error: {error || localError}</p>
            <button 
              className={styles.retryButton}
              onClick={() => navigate('/dashboard')}
            >
              Back to Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TestStarter;
