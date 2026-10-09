import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/client';
import {
  BookOpen,
  HelpCircle,
  ThumbsUp,
  Heart,
  HelpCircle as ConfusedIcon,
  ThumbsDown,
  ArrowLeft,
  Loader2,
  FileText,
  ListOrdered,
  FileSpreadsheet,
  CheckCircle2,
  Zap
} from 'lucide-react';
import './SummaryView.css';

export default function SummaryView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [material, setMaterial] = useState(null);
  const [summary, setSummary] = useState(null);
  const [level, setLevel] = useState('Standard');
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [reacted, setReacted] = useState(null);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const matRes = await api.get(`/materials/${id}`);
      setMaterial(matRes.data);

      const sumRes = await api.get(`/materials/${id}/summary`);
      if (sumRes.data) {
        setSummary(sumRes.data);
        setLevel(sumRes.data.summaryLevel || 'Standard');
      } else {
        // Auto summarize if none exists
        handleSummarize('Standard');
      }
    } catch (err) {
      console.error('Error fetching summary or material', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSummarize = async (selectedLevel) => {
    try {
      setGenerating(true);
      setLevel(selectedLevel);
      const res = await api.post(`/materials/${id}/summarize`, {
        summaryLevel: selectedLevel
      });
      setSummary(res.data);
    } catch (err) {
      alert('Failed to generate summary: ' + (err.response?.data?.message || err.message));
    } finally {
      setGenerating(false);
    }
  };

  const handleReaction = async (type) => {
    try {
      await api.post('/reactions', {
        targetType: 'SUMMARY',
        targetId: summary?.id,
        topic: summary?.materialTitle?.replace('.pdf', '') || 'Study Material',
        reactionType: type
      });
      setReacted(type);
    } catch (err) {
      console.error('Failed to record reaction', err);
    }
  };

  if (loading) {
    return (
      <div className="summary-loading">
        <Loader2 className="spin" size={36} color="var(--primary)" />
        <p>Opening study notes...</p>
      </div>
    );
  }

  return (
    <div className="summary-page">
      {/* Top Bar Navigation */}
      <div className="summary-nav-bar">
        <button className="back-btn" onClick={() => navigate('/materials')}>
          <ArrowLeft size={16} /> Back to Materials
        </button>
        <button
          className="quiz-cta-btn"
          onClick={() => navigate(`/quizzes?materialId=${id}&topic=${encodeURIComponent(material?.fileName?.replace('.pdf', ''))}`)}
        >
          <HelpCircle size={16} /> Generate Quiz from this PDF
        </button>
      </div>

      {/* Header with Title and Level Selector */}
      <div className="summary-header-card">
        <div className="summary-title-meta">
          <div className="title-icon">
            <BookOpen size={24} color="var(--primary)" />
          </div>
          <div>
            <h2>{material?.fileName}</h2>
            <p className="summary-sub">
              {material?.pageCount} Pages • Uploaded on {new Date(material?.uploadedAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Level Controls: Quick, Standard, Detailed */}
        <div className="level-controls">
          <span className="level-label">Summary Depth:</span>
          <div className="level-btn-group">
            {['Quick', 'Standard', 'Detailed'].map((lvl) => (
              <button
                key={lvl}
                className={`level-btn ${level === lvl ? 'active' : ''}`}
                onClick={() => handleSummarize(lvl)}
                disabled={generating}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Loading state for AI generation */}
      {generating ? (
        <div className="generating-card">
          <Loader2 className="spin" size={32} color="var(--primary)" />
          <h4>Creating your {level.toLowerCase()} summary...</h4>
          <p>Extracting key concepts, formulas, definitions, and high-yield exam points</p>
        </div>
      ) : summary ? (
        <div className="summary-content-grid">
          {/* Quick Summary Card */}
          <div className="summary-section-card full-width">
            <div className="section-badge">
              <Zap size={16} color="var(--primary)" /> Quick Summary
            </div>
            <p className="quick-summary-text">{summary.quickSummary}</p>
          </div>

          {/* Key Concepts */}
          <div className="summary-section-card">
            <div className="section-badge badge-blue">
              <ListOrdered size={16} /> Key Concepts
            </div>
            <ul className="concepts-list">
              {summary.keyConcepts?.map((c, idx) => (
                <li key={idx}>
                  <CheckCircle2 size={16} className="concept-check" />
                  <span>{c}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Important Definitions */}
          <div className="summary-section-card">
            <div className="section-badge badge-teal">
              <FileText size={16} /> Important Definitions
            </div>
            <div className="definitions-list">
              {summary.importantDefinitions?.map((d, idx) => (
                <div key={idx} className="definition-box">
                  <p>{d}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Important Formulas */}
          {summary.importantFormulas?.length > 0 && (
            <div className="summary-section-card">
              <div className="section-badge badge-purple">
                <FileSpreadsheet size={16} /> Important Formulas
              </div>
              <div className="formulas-list">
                {summary.importantFormulas?.map((f, idx) => (
                  <div key={idx} className="formula-box">
                    <code>{f}</code>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* High-Yield Exam Points */}
          <div className="summary-section-card">
            <div className="section-badge badge-amber">
              <CheckCircle2 size={16} /> High-Yield Exam Points
            </div>
            <ul className="exam-points-list">
              {summary.examPoints?.map((p, idx) => (
                <li key={idx}>
                  <span className="exam-point-bullet">★</span>
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Revision Takeaway */}
          <div className="summary-section-card full-width revision-card">
            <div className="section-badge badge-green">
              <Zap size={16} /> Quick Revision Takeaway
            </div>
            <p className="revision-text">{summary.quickRevision}</p>
          </div>

          {/* Reaction-Based Scoring Bar */}
          <div className="reaction-card full-width">
            <div className="reaction-prompt">
              <h4>Was this AI summary helpful for your understanding?</h4>
              <p>Your feedback shapes personalized score calculations & topic recommendations.</p>
            </div>
            <div className="reaction-buttons">
              <button
                className={`rx-btn ${reacted === 'HELPFUL' ? 'active helpful' : ''}`}
                onClick={() => handleReaction('HELPFUL')}
              >
                <ThumbsUp size={16} /> Helpful (+1)
              </button>
              <button
                className={`rx-btn ${reacted === 'EXCELLENT' ? 'active excellent' : ''}`}
                onClick={() => handleReaction('EXCELLENT')}
              >
                <Heart size={16} /> Excellent (+2)
              </button>
              <button
                className={`rx-btn ${reacted === 'CONFUSED' ? 'active confused' : ''}`}
                onClick={() => handleReaction('CONFUSED')}
              >
                <ConfusedIcon size={16} /> Still Confused (-1)
              </button>
              <button
                className={`rx-btn ${reacted === 'NOT_HELPFUL' ? 'active unhelpful' : ''}`}
                onClick={() => handleReaction('NOT_HELPFUL')}
              >
                <ThumbsDown size={16} /> Not Helpful (-2)
              </button>
            </div>
            {reacted && (
              <span className="rx-confirmed">Feedback recorded! Personalization updated.</span>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
