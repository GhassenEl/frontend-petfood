import React from 'react';
import { getProductEcoLabels, computeProductEcoScore } from '../utils/rseEcologyEngine';
import './RseEcoBadge.css';

/** Badge éco compact pour fiches produit. */
const RseEcoBadge = ({ product, showScore = false, size = 'sm' }) => {
  const labels = getProductEcoLabels(product);
  const score = computeProductEcoScore(product);

  if (!labels.length && !showScore) return null;

  return (
    <div className={`rse-eco-badge rse-eco-badge--${size}`}>
      {showScore && score >= 60 && (
        <span className="rse-eco-badge__score" title={`Score éco ${score}/100`}>
          🌱 {score}
        </span>
      )}
      {labels.map((l) => (
        <span
          key={l.id}
          className="rse-eco-badge__tag"
          style={{ background: `${l.color}18`, color: l.color, borderColor: `${l.color}40` }}
          title={l.label}
        >
          {l.icon} {size !== 'xs' && l.label}
        </span>
      ))}
    </div>
  );
};

export default RseEcoBadge;
