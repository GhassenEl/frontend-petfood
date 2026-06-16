import React, { useState } from 'react';
import { Percent, Sparkles, Check } from 'lucide-react';
import { updateVendorProduct } from '../services/vendorService';
import { formatDT } from '../utils/formatCurrency';

const VendorPromoAssistantPanel = ({ suggestions = [], onApplied }) => {
  const [applying, setApplying] = useState(null);
  const [applied, setApplied] = useState(new Set());

  const handleApply = async (s) => {
    setApplying(s.productId);
    try {
      await updateVendorProduct(s.productId, { promotionPercent: s.discountPercent });
      setApplied((prev) => new Set(prev).add(s.productId));
      onApplied?.(s);
    } catch (e) {
      console.error(e);
    } finally {
      setApplying(null);
    }
  };

  if (!suggestions.length) {
    return (
      <div className="vnd-card">
        <p className="vnd-empty">Aucune promotion à suggérer — vos prix sont optimaux.</p>
      </div>
    );
  }

  return (
    <section className="vnd-card vnd-promo-ai">
      <h2><Sparkles size={18} aria-hidden /> Assistant promo IA</h2>
      <p style={{ margin: '0 0 12px', fontSize: '0.9rem', color: '#64748b' }}>
        L&apos;IA propose des promotions ciblées — appliquez en un clic.
      </p>
      <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
        {suggestions.map((s) => {
          const done = applied.has(s.productId);
          return (
            <li key={s.id} className={`vnd-promo-item vnd-promo-item--${s.urgency}`}>
              <div>
                <strong>{s.productName}</strong>
                <p style={{ margin: '4px 0', fontSize: '0.85rem', color: '#64748b' }}>
                  -{s.discountPercent}% · {formatDT(s.promoPrice)} (était {formatDT(s.currentPrice)})
                </p>
                <p style={{ margin: 0, fontSize: '0.8rem', color: '#6366f1' }}>{s.reason}</p>
              </div>
              <button
                type="button"
                className="vnd-btn vnd-btn--primary vnd-btn--sm"
                disabled={done || applying === s.productId}
                onClick={() => handleApply(s)}
              >
                {done ? (
                  <><Check size={14} /> Appliquée</>
                ) : applying === s.productId ? (
                  'Application…'
                ) : (
                  <><Percent size={14} /> Appliquer -{s.discountPercent}%</>
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
};

export default VendorPromoAssistantPanel;
