import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import SubmitFeedback from './pages/SubmitFeedback';
import FeedbackList from './pages/FeedbackList';
import FeedbackDetail from './pages/FeedbackDetail';
import './App.css';

function App() {
  return (
    <Router>
      <Navbar />
      <div className="container">
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/submit" element={<SubmitFeedback />} />
          <Route path="/feedback" element={<FeedbackList />} />
          <Route path="/feedback/:id" element={<FeedbackDetail />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
