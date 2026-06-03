import api from '../utils/api';

export const fetchAnalyticsHub = () => api.get('/analytics/hub').then((r) => r.data);

export const fetchPlatformAlerts = () => api.get('/analytics/alerts').then((r) => r.data);

export const fetchDatasetsCatalog = () => api.get('/analytics/datasets').then((r) => r.data);

export const getExportUrl = (table, format = 'csv') => {
  const base = api.defaults.baseURL || '/api';
  return `${base}/analytics/export/${table}?format=${format}`;
};
