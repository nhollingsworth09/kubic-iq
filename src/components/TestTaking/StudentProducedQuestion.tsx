import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTest } from '../../contexts/TestContext';
import styles from './QuestionStyles.module.css';
import { processLatexInText, refreshMathJax } from '../../utils/latexUtils';

interface StudentProducedQuestionProps {
  onNext?: () => void;
  onPrevious?: () => void;
}

const StudentProducedQuestion: React.FC<StudentProducedQuestionProps> = ({ onNext, onPrevious }) => {
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
  // State for the input
  const [answer, setAnswerText] = useState('');
  
  // Reference for MathJax rendering
  const previewRef = useRef<HTMLDivElement>(null);
  
  // State for showing/hiding directions panel
  const [showDirections, setShowDirections] = useState(true);
  
  // When the question changes, reset the input to the saved answer
  useEffect(() => {
    if (currentQuestion) {
      const currentAnswer = answers.find(a => a.questionId === currentQuestion.id);
      setAnswerText(currentAnswer?.textAnswer || '');
    }
  }, [currentQuestionIndex, answers, currentQuestion]);
    // Render MathJax when answer changes
  useEffect(() => {
    refreshMathJax(previewRef.current);
  }, [answer]);
  
  // If no current question, navigate back to dashboard
  if (!currentQuestion) {
    navigate('/dashboard');
    return null;
  }
  
  // Get the existing answer for this question, if any
  const currentAnswer = answers.find(a => a.questionId === currentQuestion.id);
  const textAnswer = currentAnswer?.textAnswer || '';
  const isMarkedForReview = currentAnswer?.isMarkedForReview || false;
  
  // Save the answer to the context when it changes
  const handleAnswerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sanitizedValue = sanitizeInput(e.target.value);
    setAnswerText(sanitizedValue);
    setAnswer({ textAnswer: sanitizedValue });
  };

  const sanitizeInput = (value: string) => {
    return value.replace(/[^0-9./-]/g, '');
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

  // Utility to convert decimal with 4 places into a simplified LaTeX fraction
  const decimalToFractionLatex = (decimalStr: string) => {
    const num = parseFloat(decimalStr);
    if (isNaN(num)) return '—';
    
    const tolerance = 1.0E-6;
    let h1 = 1, h2 = 0;
    let k1 = 0, k2 = 1;
    let b = num;

    do {
      let a = Math.floor(b);
      let aux = h1;
      h1 = a * h1 + h2;
      h2 = aux;
      aux = k1;
      k1 = a * k1 + k2;
      k2 = aux;
      b = 1 / (b - a);
    } while (Math.abs(num - h1 / k1) > num * tolerance);

    const sign = num < 0 ? '-' : '';
    return `\\(${sign}\\frac{${Math.abs(h1)}}{${k1}}\\)`;
  };

  const getLatexPreview = () => {
    if (!answer) return '—';

    // If it's in fraction form like "3/4"
    if (/^-?\d+\/\d+$/.test(answer)) {
      const [num, den] = answer.split('/');
      return `\\(\\frac{${num}}{${den}}\\)`;
    }

    // Convert decimals with exactly 4 decimal places to LaTeX fraction
    if (/^-?\\d*\\.\\d{4}$/.test(answer)) {
      return decimalToFractionLatex(answer);
    }

    // Default raw LaTeX
    return `\\(${answer}\\)`;
  };
  // This was moved up to the top of the component

  return (
    <div className={styles.studentResponseContainer}>
      {/* Sidebar with directions */}
      {showDirections && (
        <aside className={styles.sidebarPanel}>
          <div className={styles.sidebarHeader}>
            <h3>Student-produced response directions</h3>
            <button 
              onClick={() => setShowDirections(false)}
              className={styles.closeButton}
            >
              &times;
            </button>
          </div>
          <div className={styles.sidebarBody}>
            <ul className={styles.directionsList}>
              <li>If you find more than one correct answer, enter only one answer.</li>
              <li>You can enter up to 5 characters for a positive answer and up to 6 characters for a negative answer.</li>
              <li>If your answer is a fraction that doesn't fit, enter its decimal equivalent.</li>
              <li>If your answer is a decimal that doesn't fit, round or truncate at the fourth digit.</li>
              <li>If your answer is a mixed number (e.g., 3½), enter as <strong>7/2</strong> or <strong>3.5</strong>.</li>
              <li>Don't enter symbols like <code>$</code>, <code>%</code>, or commas.</li>
            </ul>
            <div className={styles.examplesTable}>
              <table>
                <thead>
                  <tr>
                    <th>Answer</th>
                    <th>Acceptable</th>
                    <th>Unacceptable</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>3.5</td>
                    <td>3.5, 3.50, 7/2</td>
                    <td>31/2, 3 1/2</td>
                  </tr>
                  <tr>
                    <td>2/3</td>
                    <td>.666, .6667, 2/3</td>
                    <td>.66, .67</td>
                  </tr>
                  <tr>
                    <td>-1/3</td>
                    <td>-1/3, -.3333</td>
                    <td>-.33</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </aside>
      )}

      {/* Main content */}
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
          {!showDirections && (
            <button 
              onClick={() => setShowDirections(true)}
              className={styles.showDirectionsButton}
            >
              Show Directions
            </button>
          )}
        </div>        <div className={styles.questionText}
             dangerouslySetInnerHTML={{ __html: processLatexInText(currentQuestion.text) }}
             ref={el => {
               if (el) refreshMathJax(el);
             }} />

        <div className={styles.studentResponseInput}>
          <input
            type="text"
            className={styles.studentInput}
            placeholder="Enter your answer"
            value={answer}
            onChange={handleAnswerChange}
            maxLength={6} // Allow for negative sign + 5 characters
          />

          <div className={styles.answerPreview} ref={previewRef}>
            <strong>Answer Preview:</strong>{' '}
            <span dangerouslySetInnerHTML={{ __html: getLatexPreview() }} />
          </div>
        </div>        <div className={styles.navigationButtons}>
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
    </div>
  );
};

export default StudentProducedQuestion;
