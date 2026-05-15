import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllFeedback } from '../services/api';

const RATING_LABELS = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];
const RATING_COLOR = ['', '#ef4444', '#f97316', '#3b82f6', '#22c55e', '#16a34a'];

function StarBar({ rating }) {
  const num = parseFloat(rating);
  const full = num - Math.floor(num) >= 0.75 ? Math.ceil(num) : Math.floor(num);
  const half = num - Math.floor(num) >= 0.25 && num - Math.floor(num) < 0.75;
  const empty = 5 - full - (half ? 1 : 0);
  return (
    <span className="star-bar">
      {Array(full).fill(null).map((_, i) => (
        <span key={`f${i}`} className="star star-filled">&#9733;</span>
      ))}
      {half && <span className="star star-half">&#9733;</span>}
      {Array(empty).fill(null).map((_, i) => (
        <span key={`e${i}`} className="star star-empty">&#9733;</span>
      ))}
    </span>
  );
}

function Dashboard() {
  const [feedbackList, setFeedbackList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getAllFeedback()
      .then((res) => { setFeedbackList(res.data); setLoading(false); })
      .catch(() => { setError('Failed to load feedback data.'); setLoading(false); });
  }, []);

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="page"><div className="alert alert-error">{error}</div></div>;

  const totalCount = feedbackList.length;
  const avgRating =
    totalCount > 0
      ? (feedbackList.reduce((sum, f) => sum + f.rating, 0) / totalCount).toFixed(1)
      : null;

  const programStats = feedbackList.reduce((acc, f) => {
    const prog = f.program_name;
    if (!acc[prog]) acc[prog] = { count: 0, total: 0 };
    acc[prog].count += 1;
    acc[prog].total += f.rating;
    return acc;
  }, {});

  const programList = Object.entries(programStats)
    .map(([name, data]) => ({
      name,
      count: data.count,
      avgRating: (data.total / data.count).toFixed(1),
    }))
    .sort((a, b) => b.count - a.count);

  const recentFeedback = feedbackList.slice(0, 5);

  return (
    <div className="page">
      <h2>Dashboard</h2>

      {/* Overall summary */}
      <div className="overview-grid">
        <div className="overview-card overview-card-total">
          <div className="overview-icon">&#128203;</div>
          <div className="overview-right">
            <div className="overview-value">{totalCount}</div>
            <div className="overview-label">Total Feedback</div>
          </div>
        </div>
        <div className="overview-card overview-card-rating">
          <div className="overview-icon">&#9733;</div>
          <div className="overview-right">
            <div className="overview-value">{avgRating ?? '—'} <span className="overview-outof">/5</span></div>
            <div className="overview-label">Overall Rating</div>
            {avgRating && (
              <div className="overview-tag" style={{ background: RATING_COLOR[Math.round(parseFloat(avgRating))] }}>
                {RATING_LABELS[Math.round(parseFloat(avgRating))]}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Program-wise stats */}
      {programList.length > 0 && (
        <div className="program-section">
          <div className="program-section-header">
            <span className="program-section-title">Program-wise Feedback</span>
            <span className="program-section-count">{programList.length} program{programList.length !== 1 ? 's' : ''}</span>
          </div>
          <div className="program-grid">
            {programList.map((p) => {
              const ratingNum = Math.round(parseFloat(p.avgRating));
              return (
                <div className="program-card" key={p.name}>
                  <div className="program-card-header">
                    <span className="program-card-name" title={p.name}>{p.name}</span>
                    <span className="program-card-tag" style={{ background: RATING_COLOR[ratingNum] + '22', color: RATING_COLOR[ratingNum] }}>
                      {RATING_LABELS[ratingNum]}
                    </span>
                  </div>
                  <div className="program-card-metrics">
                    <div className="program-metric">
                      <div className="program-metric-value">{p.count}</div>
                      <div className="program-metric-label">Feedback{p.count !== 1 ? 's' : ''}</div>
                    </div>
                    <div className="program-metric-divider" />
                    <div className="program-metric">
                      <div className="program-metric-value">{p.avgRating}</div>
                      <div className="program-metric-label">Avg Rating</div>
                    </div>
                  </div>
                  <StarBar rating={p.avgRating} />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recent feedback */}
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
                        {f.rating} — {RATING_LABELS[f.rating]}
                      </span>
                    </td>
                    <td>{new Date(f.submitted_at).toLocaleDateString()}</td>
                    <td>
                      <Link to={`/feedback/${f.feedback_id}`} className="link">View</Link>
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
