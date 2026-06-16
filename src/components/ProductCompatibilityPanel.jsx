import React from 'react';
import { Link } from 'react-router-dom';

const LEVEL_CLASS = {
  excellent: 'an-score-excellent',
  bon: 'an-score-good',
  moyen: 'an-score-medium',
  faible: 'an-score-low',
};

const ProductCompatibilityPanel = ({ scores = [], loading }) => {
  if (loading) {
    return <p className="an-loading">Calcul des scores de compatibilité…</p>;
  }

  if (!scores.length) {
    return (
      <p className="an-empty">
        Aucun produit scoré.{' '}
        <Link to="/client-products">Parcourir la boutique →</Link>
      </p>
    );
  }

  return (
    <ul className="an-compat-list">
      {scores.map(({ product, compatibility }) => (
        <li key={compatibility.productId} className="an-compat-item">
          <div className="an-compat-head">
            <strong>{product.name}</strong>
            <span className={`an-score-badge ${LEVEL_CLASS[compatibility.level] || ''}`}>
              {compatibility.score}/100
            </span>
          </div>
          <p className="an-compat-level">{compatibility.summary}</p>
          <div className="an-score-bar">
            <div
              className="an-score-fill"
              style={{ width: `${compatibility.score}%` }}
            />
          </div>
          <ul className="an-factors">
            {(compatibility.factors || []).slice(0, 4).map((f) => (
              <li key={f.label}>
                {f.label}
                {f.warn ? ` ⚠ ${f.warn}` : ''}
              </li>
            ))}
          </ul>
          <Link to="/client-products" className="an-card-link">Voir en boutique →</Link>
        </li>
      ))}
    </ul>
  );
};

export default ProductCompatibilityPanel;
