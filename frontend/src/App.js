import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import RoleSelect from './pages/RoleSelect';
import Dashboard from './pages/Dashboard';
import SubmitFeedback from './pages/SubmitFeedback';
import FeedbackList from './pages/FeedbackList';
import FeedbackDetail from './pages/FeedbackDetail';
import './App.css';

function App() {
  const [role, setRole] = useState(null);

  if (!role) {
    return <RoleSelect onSelectRole={setRole} />;
  }

  return (
    <Router>
      <div className="app-layout">
        <Navbar role={role} onSwitchRole={() => setRole(null)} />
        <div className="main-content">
          <div className="container">
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/feedback" element={<FeedbackList />} />
              <Route path="/feedback/:id" element={<FeedbackDetail role={role} />} />
              {role === 'user' && <Route path="/submit" element={<SubmitFeedback />} />}
              <Route path="*" element={<Navigate to="/dashboard" />} />
            </Routes>
          </div>
        </div>
      </div>
    </Router>
  );
}

export default App;
