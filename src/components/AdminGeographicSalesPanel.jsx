import React, { useMemo } from 'react';
import { MapPin, TrendingUp } from 'lucide-react';

const DEMO_GEO_SALES = [
  { region: 'Tunis', orders: 842, revenue: 28450, share: 28, growth: 12 },
  { region: 'Sousse', orders: 521, revenue: 17620, share: 17, growth: 8 },
  { region: 'Sfax', orders: 468, revenue: 15890, share: 16, growth: 15 },
  { region: 'Ariana', orders: 392, revenue: 13240, share: 13, growth: 6 },
  { region: 'Nabeul', orders: 284, revenue: 9610, share: 9, growth: 22 },
  { region: 'Bizerte', orders: 198, revenue: 6720, share: 7, growth: 4 },
  { region: 'Béja', orders: 156, revenue: 5280, share: 5, growth: 18 },
  { region: 'Autres', orders: 312, revenue: 10560, share: 5, growth: 3 },
];

const AdminGeographicSalesPanel = ({ loading }) => {
  const total = useMemo(
    () => DEMO_GEO_SALES.reduce((s, r) => s + r.revenue, 0),
    [],
  );

  if (loading) {
    return <p style={{ color: '#94a3b8' }}>Chargement analyse géographique…</p>;
  }

  const maxShare = Math.max(...DEMO_GEO_SALES.map((r) => r.share));

  return (
    <div id="geo" className="bi-geo-panel">
      <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
        <div>
          <h3 style={{ margin: '0 0 4px', display: 'flex', alignItems: 'center', gap: 8, fontSize: 16 }}>
            <MapPin size={18} color="#1e40af" />
            Analyse géographique des ventes
          </h3>
          <p style={{ margin: 0, fontSize: 13, color: '#64748b' }}>
            CA par gouvernorat — {total.toLocaleString('fr-FR')} TND total (30 j)
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <strong style={{ fontSize: 22, color: '#1e40af' }}>8</strong>
          <p style={{ margin: 0, fontSize: 11, color: '#64748b' }}>zones couvertes</p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {DEMO_GEO_SALES.map((r) => (
          <div key={r.region} style={{ display: 'grid', gridTemplateColumns: '100px 1fr 80px 70px', gap: 10, alignItems: 'center', fontSize: 13 }}>
            <strong>{r.region}</strong>
            <div style={{ height: 10, borderRadius: 999, background: '#e2e8f0', overflow: 'hidden' }}>
              <div
                style={{
                  width: `${(r.share / maxShare) * 100}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, #1e40af, #0ea5e9)',
                  borderRadius: 999,
                }}
              />
            </div>
            <span style={{ color: '#475569', fontWeight: 600 }}>{r.revenue.toLocaleString('fr-FR')} TND</span>
            <span style={{ color: r.growth >= 10 ? '#059669' : '#64748b', fontSize: 12, display: 'flex', alignItems: 'center', gap: 2 }}>
              <TrendingUp size={12} /> +{r.growth}%
            </span>
          </div>
        ))}
      </div>

      <p style={{ margin: '14px 0 0', fontSize: 11, color: '#94a3b8' }}>
        {DEMO_GEO_SALES.reduce((s, r) => s + r.orders, 0).toLocaleString('fr-FR')} commandes · heatmap livraison via hub logistique
      </p>
    </div>
  );
};

export default AdminGeographicSalesPanel;
