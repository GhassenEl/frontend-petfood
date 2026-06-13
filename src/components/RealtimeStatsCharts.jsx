import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { Activity, RefreshCw } from 'lucide-react';
import useRealtimeStats from '../hooks/useRealtimeStats';
import { ROLE_REALTIME_META } from '../utils/realtimeStatsDemo';

const PIE_COLORS = ['#e67e22', '#27ae60', '#3498db', '#9b59b6', '#e74c3c', '#f39c12', '#14b8a6', '#0ea5e9'];

const tooltipStyle = {
  borderRadius: 12,
  border: 'none',
  boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
  fontSize: 13,
  fontWeight: 600,
};

const LiveBadge = ({ demo, updatedAt }) => (
  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', fontWeight: 700, color: demo ? '#92400e' : '#166534', background: demo ? '#fef3c7' : '#dcfce7', padding: '4px 10px', borderRadius: 999 }}>
    <span style={{ width: 8, height: 8, borderRadius: '50%', background: demo ? '#f59e0b' : '#22c55e', animation: 'pulse 1.5s ease-in-out infinite' }} />
    {demo ? 'Simulation live' : 'Temps réel'}
    {updatedAt && (
      <span style={{ color: '#64748b', fontWeight: 500 }}>
        · {new Date(updatedAt).toLocaleTimeString('fr-FR')}
      </span>
    )}
  </span>
);

const RealtimeStatsCharts = ({ role, intervalMs = 8000, detailLink, detailLabel }) => {
  const meta = ROLE_REALTIME_META[role] || {};
  const { data, demo, loading, refreshing, reload } = useRealtimeStats(role, intervalMs);

  if (loading && !data) {
    return (
      <div className="card-animal" style={{ padding: 28, marginBottom: 24, textAlign: 'center', color: '#64748b' }}>
        Chargement des statistiques temps réel…
      </div>
    );
  }

  if (!data) return null;

  const {
    kpis = [],
    liveSeries = [],
    dailySeries = [],
    breakdown = [],
    monthlySeries = [],
    updatedAt,
  } = data;

  const accent = meta.accent || '#3498db';
  const accent2 = meta.accent2 || '#27ae60';
  const link = detailLink || meta.detailLink;
  const linkLabel = detailLabel || meta.detailLabel || 'Détails';

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      style={{ marginBottom: 28 }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#334155', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Activity size={20} color={accent} />
            {meta.title || 'Statistiques temps réel'}
          </h2>
          <LiveBadge demo={demo} updatedAt={updatedAt} />
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button
            type="button"
            onClick={reload}
            disabled={refreshing}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 12px',
              borderRadius: 10, border: '1px solid #e2e8f0', background: 'white',
              fontWeight: 600, fontSize: '0.82rem', cursor: refreshing ? 'wait' : 'pointer',
            }}
          >
            <RefreshCw size={14} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
            Actualiser
          </button>
          {link && (
            <Link
              to={link}
              style={{
                fontSize: '0.85rem', fontWeight: 700, color: accent,
                textDecoration: 'none', padding: '8px 14px',
                background: `${accent}14`, borderRadius: 10,
              }}
            >
              {linkLabel} →
            </Link>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12, marginBottom: 18 }}>
        {kpis.map((k) => (
          <div key={k.label} className="card-animal" style={{ padding: '14px 16px' }}>
            <div style={{ fontSize: '1.35rem', marginBottom: 4 }}>{k.icon}</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>{k.value}</div>
            <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>{k.label}</div>
            {k.delta && <div style={{ fontSize: '0.72rem', color: accent, fontWeight: 700, marginTop: 4 }}>{k.delta}</div>}
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 18, marginBottom: 18 }}>
        <div className="card-animal" style={{ padding: 22 }}>
          <h3 style={{ margin: '0 0 4px', fontSize: '0.95rem', fontWeight: 700 }}>Courbe live</h3>
          <p style={{ margin: '0 0 14px', fontSize: '0.8rem', color: '#64748b' }}>Flux mis à jour toutes les {Math.round(intervalMs / 1000)}s</p>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={liveSeries} margin={{ top: 8, right: 12, left: -4, bottom: 0 }}>
              <defs>
                <linearGradient id={`liveGrad1-${role}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={accent} stopOpacity={0.35} />
                  <stop offset="95%" stopColor={accent} stopOpacity={0} />
                </linearGradient>
                <linearGradient id={`liveGrad2-${role}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={accent2} stopOpacity={0.25} />
                  <stop offset="95%" stopColor={accent2} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="time" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Area type="monotone" dataKey="primary" name={meta.primaryLabel} stroke={accent} fill={`url(#liveGrad1-${role})`} strokeWidth={2} isAnimationActive={false} />
              <Area type="monotone" dataKey="secondary" name={meta.secondaryLabel} stroke={accent2} fill={`url(#liveGrad2-${role})`} strokeWidth={2} isAnimationActive={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="card-animal" style={{ padding: 22 }}>
          <h3 style={{ margin: '0 0 4px', fontSize: '0.95rem', fontWeight: 700 }}>Activité récente (7 jours)</h3>
          <p style={{ margin: '0 0 14px', fontSize: '0.8rem', color: '#64748b' }}>Volume quotidien</p>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={dailySeries} margin={{ top: 8, right: 12, left: -4, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="primary" name={meta.primaryLabel?.split(' /')[0] || 'Volume'} fill={accent} radius={[6, 6, 0, 0]} />
              <Bar dataKey="secondary" name={meta.secondaryLabel?.split(' /')[0] || 'Secondaire'} fill={accent2} radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 18 }}>
        {monthlySeries?.length > 0 && (
          <div className="card-animal" style={{ padding: 22 }}>
            <h3 style={{ margin: '0 0 12px', fontSize: '0.95rem', fontWeight: 700 }}>Tendance mensuelle</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={monthlySeries} margin={{ top: 4, right: 8, left: -8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${v} DT`, 'Valeur']} />
                <Line type="monotone" dataKey="value" stroke={accent} strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        <div className="card-animal" style={{ padding: 22 }}>
          <h3 style={{ margin: '0 0 12px', fontSize: '0.95rem', fontWeight: 700 }}>Répartition</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={breakdown} cx="50%" cy="50%" innerRadius={48} outerRadius={72} paddingAngle={3} dataKey="value">
                {breakdown.map((entry, index) => (
                  <Cell key={entry.name} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </motion.div>
  );
};

export default RealtimeStatsCharts;
