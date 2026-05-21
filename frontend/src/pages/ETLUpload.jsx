import { useState, useEffect, useRef } from 'react';
import { uploadETLFile, getETLRuns } from '../services/api';

export default function ETLUpload({ role }) {
  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [runs, setRuns] = useState([]);
  const [loadingRuns, setLoadingRuns] = useState(true);
  const fileInputRef = useRef();

  useEffect(() => {
    fetchRuns();
  }, []);

  const fetchRuns = async () => {
    try {
      const res = await getETLRuns();
      setRuns(res.data);
    } catch {
      // silently fail
    } finally {
      setLoadingRuns(false);
    }
  };

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    validateAndSetFile(selected);
  };

  const validateAndSetFile = (selected) => {
    if (!selected) return;
    const ext = selected.name.split('.').pop().toLowerCase();
    if (!['csv', 'xlsx', 'xls'].includes(ext)) {
      setError('Only CSV and Excel (.xlsx, .xls) files are supported.');
      setFile(null);
      return;
    }
    setError('');
    setFile(selected);
    setResult(null);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    validateAndSetFile(e.dataTransfer.files[0]);
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setError('');
    setResult(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await uploadETLFile(formData);
      setResult(res.data);
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      fetchRuns();
    } catch (err) {
      setError(err.response?.data?.detail || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const statusBadge = (status) => {
    const cls = status === 'success' ? 'badge-success' : status === 'failed' ? 'badge-danger' : 'badge-warning';
    return <span className={`badge ${cls}`}>{status}</span>;
  };

  if (role !== 'admin') {
    return (
      <div className="page-container">
        <div className="alert alert-danger">Access denied. This page is for administrators only.</div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Import Data (ETL)</h1>
        <p className="page-subtitle">Upload a CSV or Excel file to import feedback records into the system.</p>
      </div>

      {/* Upload Card */}
      <div className="card etl-upload-card">
        <h2>Upload File</h2>

        <div
          className={`drop-zone ${dragOver ? 'drag-over' : ''} ${file ? 'has-file' : ''}`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
          {file ? (
            <div className="drop-zone-file">
              <span className="file-icon">📄</span>
              <span className="file-name">{file.name}</span>
              <span className="file-size">({(file.size / 1024).toFixed(1)} KB)</span>
            </div>
          ) : (
            <div className="drop-zone-placeholder">
              <span className="upload-icon">⬆</span>
              <p>Drag & drop a file here, or <strong>click to browse</strong></p>
              <small>Supports CSV, XLSX, XLS</small>
            </div>
          )}
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        <div className="etl-upload-actions">
          {file && (
            <button
              className="btn btn-secondary"
              onClick={() => { setFile(null); setResult(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
            >
              Clear
            </button>
          )}
          <button
            className="btn btn-primary"
            onClick={handleUpload}
            disabled={!file || uploading}
          >
            {uploading ? 'Processing...' : 'Run ETL'}
          </button>
        </div>
      </div>

      {/* ETL Run Result */}
      {result && (
        <div className={`card etl-result-card ${result.status === 'success' ? 'result-success' : 'result-failed'}`}>
          <h2>ETL Run Result — {statusBadge(result.status)}</h2>
          <div className="etl-stats-grid">
            <div className="etl-stat">
              <span className="etl-stat-value">{result.total_records}</span>
              <span className="etl-stat-label">Total Records</span>
            </div>
            <div className="etl-stat etl-stat-green">
              <span className="etl-stat-value">{result.loaded_records}</span>
              <span className="etl-stat-label">Loaded</span>
            </div>
            <div className="etl-stat etl-stat-orange">
              <span className="etl-stat-value">{result.duplicate_records}</span>
              <span className="etl-stat-label">Duplicates Removed</span>
            </div>
            <div className="etl-stat etl-stat-red">
              <span className="etl-stat-value">{result.invalid_records}</span>
              <span className="etl-stat-label">Invalid Records</span>
            </div>
          </div>
          {result.error_message && (
            <div className="alert alert-danger" style={{ marginTop: '1rem' }}>
              {result.error_message}
            </div>
          )}
        </div>
      )}

      {/* ETL Run History */}
      <div className="card">
        <h2>ETL Run History</h2>
        {loadingRuns ? (
          <p>Loading history...</p>
        ) : runs.length === 0 ? (
          <p className="empty-state">No ETL runs yet. Upload a file to get started.</p>
        ) : (
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Run ID</th>
                  <th>Filename</th>
                  <th>Total</th>
                  <th>Loaded</th>
                  <th>Duplicates</th>
                  <th>Invalid</th>
                  <th>Status</th>
                  <th>Run At</th>
                </tr>
              </thead>
              <tbody>
                {runs.map((run) => (
                  <tr key={run.run_id}>
                    <td>#{run.run_id}</td>
                    <td>{run.filename}</td>
                    <td>{run.total_records}</td>
                    <td><span className="badge badge-success">{run.loaded_records}</span></td>
                    <td><span className="badge badge-warning">{run.duplicate_records}</span></td>
                    <td><span className="badge badge-danger">{run.invalid_records}</span></td>
                    <td>{statusBadge(run.status)}</td>
                    <td>{new Date(run.run_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
