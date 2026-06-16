import React, { useState } from 'react';
import { Monitor, LogOut } from 'lucide-react';

const AdminActiveSessionsPanel = ({ sessions = [], loading }) => {
  const [revoked, setRevoked] = useState(new Set());

  if (loading) return <p className="ais-loading">Chargement des sessions…</p>;

  const visible = sessions.filter((s) => !revoked.has(s.id));

  if (!visible.length) {
    return <p className="ais-empty ais-empty-ok">Aucune session active.</p>;
  }

  return (
    <ul className="ps-sessions">
      {visible.map((s) => (
        <li key={s.id} className={s.current ? 'ps-session-current' : ''}>
          <Monitor size={18} aria-hidden />
          <div>
            <strong>{s.user}</strong>
            <span className="ps-session-role">{s.role}</span>
            <p>{s.device} · {s.ip}</p>
          </div>
          {s.current ? (
            <span className="ps-session-badge">Session actuelle</span>
          ) : (
            <button
              type="button"
              className="ps-session-revoke"
              onClick={() => setRevoked((prev) => new Set(prev).add(s.id))}
            >
              <LogOut size={14} aria-hidden /> Révoquer
            </button>
          )}
        </li>
      ))}
    </ul>
  );
};

export default AdminActiveSessionsPanel;
