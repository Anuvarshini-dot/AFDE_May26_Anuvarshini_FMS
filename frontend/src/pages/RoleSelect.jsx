import React from 'react';

function RoleSelect({ onSelectRole }) {
  return (
    <div className="role-page">
      <div className="role-container">
        <div className="role-header">
          <div className="role-logo">FMS</div>
          <h1 className="role-title">Feedback Management System</h1>
          <p className="role-subtitle">Select your role to continue</p>
        </div>

        <div className="role-cards">
          <div className="role-card" onClick={() => onSelectRole('admin')}>
            <div className="role-card-icon role-icon-admin">A</div>
            <h3 className="role-card-title">Admin</h3>
            <p className="role-card-desc">View the dashboard and manage all submitted feedback</p>
            <button className="role-btn role-btn-admin">Continue as Admin</button>
          </div>

          <div className="role-card" onClick={() => onSelectRole('user')}>
            <div className="role-card-icon role-icon-user">U</div>
            <h3 className="role-card-title">User</h3>
            <p className="role-card-desc">View the dashboard and submit your feedback</p>
            <button className="role-btn role-btn-user">Continue as User</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RoleSelect;
