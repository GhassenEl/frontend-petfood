import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, ShieldAlert } from 'lucide-react';

const RISK_CLASS = {
  critical: 'aad-risk-critical',
  high: 'aad-risk-high',
  medium: 'aad-risk-medium',
  low: 'aad-risk-low',
};

const AdminRiskProductsPanel = ({ items = [], loading }) => {
  if (loading) {
    return <p className="aad-loading">Analyse des avis négatifs…</p>;
  }

  if (!items?.length) {
    return (
      <div className="aad-empty aad-empty-ok">
        <ShieldAlert size={32} aria-hidden />
        <p>Aucun produit à risque identifié pour le moment.</p>
        <Link to="/admin/reviews" className="aad-link-btn">Voir tous les avis</Link>
      </div>
    );
  }

  return (
    <ul className="aad-risk-list">
      {items.map((p) => (
        <li key={p.productId} className={`aad-risk-item ${RISK_CLASS[p.riskLevel] || ''}`}>
          <div className="aad-risk-head">
            <AlertTriangle size={18} aria-hidden />
            <div>
              <h4>{p.name}</h4>
              <span className="aad-risk-level">{p.riskLevel}</span>
            </div>
          </div>
          <p className="aad-risk-stats">
            Note {p.avgRating != null ? `${p.avgRating}/5` : '—'} · {p.reviewCount} avis
            {p.negativeCount > 0 && ` · ${p.negativeCount} négatif(s)`}
          </p>
          <ul className="aad-risk-reasons">
            {(p.reasons || []).map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
          {p.weaknessThemes?.length > 0 && (
            <div className="aad-tags">
              {p.weaknessThemes.map((t) => (
                <span key={t} className="aad-tag-warn">{t}</span>
              ))}
            </div>
          )}
          <p className="aad-risk-action">{p.action}</p>
          <Link to="/admin/reviews" className="aad-card-link">Modérer les avis →</Link>
        </li>
      ))}
    </ul>
  );
};

export default AdminRiskProductsPanel;
