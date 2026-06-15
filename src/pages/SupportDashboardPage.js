import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  fetchSupportTickets,
  fetchSupportComplaints,
  fetchSupportReturns,
  fetchSupportAssistQueue,
} from '../services/supportService';
import usePlatformRefresh from '../hooks/usePlatformRefresh';
import DemoModePill from '../components/DemoModePill';

const card = {
  background: '#fff',
  borderRadius: 16,
  padding: 20,
  border: '1px solid #e2e8f0',
  boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
};

const KpiCard = ({ to, icon, label, value, color }) => (
  <Link to={to} style={{ ...card, textDecoration: 'none', color: 'inherit', borderTop: `3px solid ${color}` }}>
    <div style={{ fontSize: 28, marginBottom: 8 }}>{icon}</div>
    <div style={{ fontSize: 32, fontWeight: 900, color }}>{value}</div>
    <div style={{ fontSize: 14, color: '#64748b', marginTop: 4 }}>{label}</div>
  </Link>
);

const SupportDashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [demo, setDemo] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [ticketsRes, complaintsRes, returnsRes, assistRes] = await Promise.all([
        fetchSupportTickets(),
        fetchSupportComplaints(),
        fetchSupportReturns(),
        fetchSupportAssistQueue(),
      ]);
      const isDemo = ticketsRes.demo || complaintsRes.demo || returnsRes.demo || assistRes.demo;
      setDemo(isDemo);
      setStats({
        openTickets: (ticketsRes.data?.tickets || []).filter((t) => t.status !== 'resolved').length,
        openComplaints: (complaintsRes.data?.complaints || []).length,
        pendingReturns: (returnsRes.data?.returns || []).length,
        assistQueue: (assistRes.data?.queue || []).length,
      });
    } catch {
      setDemo(true);
      setStats({ openTickets: 2, openComplaints: 1, pendingReturns: 1, assistQueue: 1 });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);
  usePlatformRefresh(load, [load]);

  if (loading) {
    return <div style={{ padding: 48, textAlign: 'center' }}>Chargement du tableau de bord…</div>;
  }

  const s = stats || {};

  return (
    <div style={{ padding: 24, maxWidth: 1000, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <h1 style={{ margin: 0, fontSize: 26, fontWeight: 900 }}>📞 Tableau de bord SAV</h1>
        {demo && <DemoModePill />}
      </div>

      <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
        <KpiCard to="/support/complaints" icon="⚠️" label="Réclamations ouvertes" value={s.openComplaints ?? 0} color="#f59e0b" />
        <KpiCard to="/support/tickets" icon="🎫" label="Tickets actifs" value={s.openTickets ?? 0} color="#2563eb" />
        <KpiCard to="/support/returns" icon="↩️" label="Retours en cours" value={s.pendingReturns ?? 0} color="#7c3aed" />
        <KpiCard to="/support/assist" icon="🎧" label="File assistance" value={s.assistQueue ?? 0} color="#059669" />
      </div>

      <div style={{ ...card, marginTop: 24 }}>
        <h2 style={{ margin: '0 0 12px', fontSize: 17, fontWeight: 800 }}>Actions rapides</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          {[
            { to: '/support/complaints', label: 'Traiter réclamations' },
            { to: '/support/tickets', label: 'Voir tickets' },
            { to: '/support/assist', label: 'Assistance live' },
            { to: '/support/returns', label: 'Gérer retours' },
          ].map((a) => (
            <Link
              key={a.to}
              to={a.to}
              style={{
                padding: '8px 16px',
                borderRadius: 10,
                background: '#f1f5f9',
                color: '#334155',
                fontWeight: 600,
                fontSize: 14,
                textDecoration: 'none',
              }}
            >
              {a.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SupportDashboardPage;
