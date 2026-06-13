import React from 'react';
import { Star } from 'lucide-react';

const StarRatingDisplay = ({
  value = 0,
  size = 16,
  showValue = true,
  color = '#f59e0b',
  emptyColor = '#d1d5db',
}) => {
  const rating = Math.min(5, Math.max(0, Number(value) || 0));
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2 }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={size}
          fill={star <= rating ? color : 'none'}
          color={star <= rating ? color : emptyColor}
          aria-hidden
        />
      ))}
      {showValue && (
        <span style={{ fontSize: size * 0.75, color: '#6b7280', marginLeft: 4, fontWeight: 700 }}>
          {rating}/5
        </span>
      )}
    </span>
  );
};

export default StarRatingDisplay;
