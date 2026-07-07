import React from 'react';
import { getProductRating, renderStars } from '../utils/productRating';

const ProductStarRating = ({ product, size = 'sm', showCount = true, showNumeric = true }) => {
  const { avg, count, hasRating } = getProductRating(product);
  if (!hasRating) return null;

  const fontSize = size === 'lg' ? 16 : size === 'md' ? 14 : 12;

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        fontSize,
        color: '#f59e0b',
        fontWeight: 700,
        flexWrap: 'wrap',
      }}
      aria-label={`${avg.toFixed(1)} sur 5${count ? `, ${count} avis` : ''}`}
    >
      <span style={{ letterSpacing: 1 }} aria-hidden>{renderStars(avg)}</span>
      {showNumeric && (
        <span style={{ color: '#92400e' }}>{avg.toFixed(1)}/5</span>
      )}
      {showCount && count > 0 && (
        <span style={{ color: '#6b7280', fontWeight: 600, fontSize: fontSize - 1 }}>
          ({count} avis)
        </span>
      )}
    </span>
  );
};

export default ProductStarRating;
