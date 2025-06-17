import { useState, useEffect } from 'react';
import styles from './MasteryDashboard.module.css';

// Minimum number of answers needed to show mastery score
const MIN_ANSWERS = 25;

interface UserProgress {
  responseCount: number;
  masteryScore: number | null;
  requiredAnswers?: number;
}

export const MasteryDashboard = () => {
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'practice' | 'learn'>('practice');
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  
  useEffect(() => {
    // Fetch user progress from backend
    const fetchUserProgress = async () => {
      try {
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

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const resources = [
    { title: 'View Formula Sheet', icon: 'formula'},
    { title: 'Test Day Strategies', icon: 'guide'},
    { title: 'Knowing You\'re Ready', icon: 'ready'}
  ];

  const practiceOptions = [
    { title: 'Build a Custom Quiz', icon: 'pen' },
    { title: 'Build a Custom Exam', icon: 'pen' },
    { title: 'Take a Mock Exam', icon: 'pen'}
  ];

  const isMasteryUnlocked = userProgress && userProgress.responseCount >= MIN_ANSWERS;
  const remainingQuestions = MIN_ANSWERS - (userProgress?.responseCount || 0);
  
  return (
    <div className={styles.dashboardContainer}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarLogo}>
          <img src="/brand/kubic-logo-icon.svg" className={styles.logoImg} alt="KubicIQ Logo" />
        </div>
        <nav className={styles.sidebarNav}>
          <button className={styles.navIcon}>
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
            </svg>
          </button>
          <button className={`${styles.navIcon} ${styles.navIconActive}`}>
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M17 3H7c-1.1 0-1.99.9-1.99 2L5 21l7-3 7 3V5c0-1.1-.9-2-2-2z"/>
            </svg>
          </button>
        </nav>
        <div className={styles.sidebarFooter}>
          <button className={styles.menuButton} onClick={toggleMenu} aria-label="Menu">
            <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
              <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>
            </svg>
          </button>
        </div>
        
        {menuOpen && (
          <div className={styles.menuOverlay} onClick={toggleMenu}>
            <div className={styles.menuPopup} onClick={(e) => e.stopPropagation()}>
              <h3 className={styles.menuTitle}>Menu</h3>
              <ul className={styles.menuList}>
                <li>
                  <button className={styles.menuItem}>
                    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                    </svg>
                    Account Management
                  </button>
                </li>
                <li>
                  <button className={styles.menuItem}>
                    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                      <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM9 6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9V6zm9 14H6V10h12v10zm-6-3c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z"/>
                    </svg>
                    Privacy Settings
                  </button>
                </li>
                <li>
                  <button className={styles.menuItem} onClick={handleLogout}>
                    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                      <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
                    </svg>
                    Logout
                  </button>
                </li>
              </ul>
            </div>
          </div>
        )}
      </aside>      <div className={styles.dashboardCard}>
        <div className={styles.tabsContainer}>
          <div className={styles.pageTabs}>
            <button 
              className={`${styles.pageTab} ${activeTab === 'practice' ? styles.pageTabActive : ''}`}
              onClick={() => setActiveTab('practice')}
              aria-label="Practice tab"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                <path d="M17 3H7c-1.1 0-1.99.9-1.99 2L5 21l7-3 7 3V5c0-1.1-.9-2-2-2z"/>
              </svg>
              <span>Practice</span>
            </button>
            <button 
              className={`${styles.pageTab} ${activeTab === 'learn' ? styles.pageTabActive : ''}`}
              onClick={() => setActiveTab('learn')}
              aria-label="Learn tab"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                <path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4z"/>
              </svg>
              <span>Learn</span>
            </button>
          </div>
          <div className={styles.masteryBadge}>
            <span>Mastery Score</span>
            <div className={styles.hexagonBadge}>
              {!isMasteryUnlocked ? (
                <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                  <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2z"/>
                </svg>
              ) : (
                <span className={styles.hexScore}>{userProgress?.masteryScore?.toFixed(1)}</span>
              )}
            </div>
          </div>
        </div>
        {/* Main Content - Stacked layout to match design */}
        <section className={styles.dashboardMainStacked}>

          {/* Intro Box */}
          <div className={styles.introBox}>
            {loading ? (
              <h2>Loading your progress...</h2>
            ) : !isMasteryUnlocked ? (
              <>
                <h2>Answer {remainingQuestions} more questions to unlock your Mastery Score</h2>
                <p>
                  To get started, you'll need to answer {MIN_ANSWERS} questions. This is the first step towards
                  getting you ready for your exam, and will allow us to accurately set your Mastery Score.
                  <button className={styles.infoLink}>What is Mastery Score?</button>
                </p>
                {userProgress && (
                  <div className={styles.progressWrapper}>
                    <progress 
                      value={userProgress.responseCount} 
                      max={MIN_ANSWERS} 
                      className={styles.progressBar}
                    />
                    <p className={styles.progressText}>
                      {userProgress.responseCount}/{MIN_ANSWERS} questions answered
                    </p>
                  </div>
                )}
              </>
            ) : (
              <>
                <h2>Your Mastery Score: {userProgress?.masteryScore?.toFixed(1)}</h2>
                <p>
                  Continue practicing to improve your mastery score. We'll adjust your 
                  score based on the difficulty of questions you answer correctly.
                </p>
              </>
            )}
            <button className={styles.btnPrimary}>
              <svg className={styles.buttonIcon} viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34a.9959.9959 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
              </svg>
              <span style={{marginLeft: "0.5rem"}}>Take a Quiz</span>
            </button>
          </div>

          {/* Score Box */}
          <div className={styles.scoreBox}>
            <h3>
              <svg className={styles.iconLarge} viewBox="0 0 24 24" fill="currentColor">
                <path d="M11 2v20c-5.07-.5-9-4.79-9-10s3.93-9.5 9-10zm2.03 0v8.99H22c-.47-4.74-4.24-8.52-8.97-8.99zm0 11.01V22c4.74-.47 8.5-4.25 8.97-8.99h-8.97z"/>
              </svg>
              Mastery Score
            </h3>
            
            <div className={styles.hexagonLarge}>
              {!isMasteryUnlocked ? (
                <svg className={styles.iconLarge} viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM9 6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9V6zm9 14H6V10h12v10zm-6-3c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z"/>
                </svg>
              ) : (
                <span className={styles.scoreDisplay}>
                  {userProgress?.masteryScore?.toFixed(1)}
                </span>
              )}
            </div>
            
            <p>
              <strong>{userProgress?.responseCount || 0}/{MIN_ANSWERS}</strong><br />
              {!isMasteryUnlocked ? 'Unlock Mastery Score by Answering 25 Questions' : 'Mastery Score Unlocked'}
            </p>
          </div>

          {/* Practice and Resources Row */}
          <div className={styles.practiceResourcesRow}>
            {/* Practice Options */}
            <div className={styles.practiceOptions}>
              <h3>More Ways to Practice</h3>
              <div className={styles.buttonGroup}>
                {practiceOptions.map((option, index) => (
                  <button key={index} className={styles.btnOutline}>
                    <svg className={styles.buttonIcon} viewBox="0 0 24 24" fill="currentColor">
                      <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34a.9959.9959 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                    </svg>
                    {option.title}
                    <svg className={styles.infoIcon} viewBox="0 0 24 24" fill="currentColor">
                      <path d="M11 17h2v-6h-2v6zm1-15C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zM11 9h2V7h-2v2z"/>
                    </svg>
                  </button>
                ))}
              </div>
            </div>
            
            {/* Resources */}
            <div className={styles.resources}>
              <h3>Additional Resources</h3>
              <div className={styles.buttonGroup}>
                {resources.map((resource, index) => (
                  <button key={index} className={styles.btnResource}>
                    <svg className={styles.buttonIcon} viewBox="0 0 24 24" fill="currentColor">
                      <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
                    </svg>
                    {resource.title}
                    <svg className={styles.buttonIcon} viewBox="0 0 24 24" fill="currentColor">
                      <path d=""/>
                    </svg>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
