import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';

const TYPE_ICON = {
  temperature: '🌡️',
  humidity: '💧',
  'food-quality': '📷',
  mold: '🦠',
  stock: '📦',
  hydration: '🚰',
  connectivity: '📡',
  consumption: '📈',
  alert: '🔔',
};

const IoTAnomalyPanel = ({ anomalies = [], loading }) => {
  if (loading) return <p className="iot-muted">Analyse des capteurs…</p>;

  if (!anomalies.length) {
    return (
      <div className="iot-anomaly-empty">
        <p>✅ Aucune anomalie détectée — tous les capteurs dans les normes.</p>
      </div>
    );
  }

  return (
    <section className="iot-anomaly-panel">
      <header className="iot-anomaly-panel__head">
        <AlertTriangle size={18} color="#d97706" />
        <h3>Anomalies détectées ({anomalies.length})</h3>
      </header>
      <ul className="iot-anomaly-list">
        {anomalies.map((a) => (
          <li key={a.id} className={`iot-anomaly-item iot-anomaly-item--${a.severity}`}>
            <span className="iot-anomaly-icon" aria-hidden>{TYPE_ICON[a.type] || '⚠️'}</span>
            <div className="iot-anomaly-body">
              <strong>{a.deviceName || a.type}</strong>
              <p>{a.message}</p>
              {a.zScore != null && (
                <small>Z-score : {a.zScore}</small>
              )}
            </div>
            {a.deviceId && (
              <Link to="/client-iot?tab=devices" className="iot-anomaly-link">Voir →</Link>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
};

export default IoTAnomalyPanel;
