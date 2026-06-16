import React from 'react';
import { Link } from 'react-router-dom';
import { Package, AlertTriangle } from 'lucide-react';

const URGENCY_CLASS = {
  critical: 'bi-stock-critical',
  high: 'bi-stock-high',
  medium: 'bi-stock-medium',
  ok: 'bi-stock-ok',
};

const PredictiveStockPanel = ({ predictions = [], loading }) => {
  if (loading) {
    return <p className="bi-loading">Prévision des ruptures de stock…</p>;
  }

  const atRisk = predictions.filter((p) => p.urgency !== 'ok');
  if (!atRisk.length) {
    return (
      <div className="bi-empty bi-empty-ok">
        <Package size={32} aria-hidden />
        <p>Aucune rupture prévue sous 14 jours.</p>
        <Link to="/admin/stock" className="bi-link-btn">Gestion stock →</Link>
      </div>
    );
  }

  return (
    <ul className="bi-stock-list">
      {atRisk.map((p) => (
        <li key={p.productId} className={`bi-stock-item ${URGENCY_CLASS[p.urgency] || ''}`}>
          <AlertTriangle size={18} aria-hidden />
          <div>
            <strong>{p.name}</strong>
            <span className="bi-stock-urgency">{p.urgency}</span>
            <p>{p.aiSummary}</p>
            <div className="bi-stock-meta">
              <span>Stock : {p.stock}</span>
              <span>Vélocité : {p.velocityPerDay}/j</span>
              <span>Rupture prévue : {p.predictedOutDate}</span>
              <span>Réappro suggéré : {p.reorderSuggested} u</span>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
};

export default PredictiveStockPanel;
