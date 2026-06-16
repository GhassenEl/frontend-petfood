import React from 'react';
import { AlertTriangle, Bell } from 'lucide-react';

const SEV = { high: 'livih-alert--high', medium: 'livih-alert--medium', low: 'livih-alert--ok' };

const LivreurDelayDetectionPanel = ({ delays, loading }) => {
  if (loading) return <p className="livih-muted">Analyse retards…</p>;
  const d = delays || {};

  return (
    <div className="livih-panel">
      <p className="livih-summary">
        <AlertTriangle size={16} aria-hidden />
        Identification précoce des risques de retard et notification automatique des clients concernés.
      </p>
      {d.notifyCount > 0 && (
        <p className="livih-notify-banner">
          <Bell size={16} /> {d.notifyCount} client(s) à notifier
        </p>
      )}
      <p className="livih-ai-text">{d.aiSummary}</p>
      <ul className="livih-list">
        {(d.alerts || []).map((a) => (
          <li key={a.id} className={`livih-card ${SEV[a.severity] || ''}`}>
            <strong>{a.message}</strong>
            {a.address && <p>{a.address}</p>}
            {a.delayMinutes && <span className="livih-tag">+{a.delayMinutes} min</span>}
            <p className="livih-action">{a.suggestedAction}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default LivreurDelayDetectionPanel;
