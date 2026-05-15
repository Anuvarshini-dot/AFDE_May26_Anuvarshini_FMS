import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllFeedback } from '../services/api';

const RATING_LABELS = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];

function Dashboard() {
  const [feedbackList, setFeedbackList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getAllFeedback()
      .then((res) => {
        setFeedbackList(res.data);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load feedback data.');
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="page"><div className="alert alert-error">{error}</div></div>;

  const totalCount = feedbackList.length;
  const avgRating =
    totalCount > 0
      ? (feedbackList.reduce((sum, f) => sum + f.rating, 0) / totalCount).toFixed(1)
      : '—';
  const recentFeedback = feedbackList.slice(0, 5);

  return (
    <div className="page">
      <h2>Dashboard</h2>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{totalCount}</div>
          <div className="stat-label">Total Feedback</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{avgRating}</div>
          <div className="stat-label">Average Rating</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">
            {totalCount > 0 ? RATING_LABELS[Math.round(parseFloat(avgRating))] : '—'}
          </div>
          <div className="stat-label">Overall Sentiment</div>
        </div>
      </div>

      <div className="section">
        <h3>Recent Feedback</h3>
        {recentFeedback.length === 0 ? (
          <p className="empty">No feedback submitted yet.</p>
        ) : (
          <>
            <table className="table">
              <thead>
                <tr>
                  <th>Participant</th>
                  <th>Program</th>
                  <th>Rating</th>
                  <th>Date</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {recentFeedback.map((f) => (
                  <tr key={f.feedback_id}>
                    <td>{f.participant_name}</td>
                    <td>{f.program_name}</td>
                    <td>
                      <span className={`badge rating-${f.rating}`}>
                        {f.rating} - {RATING_LABELS[f.rating]}
                      </span>
                    </td>
                    <td>{new Date(f.submitted_at).toLocaleDateString()}</td>
                    <td>
                      <Link to={`/feedback/${f.feedback_id}`} className="link">
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {totalCount > 5 && (
              <Link to="/feedback" className="btn-link">
                View all {totalCount} feedback records →
              </Link>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
