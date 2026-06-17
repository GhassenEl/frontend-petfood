import { useCallback, useEffect, useState } from 'react';
import getSocket from '../utils/socketClient';

/**
 * Flux temps réel IoT — Socket.IO + pulse connexion.
 */
export default function useIoTLive({ enabled = true, onTelemetry } = {}) {
  const [socketConnected, setSocketConnected] = useState(false);
  const [mqttConnected, setMqttConnected] = useState(false);
  const [lastEventAt, setLastEventAt] = useState(null);
  const [lastEvent, setLastEvent] = useState(null);

  const handleTelemetry = useCallback(
    (payload) => {
      setLastEventAt(Date.now());
      setLastEvent(payload);
      onTelemetry?.(payload);
    },
    [onTelemetry]
  );

  useEffect(() => {
    if (!enabled) return undefined;
    const socket = getSocket();

    const onConnect = () => setSocketConnected(true);
    const onDisconnect = () => setSocketConnected(false);
    const onMqtt = (p) => {
      setMqttConnected(true);
      handleTelemetry({ ...p, channel: 'mqtt' });
    };
    const onDevice = (p) => handleTelemetry({ ...p, channel: 'device' });
    const onFoodQuality = (p) => handleTelemetry({ ...p, channel: 'food-quality' });

    if (socket.connected) onConnect();
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('iot:mqtt:status', (p) => setMqttConnected(Boolean(p?.connected)));
    socket.on('iot:mqtt:message', onMqtt);
    socket.on('iot:device:update', onDevice);
    socket.on('iot:telemetry', onDevice);
    socket.on('iot:food-quality:reading', onFoodQuality);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('iot:mqtt:status');
      socket.off('iot:mqtt:message', onMqtt);
      socket.off('iot:device:update', onDevice);
      socket.off('iot:telemetry', onDevice);
      socket.off('iot:food-quality:reading', onFoodQuality);
    };
  }, [enabled, handleTelemetry]);

  return {
    socketConnected,
    mqttConnected,
    lastEventAt,
    lastEvent,
    isLive: socketConnected || mqttConnected,
  };
}
