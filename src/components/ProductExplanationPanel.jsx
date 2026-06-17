import React from 'react';

const ProductExplanationPanel = ({ items = [], loading }) => {
  if (loading) {
    return <p className="xai-loading">Génération des explications IA…</p>;
  }

  if (!items.length) {
    return <p className="xai-empty">Aucune recommandation expliquée pour cet animal.</p>;
  }

  return (
    <ul className="xai-explain-list">
      {items.map(({ product, explanation }) => (
        <li key={product.id || product._id} className="xai-explain-item">
          <h4>{product.name}</h4>
          <p className="xai-summary">{explanation?.summary}</p>
          <ul className="xai-reasons">
            {(explanation?.reasons || []).map((r) => (
              <li key={r.code}>
                <span className="xai-reason-icon" aria-hidden>{r.icon}</span>
                <div>
                  <strong>{r.label}</strong>
                  <span className="xai-confidence">{r.confidence}% indicateur indicatif</span>
                  <p>{r.detail}</p>
                </div>
              </li>
            ))}
          </ul>
          <p className="xai-note">{explanation?.transparencyNote}</p>
        </li>
      ))}
    </ul>
  );
};

export default ProductExplanationPanel;
