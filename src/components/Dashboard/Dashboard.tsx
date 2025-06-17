import { useAuth } from '../../contexts/AuthContext';
import { MasteryDashboard } from '../MasteryDashboard/MasteryDashboard';
import styles from './Dashboard.module.css';

export const Dashboard = () => {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className={styles.dashboard}>
      <main className={styles.main}>
        <MasteryDashboard />
      </main>
    </div>
  );
};
