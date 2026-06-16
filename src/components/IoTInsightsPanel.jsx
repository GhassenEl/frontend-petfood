import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

const PRIORITY_CLASS = {
  high: 'iot-insight--high',
  medium: 'iot-insight--medium',
  low: 'iot-insight--low',
};

const IoTInsightsPanel = ({ insights = [], predictions = [], loading }) => {
  if (loading) return <p className="iot-muted">Analyse des capteurs IoT…</p>;

  return (
    <div className="iot-insights">
      <p className="iot-summary">
        <Sparkles size={16} aria-hidden />
        Intelligence IoT — prédictions stock, hydratation et anomalies capteurs.
      </p>

      {predictions.length > 0 && (
        <div className="iot-predict-grid">
          {predictions.slice(0, 4).map((p) => (
            <div key={`${p.kind}-${p.deviceId}`} className={`iot-predict-card iot-predict--${p.urgency || p.risk || 'low'}`}>
              <span className="iot-predict-icon">{p.kind === 'food' ? '🍽️' : '💧'}</span>
              <strong>{p.petName || p.deviceName}</strong>
              <p>{p.aiSummary}</p>
              {p.daysLeft != null && <span className="iot-predict-meta">~{p.daysLeft} j restants</span>}
              {p.percentOfTarget != null && <span className="iot-predict-meta">{p.percentOfTarget} % objectif</span>}
            </div>
          ))}
        </div>
      )}

      <ul className="iot-insight-list">
        {insights.map((item) => (
          <li key={item.id} className={`iot-insight-item ${PRIORITY_CLASS[item.priority] || ''}`}>
            <span className="iot-insight-icon" aria-hidden>{item.icon}</span>
            <div>
              <strong>{item.title}</strong>
              <p>{item.message}</p>
              {item.link && (
                <Link to={item.link} className="iot-insight-link">Voir →</Link>
              )}
            </div>
          </li>
        ))}
      </ul>

      {!insights.length && (
        <p className="iot-empty-ok">Tous les capteurs sont dans les normes — aucune action requise.</p>
      )}
    </div>
  );
};

export default IoTInsightsPanel;
