import React, { useEffect, useState } from 'react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import {
  User,
  Mail,
  GraduationCap,
  Calendar,
  Save,
  Loader2,
  Award,
  Target,
  Brain,
  Flame,
  BookOpen
} from 'lucide-react';
import './Profile.css';

export default function Profile() {
  const { setUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    courseOrBranch: '',
    yearOfStudy: ''
  });
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await api.get('/profile');
      setProfile(res.data);
      setFormData({
        fullName: res.data.fullName || '',
        courseOrBranch: res.data.courseOrBranch || '',
        yearOfStudy: res.data.yearOfStudy || ''
      });
    } catch (err) {
      console.error('Failed to load profile', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await api.put('/profile', formData);
      setProfile(res.data);
      setUser((prev) => ({
        ...prev,
        fullName: res.data.fullName,
        courseOrBranch: res.data.courseOrBranch,
        yearOfStudy: res.data.yearOfStudy
      }));
      setSuccessMsg('Profile updated successfully!');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      alert('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="profile-loading">
        <Loader2 className="spin" size={36} color="var(--primary)" />
        <p>Loading your student profile...</p>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-header">
        <h2>👤 Student Profile & Settings</h2>
        <p>Manage your academic profile information and review your learning stats</p>
      </div>

      {successMsg && <div className="success-banner">{successMsg}</div>}

      <div className="profile-grid">
        {/* Left Column: Edit Form */}
        <div className="profile-card">
          <div className="profile-avatar-row">
            <div className="big-avatar">
              {profile?.fullName ? profile.fullName.charAt(0).toUpperCase() : 'S'}
            </div>
            <div>
              <h3>{profile?.fullName}</h3>
              <p className="profile-email-meta">{profile?.email}</p>
            </div>
          </div>

          <form onSubmit={handleSave} className="profile-form">
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>Course / Branch</label>
              <input
                type="text"
                value={formData.courseOrBranch}
                onChange={(e) => setFormData({ ...formData, courseOrBranch: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Year of Study</label>
              <select
                value={formData.yearOfStudy}
                onChange={(e) => setFormData({ ...formData, yearOfStudy: e.target.value })}
              >
                <option value="1st Year">1st Year</option>
                <option value="2nd Year">2nd Year</option>
                <option value="3rd Year">3rd Year</option>
                <option value="4th Year">4th Year</option>
                <option value="Postgraduate">Postgraduate</option>
              </select>
            </div>

            <div className="form-group">
              <label>Email (Read-Only)</label>
              <input type="email" value={profile?.email} disabled />
            </div>

            <button type="submit" className="save-btn" disabled={saving}>
              {saving ? (
                <span className="btn-spinner">
                  <Loader2 size={16} className="spin" /> Saving...
                </span>
              ) : (
                <>
                  <Save size={16} /> Save Changes
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Column: Lifetime Student Statistics */}
        <div className="profile-stats-card">
          <h3>Lifetime Academic Stats</h3>
          <div className="lifetime-stats-list">
            <div className="l-stat-item">
              <div className="l-stat-icon icon-purp">
                <Target size={20} />
              </div>
              <div className="l-stat-info">
                <span className="l-lbl">Learning Score</span>
                <span className="l-val">{profile?.learningScore}%</span>
              </div>
            </div>

            <div className="l-stat-item">
              <div className="l-stat-icon icon-teal">
                <Brain size={20} />
              </div>
              <div className="l-stat-info">
                <span className="l-lbl">Average Accuracy</span>
                <span className="l-val">{profile?.averageScore}%</span>
              </div>
            </div>

            <div className="l-stat-item">
              <div className="l-stat-icon icon-orange">
                <Flame size={20} />
              </div>
              <div className="l-stat-info">
                <span className="l-lbl">Current Streak</span>
                <span className="l-val">{profile?.currentStreak} Days</span>
              </div>
            </div>

            <div className="l-stat-item">
              <div className="l-stat-icon icon-blue">
                <Award size={20} />
              </div>
              <div className="l-stat-info">
                <span className="l-lbl">Quizzes Completed</span>
                <span className="l-val">{profile?.totalQuizzes} Tests</span>
              </div>
            </div>

            <div className="l-stat-item">
              <div className="l-stat-icon icon-ind">
                <BookOpen size={20} />
              </div>
              <div className="l-stat-info">
                <span className="l-lbl">Study Materials</span>
                <span className="l-val">{profile?.studyMaterialsCount} Documents</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
