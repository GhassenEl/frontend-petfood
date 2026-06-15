import api from '../utils/api';

export const fetchAdminAdvancedPack = () =>
  api.get('/ai/admin/advanced-pack').then((r) => r.data);

export const postAdminCopilot = (message, context = {}) =>
  api.post('/ai/admin/copilot', { message, context }).then((r) => r.data);

export const fetchClientAdvancedPack = () =>
  api.get('/ai/client/advanced-pack').then((r) => r.data);

export const analyzeNlpText = (text) =>
  api.post('/ml/nlp/analyze', { text }).then((r) => r.data);
