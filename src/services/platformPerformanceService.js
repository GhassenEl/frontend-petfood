import api from '../utils/api';

export const fetchPlatformPerformance = () =>
  api.get('/platform/performance').then((r) => r.data);
