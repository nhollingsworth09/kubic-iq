import { Badge } from '../Badge/Badge';
import styles from './HexagonScore.module.css';

interface HexagonScoreProps {
  score?: number;
  maxScore?: number;
  locked?: boolean;
}

export const HexagonScore = ({ score = 144, maxScore = 200, locked = true }: HexagonScoreProps) => {
  return (
    <div className={styles.container}>
      <div className={styles.hexagon}>
        <div className={styles.hexagonInner}>
          {locked ? (
            <svg className={styles.lockIcon} viewBox="0 0 24 24" fill="currentColor">
              <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
            </svg>
          ) : (
            <div className={styles.scoreDisplay}>
              <div className={styles.score}>{score}</div>
              <div className={styles.maxScore}>/{maxScore}</div>
            </div>
          )}
        </div>
      </div>
      <div className={styles.statusText}>
        {locked ? (
          <span>{score}/{maxScore} <Badge locked>Unlock...</Badge></span>
        ) : (
          <span>Mastery Score: {score}/{maxScore}</span>
        )}
      </div>
    </div>
  );
};
