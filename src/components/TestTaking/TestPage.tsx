import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTest } from '../../contexts/TestContext';
import { TestLayout } from './TestLayout';
import MultipleChoiceQuestion from './MultipleChoiceQuestion';
import StudentProducedQuestion from './StudentProducedQuestion';
import styles from './TestPage.module.css';

const TestPage: React.FC = () => {
  const { questionNumber } = useParams();
  const navigate = useNavigate();
  const { 
    questions, 
    currentQuestionIndex, 
    goToQuestion, 
    isTestComplete,
    testType 
  } = useTest();

  // Convert question number param to index
  const qNumAsIndex = questionNumber ? parseInt(questionNumber) - 1 : 0;

  // Sync URL param with current question index
  useEffect(() => {
    if (qNumAsIndex !== currentQuestionIndex && qNumAsIndex >= 0 && qNumAsIndex < questions.length) {
      goToQuestion(qNumAsIndex);
    }
  }, [qNumAsIndex, currentQuestionIndex, goToQuestion, questions.length]);

  // Redirect if test is complete
  useEffect(() => {
    if (isTestComplete) {
      navigate('/test/results');
    }
  }, [isTestComplete, navigate]);

  // If there are no questions, navigate back to dashboard
  if (questions.length === 0) {
    navigate('/dashboard');
    return null;
  }

  // Handle navigation
  const handleNextQuestion = () => {
    const nextIndex = currentQuestionIndex + 1;
    if (nextIndex < questions.length) {
      navigate(`/test/question/${nextIndex + 1}`);
    }
  };

  const handlePreviousQuestion = () => {
    const prevIndex = currentQuestionIndex - 1;
    if (prevIndex >= 0) {
      navigate(`/test/question/${prevIndex + 1}`);
    }
  };

  // Get current question
  const currentQuestion = questions[currentQuestionIndex];
  
  return (
    <TestLayout showSidebar={true}>
      {currentQuestion && (
        <>
          {currentQuestion.questionType === 'multiple-choice' ? (
            <MultipleChoiceQuestion
              onNext={handleNextQuestion}
              onPrevious={handlePreviousQuestion}
            />
          ) : (
            <StudentProducedQuestion
              onNext={handleNextQuestion}
              onPrevious={handlePreviousQuestion}
            />
          )}
        </>
      )}
    </TestLayout>
  );
};

export default TestPage;
