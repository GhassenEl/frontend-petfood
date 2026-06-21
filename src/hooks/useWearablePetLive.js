import { useCallback, useEffect, useRef, useState } from 'react';
import getSocket from '../utils/socketClient';
import {
  fetchWearableState,
  runWearableSimulation,
} from '../services/wearablePetService';
import { mergeWearableReading } from '../utils/wearablePetEngine';

const LIVE_INTERVAL_MS = 3000;

/**
 * Flux temps réel colliers connectés — polling démo + Socket.IO.
 */
export default function useWearablePetLive({ enabled = true, demoSimulate = true } = {}) {
  const [state, setState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLive, setIsLive] = useState(true);
  const [lastTickAt, setLastTickAt] = useState(null);
  const [socketConnected, setSocketConnected] = useState(false);
  const modeRef = useRef('demo');
  const stateRef = useRef(null);
  stateRef.current = state;

  const applyReading = useCallback((reading) => {
    if (!reading) return;
    setState((prev) => mergeWearableReading(prev, reading));
    setLastTickAt(Date.now());
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const next = await fetchWearableState();
      modeRef.current = next?.mode || 'demo';
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
        const collars = stateRef.current?.collars || [];
        if (!collars.length) return;
        const readings = await Promise.all(
          collars.filter((c) => c.status === 'online').map((c) => runWearableSimulation(c)),
        );
        readings.filter(Boolean).forEach(applyReading);
        return;
      }
      try {
        const next = await fetchWearableState();
        modeRef.current = next?.mode || 'live';
        setState(next);
        setLastTickAt(Date.now());
      } catch {
        /* ignore */
      }
    };

    const id = setInterval(tick, LIVE_INTERVAL_MS);
    return () => clearInterval(id);
  }, [enabled, isLive, demoSimulate, applyReading]);

  useEffect(() => {
    if (!enabled) return undefined;
    const socket = getSocket();

    const onConnect = () => setSocketConnected(true);
    const onDisconnect = () => setSocketConnected(false);
    const onReading = (payload) => {
      if (payload?.reading) applyReading(payload.reading);
      else if (payload?.deviceId && payload?.metrics) applyReading(payload);
    };
    const onTelemetry = (p) => {
      if (p?.type === 'wearable-collar' || p?.deviceType === 'wearable-collar') onReading(p);
    };

    if (socket.connected) onConnect();
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('iot:wearable:reading', onReading);
    socket.on('wearable:vitals', onReading);
    socket.on('iot:telemetry', onTelemetry);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('iot:wearable:reading', onReading);
      socket.off('wearable:vitals', onReading);
      socket.off('iot:telemetry', onTelemetry);
    };
  }, [enabled, applyReading]);

  return {
    state,
    loading,
    isLive,
    setIsLive,
    lastTickAt,
    socketConnected,
    reload: load,
    applyReading,
  };
}
