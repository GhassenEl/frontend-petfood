import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { formatPriceVerifiedDate } from '../utils/productDetails';

const VerifiedPriceBadge = ({ product, compact = false }) => {
  if (!product?.priceVerified) return null;
  const dateLabel = formatPriceVerifiedDate(product.priceVerifiedAt);

  if (compact) {
    return (
      <span
        title={dateLabel ? `Prix vérifié — ${dateLabel}` : 'Prix vérifié par PetfoodTN'}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
          fontSize: 10,
          fontWeight: 700,
          color: '#0369a1',
          background: '#e0f2fe',
          padding: '3px 8px',
          borderRadius: 999,
        }}
      >
        <ShieldCheck size={11} /> Vérifié
      </span>
    );
  }

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        fontSize: 12,
        fontWeight: 600,
        color: '#0369a1',
        background: 'linear-gradient(135deg, #e0f2fe, #f0f9ff)',
        border: '1px solid #bae6fd',
        padding: '6px 12px',
        borderRadius: 10,
      }}
    >
      <ShieldCheck size={14} />
      <span>
        Prix officiel vérifié
        {dateLabel ? ` — ${dateLabel}` : ''}
      </span>
    </div>
  );
};

export default VerifiedPriceBadge;
