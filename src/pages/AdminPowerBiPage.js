import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BarChart3, AlertTriangle, Download, ExternalLink, RefreshCw, Pill,
} from 'lucide-react';
import useAnalyticsHub from '../hooks/useAnalyticsHub';
import PowerBiDashboardPanel from '../components/PowerBiDashboardPanel';
import { fetchDatasetsCatalog } from '../services/analyticsHubService';
import api from '../utils/api';
import { getStoredToken } from '../utils/authStorage';
import { isValidToken } from '../utils/jwtSecurity';
import { DEMO_ADMIN_ANALYTICS, DEMO_ADMIN_DATASETS } from '../utils/adminDemoData';

const severityStyle = {
  high: { bg: '#fee2e2', color: '#991b1b', border: '#fecaca' },
  medium: { bg: '#fef3c7', color: '#92400e', border: '#fde68a' },
  low: { bg: '#f0f9ff', color: '#1e40af', border: '#bae6fd' },
};

const AdminPowerBiPage = () => {
  const { data: apiData, loading, reload } = useAnalyticsHub();
  const [catalog, setCatalog] = useState(null);
  const data = {
    ...DEMO_ADMIN_ANALYTICS,
    ...(apiData?.kpiSummary ? { kpiSummary: { ...DEMO_ADMIN_ANALYTICS.kpiSummary, ...apiData.kpiSummary } } : {}),
    alerts: (apiData?.alerts?.length
      ? apiData.alerts.filter((a) => !/agent\s*ia|incidents?\s*ia/i.test(`${a.title || ''} ${a.message || ''}`))
      : DEMO_ADMIN_ANALYTICS.alerts),
    alertCounts: {
      total: apiData?.alertCounts?.total ?? DEMO_ADMIN_ANALYTICS.alertCounts.total,
      high: apiData?.alertCounts?.high ?? DEMO_ADMIN_ANALYTICS.alertCounts.high,
      pharmacy: apiData?.alertCounts?.pharmacy ?? DEMO_ADMIN_ANALYTICS.alertCounts.pharmacy,
    },
    quickLinks: (apiData?.quickLinks?.length ? apiData.quickLinks : DEMO_ADMIN_ANALYTICS.quickLinks)
      .filter((l) => !/agent\s*ia|incidents?\s*ia/i.test(l.label || '')),
    powerBi: apiData?.powerBi || DEMO_ADMIN_ANALYTICS.powerBi,
  };

  useEffect(() => {
    fetchDatasetsCatalog()
      .then(setCatalog)
      .catch(() => setCatalog(DEMO_ADMIN_DATASETS));
  }, []);

  const downloadCsv = async (table) => {
    const token = getStoredToken();
    const base = api.defaults.baseURL || '/api';
    const url = `${base}/analytics/export/${table}?format=csv`;
    try {
      const res = await fetch(url, {
        headers: token && isValidToken(token) ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error('Export failed');
      const blob = await res.blob();
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `petfoodtn_${table}.csv`;
      a.click();
      URL.revokeObjectURL(a.href);
    } catch {
      window.alert('Export indisponible en mode démo — configurez le backend analytics.');
    }
  };

  const datasets = catalog?.datasets?.length ? catalog.datasets : DEMO_ADMIN_DATASETS.datasets;

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
      <motion.header
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          marginBottom: 24,
          padding: '28px 24px',
          borderRadius: 20,
          background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 50%, #3b82f6 100%)',
          color: 'white',
        }}
      >
        <h1 style={{ margin: '0 0 8px', fontSize: 28, fontWeight: 800 }}>
          <BarChart3 size={28} style={{ verticalAlign: 'middle', marginRight: 8 }} />
          Power BI &amp; analytics
        </h1>
        <p style={{ margin: 0, opacity: 0.9 }}>
          Tableaux de bord, alertes opérationnelles et exports pour Power BI Desktop.
        </p>
        <button type="button" onClick={reload} style={btnLight}>
          <RefreshCw size={14} /> Actualiser
        </button>
      </motion.header>

      {loading ? (
        <p style={{ color: '#94a3b8' }}>Chargement du hub analytique…</p>
      ) : (
        <>
          <PowerBiDashboardPanel showHeader={false} className="pbi-panel--page" />

          <section style={card} id="alerts">
            <h2 style={h2}>
              <AlertTriangle size={20} color="#dc2626" /> Alertes opérationnelles
            </h2>
            {(data?.alerts || []).length === 0 ? (
              <p style={{ color: '#64748b' }}>Aucune alerte critique pour le moment.</p>
            ) : (
              <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                {data.alerts.map((a) => {
                  const st = severityStyle[a.severity] || severityStyle.low;
                  return (
                    <li
                      key={a.id}
                      style={{
                        marginBottom: 10,
                        padding: 14,
                        borderRadius: 12,
                        background: st.bg,
                        border: `1px solid ${st.border}`,
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                        {a.type === 'pharmacy' ? <Pill size={18} /> : <AlertTriangle size={18} />}
                        <div style={{ flex: 1 }}>
                          <strong style={{ color: st.color }}>{a.title}</strong>
                          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#475569' }}>{a.message}</p>
                        </div>
                        {a.link && (
                          <Link to={a.link} style={{ fontSize: 12, fontWeight: 700, color: st.color }}>
                            Voir →
                          </Link>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          <section style={card} id="exports">
            <h2 style={h2}>
              <Download size={20} /> Exports pour Power BI Desktop
            </h2>
            <p style={{ fontSize: 14, color: '#64748b', marginTop: 0 }}>
              Téléchargez les jeux de données ou connectez Power Query à l&apos;API (token admin).
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {datasets.map((ds) => (
                <button
                  key={ds.id}
                  type="button"
                  onClick={() => downloadCsv(ds.id)}
                  style={exportBtn}
                >
                  <Download size={14} /> {ds.label || ds.id}.csv
                </button>
              ))}
            </div>
            {(data?.quickLinks || []).length > 0 && (
              <div style={{ marginTop: 16, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {data.quickLinks.map((l) => (
                  <Link key={l.path} to={l.path} style={chip}>
                    {l.label} <ExternalLink size={12} />
                  </Link>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
};

const card = {
  background: '#fff',
  borderRadius: 16,
  padding: 24,
  marginBottom: 20,
  border: '1px solid #e2e8f0',
  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
};

const h2 = { margin: '0 0 16px', fontSize: 18, display: 'flex', alignItems: 'center', gap: 8 };
const btnLight = {
  marginTop: 12,
  padding: '8px 14px',
  borderRadius: 8,
  border: '1px solid rgba(255,255,255,0.4)',
  background: 'rgba(255,255,255,0.15)',
  color: '#fff',
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
};
const exportBtn = {
  padding: '10px 14px',
  borderRadius: 8,
  border: '1px solid #bfdbfe',
  background: '#eff6ff',
  color: '#1d4ed8',
  cursor: 'pointer',
  fontWeight: 600,
  fontSize: 13,
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
};
const chip = {
  padding: '8px 12px',
  borderRadius: 999,
  background: '#f1f5f9',
  color: '#334155',
  fontSize: 12,
  fontWeight: 600,
  textDecoration: 'none',
  display: 'inline-flex',
  alignItems: 'center',
  gap: 4,
};

export default AdminPowerBiPage;
