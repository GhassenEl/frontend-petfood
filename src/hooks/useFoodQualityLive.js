import { useCallback, useEffect, useRef, useState } from 'react';
import getSocket from '../utils/socketClient';
import {
  fetchFoodQualityState,
  runEsp32CamSimulation,
  mergeFoodQualityReading,
} from '../services/iotFoodQualityService';
import { dispatchFoodQualityAlerts } from '../services/foodQualityNotificationService';

const LIVE_INTERVAL_MS = 5000;

/**
 * Flux temps réel ESP32-CAM — polling + événements Socket.IO.
 */
export default function useFoodQualityLive({ enabled = true, demoSimulate = true } = {}) {
  const [state, setState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLive, setIsLive] = useState(true);
  const [lastTickAt, setLastTickAt] = useState(null);
  const [socketConnected, setSocketConnected] = useState(false);
  const [lastAlert, setLastAlert] = useState(null);
  const modeRef = useRef('demo');
  const deviceRef = useRef(null);

  const applyReading = useCallback((reading) => {
    if (!reading) return;
    setState((prev) => mergeFoodQualityReading(prev, reading));
    setLastTickAt(Date.now());
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const next = await fetchFoodQualityState();
      modeRef.current = next?.mode || 'demo';
      deviceRef.current = next?.device;
      setState(next);
      setLastTickAt(Date.now());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!enabled || !isLive) return undefined;

    const tick = async () => {
      if (modeRef.current === 'demo' && demoSimulate) {
        const reading = await runEsp32CamSimulation(undefined, deviceRef.current);
        setState((prev) => mergeFoodQualityReading(prev, reading));
        setLastTickAt(Date.now());
        if (reading?.isCritical || reading?.quality === 'bad' || reading?.isNonConforme) {
          const alertResult = await dispatchFoodQualityAlerts(reading, deviceRef.current);
          if (alertResult.sent) setLastAlert(alertResult);
        }
        return;
      }
      try {
        const next = await fetchFoodQualityState();
        modeRef.current = next?.mode || 'live';
        setState(next);
        setLastTickAt(Date.now());
      } catch {
        /* ignore */
      }
    };

    const id = setInterval(tick, LIVE_INTERVAL_MS);
    return () => clearInterval(id);
  }, [enabled, isLive, demoSimulate]);

  useEffect(() => {
    if (!enabled) return undefined;
    const socket = getSocket();

    const onConnect = () => setSocketConnected(true);
    const onDisconnect = () => setSocketConnected(false);
    const onReading = (payload) => {
      if (payload?.reading) applyReading(payload.reading);
      else if (payload?.qualityScore != null) applyReading(payload);
    };

    if (socket.connected) onConnect();
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('iot:food-quality:reading', onReading);
    socket.on('food-quality:reading', onReading);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('iot:food-quality:reading', onReading);
      socket.off('food-quality:reading', onReading);
    };
  }, [enabled, applyReading]);

  const patchState = useCallback((updater) => {
    setState((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      if (next?.mode) modeRef.current = next.mode;
      return next;
    });
  }, []);

  return {
    state,
    loading,
    isLive,
    setIsLive,
    lastTickAt,
    socketConnected,
    reload: load,
    applyReading,
    patchState,
    lastAlert,
  };
}
