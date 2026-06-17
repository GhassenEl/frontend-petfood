import React from 'react';
import { Link } from 'react-router-dom';
import { Bell } from 'lucide-react';
import {
  DEMO_SMART_NOTIFICATIONS,
  SMART_NOTIFICATION_TYPES,
  countUnreadSmartNotifications,
} from '../utils/smartNotificationsHubEngine';

const formatWhen = (iso) => {
  if (!iso) return '—';
  const d = new Date(iso);
  const diff = d - Date.now();
  if (diff > 0 && diff < 86400000) return `Dans ${Math.round(diff / 3600000)} h`;
  if (diff < 0) return `Il y a ${Math.round(Math.abs(diff) / 3600000)} h`;
  return d.toLocaleDateString('fr-FR');
};

const SmartNotificationsHubPanel = () => {
  const unread = countUnreadSmartNotifications();

  return (
    <section className="shub-panel">
      <header className="shub-panel__head">
        <Bell size={20} color="#e67e22" />
        <div>
          <h3>Smart Notifications</h3>
          <p>Repas, vaccination, rupture stock et aliment détérioré — push &amp; e-mail.</p>
        </div>
        {unread > 0 && <span className="shub-badge">{unread} non lues</span>}
      </header>

      <ul className="shub-notif-list">
        {DEMO_SMART_NOTIFICATIONS.map((n) => {
          const meta = SMART_NOTIFICATION_TYPES[n.type] || SMART_NOTIFICATION_TYPES.meal;
          return (
            <li key={n.id} className={`shub-notif-item${n.read ? '' : ' is-unread'}`}>
              <span className="shub-notif-icon" style={{ color: meta.color }} aria-hidden>{meta.icon}</span>
              <div className="shub-notif-body">
                <span className="shub-notif-type">{meta.label}</span>
                <strong>{n.title}</strong>
                <p>{n.message}</p>
                <small>{n.petName && `${n.petName} · `}{formatWhen(n.scheduledAt)} · {n.channel}</small>
              </div>
              {n.link && (
                <Link to={n.link} className="shub-notif-link">Voir</Link>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
};

export default SmartNotificationsHubPanel;
