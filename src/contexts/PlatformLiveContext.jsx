import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import getSocket from '../utils/socketClient';
import { pingBackendHealth } from '../services/backendHealthService';
import {
  dispatchPlatformRefresh,
  fetchPlatformLive,
  PLATFORM_REFRESH_EVENT,
} from '../services/platformLiveService';
import { isProductionBuild } from '../config/platformRuntime';

const HEALTH_POLL_MS = isProductionBuild() ? 20000 : 45000;

const PlatformLiveContext = createContext(null);

export const usePlatformLive = () => {
  const ctx = useContext(PlatformLiveContext);
  if (!ctx) {
    throw new Error('usePlatformLive must be used within PlatformLiveProvider');
  }
  return ctx;
};

export const PlatformLiveProvider = ({ children }) => {
  const { user } = useAuth();
  const [pulse, setPulse] = useState(null);
  const [socketConnected, setSocketConnected] = useState(false);
  const [apiOnline, setApiOnline] = useState(true);
  const [lastHealthCheck, setLastHealthCheck] = useState(null);
  const [syncing, setSyncing] = useState(false);

  const applyPulse = useCallback((data) => {
    if (!data) return;
    setPulse(data);
    dispatchPlatformRefresh(data);
  }, []);

  const checkHealth = useCallback(async () => {
    const result = await pingBackendHealth();
    setApiOnline(result.ok);
    setLastHealthCheck(result.checkedAt);
    return result;
  }, []);

  const refresh = useCallback(async () => {
    if (!user) return null;
    setSyncing(true);
    try {
      await checkHealth();
      const data = await fetchPlatformLive();
      applyPulse(data);
      return data;
    } catch {
      return null;
    } finally {
      setSyncing(false);
    }
  }, [user, applyPulse, checkHealth]);

  useEffect(() => {
    checkHealth();
    const id = setInterval(checkHealth, HEALTH_POLL_MS);
    const onVisible = () => {
      if (document.visibilityState === 'visible') checkHealth();
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      clearInterval(id);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [checkHealth]);

  useEffect(() => {
    const socket = getSocket();

    const onConnect = () => {
      setSocketConnected(true);
      if (user?.id || user?._id) {
        socket.emit('join', {
          userId: user.id || user._id,
          role: user.role,
          room: 'platform-live',
        });
      } else {
        socket.emit('join', { room: 'platform-live' });
      }
    };

    const onDisconnect = () => setSocketConnected(false);
    const onPulse = (data) => applyPulse(data);

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('platform:pulse', onPulse);
    if (socket.connected) onConnect();

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('platform:pulse', onPulse);
    };
  }, [user, applyPulse]);

  useEffect(() => {
    if (!user) return undefined;
    refresh();
    const onVisible = () => {
      if (document.visibilityState === 'visible') refresh();
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [user, refresh]);

  const value = {
    pulse,
    socketConnected,
    apiOnline,
    lastHealthCheck,
    syncing,
    isLive: apiOnline && Boolean(pulse?.online) && (socketConnected || pulse?.mode === 'live'),
    refresh,
    checkHealth,
  };

  return (
    <PlatformLiveContext.Provider value={value}>
      {children}
    </PlatformLiveContext.Provider>
  );
};

export { PLATFORM_REFRESH_EVENT };
