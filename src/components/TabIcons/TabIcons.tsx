import styles from './TabIcons.module.css';

export const TabIcons = () => {
  return (
    <div className={styles.tabContainer}>
      <div className={`${styles.tab} ${styles.active}`}>
        <svg className={styles.icon} viewBox="0 0 24 24" fill="currentColor">
          <path d="M17 3H7c-1.1 0-1.99.9-1.99 2L5 21l7-3 7 3V5c0-1.1-.9-2-2-2z"/>
        </svg>
      </div>
      <div className={styles.tab}>
        <svg className={styles.icon} viewBox="0 0 24 24" fill="currentColor">
          <path d="M16 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zM4 18v-1c0-1.1.9-2 2-2s2 .9 2 2v1h2v-1c0-2.21-1.79-4-4-4s-4 1.79-4 4v1h2zm0 2v2h16v-2H4z"/>
        </svg>
      </div>
      <div className={styles.tab}>
        <svg className={styles.icon} viewBox="0 0 24 24" fill="currentColor">
          <path d="M6 2v6h.01L6 8.01 10 12l-4 4 .01.01H6V22h12v-5.99h-.01L18 16l-4-4 4-3.99-.01-.01H18V2H6z"/>
        </svg>
      </div>
    </div>
  );
};
