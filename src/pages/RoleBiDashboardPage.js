import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, AreaChart, Area, LineChart, Line,
} from 'recharts';
import { BarChart3, AlertTriangle, RefreshCw, Download } from 'lucide-react';
import { fetchRoleBi, exportRoleBiCsv } from '../services/roleBiService';
import { ROLE_BI_META } from '../utils/roleBiDemoData';

const COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4', '#ec4899', '#84cc16'];

const PERIOD_OPTIONS = [
  { value: '30', label: '30 jours' },
  { value: '90', label: '90 jours' },
  { value: '365', label: '12 mois' },
];

const cardStyle = {
  background: 'white',
  borderRadius: 16,
  padding: 22,
  boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
  border: '1px solid #f1f5f9',
  marginBottom: 18,
};

const severityStyle = {
  high: { bg: '#fee2e2', color: '#991b1b' },
  medium: { bg: '#fef3c7', color: '#92400e' },
  low: { bg: '#f0f9ff', color: '#1e40af' },
};

const DASH_HOME = {
  vendor: '/vendor/dashboard',
  moderator: '/moderator/dashboard',
  livreur: '/livreur/dashboard',
};

const RoleBiDashboardPage = ({ role }) => {
  const meta = ROLE_BI_META[role] || {};
  const [data, setData] = useState(null);
  const [demo, setDemo] = useState(false);
  const [loading, setLoading] = useState(true);
  const [periodDays, setPeriodDays] = useState('90');
  const [lastRefresh, setLastRefresh] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data: payload, demo: isDemo } = await fetchRoleBi(role, periodDays);
    setData(payload);
    setDemo(isDemo);
    setLastRefresh(new Date());
    setLoading(false);
  }, [role, periodDays]);

  useEffect(() => { load(); }, [load]);

  if (loading && !data) {
    return (
      <div style={{ padding: 48, textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: 16 }}>📊</div>
        <p style={{ color: '#64748b' }}>Chargement du dashboard BI…</p>
      </div>
    );
  }

  if (!data) return null;

  const { kpis = [], trend = [], breakdown = [], daily = [], table = {}, alerts = [] } = data;
  const dailyData = daily[0]?.label ? daily.map((d) => ({
    name: d.label || d.name,
    primary: d.count ?? d.primary,
    secondary: d.commission ?? d.secondary,
  })) : daily;

  const handleExport = () => {
    if (meta.tableColumns && table.rows) {
      exportRoleBiCsv(role, table.rows, meta.tableColumns);
    }
  };

  return (
    <div style={{ padding: 24, maxWidth: 1400, margin: '0 auto' }}>
      <motion.header
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          marginBottom: 24,
          padding: '28px 24px',
          borderRadius: 20,
          background: meta.gradient || 'linear-gradient(135deg, #334155, #475569)',
          color: 'white',
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ margin: '0 0 8px', fontSize: '1.6rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8 }}>
              <BarChart3 size={26} />
              {meta.title}
              {demo && (
                <span style={{ fontSize: '0.7rem', background: 'rgba(255,255,255,0.2)', padding: '4px 10px', borderRadius: 999 }}>
                  Mode démo
                </span>
              )}
            </h1>
            <p style={{ margin: 0, opacity: 0.9, fontSize: '0.9rem' }}>{meta.subtitle}</p>
            {lastRefresh && (
              <p style={{ margin: '6px 0 0', fontSize: '0.75rem', opacity: 0.75 }}>
                MAJ {lastRefresh.toLocaleTimeString('fr-FR')}
              </p>
            )}
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <select
              value={periodDays}
              onChange={(e) => setPeriodDays(e.target.value)}
              style={{ padding: '8px 12px', borderRadius: 10, border: 'none', fontWeight: 600 }}
            >
              {PERIOD_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <button type="button" onClick={load} disabled={loading} style={headerBtn}>
              <RefreshCw size={14} /> Actualiser
            </button>
            {meta.tableColumns && (
              <button type="button" onClick={handleExport} style={headerBtnOutline}>
                <Download size={14} /> Export CSV
              </button>
            )}
            <Link to={DASH_HOME[role] || '/'} style={{ ...headerBtnOutline, textDecoration: 'none' }}>
              ← Dashboard
            </Link>
          </div>
        </div>
      </motion.header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 20 }}>
        {kpis.map((k) => (
          <div key={k.label} style={{ ...cardStyle, marginBottom: 0, borderLeft: `4px solid ${k.color}` }}>
            <div style={{ fontSize: '1.2rem' }}>{k.icon}</div>
            <p style={{ margin: '6px 0 2px', fontSize: '1.25rem', fontWeight: 800, color: k.color }}>{k.value}</p>
            <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748b' }}>{k.label}</p>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 18, marginBottom: 18 }}>
        <div style={cardStyle}>
          <h3 style={{ margin: '0 0 12px', fontSize: '0.95rem', fontWeight: 700 }}>Tendance mensuelle</h3>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={trend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Area type="monotone" dataKey="primary" name={meta.primaryLabel} stroke="#0ea5e9" fill="rgba(14,165,233,0.2)" />
              <Area type="monotone" dataKey="secondary" name={meta.secondaryLabel} stroke="#10b981" fill="rgba(16,185,129,0.15)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div style={cardStyle}>
          <h3 style={{ margin: '0 0 12px', fontSize: '0.95rem', fontWeight: 700 }}>Activité quotidienne</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="primary" name={meta.primaryLabel} fill="#6366f1" radius={[6, 6, 0, 0]} />
              <Bar dataKey="secondary" name={meta.secondaryLabel} fill="#14b8a6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 18, marginBottom: 18 }}>
        <div style={cardStyle}>
          <h3 style={{ margin: '0 0 12px', fontSize: '0.95rem', fontWeight: 700 }}>Répartition</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={breakdown} cx="50%" cy="50%" innerRadius={50} outerRadius={78} paddingAngle={3} dataKey="value">
                {breakdown.map((entry, i) => <Cell key={entry.name} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div style={cardStyle}>
          <h3 style={{ margin: '0 0 12px', fontSize: '0.95rem', fontWeight: 700 }}>Évolution (ligne)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={trend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Line type="monotone" dataKey="secondary" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {meta.tableColumns && table.rows?.length > 0 && (
        <div style={cardStyle}>
          <h3 style={{ margin: '0 0 12px', fontSize: '0.95rem', fontWeight: 700 }}>{meta.tableTitle}</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e2e8f0', textAlign: 'left' }}>
                  {meta.tableColumns.map((c) => <th key={c.key} style={{ padding: 10 }}>{c.label}</th>)}
                </tr>
              </thead>
              <tbody>
                {table.rows.map((row, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    {meta.tableColumns.map((c) => <td key={c.key} style={{ padding: 10 }}>{row[c.key]}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {alerts.length > 0 && (
        <div style={cardStyle}>
          <h3 style={{ margin: '0 0 12px', fontSize: '0.95rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
            <AlertTriangle size={18} color="#dc2626" /> Alertes BI
          </h3>
          <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
            {alerts.map((a, i) => {
              const st = severityStyle[a.severity] || severityStyle.low;
              return (
                <li key={i} style={{ padding: '10px 12px', marginBottom: 8, borderRadius: 10, background: st.bg, color: st.color, fontSize: '0.88rem' }}>
                  <strong>{a.title}</strong> — {a.message}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
};

const headerBtn = {
  display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px',
  borderRadius: 10, border: 'none', background: 'rgba(255,255,255,0.95)',
  color: '#0f172a', fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem',
};

const headerBtnOutline = {
  ...headerBtn,
  background: 'transparent',
  border: '1px solid rgba(255,255,255,0.5)',
  color: 'white',
};

export default RoleBiDashboardPage;
