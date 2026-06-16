import React from 'react';
import { TrendingUp, Star } from 'lucide-react';

const TIER_STYLE = {
  high: { bg: '#dcfce7', color: '#166534', label: 'Fort potentiel' },
  medium: { bg: '#fef3c7', color: '#92400e', label: 'Potentiel moyen' },
};

const VendorProductPotentialPanel = ({ products = [] }) => {
  if (!products.length) {
    return (
      <section className="vnd-card">
        <h2>Produits à fort potentiel</h2>
        <p className="vnd-empty">Pas encore assez de données — vendez davantage pour activer la détection.</p>
      </section>
    );
  }

  return (
    <section className="vnd-card">
      <h2><TrendingUp size={18} aria-hidden /> Produits à fort potentiel commercial</h2>
      <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
        {products.map((p) => {
          const tier = TIER_STYLE[p.tier] || TIER_STYLE.medium;
          return (
            <li key={p.productId} style={{ padding: '14px 0', borderBottom: '1px solid #f1f5f9' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                <div>
                  <strong>{p.productName}</strong>
                  <span
                    style={{
                      marginLeft: 8,
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: 999,
                      background: tier.bg,
                      color: tier.color,
                    }}
                  >
                    {tier.label}
                  </span>
                  <p style={{ margin: '6px 0', fontSize: '0.85rem', color: '#64748b' }}>
                    Score {p.potentialScore}/100 · {p.unitsSold} ventes · stock {p.stock}
                    {p.avgRating > 0 && (
                      <> · <Star size={12} style={{ verticalAlign: 'middle' }} /> {p.avgRating}</>
                    )}
                  </p>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: '#6366f1' }}>{p.aiSummary}</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 6 }}>
                    {(p.signals || []).map((sig) => (
                      <span
                        key={sig}
                        style={{
                          fontSize: '0.7rem',
                          padding: '2px 8px',
                          borderRadius: 999,
                          background: '#f1f5f9',
                          color: '#475569',
                        }}
                      >
                        {sig}
                      </span>
                    ))}
                  </div>
                </div>
                <strong style={{ color: '#059669', fontSize: '1.1rem' }}>{p.potentialScore}</strong>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
};

export default VendorProductPotentialPanel;
