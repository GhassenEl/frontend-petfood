import React from 'react';
import { Activity } from 'lucide-react';

const formatTime = (iso) => {
  if (!iso) return '—';
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  if (diff < 60000) return 'À l\'instant';
  if (diff < 3600000) return `Il y a ${Math.round(diff / 60000)} min`;
  if (diff < 86400000) return `Il y a ${Math.round(diff / 3600000)} h`;
  return d.toLocaleString('fr-FR', { hour: '2-digit', minute: '2-digit' });
};

const IoTSensorTimelinePanel = ({ events = [], loading }) => {
  if (loading) return <p className="iot-muted">Synchronisation capteurs…</p>;

  if (!events.length) {
    return <p className="iot-muted">Aucun événement capteur récent.</p>;
  }

  return (
    <div className="iot-timeline">
      <h3 className="iot-timeline-title">
        <Activity size={18} aria-hidden /> Flux capteurs temps réel
      </h3>
      <ul className="iot-timeline-list">
        {events.map((ev) => (
          <li key={ev.id} className="iot-timeline-item">
            <span className="iot-timeline-dot" aria-hidden />
            <div className="iot-timeline-content">
              <div className="iot-timeline-head">
                <span>{ev.icon} {ev.deviceName}</span>
                <time dateTime={ev.at}>{formatTime(ev.at)}</time>
              </div>
              <p>{ev.message}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default IoTSensorTimelinePanel;
