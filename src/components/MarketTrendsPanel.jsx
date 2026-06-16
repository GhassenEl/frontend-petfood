import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const MOMENTUM_ICON = { rising: TrendingUp, declining: TrendingDown, stable: Minus };
const MOMENTUM_COLOR = { rising: '#059669', declining: '#dc2626', stable: '#64748b' };

const MarketTrendsPanel = ({ marketTrends, loading }) => {
  if (loading) {
    return <p className="bi-loading">Analyse des tendances marché…</p>;
  }

  const trends = marketTrends?.topCategories || [];
  if (!trends.length) {
    return <p className="bi-empty">Pas assez de commandes pour détecter les tendances.</p>;
  }

  const chartData = trends.map((t) => ({
    name: t.label,
    units: t.units,
    revenue: t.revenue,
  }));

  return (
    <div className="bi-trends">
      <p className="bi-summary">{marketTrends.summary}</p>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="name" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip />
          <Bar dataKey="units" name="Unités vendues" radius={[4, 4, 0, 0]}>
            {chartData.map((_, i) => (
              <Cell key={i} fill={['#2563eb', '#0d9488', '#7c3aed', '#ea580c', '#64748b', '#059669'][i % 6]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <ul className="bi-trend-list">
        {trends.map((t) => {
          const Icon = MOMENTUM_ICON[t.momentum] || Minus;
          const color = MOMENTUM_COLOR[t.momentum] || '#64748b';
          return (
            <li key={t.category}>
              <Icon size={16} color={color} aria-hidden />
              <div>
                <strong>{t.label}</strong>
                <span>{t.units} u · {t.revenue} DT</span>
                <p>{t.insight}</p>
                {t.growthUnitsPct !== 0 && (
                  <small style={{ color }}>
                    {t.growthUnitsPct > 0 ? '+' : ''}{t.growthUnitsPct} % vs période précédente
                  </small>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default MarketTrendsPanel;
