import api from '../utils/api';

export const fetchAdminLivePresence = () =>
  api.get('/admin/presence/live').then((r) => r.data);

export const postPresenceHeartbeat = (payload) =>
  api.post('/presence/heartbeat', payload).catch(() => null);
