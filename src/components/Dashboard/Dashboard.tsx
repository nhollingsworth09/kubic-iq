import { useEffect, useState } from 'react';
import styles from './Dashboard.module.css';

interface DashboardProps {
  userName: string;
  masteryScore?: number;
  onLogout: () => void;
}

export const Dashboard = ({ userName, masteryScore = 0, onLogout }: DashboardProps) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Animate progress bar on mount
    const timer = setTimeout(() => {
      setProgress(masteryScore);
    }, 300);
    return () => clearTimeout(timer);
  }, [masteryScore]);

  return (
    <div className={styles.dashboard}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.greeting}>
            Welcome back, <span className={styles.userName}>{userName}</span>
          </h1>
          <button onClick={onLogout} className={styles.logoutButton}>
            Logout
          </button>
        </div>
      </header>

      <main className={styles.main}>
        <section className={styles.scoreCard}>
          <h2 className={styles.scoreTitle}>Your Progress</h2>
          <div className={styles.scoreContent}>
            <div className={styles.scoreValue}>
              <span className={styles.score}>{Math.round(masteryScore * 100)}%</span>
              <span className={styles.scoreLabel}>Mastery</span>
            </div>
            <div className={styles.progressBar}>
              <div 
                className={styles.progressFill}
                style={{ width: `${progress * 100}%` }}
              />
            </div>
          </div>
        </section>

        <section className={styles.actionCards}>
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Practice Questions</h3>
            <p className={styles.cardDescription}>
              Continue your SAT prep with adaptive questions tailored to your level.
            </p>
            <button className={styles.cardButton}>Start Practice</button>
          </div>

          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Review Mistakes</h3>
            <p className={styles.cardDescription}>
              Learn from your previous attempts and strengthen your weak areas.
            </p>
            <button className={styles.cardButton}>View History</button>
          </div>

          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Study Resources</h3>
            <p className={styles.cardDescription}>
              Access study guides and tips to improve your score.
            </p>
            <button className={styles.cardButton}>Browse Resources</button>
          </div>
        </section>
      </main>
    </div>
  );
};
