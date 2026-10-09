import React, { useEffect, useState, useRef } from 'react';
import api from '../api/client';
import {
  Bot,
  Send,
  Sparkles,
  BookOpen,
  ThumbsUp,
  Heart,
  HelpCircle,
  ThumbsDown,
  Loader2,
  User,
  Zap,
  GraduationCap
} from 'lucide-react';
import './Mentor.css';

export default function Mentor() {
  const [materials, setMaterials] = useState([]);
  const [selectedMaterialId, setSelectedMaterialId] = useState('');
  const [topic, setTopic] = useState('Fourier Transform');
  const [mode, setMode] = useState('Simple'); // Simple, Detailed, Exam, Revision
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState([]);
  const [sending, setSending] = useState(false);
  const [reactedMsgId, setReactedMsgId] = useState({});
  const chatEndRef = useRef(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sending]);

  const fetchInitialData = async () => {
    try {
      const matRes = await api.get('/materials');
      setMaterials(matRes.data);

      const histRes = await api.get('/mentor/history');
      if (histRes.data && histRes.data.length > 0) {
        setMessages(histRes.data);
      } else {
        // Welcome message
        setMessages([
          {
            sender: 'AI',
            mode: 'Simple',
            text: "Hello Naveen! I'm your Pocket AI Mentor. I can break down challenging engineering and academic concepts into simple analogies, generate 5-mark exam answers, or list high-yield formulas. What are you studying today?",
            timestamp: new Date().toISOString()
          }
        ]);
      }
    } catch (err) {
      console.error('Failed to load mentor initial data', err);
    }
  };

  const handleSend = async (e) => {
    if (e) e.preventDefault();
    if (!question.trim()) return;

    const userMsg = {
      sender: 'USER',
      text: question.trim(),
      mode: mode,
      timestamp: new Date().toISOString()
    };

    setMessages((prev) => [...prev, userMsg]);
    const currentQuestion = question.trim();
    setQuestion('');
    setSending(true);

    try {
      const res = await api.post('/mentor/ask', {
        materialId: selectedMaterialId || null,
        topic: topic || 'Study Topic',
        question: currentQuestion,
        mode: mode
      });

      const aiMsg = {
        sender: 'AI',
        text: res.data.answer,
        mode: res.data.mode,
        timestamp: res.data.timestamp
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'AI',
          text: 'Apologies, I encountered an issue processing that query. Please try again or rephrase your question.',
          mode: mode,
          timestamp: new Date().toISOString()
        }
      ]);
    } finally {
      setSending(false);
    }
  };

  const handleQuickPrompt = (promptText) => {
    setQuestion(promptText);
  };

  const handleReaction = async (msgIdx, type) => {
    try {
      await api.post('/reactions', {
        targetType: 'MENTOR_CHAT',
        targetId: `chat_${msgIdx}`,
        topic: topic || 'Study Topic',
        reactionType: type
      });
      setReactedMsgId((prev) => ({ ...prev, [msgIdx]: type }));
    } catch (err) {
      console.error('Failed to record chat reaction', err);
    }
  };

  return (
    <div className="mentor-page">
      {/* Mentor Header with Topic & Response Mode Controls */}
      <div className="mentor-header-card">
        <div className="mentor-header-top">
          <div className="mentor-avatar-badge">
            <Bot size={26} color="var(--primary)" />
            <div>
              <h3>AI Study Mentor</h3>
              <p>Context-aware pedagogical tutor with exam mode & instant analogies</p>
            </div>
          </div>

          <div className="mentor-controls">
            <div className="ctrl-group">
              <label>Reference PDF:</label>
              <select
                value={selectedMaterialId}
                onChange={(e) => setSelectedMaterialId(e.target.value)}
              >
                <option value="">General Academic Context</option>
                {materials.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.fileName}
                  </option>
                ))}
              </select>
            </div>

            <div className="ctrl-group">
              <label>Topic:</label>
              <input
                type="text"
                value={topic}
                placeholder="e.g. Fourier Transform"
                onChange={(e) => setTopic(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Mode Selector */}
        <div className="mode-selector-row">
          <span className="mode-title">Mentor Response Mode:</span>
          <div className="mode-pills">
            {[
              { id: 'Simple', label: 'Simple (Analogies)' },
              { id: 'Detailed', label: 'Detailed (Deep Dive)' },
              { id: 'Exam', label: 'Exam (5-Mark Answer)' },
              { id: 'Revision', label: 'Revision (Flash Points)' }
            ].map((m) => (
              <button
                key={m.id}
                className={`mode-pill ${mode === m.id ? 'active' : ''}`}
                onClick={() => setMode(m.id)}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chat Messages Log */}
      <div className="mentor-chat-area">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`chat-message-row ${msg.sender === 'USER' ? 'user-row' : 'ai-row'}`}
          >
            <div className="chat-avatar">
              {msg.sender === 'USER' ? <User size={18} /> : <Bot size={18} />}
            </div>

            <div className="chat-bubble">
              <div className="bubble-header">
                <span className="bubble-sender">
                  {msg.sender === 'USER' ? 'You' : 'Pocket Mentor'}
                </span>
                {msg.mode && <span className="bubble-mode">[{msg.mode} Mode]</span>}
              </div>

              <div className="bubble-text">
                {msg.text.split('\n').map((line, lIdx) => (
                  <p key={lIdx}>{line}</p>
                ))}
              </div>

              {msg.sender === 'AI' && (
                <div className="chat-reactions">
                  <span className="chat-rx-label">Helpful?</span>
                  <button
                    className={`rx-tiny-btn ${reactedMsgId[idx] === 'HELPFUL' ? 'active' : ''}`}
                    onClick={() => handleReaction(idx, 'HELPFUL')}
                    title="Helpful (+1)"
                  >
                    <ThumbsUp size={13} />
                  </button>
                  <button
                    className={`rx-tiny-btn ${reactedMsgId[idx] === 'EXCELLENT' ? 'active' : ''}`}
                    onClick={() => handleReaction(idx, 'EXCELLENT')}
                    title="Excellent (+2)"
                  >
                    <Heart size={13} />
                  </button>
                  <button
                    className={`rx-tiny-btn ${reactedMsgId[idx] === 'CONFUSED' ? 'active' : ''}`}
                    onClick={() => handleReaction(idx, 'CONFUSED')}
                    title="Still Confused (-1)"
                  >
                    <HelpCircle size={13} />
                  </button>
                  <button
                    className={`rx-tiny-btn ${reactedMsgId[idx] === 'NOT_HELPFUL' ? 'active' : ''}`}
                    onClick={() => handleReaction(idx, 'NOT_HELPFUL')}
                    title="Not Helpful (-2)"
                  >
                    <ThumbsDown size={13} />
                  </button>
                  {reactedMsgId[idx] && (
                    <span className="rx-recorded-text">Recorded</span>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}

        {sending && (
          <div className="chat-message-row ai-row">
            <div className="chat-avatar">
              <Bot size={18} />
            </div>
            <div className="chat-bubble ai-thinking">
              <Loader2 size={16} className="spin" color="var(--primary)" />
              <span>Mentor is analyzing context and formulating response...</span>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Suggested Quick Prompts */}
      <div className="quick-prompts-bar">
        <span className="quick-label">Try asking:</span>
        <button
          className="quick-prompt-chip"
          onClick={() => handleQuickPrompt(`Explain ${topic} simply with a real-world analogy.`)}
        >
          "Explain {topic} simply"
        </button>
        <button
          className="quick-prompt-chip"
          onClick={() => handleQuickPrompt(`Format an answer for a 5-mark university exam question on ${topic}.`)}
        >
          "5-mark exam answer"
        </button>
        <button
          className="quick-prompt-chip"
          onClick={() => handleQuickPrompt(`What are the key mathematical formulas and properties for ${topic}?`)}
        >
          "Important formulas"
        </button>
        <button
          className="quick-prompt-chip"
          onClick={() => handleQuickPrompt(`Give me 3 practice MCQ hints for ${topic}.`)}
        >
          "Practice hints"
        </button>
      </div>

      {/* Message Input Bar */}
      <form onSubmit={handleSend} className="mentor-input-form">
        <input
          type="text"
          placeholder={`Ask anything about ${topic || 'your studies'}...`}
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          disabled={sending}
        />
        <button type="submit" className="mentor-send-btn" disabled={sending || !question.trim()}>
          {sending ? <Loader2 size={18} className="spin" /> : <Send size={18} />}
        </button>
      </form>
    </div>
  );
}
