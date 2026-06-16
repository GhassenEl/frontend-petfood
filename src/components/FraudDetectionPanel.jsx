import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, CreditCard, UserX } from 'lucide-react';

const SEV_CLASS = {
  critical: 'ais-sev-critical',
  high: 'ais-sev-high',
  medium: 'ais-sev-medium',
  low: 'ais-sev-low',
};

const FraudDetectionPanel = ({ alerts = [], behavior, loading }) => {
  if (loading) {
    return <p className="ais-loading">Analyse des transactions…</p>;
  }

  if (!alerts.length) {
    return (
      <div className="ais-empty ais-empty-ok">
        <p>Aucune alerte fraude active.</p>
        <Link to="/moderator/fraud" className="ais-link-btn">Centre anti-fraude modération →</Link>
      </div>
    );
  }

  return (
    <div className="ais-fraud">
      {behavior?.suspicious && (
        <div className="ais-behavior-banner">
          <UserX size={18} aria-hidden />
          <span>{behavior.summary}</span>
        </div>
      )}
      <ul className="ais-alert-list">
        {alerts.map((a) => (
          <li key={a.id} className={`ais-alert-item ${SEV_CLASS[a.severity] || ''}`}>
            <div className="ais-alert-head">
              <AlertTriangle size={18} aria-hidden />
              <div>
                <strong>{a.title}</strong>
                <span className="ais-alert-type">{a.type}</span>
              </div>
              <span className="ais-score">{a.score ?? '—'}%</span>
            </div>
            <p>{a.detail}</p>
            <p className="ais-action">{a.suggestedAction}</p>
            {a.orderId && (
              <Link to="/admin/orders" className="ais-card-link">
                <CreditCard size={14} aria-hidden /> Voir commandes
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FraudDetectionPanel;
