import styles from './Badge.module.css';

interface BadgeProps {
  locked?: boolean;
  children?: React.ReactNode;
}

export const Badge = ({ locked = false, children }: BadgeProps) => {
  return (
    <div className={`${styles.badge} ${locked ? styles.locked : styles.unlocked}`}>
      {locked ? (
        <svg className={styles.icon} viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/>
        </svg>
      ) : (
        <svg className={styles.icon} viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/>
        </svg>
      )}
      {children}
    </div>
  );
};
