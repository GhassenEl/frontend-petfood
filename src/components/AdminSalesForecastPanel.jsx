import React, { useMemo } from 'react';
import {
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, ComposedChart, Legend, Line,
} from 'recharts';
import { Sparkles, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { formatDT } from '../utils/formatCurrency';

const trendIcon = { up: TrendingUp, down: TrendingDown, stable: Minus };
const trendColor = { up: '#059669', down: '#dc2626', stable: '#64748b' };

const AdminSalesForecastPanel = ({ forecast, loading }) => {
  const chartData = useMemo(() => {
    if (!forecast?.history?.length && !forecast?.forecast?.length) return [];
    const hist = (forecast.history || []).map((h) => ({
      label: h.label || `M${h.month}`,
      actual: h.revenue,
      forecast: null,
      bandLow: null,
      bandHigh: null,
    }));
    const fc = (forecast.forecast || []).map((f) => ({
      label: f.label || `M+${f.month}`,
      actual: null,
      forecast: f.revenue,
      bandLow: f.revenueLow,
      bandHigh: f.revenueHigh,
    }));
    if (hist.length && fc.length) {
      const bridge = { ...hist[hist.length - 1], forecast: hist[hist.length - 1].actual };
      return [...hist.slice(0, -1), bridge, ...fc];
    }
    return [...hist, ...fc];
  }, [forecast]);

  if (loading) {
    return <p className="aad-loading">Entraînement du modèle de prévision…</p>;
  }

  if (!forecast?.forecast?.length) {
    return <p className="aad-empty">Prévision indisponible.</p>;
  }

  const TrendIcon = trendIcon[forecast.metrics?.trend] || Minus;
  const color = trendColor[forecast.metrics?.trend] || '#64748b';

  return (
    <div className="aad-forecast">
      <div className="aad-forecast-meta">
        <div className="aad-forecast-badge">
          <Sparkles size={18} aria-hidden />
          <span>Modèle ML : {forecast.metrics?.model || 'linear_regression_v1'}</span>
        </div>
        <p className="aad-stock-hint">{forecast.stockHint}</p>
      </div>

      <div className="aad-kpi-grid aad-kpi-grid-compact">
        <div className="aad-kpi-card">
          <TrendIcon size={20} color={color} aria-hidden />
          <span className="aad-kpi-label">Tendance</span>
          <strong style={{ color }}>{forecast.metrics?.trend || 'stable'}</strong>
        </div>
        <div className="aad-kpi-card">
          <span className="aad-kpi-label">Horizon</span>
          <strong>{forecast.metrics?.horizonMonths ?? 3} mois</strong>
        </div>
        <div className="aad-kpi-card">
          <span className="aad-kpi-label">Prochain mois prévu</span>
          <strong>{formatDT(forecast.forecast[0]?.revenue)}</strong>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={280}>
        <ComposedChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="label" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip formatter={(v) => (v != null ? `${Number(v).toFixed(2)} DT` : '—')} />
          <Legend />
          <Area type="monotone" dataKey="bandHigh" stroke="none" fill="#dbeafe" fillOpacity={0.4} name="Intervalle haut" />
          <Area type="monotone" dataKey="bandLow" stroke="none" fill="#dbeafe" fillOpacity={0.2} />
          <Line type="monotone" dataKey="actual" stroke="#2563eb" strokeWidth={2} name="Réel" dot={{ r: 3 }} connectNulls={false} />
          <Line type="monotone" dataKey="forecast" stroke="#0d9488" strokeWidth={2} strokeDasharray="6 4" name="Prévision ML" dot={{ r: 4 }} connectNulls={false} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AdminSalesForecastPanel;
