import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTest } from '../../contexts/TestContext';
import styles from './QuestionStyles.module.css';
import reviewStyles from './QuestionReview.module.css';
import { processLatexInText, refreshMathJax } from '../../utils/latexUtils';

const QuestionReview: React.FC = () => {
  const { questionNumber } = useParams();
  const navigate = useNavigate();
  const { questions, answers } = useTest();
  
  const questionIndex = questionNumber ? parseInt(questionNumber) - 1 : 0;
  const question = questions[questionIndex];
  
  if (!question) {
    navigate('/test/results');
    return null;
  }

  const currentAnswer = answers.find(a => a.questionId === question.id);
  const options = question.questionType === 'multiple-choice' ? question.options || [] : [];
  
  const handleBackToResults = () => {
    navigate('/test/results');
  };

  return (
    <div className={reviewStyles.reviewContainer}>
      <header className={reviewStyles.reviewHeader}>
        <h2>Question {questionIndex + 1} Review</h2>
        <div className={reviewStyles.resultBadge} 
             data-correct={currentAnswer?.isCorrect ? 'true' : 'false'}>
          {currentAnswer?.isCorrect ? 'Correct' : 'Incorrect'}
        </div>
      </header>
      
      <div className={reviewStyles.reviewContent}>
        {/* Question Text */}
        <div 
          className={styles.questionText} 
          dangerouslySetInnerHTML={{ __html: processLatexInText(question.text) }}
          ref={el => { if (el) refreshMathJax(el); }} 
        />
        
        {/* Multiple Choice Question */}
        {question.questionType === 'multiple-choice' && (
          <ul className={styles.choices}>
            {options.map((option, index) => {
              const correctOption = typeof question.correctAnswer === 'string' 
                ? parseInt(question.correctAnswer, 10) 
                : question.correctAnswer;
              const isCorrectOption = index === correctOption;
              const isSelectedOption = index === currentAnswer?.selectedOption;
              
              return (
                <li
                  key={index}
                  className={`${styles.choice} 
                    ${isCorrectOption ? reviewStyles.correctOption : ''} 
                    ${isSelectedOption && !isCorrectOption ? reviewStyles.incorrectSelection : ''}`}
                >
                  <div className={styles.choiceLeft}>
                    <span className={styles.choiceLabel}>
                      {String.fromCharCode(65 + index)} {/* A, B, C, D... */}
                    </span>
                    <span 
                      className={styles.choiceText} 
                      dangerouslySetInnerHTML={{ __html: processLatexInText(option) }}
                      ref={el => { if (el) refreshMathJax(el); }} 
                    />
                  </div>
                  
                  {isCorrectOption && (
                    <div className={reviewStyles.correctIcon}>✓</div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
        
        {/* Student Produced Response */}
        {question.questionType === 'student-produced' && (
          <div className={reviewStyles.studentResponse}>
            <div className={reviewStyles.responseSection}>
              <h3>Your Answer</h3>
              <div className={reviewStyles.answerBox}>
                {currentAnswer?.textAnswer || 'No answer provided'}
              </div>
            </div>
            
            <div className={reviewStyles.responseSection}>
              <h3>Correct Answer</h3>
              <div className={`${reviewStyles.answerBox} ${reviewStyles.correctAnswer}`}>
                {question.correctAnswer}
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className={styles.navigationButtons}>
        <button 
          className={`${styles.navButton} ${styles.primary}`}
          onClick={handleBackToResults}
        >
          Back to Results
        </button>
      </div>
    </div>
  );
};

export default QuestionReview;
