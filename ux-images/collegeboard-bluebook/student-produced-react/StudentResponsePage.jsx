import React, { useState, useEffect, useRef } from 'react';
import './quiz.css';

const StudentResponsePage = () => {
  const totalQuestions = 7;
  const currentQuestion = 3;

  const [answer, setAnswer] = useState('');
  const previewRef = useRef(null);

  const sanitizeInput = (value) => {
    return value.replace(/[^0-9./-]/g, '');
  };

  // Utility to convert decimal with 4 places into a simplified LaTeX fraction
  const decimalToFractionLatex = (decimalStr) => {
    const num = parseFloat(decimalStr);
    const tolerance = 1.0E-6;
    let h1 = 1, h2 = 0;
    let k1 = 0, k2 = 1;
    let b = num;

    do {
      let a = Math.floor(b);
      let aux = h1;
      h1 = a * h1 + h2;
      h2 = aux;
      aux = k1;
      k1 = a * k1 + k2;
      k2 = aux;
      b = 1 / (b - a);
    } while (Math.abs(num - h1 / k1) > num * tolerance);

    const sign = num < 0 ? '-' : '';
    return `\\(${sign}\\frac{${Math.abs(h1)}}{${k1}}\\)`;
  };

  const getLatexPreview = () => {
    if (!answer) return '—';

    // If it's in fraction form like "3/4"
    if (/^-?\d+\/\d+$/.test(answer)) {
      const [num, den] = answer.split('/');
      return `\\(\\frac{${num}}${den}\\)`;
    }

    // Convert decimals with exactly 4 decimal places to LaTeX fraction
    if (/^-?\\d*\\.\\d{4}$/.test(answer)) {
      return decimalToFractionLatex(answer);
    }

    // Default raw LaTeX
    return `\\(${answer}\\)`;
  };

  useEffect(() => {
    if (window.MathJax && window.MathJax.typesetPromise) {
      window.MathJax.typesetPromise([previewRef.current]);
    }
  }, [answer]);

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

      <div className="quiz-content student-response-layout">
        {/* Sidebar Panel */}
        <aside className="sidebar-panel open">
          <div className="sidebar-header">
            <h3>Student-produced response directions</h3>
          </div>
          <div className="sidebar-body">
            <ul className="directions-list">
              <li>If you find more than one correct answer, enter only one answer.</li>
              <li>You can enter up to 5 characters for a positive answer and up to 6 characters for a negative answer.</li>
              <li>If your answer is a fraction that doesn't fit, enter its decimal equivalent.</li>
              <li>If your answer is a decimal that doesn’t fit, round or truncate at the fourth digit.</li>
              <li>If your answer is a mixed number (e.g., 3½), enter as <strong>7/2</strong> or <strong>3.5</strong>.</li>
              <li>Don’t enter symbols like <code>$</code>, <code>%</code>, or commas.</li>
            </ul>
            <div className="examples-table">
              <table>
                <thead>
                  <tr>
                    <th>Answer</th>
                    <th>Acceptable</th>
                    <th>Unacceptable</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>3.5</td>
                    <td>3.5, 3.50, 7/2</td>
                    <td>31/2, 3 1/2</td>
                  </tr>
                  <tr>
                    <td>2/3</td>
                    <td>.666, .6667, 2/3</td>
                    <td>.66, .67</td>
                  </tr>
                  <tr>
                    <td>-1/3</td>
                    <td>-1/3, -.3333</td>
                    <td>-.33</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </aside>

        {/* Main Input Area */}
        <main className="student-response-main">
          <div className="question-meta">
            <span className="question-progress">Question {currentQuestion} of {totalQuestions}</span>
            <label className="mark-review">
              <input type="checkbox" /> Mark for Review
            </label>
          </div>

          <p className="question-text">
            The y-intercept of the graph of <i>y = –6x – 32</i> in the xy-plane is <i>(0, y)</i>. What is the value of <i>y</i>?
          </p>

          <input
            type="text"
            className="student-input"
            placeholder="Enter your answer"
            value={answer}
            onChange={(e) => setAnswer(sanitizeInput(e.target.value))}
          />

          <div className="answer-preview" ref={previewRef}>
            <strong>Answer Preview:</strong>{' '}
            <span dangerouslySetInnerHTML={{ __html: getLatexPreview() }} />
          </div>
        </main>
      </div>

      <footer className="quiz-footer">
        <button className="nav-button">Back</button>
        <button className="nav-button primary">Next</button>
      </footer>
    </div>
  );
};

export default StudentResponsePage;
