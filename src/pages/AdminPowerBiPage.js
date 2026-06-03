import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BarChart3, AlertTriangle, Download, ExternalLink, RefreshCw, Pill, Shield,
} from 'lucide-react';
import useAnalyticsHub from '../hooks/useAnalyticsHub';
import { fetchDatasetsCatalog } from '../services/analyticsHubService';
import api from '../utils/api';

const severityStyle = {
  high: { bg: '#fee2e2', color: '#991b1b', border: '#fecaca' },
  medium: { bg: '#fef3c7', color: '#92400e', border: '#fde68a' },
  low: { bg: '#f0f9ff', color: '#1e40af', border: '#bae6fd' },
};

const AdminPowerBiPage = () => {
  const { data, loading, reload } = useAnalyticsHub();
  const [catalog, setCatalog] = useState(null);
  const viteEmbed = import.meta.env.VITE_POWER_BI_EMBED_URL || '';
  const embedUrl = data?.powerBi?.embedUrl || viteEmbed || '';

  useEffect(() => {
    fetchDatasetsCatalog().then(setCatalog).catch(() => setCatalog(null));
  }, []);

  const downloadCsv = async (table) => {
    const token = localStorage.getItem('token');
    const base = api.defaults.baseURL || '/api';
    const url = `${base}/analytics/export/${table}?format=csv`;
    const res = await fetch(url, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    const blob = await res.blob();
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `petfoodtn_${table}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

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
          Power BI &amp; alertes plateforme
        </h1>
        <p style={{ margin: 0, opacity: 0.9 }}>
          Rapport intégré, exports pour actualisation Power BI Desktop, alertes incidents urgents et stock pharmacie.
        </p>
        <button type="button" onClick={reload} style={btnLight}>
          <RefreshCw size={14} /> Actualiser
        </button>
      </motion.header>

      {loading ? (
        <p style={{ color: '#94a3b8' }}>Chargement du hub analytique…</p>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 24 }}>
            <Kpi label="Alertes" value={data?.alertCounts?.total ?? 0} />
            <Kpi label="Urgentes" value={data?.alertCounts?.high ?? 0} color="#dc2626" />
            <Kpi label="Pharmacie" value={data?.alertCounts?.pharmacy ?? 0} color="#7c3aed" />
            <Kpi label="Incidents IA" value={data?.alertCounts?.incident ?? 0} color="#ea580c" />
          </div>

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
                        {a.type === 'pharmacy' ? <Pill size={18} /> : <Shield size={18} />}
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

          <section style={card} id="embed">
            <h2 style={h2}>
              <BarChart3 size={20} /> Rapport Power BI intégré
            </h2>
            {embedUrl ? (
              <iframe
                title="Power BI PetfoodTN"
                src={embedUrl}
                style={{
                  width: '100%',
                  height: 520,
                  border: '1px solid #e2e8f0',
                  borderRadius: 12,
                }}
                allowFullScreen
              />
            ) : (
              <div style={{ padding: 20, background: '#f8fafc', borderRadius: 12, border: '1px dashed #cbd5e1' }}>
                <p style={{ margin: '0 0 12px', color: '#475569' }}>
                  Aucune URL d’intégration configurée. Ajoutez dans <code>backend/.env</code> :
                </p>
                <pre style={{ background: '#1e293b', color: '#e2e8f0', padding: 12, borderRadius: 8, fontSize: 12 }}>
                  POWER_BI_EMBED_URL=https://app.powerbi.com/view?r=...
                </pre>
                <p style={{ margin: '12px 0 0', fontSize: 13, color: '#64748b' }}>
                  Ou côté frontend Vite : <code>VITE_POWER_BI_EMBED_URL</code>
                </p>
                <ol style={{ marginTop: 12, fontSize: 13, color: '#334155' }}>
                  {(data?.powerBi?.setupSteps || []).map((s, i) => (
                    <li key={i} style={{ marginBottom: 6 }}>{s}</li>
                  ))}
                </ol>
              </div>
            )}
          </section>

          <section style={card} id="exports">
            <h2 style={h2}>
              <Download size={20} /> Exports pour Power BI Desktop
            </h2>
            <p style={{ fontSize: 14, color: '#64748b', marginTop: 0 }}>
              Téléchargez les jeux de données ou connectez Power Query à l’API (token admin).
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {(catalog?.datasets || []).map((ds) => (
                <button
                  key={ds.id}
                  type="button"
                  onClick={() => downloadCsv(ds.id)}
                  style={exportBtn}
                >
                  <Download size={14} /> {ds.id}.csv
                </button>
              ))}
            </div>
            {data?.quickLinks?.length > 0 && (
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

const Kpi = ({ label, value, color = '#1e3a8a' }) => (
  <div style={{ background: '#fff', borderRadius: 12, padding: 16, border: '1px solid #e2e8f0' }}>
    <div style={{ fontSize: 12, color: '#64748b' }}>{label}</div>
    <div style={{ fontSize: 24, fontWeight: 800, color }}>{value}</div>
  </div>
);

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
