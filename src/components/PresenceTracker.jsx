import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import getSocket from '../utils/socketClient';
import { getStoredCity } from '../hooks/usePlatformCity';
import { postPresenceHeartbeat } from '../services/adminPresenceService';

const SESSION_KEY = 'petfood_presence_session';

export const getPresenceSessionId = () => {
  try {
    let id = sessionStorage.getItem(SESSION_KEY);
    if (!id) {
      id = `sess-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
      sessionStorage.setItem(SESSION_KEY, id);
    }
    return id;
  } catch {
    return `sess-${Date.now()}`;
  }
};

/** Envoie la présence (socket + HTTP secours) pour visiteurs et utilisateurs connectés. */
const PresenceTracker = () => {
  const { user } = useAuth();
  const location = useLocation();
  const pathRef = useRef(location.pathname);

  useEffect(() => {
    pathRef.current = location.pathname;
  }, [location.pathname]);

  useEffect(() => {
    const socket = getSocket();
    const sessionId = getPresenceSessionId();

    const payload = () => ({
      sessionId,
      userId: user?.id || user?._id || null,
      role: user?.role || 'visitor',
      name: user?.name || 'Visiteur',
      region: getStoredCity() || user?.region || 'Non assignée',
      path: pathRef.current,
    });

    const register = () => {
      const p = payload();
      socket.emit('presence:register', p);
      socket.emit('join', {
        userId: p.userId,
        role: p.role,
        room: 'platform-live',
      });
      postPresenceHeartbeat(p);
    };

    const onConnect = () => register();
    socket.on('connect', onConnect);
    if (socket.connected) register();

    const intervalId = window.setInterval(() => {
      const p = payload();
      if (socket.connected) socket.emit('presence:heartbeat', { path: p.path, region: p.region });
      else postPresenceHeartbeat(p);
    }, 30_000);

    return () => {
      socket.off('connect', onConnect);
      window.clearInterval(intervalId);
    };
  }, [user?.id, user?._id, user?.role, user?.name, user?.region, location.pathname]);

  return null;
};

export default PresenceTracker;
