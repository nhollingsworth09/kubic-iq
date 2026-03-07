import React, { useState } from 'react';
import './quiz.css';

const QuizPage = () => {
  const totalQuestions = 5;
  const currentQuestion = 1;

  const [selected, setSelected] = useState(null);
  const [eliminated, setEliminated] = useState([]);
  const [marked, setMarked] = useState(false);

  const choices = [
    { id: 'A', text: '3' },
    { id: 'B', text: '4' },
    { id: 'C', text: '8' },
    { id: 'D', text: '27' }
  ];

  const toggleEliminate = (id) => {
    setEliminated(prev =>
      prev.includes(id) ? prev.filter(choice => choice !== id) : [...prev, id]
    );
    if (selected === id) setSelected(null);
  };

  const selectChoice = (id) => {
    if (!eliminated.includes(id)) setSelected(id);
  };

  return (
    <div className="quiz-container">
      <header className="quiz-header">
        <div className="left">
          <button className="link-button">Formula Sheets</button>
        </div>
        <div className="center">
          <span className="timer">0:00</span>
        </div>
        <div className="right">
          <button className="exit-button">Exit Practice</button>
        </div>
      </header>

      <div className="quiz-content">
        <div className="question-box">
          <div className="question-meta">
            <span className="question-progress">Question {currentQuestion} of {totalQuestions}</span>
            <label className="mark-review">
              <input
                type="checkbox"
                checked={marked}
                onChange={() => setMarked(!marked)}
              />
              Mark for Review
            </label>
          </div>

          <p className="question-text">
            Two nearby trees are perpendicular to the ground, which is flat. One of these trees is 10 feet tall and has a shadow that is 5 feet long. At the same time, the shadow of the other tree is 2 feet long. How tall, in feet, is the other tree?
          </p>

          <ul className="choices">
            {choices.map(({ id, text }) => (
              <li
                key={id}
                className={`choice ${selected === id ? 'selected' : ''} ${eliminated.includes(id) ? 'eliminated' : ''}`}
                onClick={() => selectChoice(id)}
              >
                <div className="choice-left">
                  <span className="choice-label">{id}</span>
                  <span className="choice-text">{text}</span>
                </div>
                <button className="eliminate-button" onClick={(e) => { e.stopPropagation(); toggleEliminate(id); }}>
                  {eliminated.includes(id) ? 'Undo' : '⊝'}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <footer className="quiz-footer">
        <button className="nav-button">Back</button>
        <button className="nav-button primary">Next</button>
      </footer>
    </div>
  );
};

export default QuizPage;
