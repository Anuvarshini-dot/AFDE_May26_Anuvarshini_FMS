import React from 'react';
import { Link, useLocation } from 'react-router-dom';

function Navbar({ role, onSwitchRole }) {
  const location = useLocation();
  const isActive = (path) => location.pathname === path ? 'active' : '';

  return (
    <nav className="sidebar">
      <div className="sidebar-brand">Feedback Management System</div>

      <div className="sidebar-links">
        <Link to="/dashboard" className={isActive('/dashboard')}>Dashboard</Link>
        <Link to="/feedback" className={isActive('/feedback')}>All Feedback</Link>
        {role === 'user' && (
          <Link to="/submit" className={isActive('/submit')}>Submit Feedback</Link>
        )}
      </div>

      <div className="sidebar-footer">
        <div className="sidebar-role-badge">
          <span className="sidebar-role-dot" />
          {role === 'admin' ? 'Admin' : 'User'}
        </div>
        <button className="sidebar-switch-btn" onClick={onSwitchRole}>
          Switch Role
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
