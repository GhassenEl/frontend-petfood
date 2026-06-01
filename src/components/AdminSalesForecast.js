import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  ComposedChart,
  Legend,
} from 'recharts';
import { Sparkles, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import api from '../utils/api';
import { formatDT } from '../utils/formatCurrency';

const trendIcon = {
  up: TrendingUp,
  down: TrendingDown,
  stable: Minus,
};

const trendColor = {
  up: '#059669',
  down: '#dc2626',
  stable: '#64748b',
};

const AdminSalesForecast = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [months, setMonths] = useState(12);
  const [horizon, setHorizon] = useState(3);

  const load = useCallback(() => {
    setLoading(true);
    setError('');
    api
      .get(`/ai/admin/sales-forecast?months=${months}&horizon=${horizon}`)
      .then((res) => setData(res.data))
      .catch((err) => {
        setData(null);
        setError(err.response?.data?.error || 'Impossible de charger la prévision.');
      })
      .finally(() => setLoading(false));
  }, [months, horizon]);

  useEffect(() => {
    load();
  }, [load]);

  const chartData = useMemo(() => {
    if (!data) return [];
    const hist = (data.history || []).map((h) => ({
      label: h.label,
      actual: h.revenue,
      forecast: null,
      bandLow: null,
      bandHigh: null,
    }));
    const fc = (data.forecast || []).map((f) => ({
      label: f.label,
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
  }, [data]);

  const TrendIcon = data?.metrics?.trend ? trendIcon[data.metrics.trend] : Minus;

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} style={cardStyle}>
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
        <TrendingUp size={22} color="#3498db" />
        <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, flex: '1 1 200px' }}>
          Modèle de prédiction des ventes
        </h3>
        {data?.aiPowered && (
          <span style={badgeStyle}>
            <Sparkles size={12} /> Analyse IA
          </span>
        )}
        <select
          value={months}
          onChange={(e) => setMonths(Number(e.target.value))}
          style={selectStyle}
          aria-label="Mois d'historique"
        >
          <option value={6}>6 mois historique</option>
          <option value={12}>12 mois historique</option>
          <option value={18}>18 mois historique</option>
        </select>
        <select
          value={horizon}
          onChange={(e) => setHorizon(Number(e.target.value))}
          style={selectStyle}
          aria-label="Horizon prévision"
        >
          <option value={3}>Prévoir 3 mois</option>
          <option value={6}>Prévoir 6 mois</option>
        </select>
      </div>

      {loading && <p style={{ color: '#6b7280', margin: 0 }}>Calcul du modèle prédictif…</p>}
      {error && <p style={{ color: '#b91c1c', margin: 0 }}>⚠ {error}</p>}

      {!loading && !error && data && (
        <>
          <p style={{ color: '#4b5563', fontSize: '14px', lineHeight: 1.55, margin: '0 0 16px' }}>
            {data.insight}
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
              gap: '12px',
              marginBottom: '20px',
            }}
          >
            <Kpi
              label="CA historique"
              value={formatDT(data.summary?.totalHistoricalRevenue)}
              sub={`${data.history?.length || 0} mois`}
            />
            <Kpi
              label="CA prévisionnel"
              value={formatDT(data.summary?.totalForecastRevenue)}
              sub={`${data.horizonMonths} mois`}
              accent="#3498db"
            />
            <Kpi
              label="Moy. / mois (prévu)"
              value={formatDT(data.summary?.avgMonthlyForecast)}
            />
            <Kpi
              label="Tendance"
              value={
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: trendColor[data.metrics?.trend] }}>
                  <TrendIcon size={18} />
                  {data.metrics?.trend === 'up' ? 'Hausse' : data.metrics?.trend === 'down' ? 'Baisse' : 'Stable'}
                </span>
              }
              sub={data.metrics?.slopePerMonth != null ? `${data.metrics.slopePerMonth > 0 ? '+' : ''}${data.metrics.slopePerMonth} DT/mois` : ''}
            />
            {data.metrics?.r2 != null && (
              <Kpi label="R² modèle" value={data.metrics.r2} sub={data.model === 'linear_regression' ? 'Régression linéaire' : 'Moyenne'} />
            )}
            {data.metrics?.mape != null && (
              <Kpi label="Erreur MAPE" value={`${data.metrics.mape}%`} sub="Précision historique" />
            )}
          </div>

          <ResponsiveContainer width="100%" height={280}>
            <ComposedChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${v}`} />
              <Tooltip
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                formatter={(value, name) => {
                  if (value == null) return ['—', name];
                  const labels = {
                    actual: 'CA réel',
                    forecast: 'CA prévu',
                    bandHigh: 'Plafond',
                    bandLow: 'Plancher',
                  };
                  return [`${Number(value).toLocaleString('fr-FR')} DT`, labels[name] || name];
                }}
              />
              <Legend formatter={(v) => ({ actual: 'Réel', forecast: 'Prévision', bandHigh: 'Intervalle', bandLow: '' }[v] || v)} />
              <Area
                type="monotone"
                dataKey="bandHigh"
                stroke="none"
                fill="rgba(52,152,219,0.12)"
                connectNulls={false}
                name="bandHigh"
              />
              <Area
                type="monotone"
                dataKey="bandLow"
                stroke="none"
                fill="#fff"
                connectNulls={false}
                name="bandLow"
              />
              <Line
                type="monotone"
                dataKey="actual"
                stroke="#e67e22"
                strokeWidth={2.5}
                dot={{ r: 4 }}
                connectNulls={false}
                name="actual"
              />
              <Line
                type="monotone"
                dataKey="forecast"
                stroke="#3498db"
                strokeWidth={2.5}
                strokeDasharray="6 4"
                dot={{ r: 4 }}
                connectNulls
                name="forecast"
              />
            </ComposedChart>
          </ResponsiveContainer>

          <p style={{ margin: '12px 0 0', fontSize: '0.75rem', color: '#94a3b8' }}>
            Modèle : {data.model === 'linear_regression' ? 'régression linéaire sur le CA mensuel' : 'moyenne mobile (données limitées)'}.
            Zone bleue = intervalle de confiance approximatif.
          </p>
        </>
      )}
    </motion.div>
  );
};

const Kpi = ({ label, value, sub, accent = '#059669' }) => (
  <div
    style={{
      background: '#f8fafc',
      borderRadius: '12px',
      padding: '12px 14px',
      border: '1px solid #e2e8f0',
    }}
  >
    <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>{label}</p>
    <p style={{ margin: '4px 0 0', fontSize: '1.1rem', fontWeight: 800, color: accent }}>{value}</p>
    {sub && <p style={{ margin: '2px 0 0', fontSize: '0.7rem', color: '#94a3b8' }}>{sub}</p>}
  </div>
);

const cardStyle = {
  background: 'white',
  borderRadius: '18px',
  padding: '24px',
  marginBottom: '24px',
  boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
  border: '1px solid #f0f0f0',
};

const badgeStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '4px',
  fontSize: '11px',
  fontWeight: 700,
  color: '#7c3aed',
  background: '#f3e8ff',
  padding: '4px 8px',
  borderRadius: '999px',
};

const selectStyle = {
  padding: '6px 10px',
  borderRadius: '8px',
  border: '1px solid #e5e7eb',
  fontSize: '0.85rem',
  background: 'white',
};

export default AdminSalesForecast;
