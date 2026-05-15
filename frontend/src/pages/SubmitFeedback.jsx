import React, { useState } from 'react';
import { createFeedback } from '../services/api';

const RATING_OPTIONS = [
  { value: 1, label: '1 - Poor' },
  { value: 2, label: '2 - Fair' },
  { value: 3, label: '3 - Good' },
  { value: 4, label: '4 - Very Good' },
  { value: 5, label: '5 - Excellent' },
];

const INITIAL_FORM = { participant_name: '', program_name: '', rating: '', comments: '' };

function SubmitFeedback() {
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const errs = {};
    if (!form.participant_name.trim()) errs.participant_name = 'Participant name is required.';
    if (!form.program_name.trim()) errs.program_name = 'Program / event name is required.';
    if (!form.rating) errs.rating = 'Please select a rating.';
    return errs;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setSubmitting(true);
    setSuccess('');
    try {
      await createFeedback({ ...form, rating: parseInt(form.rating) });
      setSuccess('Feedback submitted successfully!');
      setForm(INITIAL_FORM);
    } catch {
      setErrors({ submit: 'Failed to submit feedback. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page">
      <h2>Submit Feedback</h2>
      {success && <div className="alert alert-success">{success}</div>}
      {errors.submit && <div className="alert alert-error">{errors.submit}</div>}
      <div className="form-card">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Participant Name *</label>
            <input
              type="text"
              name="participant_name"
              value={form.participant_name}
              onChange={handleChange}
              placeholder="Enter your name"
              className={errors.participant_name ? 'input-error' : ''}
            />
            {errors.participant_name && (
              <span className="error-msg">{errors.participant_name}</span>
            )}
          </div>

          <div className="form-group">
            <label>Training / Event / Product Name *</label>
            <input
              type="text"
              name="program_name"
              value={form.program_name}
              onChange={handleChange}
              placeholder="Enter training or event name"
              className={errors.program_name ? 'input-error' : ''}
            />
            {errors.program_name && (
              <span className="error-msg">{errors.program_name}</span>
            )}
          </div>

          <div className="form-group">
            <label>Rating *</label>
            <select
              name="rating"
              value={form.rating}
              onChange={handleChange}
              className={errors.rating ? 'input-error' : ''}
            >
              <option value="">Select a rating</option>
              {RATING_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            {errors.rating && <span className="error-msg">{errors.rating}</span>}
          </div>

          <div className="form-group">
            <label>Comments</label>
            <textarea
              name="comments"
              value={form.comments}
              onChange={handleChange}
              placeholder="Share your feedback..."
              rows={4}
            />
          </div>

          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? 'Submitting...' : 'Submit Feedback'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default SubmitFeedback;
