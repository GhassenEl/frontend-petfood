import React, { useState } from 'react';
import { Monitor, LogOut } from 'lucide-react';
import { revokeSecuritySession } from '../services/securityService';

const AdminActiveSessionsPanel = ({ sessions = [], loading, onRevoked }) => {
  const [revoked, setRevoked] = useState(new Set());
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState('');

  if (loading) return <p className="ais-loading">Chargement des sessions…</p>;

  const visible = sessions.filter((s) => !revoked.has(s.id));

  const handleRevoke = async (sessionId) => {
    setError('');
    setBusyId(sessionId);
    try {
      await revokeSecuritySession(sessionId);
      setRevoked((prev) => new Set(prev).add(sessionId));
      onRevoked?.(sessionId);
    } catch (e) {
      setError(e.response?.data?.error || e.message || 'Révocation impossible');
    } finally {
      setBusyId(null);
    }
  };

  if (!visible.length) {
    return <p className="ais-empty ais-empty-ok">Aucune session active.</p>;
  }

  return (
    <>
      {error && <p className="ais-error" role="alert">{error}</p>}
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
                disabled={busyId === s.id}
                onClick={() => handleRevoke(s.id)}
              >
                <LogOut size={14} aria-hidden /> {busyId === s.id ? '…' : 'Révoquer'}
              </button>
            )}
          </li>
        ))}
      </ul>
    </>
  );
};

export default AdminActiveSessionsPanel;
