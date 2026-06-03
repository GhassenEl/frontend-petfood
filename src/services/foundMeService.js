import api from '../utils/api';

export const listFoundMeReports = (params = {}) =>
  api.get('/found-me', { params }).then((r) => r.data);

export const listMyFoundMeReports = () => api.get('/found-me/mine').then((r) => r.data);

export const lookupFoundMeTag = (tagCode) =>
  api.get(`/found-me/lookup/${encodeURIComponent(tagCode)}`).then((r) => r.data);

export const createFoundMeReport = (payload) =>
  api.post('/found-me', payload).then((r) => r.data);

export const getFoundMeMatches = (id) =>
  api.get(`/found-me/${id}/matches`).then((r) => r.data);

export const markFoundMeReunited = (id, matchedReportId = null) =>
  api.post(`/found-me/${id}/reunited`, { matchedReportId }).then((r) => r.data);
