import axios from 'axios';

const api = axios.create({ baseURL: 'http://localhost:8000' });

export const getAllFeedback = () => api.get('/feedback');
export const getFeedbackById = (id) => api.get(`/feedback/${id}`);
export const createFeedback = (data) => api.post('/feedback', data);
export const updateFeedback = (id, data) => api.put(`/feedback/${id}`, data);
export const deleteFeedback = (id) => api.delete(`/feedback/${id}`);
export const searchFeedback = (params) => api.get('/search', { params });

// ETL API functions
export const uploadETLFile = (formData) =>
  api.post('/etl/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const getETLRuns = () => api.get('/etl/runs');

export const getETLAnalytics = () => api.get('/etl/analytics');

export const getProgramAnalytics = () => api.get('/etl/analytics/programs');

export const downloadReport = (programName = null) =>
  api.get('/etl/report/download', {
    responseType: 'blob',
    params: programName ? { program_name: programName } : {},
  });
