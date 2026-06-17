import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, BellRing, AlertTriangle, PackageX } from 'lucide-react';
import { requestPharmacyNotificationPermission } from '../services/vetPharmacyNotificationService';
import '../pages/VetPages.css';

const LEVEL_ICON = {
  critical: PackageX,
  warning: AlertTriangle,
  info: Bell,
};

const VetPharmacyAlertsPanel = ({
  alerts = [],
  summary = null,
  compact = false,
  title = 'Alertes pharmacie & ruptures',
  onEnableNotifications,
}) => {
  const [notifState, setNotifState] = useState(
    typeof Notification !== 'undefined' ? Notification.permission : 'unsupported'
  );

  const handleEnableNotifs = async () => {
    const result = await requestPharmacyNotificationPermission();
    setNotifState(result);
    onEnableNotifications?.(result);
  };

  if (!alerts.length && !summary?.ruptures && !summary?.lowStock) {
    return (
      <div className={`vet-pharmacy-panel vet-pharmacy-panel--ok ${compact ? 'vet-pharmacy-panel--compact' : ''}`}>
        <span className="vet-pharmacy-panel__ok">✅ Stock pharmacie sous contrôle — aucune rupture.</span>
      </div>
    );
  }

  return (
    <section className={`vet-pharmacy-panel ${compact ? 'vet-pharmacy-panel--compact' : ''}`}>
      <div className="vet-pharmacy-panel__header">
        <h2 className="vet-pharmacy-panel__title">
          <BellRing size={18} /> {title}
        </h2>
        <div className="vet-pharmacy-panel__meta">
          {summary && (
            <div className="vet-pharmacy-panel__chips">
              {summary.ruptures > 0 && (
                <span className="vet-pharmacy-chip vet-pharmacy-chip--critical">
                  {summary.ruptures} rupture{summary.ruptures > 1 ? 's' : ''}
                </span>
              )}
              {summary.lowStock > 0 && (
                <span className="vet-pharmacy-chip vet-pharmacy-chip--warning">
                  {summary.lowStock} stock bas
                </span>
              )}
              {summary.expiry > 0 && (
                <span className="vet-pharmacy-chip vet-pharmacy-chip--warning">
                  {summary.expiry} péremption
                </span>
              )}
            </div>
          )}
          {notifState !== 'granted' && notifState !== 'unsupported' && (
            <button type="button" className="vet-pharmacy-panel__notif-btn" onClick={handleEnableNotifs}>
              <Bell size={14} /> Activer alertes
            </button>
          )}
        </div>
      </div>

      <ul className="vet-pharmacy-panel__list">
        {alerts.map((alert) => {
          const Icon = LEVEL_ICON[alert.level] || AlertTriangle;
          return (
            <li
              key={alert.id}
              className={`vet-pharmacy-alert vet-pharmacy-alert--${alert.level}`}
            >
              <Icon size={16} className="vet-pharmacy-alert__icon" aria-hidden />
              <div className="vet-pharmacy-alert__body">
                <strong>{alert.name}</strong>
                <span className="vet-pharmacy-alert__badge">{alert.label}</span>
                <p>{alert.message}</p>
                {alert.location && (
                  <span className="vet-pharmacy-alert__loc">📍 {alert.location}</span>
                )}
              </div>
              {alert.link && (
                <Link to={alert.link} className="vet-pharmacy-alert__link">
                  Gérer →
                </Link>
              )}
            </li>
          );
        })}
      </ul>

      {!compact && (
        <div className="vet-pharmacy-panel__footer">
          <Link to="/vet/pharmacy">Ouvrir la pharmacie clinique →</Link>
          <Link to="/vet/prescriptions">Ordonnances →</Link>
        </div>
      )}
    </section>
  );
};

export default VetPharmacyAlertsPanel;
