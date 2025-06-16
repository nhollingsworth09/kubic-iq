import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import styles from './Dashboard.module.css';

export const Dashboard = () => {
  const { user, logout } = useAuth();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Animate progress bar on mount
    const timer = setTimeout(() => {
      setProgress(user?.masteryScore || 0);
    }, 300);
    return () => clearTimeout(timer);
  }, [user?.masteryScore]);

  if (!user) return null;

  return (
    <div className={styles.dashboard}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.greeting}>
            Welcome back, <span className={styles.userName}>{user.name}</span>
          </h1>
          <button onClick={logout} className={styles.logoutButton}>
            Logout
          </button>
        </div>
      </header>

      <main className={styles.main}>
        <section className={styles.scoreCard}>
          <h2 className={styles.scoreTitle}>Your Progress</h2>
          <div className={styles.scoreContent}>
            <div className={styles.scoreValue}>
              <span className={styles.score}>{Math.round(user.masteryScore * 100)}%</span>
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
