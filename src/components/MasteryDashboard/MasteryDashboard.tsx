import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import styles from './MasteryDashboard.module.css';
import TestHistoryList from './TestHistory/TestHistoryList';

// Minimum number of answers needed to show mastery score
const MIN_ANSWERS = 25;

// Topics available for quizzes and exams
const topics = [
  { topic: 'Algebra', subtopics: ['Linear equations in one variable', 'Linear equations in two variables', 'Systems of linear equations', 'Linear inequalities', 'Interpreting linear functions'] },
  { topic: 'Advanced Math', subtopics: ['Quadratic equations', 'Rational expressions', 'Radical expressions', 'Exponential functions', 'Polynomial expressions', 'Function notation and transformations'] },
  { topic: 'Problem Solving & Data Analysis', subtopics: ['Ratios and proportions', 'Percentages', 'Unit conversions', 'Data interpretation (tables, graphs)', 'Statistics', 'Probability'] },
  { topic: 'Geometry & Trigonometry', subtopics: ['Angles and triangles', 'Circles', 'Coordinate geometry', 'Volume and surface area', 'Trigonometric functions and identities'] }
];

interface Test {
  id: string;
  testType: 'quiz' | 'custom' | 'exam';
  questionCount: number;
  correctCount: number;
  percentage: number;
  duration: number;
  topics: string[];
  createdAt: string;
}

interface UserProgress {
  responseCount: number;
  masteryScore: number | null;
  requiredAnswers?: number;
  recentTests?: Test[];
}

export const MasteryDashboard = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'practice' | 'learn'>('practice');
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  
  // Question popup state
  const [showModal, setShowModal] = useState<boolean>(false);
  const [selectedPracticeType, setSelectedPracticeType] = useState<'quiz' | 'custom' | 'exam' | ''>('');
  const [checkedSubtopics, setCheckedSubtopics] = useState<string[]>([]);
  const [numQuestions, setNumQuestions] = useState<number>(10);
  const [showStartingMessage, setShowStartingMessage] = useState<boolean>(false);
  const [showUnlockedModal, setShowUnlockedModal] = useState<boolean>(false);
    // Create a ref to track if we need to refresh data
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Function to trigger a refresh of dashboard data
  const refreshDashboard = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  useEffect(() => {
    // Fetch user progress from backend
    const fetchUserProgress = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/user/progress', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          // Add cache-busting parameter to prevent stale data
          cache: 'no-store'
        });
        
        if (response.ok) {
          const data = await response.json();
          setUserProgress(data);
          // Show the unlock modal the first time the dashboard loads after the threshold is crossed
          if (data.masteryScore !== null && sessionStorage.getItem('mastery-just-unlocked') === 'true') {
            sessionStorage.removeItem('mastery-just-unlocked');
            setShowUnlockedModal(true);
          }
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

    // Listen for custom event when test is completed
    const handleTestCompleted = () => refreshDashboard();
    window.addEventListener('test-completed', handleTestCompleted);
    
    return () => {
      window.removeEventListener('test-completed', handleTestCompleted);
    };
  }, [refreshTrigger]);
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);  };

  // Question popup functions
  const openPracticeModal = (type: 'quiz' | 'custom' | 'exam') => {
    setSelectedPracticeType(type);
    setShowModal(true);
    
    // For mock exam, we always use all topics 
    // and don't show the selection UI
    if (type === 'exam') {
      setCheckedSubtopics(allSubs);
    } else {
      // For custom quiz and custom exam, we start with no topics selected
      setCheckedSubtopics([]);
      // Reset the number of questions to default for quiz
      if (type === 'quiz') {
        setNumQuestions(10);
      }
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setCheckedSubtopics([]);
    setNumQuestions(10);
  };

  const toggleSubtopic = (sub: string) => {
    setCheckedSubtopics(prev =>
      prev.includes(sub) ? prev.filter(s => s !== sub) : [...prev, sub]
    );
  };

  const toggleTopic = (subtopics: string[]) => {
    const allIn = subtopics.every(s => checkedSubtopics.includes(s));
    setCheckedSubtopics(prev =>
      allIn ? prev.filter(s => !subtopics.includes(s)) : [...prev, ...subtopics.filter(s => !prev.includes(s))]
    );
  };

  const allSubs = topics.flatMap(t => t.subtopics);
  const allSelected = allSubs.length > 0 && allSubs.every(sub => checkedSubtopics.includes(sub));
  const selectAll = () => setCheckedSubtopics(allSubs);
  const deselectAll = () => setCheckedSubtopics([]);
    const startPractice = () => {
    const practiceTypeLabel = 
      selectedPracticeType === 'quiz' ? 'Custom Quiz' : 
      selectedPracticeType === 'custom' ? 'Custom Exam' : 'Mock Exam';
    
    // For exams, we always use 44 questions
    const questionCount = selectedPracticeType === 'quiz' ? numQuestions : 44;
    
    // For mock exams, we use all topics regardless of selection
    const topicsToUse = selectedPracticeType === 'exam' ? allSubs : checkedSubtopics;
    
    // Save quiz configuration to localStorage for the test starter to use
    const quizConfig = {
      type: selectedPracticeType,
      topics: topicsToUse,
      numQuestions: questionCount,
      timestamp: new Date().toISOString()
    };
    
    localStorage.setItem('lastQuizConfig', JSON.stringify(quizConfig));
    
    console.log(`Starting ${practiceTypeLabel} with ${topicsToUse.length} selected topics and ${questionCount} questions`);    // Show a toast/notification and navigate to test starter
    setShowStartingMessage(true);
    setTimeout(() => {
      setShowStartingMessage(false);
      // Navigate to test starter using React Router's navigate function
      // This ensures we stay within the SPA and maintain auth state
      navigate(`/test/start/${selectedPracticeType}`);
    }, 1500);
    
    // Close the modal after starting
    closeModal();
  };

  const resources = [
    { title: 'View Formula Sheet', icon: 'formula'},
    { title: 'Test Day Strategies', icon: 'guide'},
    { title: 'Knowing You\'re Ready', icon: 'ready'}
  ];

  // Updated to include practice types
  const practiceOptions = [
    { title: 'Build a Custom Quiz', icon: 'pen', type: 'quiz' as const },
    { title: 'Build a Custom Exam', icon: 'pen', type: 'custom' as const },
    { title: 'Take a Mock Exam', icon: 'pen', type: 'exam' as const}
  ];

  const isMasteryUnlocked = userProgress && userProgress.responseCount >= MIN_ANSWERS;
  const remainingQuestions = MIN_ANSWERS - (userProgress?.responseCount || 0);
  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <h2>Loading your dashboard...</h2>
      </div>
    );
  }
  
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
              <span><b>Practice</b></span>
            </button>
            <button 
              className={`${styles.pageTab} ${activeTab === 'learn' ? styles.pageTabActive : ''}`}
              onClick={() => setActiveTab('learn')}
              aria-label="Learn tab"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                <path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4z"/>
              </svg>
              <span><b>Question History</b></span>
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
                  <br /><br />
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
              </>            ) : (
              // When mastery score is unlocked, show test history instead of intro
              <TestHistoryList tests={userProgress?.recentTests || []} />
            )}
            <button 
              className={styles.btnPrimary} 
              onClick={() => openPracticeModal('exam')}
            >
              <svg className={styles.buttonIcon} viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34a.9959.9959 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
              </svg>
              <span style={{marginLeft: "0.5rem"}}>Take a Mock Exam</span>
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
              {!isMasteryUnlocked ? (
                <>
                  <strong>{userProgress?.responseCount || 0}/{MIN_ANSWERS}</strong><br />
                  Unlock Mastery Score by Answering 25 Questions
                </>
              ) : (
                <>
                  <strong>Keep practicing!</strong><br />
                  Regular practice will help you build mastery and confidence
                </>
              )}
            </p>
          </div>

          {/* Practice and Resources Row */}
          <div className={styles.practiceResourcesRow}>
            {/* Practice Options */}
            <div className={styles.practiceOptions}>
              <h3>More Ways to Practice</h3>
              <div className={styles.buttonGroup}>
                {practiceOptions.map((option, index) => (
                  <button 
                    key={index} 
                    className={styles.btnOutline}
                    onClick={() => openPracticeModal(option.type)}
                  >
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
      </div>      {/* Question Selection Modal */}
      {showModal && (
        <div className={styles.questionModalOverlay}>
          <div className={styles.questionModalContent} onClick={(e) => e.stopPropagation()}>
            <h2>
              {selectedPracticeType === 'quiz' ? 'Build a Custom Quiz' : 
               selectedPracticeType === 'custom' ? 'Build a Custom Exam' : 'Take a Mock Exam'}
            </h2>
            
            {selectedPracticeType === 'exam' ? (
              <div className={styles.examDescription}>
                <p>
                  The Mock Exam consists of 44 questions covering all topics.
                  This simulates the actual test experience and will help you prepare for the real exam.
                </p>
              </div>
            ) : (
              <div className={styles.modalActions}>
                {allSelected ? (
                  <button className={styles.toggleBtn} onClick={deselectAll}>Deselect All</button>
                ) : (
                  <button className={styles.toggleBtn} onClick={selectAll}>Select All</button>
                )}
              </div>
            )}            {selectedPracticeType !== 'exam' && (
              <div className={styles.topicList}>
                {topics.map(({ topic, subtopics }) => (
                  <div key={topic} className={styles.topicGroup}>
                    <label className={styles.topicLabel}>
                      <input
                        type="checkbox"
                        checked={subtopics.every((s) => checkedSubtopics.includes(s))}
                        onChange={() => toggleTopic(subtopics)}
                        className={styles.topicCheckbox}
                      />
                      <strong>{topic}</strong>
                    </label>
                    <ul className={styles.subtopicList}>
                      {subtopics.map((s) => (
                        <li key={s}>
                          <label className={styles.subtopicLabel}>
                            <input
                              type="checkbox"
                              checked={checkedSubtopics.includes(s)}
                              onChange={() => toggleSubtopic(s)}
                              className={styles.subtopicCheckbox}
                            />
                            {s}
                          </label>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}            {/* Only show number selector for custom quiz */}
            {selectedPracticeType === 'quiz' && (
              <div className={styles.sliderSection}>
                <label htmlFor="questionSlider">Number of Questions: {numQuestions}</label>
                <input
                  type="range"
                  id="questionSlider"
                  min="1"
                  max="30"
                  value={numQuestions}
                  onChange={(e) => setNumQuestions(Number(e.target.value))}
                  className={styles.slider}
                />
              </div>
            )}

            {/* For Custom Exam, show a note about question count */}
            {selectedPracticeType === 'custom' && (
              <div className={styles.examNote}>
                Custom exams consist of 44 questions from your selected topics
              </div>
            )}

            <div className={styles.modalFooter}>
              <button className={styles.cancelBtn} onClick={closeModal}>Cancel</button>
              <button 
                className={styles.startBtn} 
                onClick={startPractice}
                disabled={selectedPracticeType !== 'exam' && checkedSubtopics.length === 0}
              >
                Start {selectedPracticeType === 'quiz' ? 'Quiz' : 'Exam'}
              </button>
            </div>
            
            {selectedPracticeType !== 'exam' && checkedSubtopics.length === 0 && (
              <div className={styles.topicWarning}>
                Please select at least one topic to continue
              </div>
            )}
          </div>
        </div>
      )}      {/* Mastery Unlocked Celebration Modal */}
      {showUnlockedModal && (
        <div className={styles.questionModalOverlay} onClick={() => setShowUnlockedModal(false)}>
          <div className={styles.masteryUnlockedModal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.masteryUnlockedIcon}>🏆</div>
            <h2>Mastery Score Unlocked!</h2>
            <p>
              Congratulations — you've answered your first 25 questions and your Mastery Score is now active.
            </p>
            <p>
              Keep in mind that your initial score is an estimate. As you continue to practice and answer
              more questions, your score will update and increasingly reflect your true skill level.
            </p>
            <p>
              You're on the right path. Stay consistent with your practice and you'll be well-prepared
              for a successful SAT sitting. Keep going!
            </p>
            <button
              className={styles.btnPrimary}
              onClick={() => setShowUnlockedModal(false)}
            >
              Let's Keep Going!
            </button>
          </div>
        </div>
      )}

      {/* Toast Notification for Starting Practice */}
      {showStartingMessage && (
        <div className={`${styles.toast} ${styles.toastInfo}`}>
          <div className={styles.toastContent}>
            <div className={styles.spinnerSmall}></div>
            <span>Starting {
              selectedPracticeType === 'quiz' ? 'Custom Quiz' : 
              selectedPracticeType === 'custom' ? 'Custom Exam' : 'Mock Exam'
            }...</span>
          </div>
        </div>
      )}
    </div>
  );
};
