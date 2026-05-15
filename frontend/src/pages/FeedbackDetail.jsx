import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getFeedbackById, updateFeedback, deleteFeedback } from '../services/api';

const RATING_LABELS = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];

function FeedbackDetail({ role }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [feedback, setFeedback] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState('');

  useEffect(() => {
    getFeedbackById(id)
      .then((res) => {
        setFeedback(res.data);
        setForm(res.data);
        setLoading(false);
      })
      .catch(() => {
        setPageError('Feedback record not found.');
        setLoading(false);
      });
  }, [id]);

  const validate = () => {
    const errs = {};
    if (!form.participant_name?.trim()) errs.participant_name = 'Required';
    if (!form.program_name?.trim()) errs.program_name = 'Required';
    if (!form.rating) errs.rating = 'Required';
    return errs;
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    try {
      const res = await updateFeedback(id, {
        participant_name: form.participant_name,
        program_name: form.program_name,
        rating: parseInt(form.rating),
        comments: form.comments,
      });
      setFeedback(res.data);
      setEditing(false);
      setErrors({});
    } catch {
      setErrors({ submit: 'Update failed. Please try again.' });
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this feedback?')) return;
    try {
      await deleteFeedback(id);
      navigate('/feedback');
    } catch {
      setPageError('Delete failed. Please try again.');
    }
  };

  const cancelEdit = () => {
    setEditing(false);
    setForm(feedback);
    setErrors({});
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (pageError) return (
    <div className="page">
      <div className="alert alert-error">{pageError}</div>
      <button className="back-link" onClick={() => navigate('/feedback')}>← Back to Feedback List</button>
    </div>
  );

  return (
    <div className="page">
      <div className="detail-header">
        <h2>Feedback Details</h2>
        {!editing && role === 'admin' && (
          <div className="detail-actions">
            <button className="btn-secondary" onClick={() => setEditing(true)}>Edit</button>
            <button className="btn-danger" onClick={handleDelete}>Delete</button>
          </div>
        )}
      </div>

      {editing ? (
        <div className="form-card">
          {errors.submit && <div className="alert alert-error">{errors.submit}</div>}
          <form onSubmit={handleUpdate}>
            <div className="form-group">
              <label>Participant Name *</label>
              <input
                type="text"
                value={form.participant_name}
                onChange={(e) => setForm({ ...form, participant_name: e.target.value })}
                className={errors.participant_name ? 'input-error' : ''}
              />
              {errors.participant_name && <span className="error-msg">{errors.participant_name}</span>}
            </div>
            <div className="form-group">
              <label>Program Name *</label>
              <input
                type="text"
                value={form.program_name}
                onChange={(e) => setForm({ ...form, program_name: e.target.value })}
                className={errors.program_name ? 'input-error' : ''}
              />
              {errors.program_name && <span className="error-msg">{errors.program_name}</span>}
            </div>
            <div className="form-group">
              <label>Rating *</label>
              <select
                value={form.rating}
                onChange={(e) => setForm({ ...form, rating: e.target.value })}
                className={errors.rating ? 'input-error' : ''}
              >
                <option value="1">1 - Poor</option>
                <option value="2">2 - Fair</option>
                <option value="3">3 - Good</option>
                <option value="4">4 - Very Good</option>
                <option value="5">5 - Excellent</option>
              </select>
              {errors.rating && <span className="error-msg">{errors.rating}</span>}
            </div>
            <div className="form-group">
              <label>Comments</label>
              <textarea
                value={form.comments || ''}
                onChange={(e) => setForm({ ...form, comments: e.target.value })}
                rows={4}
              />
            </div>
            <div className="form-actions">
              <button type="submit" className="btn-primary">Save Changes</button>
              <button type="button" className="btn-secondary" onClick={cancelEdit}>Cancel</button>
            </div>
          </form>
        </div>
      ) : (
        <div className="detail-card">
          <div className="detail-row">
            <span className="detail-label">Feedback ID</span>
            <span className="detail-value">#{feedback.feedback_id}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Participant Name</span>
            <span className="detail-value">{feedback.participant_name}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Program Name</span>
            <span className="detail-value">{feedback.program_name}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Rating</span>
            <span className="detail-value">
              <span className={`badge rating-${feedback.rating}`}>
                {feedback.rating} - {RATING_LABELS[feedback.rating]}
              </span>
            </span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Comments</span>
            <span className="detail-value">{feedback.comments || '—'}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Submitted At</span>
            <span className="detail-value">{new Date(feedback.submitted_at).toLocaleString()}</span>
          </div>
        </div>
      )}

      <button className="back-link" onClick={() => navigate('/feedback')}>
        ← Back to Feedback List
      </button>
    </div>
  );
}

export default FeedbackDetail;
