import React from 'react';
import { Star } from 'lucide-react';

const StarRatingPicker = ({ value = 5, onChange, size = 28, disabled = false }) => (
  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
    {[1, 2, 3, 4, 5].map((star) => (
      <button
        key={star}
        type="button"
        disabled={disabled}
        onClick={() => onChange?.(star)}
        aria-label={`${star} étoile${star > 1 ? 's' : ''}`}
        style={{
          background: 'none',
          border: 'none',
          padding: 2,
          cursor: disabled ? 'default' : 'pointer',
          lineHeight: 0,
        }}
      >
        <Star
          size={size}
          fill={star <= value ? '#f59e0b' : 'none'}
          color={star <= value ? '#f59e0b' : '#d1d5db'}
        />
      </button>
    ))}
    <span style={{ fontSize: 14, color: '#6b7280', marginLeft: 4 }}>{value}/5</span>
  </div>
);

export default StarRatingPicker;
