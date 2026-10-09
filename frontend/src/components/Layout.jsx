import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Menu, Bell } from 'lucide-react';
import './Layout.css';

export default function Layout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="layout-container">
      <Sidebar
        mobileOpen={mobileMenuOpen}
        closeMobile={() => setMobileMenuOpen(false)}
      />

      <div className="layout-main">
        <header className="mobile-header">
          <button
            className="hamburger-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <Menu size={22} />
          </button>
          <div className="mobile-brand-title">POCKET MENTOR</div>
          <div className="header-actions">
            <button className="icon-btn" title="Notifications">
              <Bell size={18} />
            </button>
          </div>
        </header>

        <main className="content-area">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
