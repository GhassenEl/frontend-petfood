import React from 'react';
import { Radio, Wifi, Cloud } from 'lucide-react';

const formatAgo = (ts) => {
  if (!ts) return '—';
  const s = Math.round((Date.now() - ts) / 1000);
  if (s < 5) return 'à l\'instant';
  if (s < 60) return `il y a ${s}s`;
  return `il y a ${Math.round(s / 60)} min`;
};

const IoTLiveStatusBar = ({ socketConnected, mqttConnected, lastEventAt, mode = 'demo' }) => (
  <div className="iot-live-bar" role="status" aria-live="polite">
    <span className={`iot-live-pill${socketConnected ? ' is-on' : ''}`}>
      <Wifi size={14} />
      WebSocket {socketConnected ? 'connecté' : 'hors ligne'}
    </span>
    <span className={`iot-live-pill${mqttConnected ? ' is-on' : ''}`}>
      <Radio size={14} />
      MQTT {mqttConnected ? 'Mosquitto actif' : 'broker en attente'}
    </span>
    <span className="iot-live-pill iot-live-pill--muted">
      <Cloud size={14} />
      Mode {mode === 'live' ? 'production' : 'démo'}
    </span>
    {lastEventAt && (
      <span className="iot-live-pulse">
        <span className="iot-live-dot" aria-hidden />
        Dernière télémétrie {formatAgo(lastEventAt)}
      </span>
    )}
  </div>
);

export default IoTLiveStatusBar;
