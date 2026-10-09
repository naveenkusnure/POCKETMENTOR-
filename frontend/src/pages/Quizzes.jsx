import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../api/client';
import {
  HelpCircle,
  Clock,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Award,
  ChevronRight,
  AlertTriangle
} from 'lucide-react';
import './Quizzes.css';

export default function Quizzes() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Generator Config
  const [topic, setTopic] = useState(searchParams.get('topic') || 'Fourier Transform');
  const [materialId, setMaterialId] = useState(searchParams.get('materialId') || '');
  const [questionCount, setQuestionCount] = useState(5);
  const [difficulty, setDifficulty] = useState('Medium');

  // Quiz State
  const [currentQuiz, setCurrentQuiz] = useState(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [generating, setGenerating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [quizResult, setQuizResult] = useState(null);
  const [timerSeconds, setTimerSeconds] = useState(0);

  // Past Attempts
  const [pastAttempts, setPastAttempts] = useState([]);
  const [activeTab, setActiveTab] = useState('new'); // 'new', 'active', 'result', 'history'

  useEffect(() => {
    fetchPastAttempts();
  }, []);

  // Timer counter during active quiz
  useEffect(() => {
    let interval = null;
    if (activeTab === 'active' && !quizResult) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [activeTab, quizResult]);

  const fetchPastAttempts = async () => {
    try {
      const res = await api.get('/quizzes/attempts');
      setPastAttempts(res.data);
    } catch (err) {
      console.error('Failed to load past attempts', err);
    }
  };

  const handleGenerate = async (e) => {
    if (e) e.preventDefault();
    try {
      setGenerating(true);
      const res = await api.post('/quizzes/generate', {
        topic,
        materialId: materialId || null,
        questionCount,
        difficulty
      });
      setCurrentQuiz(res.data);
      setCurrentIdx(0);
      setAnswers({});
      setQuizResult(null);
      setTimerSeconds(0);
      setActiveTab('active');
    } catch (err) {
      alert('Failed to generate quiz: ' + (err.response?.data?.message || err.message));
    } finally {
      setGenerating(false);
    }
  };

  const handleSelectOption = (questionId, optionIdx) => {
    setAnswers({
      ...answers,
      [questionId]: optionIdx
    });
  };

  const handleSubmitQuiz = async () => {
    if (window.confirm('Are you ready to submit your quiz?')) {
      try {
        setSubmitting(true);
        const res = await api.post('/quizzes/submit', {
          quizId: currentQuiz.id,
          timeTakenSeconds: timerSeconds,
          answers: answers
        });
        setQuizResult(res.data);
        setActiveTab('result');
        fetchPastAttempts();
      } catch (err) {
        alert('Failed to submit quiz: ' + (err.response?.data?.message || err.message));
      } finally {
        setSubmitting(false);
      }
    }
  };

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    return `${mins} min ${rem < 10 ? '0' : ''}${rem} sec`;
  };

  return (
    <div className="quizzes-page">
      {/* Tab Switcher */}
      <div className="quiz-tabs">
        <button
          className={`quiz-tab-btn ${activeTab === 'new' ? 'active' : ''}`}
          onClick={() => setActiveTab('new')}
        >
          Create Quiz
        </button>
        {currentQuiz && (
          <button
            className={`quiz-tab-btn ${activeTab === 'active' ? 'active' : ''}`}
            onClick={() => setActiveTab('active')}
          >
            Active Test
          </button>
        )}
        {quizResult && (
          <button
            className={`quiz-tab-btn ${activeTab === 'result' ? 'active' : ''}`}
            onClick={() => setActiveTab('result')}
          >
            Results & Review
          </button>
        )}
        <button
          className={`quiz-tab-btn ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          Attempt History ({pastAttempts.length})
        </button>
      </div>

      {/* TAB 1: Generate Quiz */}
      {activeTab === 'new' && (
        <div className="create-quiz-card">
          <div className="card-heading">
            <div className="heading-icon">
              <Sparkles size={24} color="var(--primary)" />
            </div>
            <div>
              <h3>Generate Topic-Based Quiz</h3>
              <p>Practice exam questions generated from your study topics or uploaded PDFs</p>
            </div>
          </div>

          <form onSubmit={handleGenerate} className="quiz-form">
            <div className="form-group">
              <label>Topic Name</label>
              <input
                type="text"
                placeholder="e.g. Fourier Transform, Signals & Systems, VLSI Design"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                required
              />
            </div>

            <div className="form-grid-3">
              <div className="form-group">
                <label>Number of Questions</label>
                <select
                  value={questionCount}
                  onChange={(e) => setQuestionCount(Number(e.target.value))}
                >
                  <option value={5}>5 Questions</option>
                  <option value={10}>10 Questions</option>
                  <option value={15}>15 Questions</option>
                  <option value={20}>20 Questions</option>
                </select>
              </div>

              <div className="form-group">
                <label>Difficulty</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                  <option value="Mixed">Mixed</option>
                </select>
              </div>

              <div className="form-group">
                <label>Question Type</label>
                <input type="text" value="Multiple Choice (MCQ)" disabled />
              </div>
            </div>

            <button type="submit" className="generate-quiz-btn" disabled={generating}>
              {generating ? (
                <span className="btn-spinner">
                  <Loader2 size={18} className="spin" /> Generating Exam Quiz...
                </span>
              ) : (
                'Generate Quiz'
              )}
            </button>
          </form>
        </div>
      )}

      {/* TAB 2: Exam Interface */}
      {activeTab === 'active' && currentQuiz && (
        <div className="active-exam-container">
          {/* Header Info */}
          <div className="exam-header-bar">
            <div>
              <span className="exam-topic-badge">{currentQuiz.topic}</span>
              <span className="exam-diff-badge">{currentQuiz.difficulty}</span>
            </div>
            <div className="timer-badge">
              <Clock size={16} />
              <span>{formatTime(timerSeconds)}</span>
            </div>
          </div>

          {/* Question Card */}
          <div className="exam-card">
            <div className="exam-progress-row">
              <span className="q-progress-text">
                Question {currentIdx + 1} of {currentQuiz.questions.length}
              </span>
              <span className="q-answered-count">
                Answered: {Object.keys(answers).length} / {currentQuiz.questions.length}
              </span>
            </div>

            <div className="question-body">
              <h3 className="question-title">
                {currentQuiz.questions[currentIdx]?.questionText}
              </h3>

              <div className="options-list">
                {currentQuiz.questions[currentIdx]?.options.map((opt, optIdx) => {
                  const qId = currentQuiz.questions[currentIdx].id;
                  const isSelected = answers[qId] === optIdx;
                  const label = String.fromCharCode(65 + optIdx); // A, B, C, D

                  return (
                    <div
                      key={optIdx}
                      className={`option-choice ${isSelected ? 'selected' : ''}`}
                      onClick={() => handleSelectOption(qId, optIdx)}
                    >
                      <div className="choice-letter">{label}</div>
                      <div className="choice-text">{opt}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Nav and Submit Buttons */}
            <div className="exam-footer-controls">
              <button
                className="exam-nav-btn"
                disabled={currentIdx === 0}
                onClick={() => setCurrentIdx(currentIdx - 1)}
              >
                <ArrowLeft size={16} /> Previous
              </button>

              {currentIdx < currentQuiz.questions.length - 1 ? (
                <button
                  className="exam-nav-btn primary"
                  onClick={() => setCurrentIdx(currentIdx + 1)}
                >
                  Next <ArrowRight size={16} />
                </button>
              ) : (
                <button
                  className="exam-submit-btn"
                  onClick={handleSubmitQuiz}
                  disabled={submitting}
                >
                  {submitting ? 'Submitting...' : 'Submit Quiz'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Quiz Results & Detailed Review */}
      {activeTab === 'result' && quizResult && (
        <div className="quiz-results-container">
          {/* Result Score Banner */}
          <div className="result-score-banner">
            <div className="score-main-badge">
              <Award size={48} className="trophy-icon" />
              <div>
                <h2>Your Result: {quizResult.scorePercentage}%</h2>
                <p>
                  Score: {quizResult.correctCount} / {quizResult.totalQuestions}
                </p>
              </div>
            </div>

            <div className="result-stats-row">
              <div className="res-stat-card stat-correct">
                <CheckCircle2 size={20} />
                <span className="res-stat-val">{quizResult.correctCount}</span>
                <span className="res-stat-lbl">Correct</span>
              </div>
              <div className="res-stat-card stat-incorrect">
                <XCircle size={20} />
                <span className="res-stat-val">{quizResult.incorrectCount}</span>
                <span className="res-stat-lbl">Incorrect</span>
              </div>
              <div className="res-stat-card stat-time">
                <Clock size={20} />
                <span className="res-stat-val">
                  {formatTime(quizResult.timeTakenSeconds)}
                </span>
                <span className="res-stat-lbl">Time</span>
              </div>
            </div>

            <div className="result-actions">
              <button
                className="action-pill-btn"
                onClick={() => handleGenerate()}
              >
                <RotateCcw size={15} /> Retake / Practice Again
              </button>
              <button
                className="action-pill-btn primary"
                onClick={() => navigate('/dashboard')}
              >
                Back to Dashboard
              </button>
            </div>
          </div>

          {/* Detailed Question Review */}
          <div className="review-section">
            <h3 className="review-header">Detailed Question Explanations</h3>
            <div className="review-questions-list">
              {quizResult.questionResults?.map((q, idx) => (
                <div
                  key={idx}
                  className={`review-question-card ${q.isCorrect ? 'is-correct' : 'is-wrong'}`}
                >
                  <div className="review-q-header">
                    <span className="review-q-number">Question {idx + 1}</span>
                    <span className={`status-badge ${q.isCorrect ? 'badge-green' : 'badge-red'}`}>
                      {q.isCorrect ? (
                        <>
                          <CheckCircle2 size={14} /> Correct
                        </>
                      ) : (
                        <>
                          <XCircle size={14} /> Incorrect
                        </>
                      )}
                    </span>
                  </div>

                  <h4 className="review-q-text">{q.questionText}</h4>

                  <div className="review-options">
                    {q.options.map((opt, optIdx) => {
                      const isChosen = q.selectedIndex === optIdx;
                      const isCorrect = q.correctIndex === optIdx;
                      let statusClass = '';
                      if (isCorrect) statusClass = 'correct-opt';
                      else if (isChosen && !isCorrect) statusClass = 'chosen-wrong-opt';

                      return (
                        <div key={optIdx} className={`review-option ${statusClass}`}>
                          <span className="opt-letter">
                            {String.fromCharCode(65 + optIdx)}
                          </span>
                          <span>{opt}</span>
                          {isCorrect && (
                            <span className="opt-indicator">✓ Correct Answer</span>
                          )}
                          {isChosen && !isCorrect && (
                            <span className="opt-indicator">✗ Your Choice</span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {q.explanation && (
                    <div className="explanation-box">
                      <strong>AI Explanation:</strong>
                      <p>{q.explanation}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Past Attempts History */}
      {activeTab === 'history' && (
        <div className="attempts-history-card">
          <div className="card-heading">
            <h3>Completed Quizzes History</h3>
            <p>Review past test scores and accuracy metrics</p>
          </div>

          {pastAttempts.length === 0 ? (
            <div className="empty-history">
              <p>No completed quizzes found yet. Generate a quiz to start practicing!</p>
            </div>
          ) : (
            <div className="history-table-container">
              <table className="history-table">
                <thead>
                  <tr>
                    <th>Topic</th>
                    <th>Score</th>
                    <th>Accuracy</th>
                    <th>Time Taken</th>
                    <th>Completed At</th>
                  </tr>
                </thead>
                <tbody>
                  {pastAttempts.map((att) => (
                    <tr key={att.id}>
                      <td className="table-topic">{att.topic}</td>
                      <td>
                        {att.correctCount} / {att.totalQuestions}
                      </td>
                      <td>
                        <span
                          className={`score-tag ${
                            att.scorePercentage >= 80
                              ? 'tag-high'
                              : att.scorePercentage >= 60
                              ? 'tag-mid'
                              : 'tag-low'
                          }`}
                        >
                          {att.scorePercentage}%
                        </span>
                      </td>
                      <td>{formatTime(att.timeTakenSeconds)}</td>
                      <td>{new Date(att.completedAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
