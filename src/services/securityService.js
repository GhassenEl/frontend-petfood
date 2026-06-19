import api from '../utils/api';

export const normalizeIntrusionResponse = (data) => {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  return data.items || data.events || [];
};

export const normalizeThreatResponse = (data) => {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  return data.items || data.threats || [];
};

export const scanTextForThreats = async (text, context = {}) => {
  const response = await api.post('/security/scan', { text, context });
  return response.data;
};

export const scanPayloadForThreats = async (payload, context = {}) => {
  const response = await api.post('/security/scan/payload', { payload, context });
  return response.data;
};

export const fetchThreatLog = async (limit = 50) => {
  const response = await api.get('/security/threats', { params: { limit } });
  return response.data;
};

export const fetchSecurityStatus = async () => {
  const response = await api.get('/security/status');
  return response.data;
};

export const fetchIntrusionEvents = async (limit = 50) => {
  const response = await api.get('/security/intrusions', { params: { limit } });
  return response.data;
};

export const fetchActiveSessions = async () => {
  const response = await api.get('/security/sessions');
  return response.data;
};

export const revokeSecuritySession = async (sessionId) => {
  const response = await api.delete(`/security/sessions/${sessionId}`);
  return response.data;
};

export const fetchPlatformSecurityPack = async () => {
  const response = await api.get('/security/platform-pack');
  return response.data;
};

export const scanFileForThreats = async (fileMeta) => {
  const response = await api.post('/security/scan/file', fileMeta);
  return response.data;
};
