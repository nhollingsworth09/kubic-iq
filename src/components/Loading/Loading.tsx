import styles from './Loading.module.css';

interface LoadingProps {
  message?: string;
}

export const Loading = ({ message = 'Loading...' }: LoadingProps) => {
  return (
    <div className={styles.loading}>
      <div className={styles.spinner} data-testid="loading-spinner" />
      <p className={styles.message}>{message}</p>
    </div>
  );
};
