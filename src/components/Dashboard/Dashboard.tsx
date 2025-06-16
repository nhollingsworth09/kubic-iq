import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { MasteryDashboard } from '../MasteryDashboard/MasteryDashboard';
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
      </header>      <main className={styles.main}>
        <MasteryDashboard />
      </main>
    </div>
  );
};
