import React, { useCallback, useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, AreaChart, Area,
} from 'recharts';
import { fetchRoleBi } from '../services/roleBiService';
import { getRoleBiDemo } from '../utils/roleBiDemoData';
import { chartSeriesHasValues, mergeChartSeries } from '../utils/chartSeriesNormalize';

const COLORS = ['#d97706', '#059669', '#dc2626', '#6366f1', '#7c3aed'];
const tooltipStyle = { borderRadius: 12, border: 'none', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', fontSize: 13 };

const ModeratorBiPanel = () => {
  const [data, setData] = useState(null);
  const [demo, setDemo] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const { data: payload, demo: isDemo } = await fetchRoleBi('moderator', 90);
    const fallback = getRoleBiDemo('moderator');
    const base = payload || fallback;
    setData({
      ...base,
      trend: mergeChartSeries(base.trend, fallback.trend),
      daily: mergeChartSeries(base.daily, fallback.daily),
    });
    setDemo(isDemo || !chartSeriesHasValues(payload?.trend) || !chartSeriesHasValues(payload?.daily));
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return <div className="mod-card"><p className="mod-empty">Chargement synthèse BI…</p></div>;
  }

  const { kpis = [], trend = [], breakdown = [], daily = [], alerts = [] } = data || {};
  const trendData = trend;
  const dailyData = daily;

  return (
    <section style={{ marginBottom: 28 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
        <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800 }}>📈 Synthèse BI modération</h2>
        {demo && <span className="mod-demo-pill">Mode démo</span>}
      </div>

      <div className="mod-kpi-grid" style={{ marginBottom: 18 }}>
        {kpis.slice(0, 6).map((k) => (
          <div key={k.label} className="mod-kpi">
            <span>{k.icon} {k.label}</span>
            <strong style={{ color: k.color || '#d97706' }}>{k.value}</strong>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 18 }}>
        <div className="mod-card" style={{ marginBottom: 0 }}>
          <h3 style={{ margin: '0 0 12px', fontSize: '0.95rem' }}>Tendance modération</h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Area type="monotone" dataKey="primary" name="Cas traités" stroke="#d97706" fill="#d9770622" strokeWidth={2} />
              <Area type="monotone" dataKey="secondary" name="Résolus" stroke="#059669" fill="#05966922" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="mod-card" style={{ marginBottom: 0 }}>
          <h3 style={{ margin: '0 0 12px', fontSize: '0.95rem' }}>Activité 7 jours</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="primary" name="Volume" fill="#d97706" radius={[6, 6, 0, 0]} />
              <Bar dataKey="secondary" name="Résolus" fill="#059669" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="mod-card" style={{ marginBottom: 0 }}>
          <h3 style={{ margin: '0 0 12px', fontSize: '0.95rem' }}>Répartition file d&apos;attente</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={breakdown} cx="50%" cy="50%" innerRadius={48} outerRadius={72} paddingAngle={3} dataKey="value" nameKey="name">
                {breakdown.map((entry, i) => (
                  <Cell key={entry.name} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {alerts.length > 0 && (
        <div className="mod-card" style={{ marginTop: 18, marginBottom: 0 }}>
          <h3 style={{ margin: '0 0 12px', fontSize: '0.95rem' }}>Alertes BI</h3>
          {alerts.map((a, i) => (
            <div key={i} style={{ padding: '10px 12px', marginBottom: 8, borderRadius: 10, background: a.severity === 'high' ? '#fef2f2' : '#fffbeb', fontSize: 13 }}>
              <strong>{a.title}</strong> — {a.message}
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default ModeratorBiPanel;
