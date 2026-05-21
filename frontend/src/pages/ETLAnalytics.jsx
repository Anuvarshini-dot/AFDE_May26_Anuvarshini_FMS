import { useState, useEffect } from 'react';
import { getETLAnalytics, downloadReport, searchFeedback } from '../services/api';

const STAR = '★';
const EMPTY_STAR = '☆';

function StarRating({ value }) {
  const full = Math.floor(value);
  const half = value - full >= 0.5;
  return (
    <span className="stars">
      {Array.from({ length: 5 }, (_, i) => {
        if (i < full) return <span key={i} className="star full">{STAR}</span>;
        if (i === full && half) return <span key={i} className="star half">{STAR}</span>;
        return <span key={i} className="star empty">{EMPTY_STAR}</span>;
      })}
      <span className="star-value">{value.toFixed(1)}</span>
    </span>
  );
}

function RatingBar({ label, count, max }) {
  const pct = max > 0 ? Math.round((count / max) * 100) : 0;
  const colorMap = { 1: '#ef4444', 2: '#f97316', 3: '#3b82f6', 4: '#22c55e', 5: '#15803d' };
  return (
    <div className="rating-bar-row">
      <span className="rating-bar-label">{label} ★</span>
      <div className="rating-bar-track">
        <div
          className="rating-bar-fill"
          style={{ width: `${pct}%`, backgroundColor: colorMap[label] || '#6b7280' }}
        />
      </div>
      <span className="rating-bar-count">{count}</span>
    </div>
  );
}

export default function ETLAnalytics({ role }) {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [downloading, setDownloading] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState('');
  const [programFeedback, setProgramFeedback] = useState([]);
  const [feedbackLoading, setFeedbackLoading] = useState(false);

  useEffect(() => { fetchAnalytics(); }, []);

  useEffect(() => {
    if (!selectedProgram) { setProgramFeedback([]); return; }
    setFeedbackLoading(true);
    searchFeedback({ program_name: selectedProgram })
      .then((res) => setProgramFeedback(res.data))
      .catch(() => setProgramFeedback([]))
      .finally(() => setFeedbackLoading(false));
  }, [selectedProgram]);

  const fetchAnalytics = async () => {
    try {
      const res = await getETLAnalytics();
      setAnalytics(res.data);
    } catch {
      setError('Failed to load analytics data.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const res = await downloadReport(selectedProgram || null);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      const filename = selectedProgram
        ? `feedback_report_${selectedProgram.replace(/\s+/g, '_')}.csv`
        : 'feedback_report_all.csv';
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      setError('Failed to download report.');
    } finally {
      setDownloading(false);
    }
  };

  if (loading) return <div className="page-container"><p>Loading analytics...</p></div>;
  if (error) return <div className="page-container"><div className="alert alert-danger">{error}</div></div>;
  if (!analytics) return null;

  const sortedPrograms = [...analytics.program_stats].sort((a, b) => b.avg_rating - a.avg_rating);
  const currentProgram = selectedProgram
    ? analytics.program_stats.find((p) => p.program_name === selectedProgram)
    : null;

  const displayRatingDist = currentProgram
    ? [
        { rating: 1, count: currentProgram.rating_1 },
        { rating: 2, count: currentProgram.rating_2 },
        { rating: 3, count: currentProgram.rating_3 },
        { rating: 4, count: currentProgram.rating_4 },
        { rating: 5, count: currentProgram.rating_5 },
      ]
    : analytics.rating_distribution;

  const maxRatingCount = displayRatingDist.length > 0
    ? Math.max(...displayRatingDist.map((r) => r.count), 1)
    : 1;

  const ratingMap = Object.fromEntries(displayRatingDist.map((r) => [r.rating, r.count]));

  const strengths = programFeedback.filter((f) => f.rating >= 4 && f.comments?.trim()).slice(0, 5);
  const improvements = programFeedback.filter((f) => f.rating <= 2 && f.comments?.trim()).slice(0, 5);
  const neutrals = programFeedback.filter((f) => f.rating === 3 && f.comments?.trim()).slice(0, 3);

  return (
    <div className="page-container">

      {/* Header */}
      <div className="etl-header-row">
        <div>
          <h1 className="etl-title">ETL Analytics</h1>
          <p className="page-subtitle">
            {selectedProgram ? `Showing results for: ${selectedProgram}` : 'Summary analytics across all feedback records.'}
          </p>
        </div>
        <div className="download-row">
          <div className="program-select-wrapper">
            <select
              className="program-select"
              value={selectedProgram}
              onChange={(e) => setSelectedProgram(e.target.value)}
            >
              <option value="">All Programs</option>
              {sortedPrograms.map((p) => (
                <option key={p.program_name} value={p.program_name}>{p.program_name}</option>
              ))}
            </select>
          </div>
          <button className="btn btn-primary" onClick={handleDownload} disabled={downloading}>
            {downloading ? 'Downloading...' : '⬇ Download CSV'}
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="stats-grid">
        {currentProgram ? (
          <>
            <div className="stat-card">
              <span className="stat-value">{currentProgram.total_feedback}</span>
              <span className="stat-label">Total Responses</span>
            </div>
            <div className="stat-card">
              <span className="stat-value"><StarRating value={currentProgram.avg_rating} /></span>
              <span className="stat-label">Avg Rating</span>
            </div>
            <div className="stat-card stat-card-positive">
              <span className="stat-value">{currentProgram.rating_4 + currentProgram.rating_5}</span>
              <span className="stat-label">Positive (4–5 ★)</span>
            </div>
            <div className="stat-card stat-card-critical">
              <span className="stat-value">{currentProgram.rating_1 + currentProgram.rating_2}</span>
              <span className="stat-label">Critical (1–2 ★)</span>
            </div>
          </>
        ) : (
          <>
            <div className="stat-card">
              <span className="stat-value">{analytics.total_imported}</span>
              <span className="stat-label">Total Records</span>
            </div>
            <div className="stat-card">
              <span className="stat-value"><StarRating value={analytics.avg_rating} /></span>
              <span className="stat-label">Overall Avg Rating</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">{analytics.program_stats.length}</span>
              <span className="stat-label">Programs</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">{analytics.total_etl_runs}</span>
              <span className="stat-label">ETL Runs</span>
            </div>
          </>
        )}
      </div>

      {/* Rating Distribution + Program table (or detail) */}
      <div className="analytics-two-col">
        <div className="card">
          <h2>Rating Distribution{currentProgram ? ` — ${selectedProgram}` : ''}</h2>
          <div className="rating-bars">
            {[5, 4, 3, 2, 1].map((r) => (
              <RatingBar key={r} label={r} count={ratingMap[r] || 0} max={maxRatingCount} />
            ))}
          </div>
        </div>

        <div className="card">
          <h2>{currentProgram ? 'Rating Breakdown' : 'Program Ranking'}</h2>
          <div className="table-wrapper">
            {currentProgram ? (
              <table className="table">
                <thead>
                  <tr><th>Stars</th><th>Count</th><th>Share</th></tr>
                </thead>
                <tbody>
                  {[5, 4, 3, 2, 1].map((r) => {
                    const cnt = ratingMap[r] || 0;
                    const pct = currentProgram.total_feedback > 0
                      ? Math.round((cnt / currentProgram.total_feedback) * 100)
                      : 0;
                    return (
                      <tr key={r}>
                        <td><span className={`badge rating-${r}`}>{r} ★</span></td>
                        <td>{cnt}</td>
                        <td>{pct}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <table className="table">
                <thead>
                  <tr><th>#</th><th>Program</th><th>Responses</th><th>Avg Rating</th></tr>
                </thead>
                <tbody>
                  {sortedPrograms.map((p, idx) => (
                    <tr key={p.program_name} style={{ cursor: 'pointer' }} onClick={() => setSelectedProgram(p.program_name)}>
                      <td>{idx + 1}</td>
                      <td><strong>{p.program_name}</strong></td>
                      <td>{p.total_feedback}</td>
                      <td><StarRating value={p.avg_rating} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          {!currentProgram && <p className="table-hint">Click a row to drill into a program.</p>}
        </div>
      </div>

      {/* Feedback Insights — only when a program is selected */}
      {selectedProgram && (
        <div className="card">
          <h2>Feedback Insights — {selectedProgram}</h2>
          {feedbackLoading ? (
            <p className="loading-text">Loading reviews...</p>
          ) : (
            <>
              <div className="insights-grid">
                {/* What went well */}
                <div className="insight-panel insight-positive">
                  <div className="insight-panel-header">
                    <span className="insight-icon">✅</span>
                    <span className="insight-panel-title">What Went Well</span>
                    <span className="insight-count">{strengths.length} review{strengths.length !== 1 ? 's' : ''}</span>
                  </div>
                  {strengths.length === 0 ? (
                    <p className="insight-empty">No high-rating reviews with comments yet.</p>
                  ) : (
                    strengths.map((f) => (
                      <div className="insight-item" key={f.feedback_id}>
                        <div className="insight-meta">
                          <span className={`badge rating-${f.rating}`}>{f.rating} ★</span>
                          <span className="insight-author">{f.participant_name}</span>
                        </div>
                        <p className="insight-comment">"{f.comments}"</p>
                      </div>
                    ))
                  )}
                </div>

                {/* Needs improvement */}
                <div className="insight-panel insight-negative">
                  <div className="insight-panel-header">
                    <span className="insight-icon">⚠️</span>
                    <span className="insight-panel-title">Needs Improvement</span>
                    <span className="insight-count">{improvements.length} review{improvements.length !== 1 ? 's' : ''}</span>
                  </div>
                  {improvements.length === 0 ? (
                    <p className="insight-empty">No critical reviews with comments yet.</p>
                  ) : (
                    improvements.map((f) => (
                      <div className="insight-item" key={f.feedback_id}>
                        <div className="insight-meta">
                          <span className={`badge rating-${f.rating}`}>{f.rating} ★</span>
                          <span className="insight-author">{f.participant_name}</span>
                        </div>
                        <p className="insight-comment">"{f.comments}"</p>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Neutral observations */}
              {neutrals.length > 0 && (
                <div className="insight-panel insight-neutral" style={{ marginTop: '16px' }}>
                  <div className="insight-panel-header">
                    <span className="insight-icon">💬</span>
                    <span className="insight-panel-title">Neutral Observations</span>
                    <span className="insight-count">{neutrals.length} review{neutrals.length !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="neutral-comments-row">
                    {neutrals.map((f) => (
                      <div className="insight-item insight-item-inline" key={f.feedback_id}>
                        <div className="insight-meta">
                          <span className={`badge rating-${f.rating}`}>{f.rating} ★</span>
                          <span className="insight-author">{f.participant_name}</span>
                        </div>
                        <p className="insight-comment">"{f.comments}"</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Detailed stats table — only when no program selected */}
      {!selectedProgram && (
        <div className="card">
          <h2>Detailed Program Statistics</h2>
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Program</th>
                  <th>Total</th>
                  <th>Avg Rating</th>
                  <th>1 ★</th>
                  <th>2 ★</th>
                  <th>3 ★</th>
                  <th>4 ★</th>
                  <th>5 ★</th>
                </tr>
              </thead>
              <tbody>
                {sortedPrograms.map((p) => (
                  <tr key={p.program_name} style={{ cursor: 'pointer' }} onClick={() => setSelectedProgram(p.program_name)}>
                    <td><strong>{p.program_name}</strong></td>
                    <td>{p.total_feedback}</td>
                    <td>
                      <span className={`badge ${p.avg_rating >= 4 ? 'badge-success' : p.avg_rating >= 3 ? 'badge-blue' : 'badge-danger'}`}>
                        {p.avg_rating.toFixed(1)}
                      </span>
                    </td>
                    <td>{p.rating_1}</td>
                    <td>{p.rating_2}</td>
                    <td>{p.rating_3}</td>
                    <td>{p.rating_4}</td>
                    <td>{p.rating_5}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="table-hint">Click a row to drill into that program's insights.</p>
        </div>
      )}
    </div>
  );
}
