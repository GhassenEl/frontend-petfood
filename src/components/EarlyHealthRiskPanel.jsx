import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';

const SEV = {
  high: 'xai-risk-high',
  medium: 'xai-risk-medium',
  low: 'xai-risk-low',
};

const EarlyHealthRiskPanel = ({ risks = [], loading }) => {
  if (loading) {
    return <p className="xai-loading">Analyse carnet médical et habitudes…</p>;
  }

  if (!risks.length) {
    return (
      <div className="xai-empty xai-empty-ok">
        <p>Aucun signal de risque précoce détecté.</p>
        <Link to="/medical-dossier" className="xai-link-btn">Carnet médical →</Link>
      </div>
    );
  }

  return (
    <ul className="xai-risk-list">
      {risks.map((r) => (
        <li key={r.id} className={`xai-risk-item ${SEV[r.severity] || ''}`}>
          <AlertTriangle size={18} aria-hidden />
          <div>
            <strong>{r.title}</strong>
            <span className="xai-risk-source">{r.source}</span>
            <p>{r.detail}</p>
            <p className="xai-risk-action">{r.action}</p>
          </div>
        </li>
      ))}
    </ul>
  );
};

export default EarlyHealthRiskPanel;
