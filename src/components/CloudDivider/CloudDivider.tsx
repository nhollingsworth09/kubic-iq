import styles from './CloudDivider.module.css';

export const CloudDivider = () => (
  <div className={styles.cloudDivider}>
    <svg 
      viewBox="0 0 100 100" 
      preserveAspectRatio="none"
      className={styles.cloudSvg}
    >
      <path
        d="M0,0 
           C30,20 70,0 100,15 
           L100,100 
           L0,100 
           Z"
        fill="white"
      />
    </svg>
  </div>
);
