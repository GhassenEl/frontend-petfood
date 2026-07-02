import React from 'react';
import { Clock, CheckCircle2, AlertTriangle, Play } from 'lucide-react';

const iconFor = (type) => {
  if (type === 'alert') return <AlertTriangle size={14} color="#dc2626" />;
  if (type === 'dispense' || type === 'manual_request') return <CheckCircle2 size={14} color="#059669" />;
  return <Play size={14} color="#64748b" />;
};

const labelFor = (log) => {
  if (log.message) return log.message;
  if (log.eventType === 'dispense' || log.eventType === 'manual_request') {
    return `Distribution ${log.portionGrams || log.grams || '—'} g`;
  }
  if (log.eventType === 'alert') return 'Alerte capteur';
  return log.label || log.eventType || 'Événement';
};

/** Bandeau des derniers événements distributeur (HX711, IR, dispense). */
const FeederLiveEventsStrip = ({ history = [], max = 5 }) => {
  const events = (history || []).slice(0, max);
  if (!events.length) return null;

  return (
    <div className="fd-live-events" role="log" aria-label="Événements distributeur récents">
      <span className="fd-live-events__title">
        <span className="fd-live-events__dot" /> Live ESP32
      </span>
      <ul className="fd-live-events__list">
        {events.map((e) => (
          <li key={e.id || `${e.createdAt}-${e.eventType}`}>
            {iconFor(e.eventType)}
            <span className="fd-live-events__text">{labelFor(e)}</span>
            <time className="fd-live-events__time">
              <Clock size={11} />
              {e.createdAt
                ? new Date(e.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
                : '—'}
            </time>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FeederLiveEventsStrip;
