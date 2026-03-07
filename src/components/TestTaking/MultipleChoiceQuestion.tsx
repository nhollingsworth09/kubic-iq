import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTest } from '../../contexts/TestContext';
import styles from './QuestionStyles.module.css';
import { processLatexInText, refreshMathJax } from '../../utils/latexUtils';
import QuestionHeader from './QuestionHeader';

interface MultipleChoiceQuestionProps {
  onNext?: () => void;
  onPrevious?: () => void;
}

const MultipleChoiceQuestion: React.FC<MultipleChoiceQuestionProps> = ({ onNext, onPrevious }) => {
  const navigate = useNavigate();
  const { 
    questions, 
    currentQuestionIndex, 
    answers, 
    setAnswer, 
    toggleMarkForReview,
    goToNextQuestion,
    goToPreviousQuestion
  } = useTest();
  const currentQuestion = questions[currentQuestionIndex];
  // State for eliminated options
  const [eliminated, setEliminated] = useState<number[]>([]);
  
  // When the question changes, reset eliminations
  useEffect(() => {
    setEliminated([]);
  }, [currentQuestionIndex]);
  
  // If no current question, navigate back to dashboard
  if (!currentQuestion) {
    navigate('/dashboard');
    return null;
  }
  
  // Get the existing answer for this question, if any
  const currentAnswer = answers.find(a => a.questionId === currentQuestion.id);
  const selectedOption = currentAnswer?.selectedOption;
  const isMarkedForReview = currentAnswer?.isMarkedForReview || false;
  
  // For multiple choice questions, we assume options exist
  const options = currentQuestion.options || [];

  const handleSelect = (optionIndex: number) => {
    // Don't select eliminated options
    if (!eliminated.includes(optionIndex)) {
      setAnswer({ selectedOption: optionIndex });
    }
  };

  const toggleEliminate = (optionIndex: number, event: React.MouseEvent) => {
    event.stopPropagation();
    
    setEliminated(prev => {
      if (prev.includes(optionIndex)) {
        return prev.filter(idx => idx !== optionIndex);
      } else {
        // If this option was selected, deselect it
        if (selectedOption === optionIndex) {
          setAnswer({ selectedOption: undefined });
        }
        return [...prev, optionIndex];
      }
    });
  };

  const handleBack = () => {
    if (onPrevious) {
      onPrevious();
    } else {
      goToPreviousQuestion();
    }
  };

  const handleNext = () => {
    if (onNext) {
      onNext();
    } else {
      goToNextQuestion();
    }
  };

  return (
    <div className={styles.questionContainer}>
      <div className={styles.questionMeta}>
        <span className={styles.questionProgress}>
          Question {currentQuestionIndex + 1} of {questions.length}
        </span>
        <label className={styles.markReview}>
          <input
            type="checkbox"
            checked={isMarkedForReview}
            onChange={() => toggleMarkForReview()}
          />
          Mark for Review
        </label>
      </div>      <div className={styles.questionText} 
           dangerouslySetInnerHTML={{ __html: processLatexInText(currentQuestion.text) }}
           ref={el => {
             if (el) refreshMathJax(el);
           }} />

      <ul className={styles.choices}>
        {options.map((option, index) => (
          <li
            key={index}
            className={`${styles.choice} 
              ${selectedOption === index ? styles.selected : ''} 
              ${eliminated.includes(index) ? styles.eliminated : ''}`}
            onClick={() => handleSelect(index)}
          >
            <div className={styles.choiceLeft}>
              <span className={styles.choiceLabel}>
                {String.fromCharCode(65 + index)} {/* A, B, C, D... */}
              </span>
              <span 
                className={styles.choiceText} 
                dangerouslySetInnerHTML={{ __html: processLatexInText(option) }}
                ref={el => {
                  if (el) refreshMathJax(el);
                }} />
            </div>
            <button 
              className={styles.eliminateButton}
              onClick={(e) => toggleEliminate(index, e)}
            >
              {eliminated.includes(index) ? 'Undo' : '⊝'}
            </button>
          </li>
        ))}
      </ul>      <div className={styles.navigationButtons}>
        {currentQuestionIndex > 0 && (
          <button 
            className={styles.navButton}
            onClick={handleBack}
          >
            Back
          </button>
        )}
        {currentQuestionIndex < questions.length - 1 && (
          <button 
            className={`${styles.navButton} ${styles.primary}`}
            onClick={handleNext}
          >
            Next
          </button>
        )}
      </div>
    </div>
  );
};

export default MultipleChoiceQuestion;
