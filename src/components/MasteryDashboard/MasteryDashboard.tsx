import { useState, useEffect } from 'react';
import { Badge } from '../Badge/Badge';
import { TabIcons } from '../TabIcons/TabIcons';
import { HexagonScore } from '../HexagonScore/HexagonScore';
import { ResourceCard } from '../ResourceCard/ResourceCard';
import styles from './MasteryDashboard.module.css';

// Minimum number of answers needed to show mastery score
const MIN_ANSWERS = 25;

interface UserProgress {
  responseCount: number;
  masteryScore: number | null;
}

export const MasteryDashboard = () => {
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  
  useEffect(() => {
    // Fetch user progress from backend
    const fetchUserProgress = async () => {
      try {
        // Replace with your actual API endpoint
        const response = await fetch('/api/user/progress', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setUserProgress(data);
        } else {
          console.error('Failed to fetch user progress');
        }
      } catch (error) {
        console.error('Error fetching user progress:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserProgress();
  }, []);

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
            </div>              <div className={styles.masteryLabel}>
              Mastery Score <Badge locked={!userProgress || userProgress.responseCount < MIN_ANSWERS} />
            </div>
          </div>
          <TabIcons />
        </div>

        {/* Main Content */}
        <div className={styles.dashboardMain}>
          {/* Left Panel */}
          <div className={styles.leftPanel}>            <div className={styles.introBox}>
              {loading ? (
                <h2>Loading your progress...</h2>
              ) : !userProgress || userProgress.responseCount < MIN_ANSWERS ? (
                <>
                  <h2>Answer {MIN_ANSWERS - (userProgress?.responseCount || 0)} more questions to unlock your Mastery Score</h2>
                  <p>
                    To get started, take a practice quiz or exam. Based on your performance, 
                    we'll show you a personalized mastery score and track your progress.
                  </p>
                  {userProgress && (
                    <div className={styles.progressWrapper}>
                      <progress value={userProgress.responseCount} max={MIN_ANSWERS} className={styles.progressBar}></progress>
                      <p className={styles.progressText}>{userProgress.responseCount}/{MIN_ANSWERS} questions answered</p>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <h2>Your Mastery Score: {userProgress.masteryScore?.toFixed(1)}</h2>
                  <p>
                    Continue practicing to improve your mastery score. We'll adjust your 
                    score based on the difficulty of questions you answer correctly.
                  </p>
                </>
              )}
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
          </div>          {/* Right Panel */}
          <div className={styles.rightPanel}>
            <HexagonScore 
              score={userProgress?.responseCount || 0} 
              maxScore={MIN_ANSWERS} 
              locked={!userProgress || userProgress.responseCount < MIN_ANSWERS} 
            />
            
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
