import styles from './ProgressBar.module.css';

interface ProgressBarProps {
  value: number; // Value between 0 and 1
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  showPercentage?: boolean;
}

export const ProgressBar = ({ 
  value, 
  label, 
  size = 'md', 
  showPercentage = true 
}: ProgressBarProps) => {
  const percentage = Math.round(value * 100);
  
  return (
    <div className={styles.wrapper}>
      {label && <div className={styles.label}>{label}</div>}
      
      <div className={`${styles.progressBar} ${styles[size]}`}>
        <div 
          className={styles.fill} 
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={percentage}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
      
      {showPercentage && (
        <div className={styles.percentage}>{percentage}%</div>
      )}
    </div>
  );
};
