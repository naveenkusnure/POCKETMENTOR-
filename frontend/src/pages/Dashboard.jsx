import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import {
  Target,
  Sparkles,
  Brain,
  Flame,
  AlertTriangle,
  BookOpen,
  ArrowUpRight,
  TrendingUp,
  CheckCircle2,
  Clock,
  ArrowRight,
  Loader2
} from 'lucide-react';
import './Dashboard.css';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await api.get('/dashboard');
      setData(res.data);
    } catch (err) {
      console.error('Error fetching dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <Loader2 className="spin" size={36} color="var(--primary)" />
        <p>Loading your personal mentor space...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      {/* Student Welcome Header */}
      <div className="dashboard-header">
        <div className="welcome-text">
          <h1>Good morning, {data?.studentName || 'Student'} 👋</h1>
          <p className="welcome-sub">Let's continue your learning journey.</p>
        </div>
        <div className="header-badge">
          <span className="badge-branch">{data?.courseOrBranch || 'ECE'}</span>
          <span className="badge-year">{data?.yearOfStudy || '3rd Year'}</span>
        </div>
      </div>

      {/* 6 Super Cards */}
      <div className="super-cards-grid">
        {/* Card 1 — Learning Score */}
        <div className="super-card card-purple">
          <div className="card-top">
            <div className="icon-box icon-purple">
              <Target size={22} />
            </div>
            <span className="trend-pill trend-up">{data?.learningScoreTrend || '↑ 8% this week'}</span>
          </div>
          <div className="card-body">
            <span className="card-label">Overall Learning Score</span>
            <div className="card-metric-row">
              <h2 className="card-big-value">{data?.learningScore}%</h2>
            </div>
            <p className="card-subtext">Weighted study & retention metric</p>
          </div>
        </div>

        {/* Card 2 — Predicted Exam Score */}
        <div className="super-card card-blue" onClick={() => navigate('/prediction')}>
          <div className="card-top">
            <div className="icon-box icon-blue">
              <Sparkles size={22} />
            </div>
            <span className="confidence-pill">Confidence: {data?.predictionConfidence}%</span>
          </div>
          <div className="card-body">
            <span className="card-label">Predicted Exam Score</span>
            <div className="card-metric-row">
              <h2 className="card-big-value">{data?.predictedScore} <span className="val-max">/ 100</span></h2>
            </div>
            <div className="card-action-row">
              <span className="trend-indicator">{data?.predictionTrend || 'Improving ↑'}</span>
              <button className="card-btn-inline">View Analysis &rarr;</button>
            </div>
          </div>
        </div>

        {/* Card 3 — Quiz Accuracy */}
        <div className="super-card card-teal" onClick={() => navigate('/quizzes')}>
          <div className="card-top">
            <div className="icon-box icon-teal">
              <Brain size={22} />
            </div>
            <span className="meta-pill">{data?.quizzesCompleted} completed</span>
          </div>
          <div className="card-body">
            <span className="card-label">Quiz Accuracy</span>
            <div className="card-metric-row">
              <h2 className="card-big-value">{data?.quizAccuracy}%</h2>
            </div>
            <p className="card-subtext">Across all completed quizzes</p>
          </div>
        </div>

        {/* Card 4 — Study Streak */}
        <div className="super-card card-orange">
          <div className="card-top">
            <div className="icon-box icon-orange">
              <Flame size={22} />
            </div>
            <span className="streak-badge">Daily Habit</span>
          </div>
          <div className="card-body">
            <span className="card-label">Study Streak</span>
            <div className="card-metric-row">
              <h2 className="card-big-value">{data?.studyStreakDays} <span className="val-max">Days</span></h2>
            </div>
            <p className="card-subtext highlight-streak">Keep the streak going!</p>
          </div>
        </div>

        {/* Card 5 — Weak Topics */}
        <div className="super-card card-amber">
          <div className="card-top">
            <div className="icon-box icon-amber">
              <AlertTriangle size={22} />
            </div>
            <span className="count-pill">{data?.weakTopics?.length || 0} Topics</span>
          </div>
          <div className="card-body">
            <span className="card-label">Weak Topics</span>
            <div className="topic-tags">
              {data?.weakTopics?.map((t, idx) => (
                <span key={idx} className="topic-tag">{t}</span>
              ))}
            </div>
            <button
              className="card-action-btn btn-amber"
              onClick={() => navigate('/mentor')}
            >
              Improve Now
            </button>
          </div>
        </div>

        {/* Card 6 — Study Materials */}
        <div className="super-card card-indigo" onClick={() => navigate('/materials')}>
          <div className="card-top">
            <div className="icon-box icon-indigo">
              <BookOpen size={22} />
            </div>
          </div>
          <div className="card-body">
            <span className="card-label">Study Materials</span>
            <div className="card-metric-row">
              <h2 className="card-big-value">{data?.materialsCount} <span className="val-max">PDFs</span></h2>
            </div>
            <button
              className="card-action-btn btn-indigo"
              onClick={(e) => {
                e.stopPropagation();
                navigate('/materials');
              }}
            >
              View Materials
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Sections: Today's Focus & Performance History */}
      <div className="dashboard-sections-grid">
        {/* Left Column: Today's Focus & Recommendations */}
        <div className="dashboard-main-col">
          <div className="section-panel">
            <div className="panel-header">
              <div className="panel-title-group">
                <h3>Today's Focus</h3>
                <p>Personalized tasks recommended by your AI mentor</p>
              </div>
              <button className="primary-pill-btn" onClick={() => navigate('/quizzes')}>
                Start Learning
              </button>
            </div>
            <div className="focus-list">
              {data?.todaysFocus?.map((item, idx) => (
                <div key={idx} className="focus-item">
                  <div className="focus-check">
                    <CheckCircle2 size={18} className="check-icon" />
                  </div>
                  <span className="focus-text">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recommended for You */}
          <div className="section-panel">
            <div className="panel-header">
              <div className="panel-title-group">
                <h3>Recommended For You</h3>
                <p>Adaptive suggestions based on reaction feedback & scores</p>
              </div>
            </div>
            <div className="recommendations-list">
              {data?.recommendations?.map((rec, idx) => (
                <div key={idx} className="recommendation-card">
                  <div className="rec-info">
                    <h4>{rec.title}</h4>
                    <p>{rec.description}</p>
                  </div>
                  <button
                    className="rec-action-btn"
                    onClick={() => {
                      if (rec.actionType === 'MENTOR') navigate('/mentor');
                      else if (rec.actionType === 'REVISION') navigate('/materials');
                      else navigate('/quizzes');
                    }}
                  >
                    Take Action &rarr;
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Performance Trend & Recent Activity */}
        <div className="dashboard-side-col">
          {/* Performance Trend Chart */}
          <div className="section-panel">
            <div className="panel-header">
              <div className="panel-title-group">
                <h3>Performance Chart</h3>
                <p>Weekly learning progress</p>
              </div>
              <TrendingUp size={18} color="var(--primary)" />
            </div>

            <div className="chart-bars-container">
              {data?.performanceChart?.map((point, idx) => (
                <div key={idx} className="chart-bar-col">
                  <div className="bar-wrapper">
                    <div
                      className="bar-fill"
                      style={{ height: `${point.score}%` }}
                      title={`${point.score}%`}
                    >
                      <span className="bar-value">{point.score}%</span>
                    </div>
                  </div>
                  <span className="bar-label">{point.week}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="section-panel">
            <div className="panel-header">
              <div className="panel-title-group">
                <h3>Recent Activity</h3>
                <p>Latest quizzes & materials</p>
              </div>
            </div>

            <div className="activity-list">
              {data?.recentActivity?.length > 0 ? (
                data.recentActivity.map((act, idx) => (
                  <div key={idx} className="activity-item">
                    <div className="activity-dot" />
                    <div className="activity-details">
                      <span className="activity-desc">{act.description}</span>
                      <span className="activity-time">
                        {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    {act.score && <span className="activity-score-badge">{act.score}</span>}
                  </div>
                ))
              ) : (
                <div className="empty-activity">
                  <Clock size={24} color="var(--text-muted)" />
                  <p>No recent activity yet. Upload a PDF or take a quiz to get started!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
