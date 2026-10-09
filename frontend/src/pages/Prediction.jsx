import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import {
  Sparkles,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  ShieldAlert,
  Loader2,
  ArrowRight,
  HelpCircle,
  Flame,
  Brain
} from 'lucide-react';
import './Prediction.css';

export default function Prediction() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPrediction();
  }, []);

  const fetchPrediction = async () => {
    try {
      setLoading(true);
      const res = await api.get('/prediction');
      setData(res.data);
    } catch (err) {
      console.error('Failed to load prediction', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="prediction-loading">
        <Loader2 className="spin" size={36} color="var(--primary)" />
        <p>Analyzing learning patterns and compiling exam forecast...</p>
      </div>
    );
  }

  return (
    <div className="prediction-page">
      {/* Header */}
      <div className="prediction-header">
        <div className="pred-title-group">
          <h2>🔮 Exam Score Predictor</h2>
          <p>Continuous AI forecasting synthesizing quiz accuracy, topic mastery, and study consistency</p>
        </div>
      </div>

      {/* Main Score Prediction Card */}
      <div className="prediction-hero-card">
        <div className="hero-left">
          <span className="hero-badge">Predicted Exam Score</span>
          <div className="hero-score-val">
            <h1>{data?.predictedScore}</h1>
            <span className="score-denominator">/ 100</span>
          </div>
          <div className="hero-meta-row">
            <span className="confidence-tag">Model Confidence: {data?.confidencePercentage}%</span>
            <span className="trend-tag">Trend: {data?.trend || 'Improving ↑'}</span>
          </div>
        </div>

        <div className="hero-right">
          <div className="recommendation-callout">
            <div className="callout-icon">
              <Sparkles size={20} color="var(--primary)" />
            </div>
            <div>
              <h4>Targeted Recommendation:</h4>
              <p>{data?.recommendation}</p>
            </div>
          </div>
          <button
            className="action-study-btn"
            onClick={() => navigate('/quizzes')}
          >
            Practice Recommended Topic &rarr;
          </button>
        </div>
      </div>

      {/* Explanation Breakdown Grid: Why this prediction? */}
      <div className="explanation-grid">
        {/* Positive Factors */}
        <div className="expl-card expl-positive">
          <div className="expl-card-header">
            <CheckCircle size={20} className="expl-icon pos-icon" />
            <h3>Why this prediction? (Positive Strengths)</h3>
          </div>
          <ul className="expl-list">
            {data?.positiveFactors?.map((f, idx) => (
              <li key={idx}>
                <span className="check-bullet">✓</span>
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Areas Needing Improvement */}
        <div className="expl-card expl-needs-work">
          <div className="expl-card-header">
            <AlertCircle size={20} className="expl-icon warn-icon" />
            <h3>Needs Improvement & Focus</h3>
          </div>
          <ul className="expl-list">
            {data?.improvementAreas?.map((area, idx) => (
              <li key={idx}>
                <span className="warn-bullet">⚠</span>
                <span>{area}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Prediction Disclaimer */}
      <div className="disclaimer-banner">
        <ShieldAlert size={20} className="disclaimer-icon" />
        <div className="disclaimer-content">
          <h4>Academic Notice & Methodology</h4>
          <p>{data?.disclaimer || 'Prediction is an estimated learning indicator based on your activity and quiz performance. It is not a guaranteed exam score.'}</p>
        </div>
      </div>
    </div>
  );
}
