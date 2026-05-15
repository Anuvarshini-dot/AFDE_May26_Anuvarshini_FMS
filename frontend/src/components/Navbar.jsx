import React from 'react';
import { Link, useLocation } from 'react-router-dom';

function Navbar() {
  const location = useLocation();

  const isActive = (path) => location.pathname === path ? 'active' : '';

  return (
    <nav className="navbar">
      <div className="navbar-brand">Feedback Management System</div>
      <div className="navbar-links">
        <Link to="/dashboard" className={isActive('/dashboard')}>Dashboard</Link>
        <Link to="/feedback" className={isActive('/feedback')}>All Feedback</Link>
        <Link to="/submit" className={isActive('/submit')}>Submit Feedback</Link>
      </div>
    </nav>
  );
}

export default Navbar;
