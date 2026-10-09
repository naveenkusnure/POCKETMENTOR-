import React, { useEffect, useState } from 'react';
import api from '../api/client';
import {
  TrendingUp,
  Target,
  Brain,
  Flame,
  Award,
  BookOpen,
  Calendar,
  Loader2,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import './ProgressView.css';

export default function ProgressView() {
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProgress();
  }, []);

  const fetchProgress = async () => {
    try {
      setLoading(true);
      const res = await api.get('/progress');
      setProgress(res.data);
    } catch (err) {
      console.error('Failed to load progress', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="progress-loading">
        <Loader2 className="spin" size={36} color="var(--primary)" />
        <p>Loading your progress analytics...</p>
      </div>
    );
  }

  return (
    <div className="progress-page">
      <div className="progress-header">
        <h2>📊 Academic Progress & Mastery</h2>
        <p>Comprehensive tracking of your study momentum, topic mastery, and consistency</p>
      </div>

      {/* Metrics Row */}
      <div className="progress-metrics-row">
        <div className="metric-box">
          <Target size={22} color="var(--primary)" />
          <span className="metric-lbl">Learning Score</span>
          <h3>{progress?.learningScore}%</h3>
          <span className="metric-note">Configured weighted formula</span>
        </div>

        <div className="metric-box">
          <Brain size={22} color="#0d9488" />
          <span className="metric-lbl">Quiz Accuracy</span>
          <h3>{progress?.quizAccuracy}%</h3>
          <span className="metric-note">{progress?.totalQuizzesCompleted} Quizzes completed</span>
        </div>

        <div className="metric-box">
          <Flame size={22} color="#ea580c" />
          <span className="metric-lbl">Study Streak</span>
          <h3>{progress?.studyStreakDays} Days</h3>
          <span className="metric-note">Daily active retention</span>
        </div>
      </div>

      {/* Formula Explanation Callout */}
      <div className="formula-card">
        <h4>📐 How is your Learning Score calculated?</h4>
        <div className="formula-grid">
          <div className="formula-item">
            <span className="weight-percent">50%</span>
            <span className="weight-title">Quiz Performance</span>
            <p>Average test accuracy and question difficulty.</p>
          </div>
          <div className="formula-item">
            <span className="weight-percent">20%</span>
            <span className="weight-title">Topic Mastery</span>
            <p>Coverage of syllabus topics without confusion flags.</p>
          </div>
          <div className="formula-item">
            <span className="weight-percent">15%</span>
            <span className="weight-title">Study Consistency</span>
            <p>Consecutive streak and regular study intervals.</p>
          </div>
          <div className="formula-item">
            <span className="weight-percent">15%</span>
            <span className="weight-title">Reaction Feedback</span>
            <p>Helpful / Excellent reactions vs Confused flags.</p>
          </div>
        </div>
      </div>

      {/* Topics Mastery: Weak vs Strong */}
      <div className="mastery-grid">
        <div className="mastery-card card-weak">
          <div className="card-m-header">
            <AlertTriangle size={20} color="#b45309" />
            <h3>Topics Needing Revision</h3>
          </div>
          <div className="topics-pill-list">
            {progress?.weakTopics?.map((t, idx) => (
              <div key={idx} className="topic-pill pill-amber">
                <span>{t}</span>
                <span className="pill-status">Action needed</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mastery-card card-strong">
          <div className="card-m-header">
            <CheckCircle2 size={20} color="#15803d" />
            <h3>Strong Mastery Topics</h3>
          </div>
          <div className="topics-pill-list">
            {progress?.strongTopics?.map((t, idx) => (
              <div key={idx} className="topic-pill pill-green">
                <span>{t}</span>
                <span className="pill-status">High accuracy</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
