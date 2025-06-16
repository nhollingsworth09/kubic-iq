import styles from './ResourceCard.module.css';

interface ResourceCardProps {
  title: string;
  icon: 'formula' | 'guide' | 'ready';
  onClick?: () => void;
}

export const ResourceCard = ({ title, icon, onClick }: ResourceCardProps) => {
  const getIcon = () => {
    switch (icon) {
      case 'formula':
        return (
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
        );
      case 'guide':
        return (
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
          </svg>
        );
      case 'ready':
        return (
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className={styles.card} onClick={onClick}>
      <div className={styles.iconContainer}>
        {getIcon()}
      </div>
      <span className={styles.title}>{title}</span>
    </div>
  );
};
