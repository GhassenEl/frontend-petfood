import api from '../utils/api';

export const fetchOwnerEmotionDashboard = () =>
  api.get('/owner-emotions/dashboard').then((r) => r.data);

export const analyzeOwnerEmotion = (payload) =>
  api.post('/owner-emotions/analyze', payload).then((r) => r.data);
