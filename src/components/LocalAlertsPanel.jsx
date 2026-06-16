import React, { useState } from 'react';
import { Bell, MapPin, Calendar } from 'lucide-react';
import { ALERT_TYPES } from '../utils/localAlertsEngine';

const formatDate = (iso) => {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('fr-FR', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
};

const LocalAlertsPanel = ({ alerts = [], summary = null }) => {
  const [typeFilter, setTypeFilter] = useState('');

  const filtered = typeFilter ? alerts.filter((a) => a.type === typeFilter) : alerts;

  return (
    <div className="geo-alerts">
      <div className="geo-alerts__header">
        <Bell size={22} aria-hidden />
        <div>
          <h3>Alertes locales</h3>
          <p className="geo-muted">{summary?.summary || 'Notifications vaccination, promotions et événements près de chez vous.'}</p>
          {summary?.urgent > 0 && (
            <p className="geo-urgent">{summary.urgent} alerte(s) prioritaire(s)</p>
          )}
        </div>
      </div>

      <div className="geo-filter-row">
        <button
          type="button"
          className={`geo-filter-btn${!typeFilter ? ' geo-filter-btn--active' : ''}`}
          onClick={() => setTypeFilter('')}
        >
          Toutes ({alerts.length})
        </button>
        {Object.values(ALERT_TYPES).map((t) => {
          const count = alerts.filter((a) => a.type === t.id).length;
          if (!count) return null;
          return (
            <button
              key={t.id}
              type="button"
              className={`geo-filter-btn${typeFilter === t.id ? ' geo-filter-btn--active' : ''}`}
              onClick={() => setTypeFilter(t.id)}
            >
              {t.icon} {t.label} ({count})
            </button>
          );
        })}
      </div>

      {!filtered.length ? (
        <p className="geo-empty">Aucune alerte pour ce filtre.</p>
      ) : (
        <div className="geo-alerts-list">
          {filtered.map((alert) => {
            const meta = ALERT_TYPES[alert.type] || ALERT_TYPES.event;
            return (
              <article
                key={alert.id}
                className={`geo-card geo-alert geo-alert--${alert.urgency || 'medium'}`}
                style={{ borderLeftColor: meta.color }}
              >
                <div className="geo-alert__head">
                  <span className="geo-badge" style={{ background: `${meta.color}18`, color: meta.color }}>
                    {meta.icon} {meta.label}
                  </span>
                  {alert.urgency === 'high' && <span className="geo-badge geo-badge--urgent">Prioritaire</span>}
                </div>
                <h4>{alert.title}</h4>
                <p className="geo-alert__desc">{alert.description}</p>
                <div className="geo-alert__meta">
                  {alert.region && <span><MapPin size={12} aria-hidden /> {alert.region}</span>}
                  {alert.date && <span><Calendar size={12} aria-hidden /> {formatDate(alert.date)}</span>}
                  {alert.distanceKm != null && <span>≈ {alert.distanceKm} km</span>}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default LocalAlertsPanel;
