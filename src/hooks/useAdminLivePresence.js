import { useCallback, useEffect, useState } from 'react';
import getSocket from '../utils/socketClient';
import { fetchAdminLivePresence } from '../services/adminPresenceService';
import { DEMO_ADMIN_LIVE_PRESENCE } from '../utils/adminDemoData';

const POLL_MS = 5000;

const useAdminLivePresence = () => {
  const [pack, setPack] = useState(null);
  const [loading, setLoading] = useState(true);
  const [live, setLive] = useState(false);

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const data = await fetchAdminLivePresence();
      setPack(data);
    } catch {
      setPack(DEMO_ADMIN_LIVE_PRESENCE);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(false);
    const pollId = window.setInterval(() => load(true), POLL_MS);
    return () => window.clearInterval(pollId);
  }, [load]);

  useEffect(() => {
    const socket = getSocket();
    const onConnect = () => {
      setLive(true);
      socket.emit('join', { role: 'admin', room: 'platform-live' });
    };
    const onPresence = (data) => {
      if (data?.onlineTotal != null) {
        setPack((prev) => ({ ...(prev || {}), live: data }));
      }
    };
    socket.on('connect', onConnect);
    socket.on('presence:live', onPresence);
    if (socket.connected) onConnect();
    return () => {
      socket.off('connect', onConnect);
      socket.off('presence:live', onPresence);
    };
  }, []);

  return { pack, loading, live, reload: () => load(true) };
};

export default useAdminLivePresence;
