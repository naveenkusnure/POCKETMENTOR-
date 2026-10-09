import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Home,
  BookOpen,
  Bot,
  HelpCircle,
  TrendingUp,
  Sparkles,
  User,
  LogOut,
  GraduationCap
} from 'lucide-react';
import './Sidebar.css';

export default function Sidebar({ mobileOpen, closeMobile }) {
  const { logout, user } = useAuth();

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: Home },
    { to: '/materials', label: 'My Materials', icon: BookOpen },
    { to: '/mentor', label: 'AI Mentor', icon: Bot },
    { to: '/quizzes', label: 'Quizzes', icon: HelpCircle },
    { to: '/progress', label: 'Progress', icon: TrendingUp },
    { to: '/prediction', label: 'Score Prediction', icon: Sparkles },
    { to: '/profile', label: 'Profile', icon: User },
  ];

  return (
    <>
      {mobileOpen && <div className="sidebar-overlay" onClick={closeMobile} />}
      <aside className={`app-sidebar ${mobileOpen ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <GraduationCap className="brand-logo" size={30} />
          <div className="brand-titles">
            <span className="brand-title">POCKET MENTOR</span>
            <span className="brand-subtitle">AI STUDY ASSISTANT</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                onClick={closeMobile}
              >
                <Icon size={19} className="nav-icon" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div className="student-profile-mini">
            <div className="avatar-circle">
              {user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'S'}
            </div>
            <div className="profile-details">
              <span className="profile-name">{user?.fullName || 'Student'}</span>
              <span className="profile-meta">{user?.courseOrBranch || 'ECE'} • {user?.yearOfStudy || 'Student'}</span>
            </div>
          </div>
          <button className="logout-btn" onClick={logout} title="Logout">
            <LogOut size={18} />
          </button>
        </div>
      </aside>
    </>
  );
}
