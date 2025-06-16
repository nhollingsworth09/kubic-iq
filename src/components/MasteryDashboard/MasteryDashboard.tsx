import { Badge } from '../Badge/Badge';
import { TabIcons } from '../TabIcons/TabIcons';
import { HexagonScore } from '../HexagonScore/HexagonScore';
import { ResourceCard } from '../ResourceCard/ResourceCard';
import styles from './MasteryDashboard.module.css';

export const MasteryDashboard = () => {
  const practiceOptions = [
    'Build a Custom Quiz',
    'Build a Custom Exam',
    'Take a Mock Exam'
  ];

  const resources = [
    { title: 'View Formula Sheet', icon: 'formula' as const },
    { title: 'Guide to Written-Answer Questions', icon: 'guide' as const },
    { title: 'Knowing You\'re Ready', icon: 'ready' as const }
  ];

  return (
    <div className={styles.dashboardContainer}>
      <div className={styles.dashboardCard}>
        {/* Header Section */}
        <div className={styles.dashboardHeader}>
          <div className={styles.headerTop}>
            <div className={styles.titleIcon}>
              <svg className={styles.headerIcon} viewBox="0 0 24 24" fill="currentColor">
                <path d="M17 3H7c-1.1 0-1.99.9-1.99 2L5 21l7-3 7 3V5c0-1.1-.9-2-2-2z"/>
              </svg>
              Practice Mastery
            </div>
            <div className={styles.masteryLabel}>
              Mastery Score <Badge locked />
            </div>
          </div>
          <TabIcons />
        </div>

        {/* Main Content */}
        <div className={styles.dashboardMain}>
          {/* Left Panel */}
          <div className={styles.leftPanel}>
            <div className={styles.introBox}>
              <h2>Grade 200 points to unlock your Mastery Score</h2>
              <p>
                To get started, take a practice quiz or exam. Based on your performance, 
                we'll show you a personalized mastery score and track your progress.
              </p>
              <button className={styles.primaryInput}>
                <svg className={styles.searchIcon} viewBox="0 0 24 24" fill="currentColor">
                  <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                </svg>
                Build a Custom Quiz
              </button>
            </div>

            <div className={styles.morePractice}>
              <h3>More Ways to Practice</h3>
              <div className={styles.practiceOptions}>
                {practiceOptions.map((option, index) => (
                  <button key={index} className={styles.practiceButton}>
                    {option}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Panel */}
          <div className={styles.rightPanel}>
            <HexagonScore score={144} maxScore={200} locked />
            
            <div className={styles.resourceLinks}>
              <h3>Additional Resources</h3>
              <div className={styles.resourceCards}>
                {resources.map((resource, index) => (
                  <ResourceCard
                    key={index}
                    title={resource.title}
                    icon={resource.icon}
                    onClick={() => console.log(`Clicked: ${resource.title}`)}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
