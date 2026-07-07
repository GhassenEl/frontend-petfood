import api from '../utils/api';
import { DEMO_ADMIN_LIVE_PRESENCE } from '../utils/adminDemoData';

const hasLiveData = (data) =>
  (data?.live?.onlineTotal ?? 0) > 0 || (data?.live?.sessions?.length ?? 0) > 0;

export const fetchAdminLivePresence = async () => {
  try {
    const { data } = await api.get('/admin/presence/live');
    if (!hasLiveData(data)) return DEMO_ADMIN_LIVE_PRESENCE;
    return {
      ...DEMO_ADMIN_LIVE_PRESENCE,
      ...data,
      live: { ...DEMO_ADMIN_LIVE_PRESENCE.live, ...(data.live || {}) },
      registered: { ...DEMO_ADMIN_LIVE_PRESENCE.registered, ...(data.registered || {}) },
    };
  } catch {
    return DEMO_ADMIN_LIVE_PRESENCE;
  }
};

export const postPresenceHeartbeat = (payload) =>
  api.post('/presence/heartbeat', payload).catch(() => null);
