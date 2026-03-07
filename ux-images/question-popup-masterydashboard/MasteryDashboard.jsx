import React, { useState } from 'react';
import styles from './MasteryDashboard.module.css';

const topics = [
  { topic: 'Algebra', subtopics: ['Linear equations in one variable', 'Linear equations in two variables', 'Systems of linear equations', 'Linear inequalities', 'Interpreting linear functions'] },
  { topic: 'Advanced Math', subtopics: ['Quadratic equations', 'Rational expressions', 'Radical expressions', 'Exponential functions', 'Polynomial expressions', 'Function notation and transformations'] },
  { topic: 'Problem Solving & Data Analysis', subtopics: ['Ratios and proportions', 'Percentages', 'Unit conversions', 'Data interpretation (tables, graphs)', 'Statistics', 'Probability'] },
  { topic: 'Geometry & Trigonometry', subtopics: ['Angles and triangles', 'Circles', 'Coordinate geometry', 'Volume and surface area', 'Trigonometric functions and identities'] }
];

export default function MasteryDashboard() {
  const [showModal, setShowModal] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState('');
  const [checkedSubtopics, setCheckedSubtopics] = useState([]);
  const [numQuestions, setNumQuestions] = useState(10);

  const allSubs = topics.flatMap(t => t.subtopics);
  const allSelected = allSubs.length > 0 && allSubs.every(sub => checkedSubtopics.includes(sub));

  const openModal = (source) => {
    setSelectedTopic(source);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setCheckedSubtopics([]);
    setNumQuestions(10);
  };

  const toggleSubtopic = (sub) => {
    setCheckedSubtopics(prev =>
      prev.includes(sub) ? prev.filter(s => s !== sub) : [...prev, sub]
    );
  };

  const toggleTopic = (subtopics) => {
    const allIn = subtopics.every(s => checkedSubtopics.includes(s));
    setCheckedSubtopics(prev =>
      allIn ? prev.filter(s => !subtopics.includes(s)) : [...prev, ...subtopics.filter(s => !prev.includes(s))]
    );
  };

  const selectAll = () => setCheckedSubtopics(allSubs);
  const deselectAll = () => setCheckedSubtopics([]);

  return (
    <div className={styles.dashboard}>
      <h1>Practice Mastery</h1>
      <div className={styles.buttonRow}>
        <button className={styles.btn} onClick={() => openModal('quiz')}>Take a Quiz</button>
        <button className={styles.btn} onClick={() => openModal('custom')}>Build a Custom Quiz</button>
        <button className={styles.btn} onClick={() => openModal('exam')}>Build a Custom Exam</button>
      </div>

      {showModal && (
        <div className={styles.menuOverlay}>
          <div className={styles.menuPopup}>
            <h2>Select Topics to Practice</h2>
            <div className={styles.actions}>
              {allSelected ? (
                <button className={styles.toggleBtn} onClick={deselectAll}>Deselect All</button>
              ) : (
                <button className={styles.toggleBtn} onClick={selectAll}>Select All</button>
              )}
            </div>

            <div className={styles.topicList}>
              {topics.map(({ topic, subtopics }) => (
                <div key={topic} className={styles.topicGroup}>
                  <label>
                    <input
                      type="checkbox"
                      checked={subtopics.every((s) => checkedSubtopics.includes(s))}
                      onChange={() => toggleTopic(subtopics)}
                    />
                    <strong>{topic}</strong>
                  </label>
                  <ul className={styles.subtopicList}>
                    {subtopics.map((s) => (
                      <li key={s}>
                        <label>
                          <input
                            type="checkbox"
                            checked={checkedSubtopics.includes(s)}
                            onChange={() => toggleSubtopic(s)}
                          />
                          {s}
                        </label>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {selectedTopic === 'custom' && (
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

            <div className={styles.modalFooter}>
              <button className={styles.cancelBtn} onClick={closeModal}>Cancel</button>
              <button className={styles.startBtn} onClick={() => alert(`Starting ${selectedTopic} with ${checkedSubtopics.length} subtopics and ${numQuestions} questions.`)}>
                Start Practice
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
