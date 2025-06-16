import { useState } from 'react';
import clsx from 'clsx';
import { Loading } from '../Loading/Loading';
import styles from './Question.module.css';

interface Option {
  id: string;
  text: string;
}

interface QuestionData {
  id: string;
  text: string;
  options: Option[];
  correctAnswer: string;
  explanation: string;
  difficulty: number;
}

interface QuestionProps {
  question: QuestionData;
  onAnswer: (answerId: string) => void;
  isLoading?: boolean;
}

export const Question = ({ 
  question,
  onAnswer,
  isLoading = false
}: QuestionProps) => {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  const handleOptionClick = (optionId: string) => {
    if (selectedAnswer || isLoading) return;
    
    setSelectedAnswer(optionId);
    setShowExplanation(true);
    onAnswer(optionId);
  };

  if (isLoading) {
    return <div data-testid="loading-indicator"><Loading /></div>;
  }

  return (
    <div className={styles.question}>
      <div className={styles.questionText}>
        <p>{question.text}</p>
      </div>

      <div className={styles.options}>
        {question.options.map((option) => (
          <button
            key={option.id}
            onClick={() => handleOptionClick(option.id)}
            disabled={!!selectedAnswer}
            className={clsx(styles.option, {
              [styles.selected]: selectedAnswer === option.id,
              [styles.correct]: selectedAnswer && option.id === question.correctAnswer
            })}
          >
            {option.text}
          </button>
        ))}
      </div>

      {showExplanation && (
        <div className={styles.explanation}>
          <p>{question.explanation}</p>
        </div>
      )}
    </div>
  );
};
