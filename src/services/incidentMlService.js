import api from '../utils/api';

export const fetchIncidentAgentPack = () => api.get('/ml/incidents/agent').then((r) => r.data);

export const fetchIncidentQueue = () => api.get('/ml/incidents/queue').then((r) => r.data);

export const processAllIncidents = (limit = 20) =>
  api.post(`/ml/incidents/process-all?limit=${limit}`).then((r) => r.data);

export const processIncident = (id) => api.post(`/ml/incidents/${id}/process`).then((r) => r.data);

export const validateIncidentProposal = (id, payload) =>
  api.post(`/ml/incidents/${id}/validate`, payload).then((r) => r.data);
