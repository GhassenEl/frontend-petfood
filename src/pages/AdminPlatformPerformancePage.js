import React from 'react';
import { Link } from 'react-router-dom';
import {
  Activity, Cpu, Database, Gauge, RefreshCw, Server, Shield, Wifi, Zap,
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { fetchPlatformPerformance } from '../services/platformPerformanceService';
import { DEMO_PLATFORM_PERFORMANCE } from '../utils/adminDemoData';
import DemoModePill from '../components/DemoModePill';
import AdminPrometheusGrafanaPanel from '../components/AdminPrometheusGrafanaPanel';
import useLivePoll from '../hooks/useLivePoll';
import usePlatformRefresh from '../hooks/usePlatformRefresh';

const card = {
  background: '#fff',
  borderRadius: 16,
  padding: 20,
  border: '1px solid #e2e8f0',
  boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
};

const HEALTH_COLORS = {
  healthy: '#059669',
  degraded: '#d97706',
  critical: '#dc2626',
};

const HEALTH_LABELS = {
  healthy: 'Opérationnel',
  degraded: 'Dégradé',
  critical: 'Critique',
};

const Kpi = ({ icon: Icon, label, value, sub, color = '#0f172a' }) => (
  <div style={{ ...card, borderTop: `3px solid ${color}` }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
      <Icon size={18} color={color} />
      <span style={{ fontSize: 13, color: '#64748b', fontWeight: 600 }}>{label}</span>
    </div>
    <div style={{ fontSize: 26, fontWeight: 900, color }}>{value}</div>
    {sub && <p style={{ margin: '6px 0 0', fontSize: 12, color: '#94a3b8' }}>{sub}</p>}
  </div>
);

const AdminPlatformPerformancePage = () => {
  const { data, loading, lastUpdatedAt, reload } = useLivePoll(async () => {
    try {
      const metrics = await fetchPlatformPerformance();
      return metrics?.health ? metrics : DEMO_PLATFORM_PERFORMANCE;
    } catch {
      return DEMO_PLATFORM_PERFORMANCE;
    }
  }, 5000);

  usePlatformRefresh(reload, [reload]);

  if (loading && !data) {
    return <div style={{ padding: 48, textAlign: 'center' }}>Chargement des métriques…</div>;
  }

  const d = data || DEMO_PLATFORM_PERFORMANCE;
  const healthColor = HEALTH_COLORS[d.health] || '#64748b';

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
      <header style={{
        ...card,
        marginBottom: 24,
        background: 'linear-gradient(135deg, #0f172a, #1e3a8a)',
        color: '#fff',
        border: 'none',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ margin: '0 0 8px', fontSize: 26, fontWeight: 900, display: 'flex', alignItems: 'center', gap: 10 }}>
              <Gauge size={28} /> Performance plateforme
            </h1>
            <p style={{ margin: 0, opacity: 0.9, fontSize: 14 }}>
              Latence API, santé serveur, base de données, temps réel et sécurité — vue admin.
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {d.mode === 'demo' && <DemoModePill />}
            <button
              type="button"
              onClick={reload}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 14px',
                borderRadius: 10,
                border: 'none',
                background: 'rgba(255,255,255,0.15)',
                color: '#fff',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              <RefreshCw size={14} /> Actualiser
            </button>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 16, marginTop: 20, flexWrap: 'wrap' }}>
          <div style={{
            padding: '12px 20px',
            borderRadius: 12,
            background: 'rgba(255,255,255,0.1)',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: 36, fontWeight: 900 }}>{d.score ?? '—'}</div>
            <div style={{ fontSize: 12, opacity: 0.85 }}>Score santé</div>
          </div>
          <div style={{
            padding: '12px 20px',
            borderRadius: 12,
            background: `${healthColor}22`,
            border: `1px solid ${healthColor}55`,
          }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: healthColor }}>
              {HEALTH_LABELS[d.health] || d.health}
            </div>
            <div style={{ fontSize: 12, opacity: 0.85 }}>État global</div>
          </div>
          <div style={{ fontSize: 13, opacity: 0.85, alignSelf: 'center' }}>
            Uptime {d.uptime?.formatted} · LIVE {lastUpdatedAt ? new Date(lastUpdatedAt).toLocaleTimeString('fr-FR') : '—'}
          </div>
        </div>
      </header>

      <div style={{ display: 'grid', gap: 14, gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', marginBottom: 24 }}>
        <Kpi icon={Zap} label="Latence moy." value={`${d.api?.avgMs ?? 0} ms`} sub={`P95 ${d.api?.p95Ms ?? 0} ms`} color="#2563eb" />
        <Kpi icon={Activity} label="Requêtes API" value={d.api?.totalRequests ?? 0} sub={`${d.api?.requestsLast5m ?? 0} / 5 min`} color="#7c3aed" />
        <Kpi icon={Server} label="Mémoire heap" value={`${d.server?.memory?.heapUsedMb ?? 0} Mo`} sub={`RSS ${d.server?.memory?.rssMb ?? 0} Mo`} color="#e67e22" />
        <Kpi icon={Database} label="Base SQL" value={d.database?.ok ? 'OK' : 'KO'} sub={`${d.database?.latencyMs ?? 0} ms`} color={d.database?.ok ? '#059669' : '#dc2626'} />
        <Kpi icon={Wifi} label="Sockets live" value={d.realtime?.socketConnections ?? 0} sub="Connexions actives" color="#0891b2" />
        <Kpi icon={Shield} label="IDS 24h" value={d.security?.eventsLast24h ?? 0} sub={`${d.security?.monitoredIps ?? 0} IP suivies`} color="#b45309" />
      </div>

      <div style={{ display: 'grid', gap: 20, gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', marginBottom: 24 }}>
        <section style={card}>
          <h2 style={{ margin: '0 0 14px', fontSize: 16, fontWeight: 800 }}>Débit API (fenêtres récentes)</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={d.api?.requestSeries || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#2563eb" radius={[6, 6, 0, 0]} name="Requêtes" />
            </BarChart>
          </ResponsiveContainer>
        </section>

        <section style={card}>
          <h2 style={{ margin: '0 0 14px', fontSize: 16, fontWeight: 800 }}>Latence des dernières requêtes</h2>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={d.api?.latencySeries || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} unit=" ms" />
              <Tooltip formatter={(v) => [`${v} ms`, 'Latence']} />
              <Area type="monotone" dataKey="ms" stroke="#7c3aed" fill="#ede9fe" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </section>
      </div>

      <AdminPrometheusGrafanaPanel refreshMs={5000} />

      <div style={{ display: 'grid', gap: 20, gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
        <section style={card}>
          <h2 style={{ margin: '0 0 12px', fontSize: 16, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Cpu size={18} /> Serveur
          </h2>
          <ul style={{ margin: 0, padding: 0, listStyle: 'none', fontSize: 14, color: '#475569' }}>
            <li style={{ padding: '6px 0', borderBottom: '1px solid #f1f5f9' }}>Node {d.server?.nodeVersion}</li>
            <li style={{ padding: '6px 0', borderBottom: '1px solid #f1f5f9' }}>{d.server?.cpus} CPU · charge {d.server?.loadAvg?.join(' / ')}</li>
            <li style={{ padding: '6px 0', borderBottom: '1px solid #f1f5f9' }}>
              RAM système {d.server?.memory?.usagePercent}% utilisée
            </li>
            <li style={{ padding: '6px 0' }}>
              Taux erreur API {d.api?.errorRate ?? 0}% ({d.api?.errors5xx ?? 0} × 5xx)
            </li>
          </ul>
        </section>

        <section style={card}>
          <h2 style={{ margin: '0 0 12px', fontSize: 16, fontWeight: 800 }}>Activité temps réel</h2>
          <ul style={{ margin: 0, padding: 0, listStyle: 'none', fontSize: 14, color: '#475569' }}>
            <li style={{ padding: '6px 0', borderBottom: '1px solid #f1f5f9' }}>Commandes aujourd&apos;hui : {d.realtime?.ordersToday}</li>
            <li style={{ padding: '6px 0', borderBottom: '1px solid #f1f5f9' }}>En attente : {d.realtime?.pendingOrders}</li>
            <li style={{ padding: '6px 0', borderBottom: '1px solid #f1f5f9' }}>Livraisons actives : {d.realtime?.activeDeliveries}</li>
            <li style={{ padding: '6px 0' }}>Stock bas : {d.realtime?.lowStockProducts} produits</li>
          </ul>
        </section>

        <section style={card}>
          <h2 style={{ margin: '0 0 12px', fontSize: 16, fontWeight: 800 }}>Entités &amp; services</h2>
          <ul style={{ margin: 0, padding: 0, listStyle: 'none', fontSize: 14, color: '#475569' }}>
            <li style={{ padding: '6px 0', borderBottom: '1px solid #f1f5f9' }}>{d.entities?.users} utilisateurs</li>
            <li style={{ padding: '6px 0', borderBottom: '1px solid #f1f5f9' }}>{d.entities?.orders} commandes</li>
            <li style={{ padding: '6px 0', borderBottom: '1px solid #f1f5f9' }}>{d.entities?.activeUsers24h} clients actifs / 24h</li>
            <li style={{ padding: '6px 0' }}>
              ML Python : {d.ml?.ok ? '✓ connecté' : '✗ indisponible'}
            </li>
          </ul>
          <div style={{ marginTop: 14, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            <Link to="/admin/security" style={linkBtn}>Sécurité &amp; IDS</Link>
            <Link to="/admin/powerbi" style={linkBtn}>Power BI</Link>
            <Link to="/admin/activity-logs" style={linkBtn}>Journaux</Link>
          </div>
        </section>
      </div>

      {(d.api?.slowest?.length > 0) && (
        <section style={{ ...card, marginTop: 20 }}>
          <h2 style={{ margin: '0 0 12px', fontSize: 16, fontWeight: 800 }}>Requêtes les plus lentes</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ textAlign: 'left', color: '#64748b' }}>
                <th style={{ padding: '8px 0' }}>Méthode</th>
                <th>Route</th>
                <th>Statut</th>
                <th>Latence</th>
              </tr>
            </thead>
            <tbody>
              {d.api.slowest.map((r, i) => (
                <tr key={`${r.path}-${i}`} style={{ borderTop: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '8px 0', fontWeight: 700 }}>{r.method}</td>
                  <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{r.path}</td>
                  <td>{r.status}</td>
                  <td style={{ fontWeight: 700, color: r.ms > 200 ? '#dc2626' : '#059669' }}>{r.ms} ms</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </div>
  );
};

const linkBtn = {
  padding: '6px 12px',
  borderRadius: 8,
  background: '#f1f5f9',
  color: '#334155',
  fontWeight: 600,
  fontSize: 12,
  textDecoration: 'none',
};

export default AdminPlatformPerformancePage;
