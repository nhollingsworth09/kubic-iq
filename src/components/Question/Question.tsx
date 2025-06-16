import { useState } from 'react';
import styles from './Question.module.css';

interface Option {
  id: string;
  text: string;
}

interface QuestionProps {
  id: string;
  text: string;
  options: Option[];
  onAnswer: (questionId: string, answerId: string) => void;
  isSubmitting?: boolean;
}

export const Question = ({ 
  id, 
  text, 
  options, 
  onAnswer, 
  isSubmitting = false 
}: QuestionProps) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const handleSubmit = () => {
    if (selectedOption && !isSubmitting) {
      onAnswer(id, selectedOption);
    }
  };

  return (
    <div className={styles.question}>
      <div className={styles.questionText}>
        <h2 className={styles.questionNumber}>Question {id}</h2>
        <p className={styles.text}>{text}</p>
      </div>

      <div className={styles.options}>
        {options.map((option) => (
          <button
            key={option.id}
            className={`${styles.option} ${
              selectedOption === option.id ? styles.selected : ''
            }`}
            onClick={() => setSelectedOption(option.id)}
            disabled={isSubmitting}
          >
            <span className={styles.optionLabel}>{option.id}.</span>
            <span className={styles.optionText}>{option.text}</span>
          </button>
        ))}
      </div>

      <div className={styles.actions}>
        <button
          className={styles.submitButton}
          onClick={handleSubmit}
          disabled={!selectedOption || isSubmitting}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Answer'}
        </button>
      </div>
    </div>
  );
};
