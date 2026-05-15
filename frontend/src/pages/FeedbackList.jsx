import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllFeedback, searchFeedback } from '../services/api';

const RATING_LABELS = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];
const INITIAL_FILTERS = { keyword: '', rating: '', program_name: '' };

function FeedbackList() {
  const [feedbackList, setFeedbackList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState(INITIAL_FILTERS);

  const fetchAll = () => {
    setLoading(true);
    setError('');
    getAllFeedback()
      .then((res) => setFeedbackList(res.data))
      .catch(() => setError('Failed to load feedback.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchAll(); }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const { keyword, rating, program_name } = filters;
    const hasFilters = keyword || rating || program_name;
    if (!hasFilters) { fetchAll(); return; }

    setLoading(true);
    setError('');
    searchFeedback({
      keyword: keyword || undefined,
      rating: rating ? parseInt(rating) : undefined,
      program_name: program_name || undefined,
    })
      .then((res) => setFeedbackList(res.data))
      .catch(() => setError('Search failed. Please try again.'))
      .finally(() => setLoading(false));
  };

  const handleReset = () => {
    setFilters(INITIAL_FILTERS);
    fetchAll();
  };

  return (
    <div className="page">
      <h2>All Feedback</h2>

      <div className="filter-card">
        <form onSubmit={handleSearch} className="filter-form">
          <input
            type="text"
            placeholder="Search by keyword in comments..."
            value={filters.keyword}
            onChange={(e) => setFilters({ ...filters, keyword: e.target.value })}
          />
          <input
            type="text"
            placeholder="Filter by program..."
            value={filters.program_name}
            onChange={(e) => setFilters({ ...filters, program_name: e.target.value })}
          />
          <select
            value={filters.rating}
            onChange={(e) => setFilters({ ...filters, rating: e.target.value })}
          >
            <option value="">All Ratings</option>
            <option value="1">1 - Poor</option>
            <option value="2">2 - Fair</option>
            <option value="3">3 - Good</option>
            <option value="4">4 - Very Good</option>
            <option value="5">5 - Excellent</option>
          </select>
          <button type="submit" className="btn-primary">Search</button>
          <button type="button" className="btn-secondary" onClick={handleReset}>Reset</button>
        </form>
      </div>

      {loading ? (
        <div className="loading">Loading...</div>
      ) : error ? (
        <div className="alert alert-error">{error}</div>
      ) : feedbackList.length === 0 ? (
        <div className="empty-state">No feedback records found.</div>
      ) : (
        <div className="section">
          <table className="table">
            <thead>
              <tr>
                <th>#</th>
                <th>Participant</th>
                <th>Program</th>
                <th>Rating</th>
                <th>Comments</th>
                <th>Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {feedbackList.map((f) => (
                <tr key={f.feedback_id}>
                  <td>{f.feedback_id}</td>
                  <td>{f.participant_name}</td>
                  <td>{f.program_name}</td>
                  <td>
                    <span className={`badge rating-${f.rating}`}>
                      {f.rating} - {RATING_LABELS[f.rating]}
                    </span>
                  </td>
                  <td className="comment-cell">
                    {f.comments
                      ? f.comments.length > 60
                        ? f.comments.substring(0, 60) + '...'
                        : f.comments
                      : '—'}
                  </td>
                  <td>{new Date(f.submitted_at).toLocaleDateString()}</td>
                  <td>
                    <Link to={`/feedback/${f.feedback_id}`} className="link">View</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default FeedbackList;
