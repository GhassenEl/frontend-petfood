import React from 'react';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { TrendingUp, Star, ShoppingBag, Smile } from 'lucide-react';
import { formatDT } from '../utils/formatCurrency';

const AdminAnalyticsDashboard = ({ dashboard, salesChart = [], loading }) => {
  if (loading) {
    return <p className="aad-loading">Construction du tableau de bord…</p>;
  }

  if (!dashboard) {
    return <p className="aad-empty">Données analytiques indisponibles.</p>;
  }

  const { kpi, salesTrend, popularProducts, satisfaction, marketTrends } = dashboard;

  return (
    <div className="aad-dashboard">
      <div className="aad-kpi-grid">
        <div className="aad-kpi-card">
          <ShoppingBag size={20} aria-hidden />
          <span className="aad-kpi-label">CA total</span>
          <strong>{formatDT(kpi?.totalRevenue)}</strong>
          <small>{kpi?.orderCount ?? 0} commandes</small>
        </div>
        <div className="aad-kpi-card">
          <TrendingUp size={20} aria-hidden />
          <span className="aad-kpi-label">Panier moyen</span>
          <strong>{formatDT(kpi?.avgBasket)}</strong>
        </div>
        <div className="aad-kpi-card">
          <Star size={20} aria-hidden />
          <span className="aad-kpi-label">Satisfaction</span>
          <strong>{kpi?.satisfactionAvg ?? '—'}/5</strong>
          <small>{kpi?.reviewCount ?? 0} avis</small>
        </div>
        <div className="aad-kpi-card">
          <Smile size={20} aria-hidden />
          <span className="aad-kpi-label">Tendance</span>
          <strong>{marketTrends?.[0]?.label || '—'}</strong>
          <small>{marketTrends?.[0]?.insight || 'Analyse marché'}</small>
        </div>
      </div>

      <div className="aad-charts-row">
        <div className="aad-chart-card">
          <h3>Évolution du chiffre d&apos;affaires</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={salesTrend?.length ? salesTrend : salesChart}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v) => [`${Number(v).toFixed(2)} DT`, 'CA']} />
              <Legend />
              <Line type="monotone" dataKey="revenue" name="CA" stroke="#2563eb" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="aad-chart-card">
          <h3>Produits populaires</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={(popularProducts || []).slice(0, 6)} layout="vertical" margin={{ left: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 10 }} />
              <Tooltip />
              <Bar dataKey="units" name="Unités" fill="#0d9488" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="aad-split">
        <div className="aad-panel">
          <h3>Satisfaction clients par produit</h3>
          <ul className="aad-satisfaction-list">
            {(satisfaction || []).slice(0, 6).map((row) => (
              <li key={row.productId}>
                <strong>{row.name}</strong>
                <span>{row.avgRating != null ? `${row.avgRating}/5` : '—'}</span>
                <small>{row.reviewCount} avis · {row.positiveRate != null ? `${row.positiveRate}% positifs` : ''}</small>
              </li>
            ))}
          </ul>
        </div>

        <div className="aad-panel">
          <h3>Tendances marché</h3>
          <ul className="aad-trend-list">
            {(marketTrends || []).map((t) => (
              <li key={t.category}>
                <span className={`aad-momentum aad-momentum-${t.momentum}`}>{t.momentum}</span>
                <div>
                  <strong>{t.label}</strong>
                  <p>{t.insight}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalyticsDashboard;
