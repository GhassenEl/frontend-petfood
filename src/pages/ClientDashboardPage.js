import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Package, Calendar, Droplets, Gift, ChevronRight, AlertTriangle,
} from 'lucide-react';
import { fetchClientDashboard } from '../services/clientDashboardService';
import { DEMO_DASHBOARD } from '../utils/clientDemoData';
import usePlatformRefresh from '../hooks/usePlatformRefresh';

const card = {
  background: '#fff',
  borderRadius: 16,
  padding: 20,
  border: '1px solid #f1f5f9',
  boxShadow: '0 4px 16px rgba(0,0,0,0.05)',
};

const STATUS_LABELS = {
  pending: 'En attente',
  paid: 'Payée',
  shipped: 'En livraison',
  processing: 'En préparation',
  delivered: 'Livrée',
};

const formatDate = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('fr-FR', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const StatPill = ({ label, value, color }) => (
  <div style={{
    background: '#f8fafc',
    borderRadius: 12,
    padding: '12px 16px',
    textAlign: 'center',
    border: '1px solid #e2e8f0',
  }}>
    <div style={{ fontSize: 22, fontWeight: 900, color: color || '#0f172a' }}>{value}</div>
    <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>{label}</div>
  </div>
);

const DashboardCard = ({ icon: Icon, title, to, children, accent }) => (
  <div style={{ ...card, borderTop: `3px solid ${accent || '#e67e22'}` }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
      <h2 style={{ margin: 0, fontSize: 16, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8 }}>
        <Icon size={18} /> {title}
      </h2>
      {to && (
        <Link to={to} style={{ fontSize: 13, color: '#e67e22', fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
          Voir <ChevronRight size={14} />
        </Link>
      )}
    </div>
    {children}
  </div>
);

const ClientDashboardPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const dash = await fetchClientDashboard();
      setData(dash?.activeOrder != null || dash?.stats ? dash : DEMO_DASHBOARD);
    } catch {
      setData(DEMO_DASHBOARD);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);
  usePlatformRefresh(load, [load]);

  if (loading) {
    return <div style={{ padding: 48, textAlign: 'center' }}>Chargement du tableau de bord…</div>;
  }

  const d = data || DEMO_DASHBOARD;
  const order = d.activeOrder;
  const appt = d.nextAppointment;
  const alerts = d.iotAlerts || [];

  return (
    <div style={{ padding: 24, maxWidth: 1100, margin: '0 auto' }}>
      <div style={{
        ...card,
        marginBottom: 24,
        background: 'linear-gradient(135deg, #ecfdf5, #d1fae5)',
        border: '1px solid #a7f3d0',
      }}>
        <h1 style={{ margin: '0 0 8px', fontSize: 28, fontWeight: 900, color: '#065f46' }}>
          🏠 Tableau de bord
        </h1>
        <p style={{ margin: 0, color: '#047857', fontSize: 15 }}>
          Commandes, santé, IoT et fidélité — tout en un coup d&apos;œil.
        </p>
        {d.stats && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: 10, marginTop: 20 }}>
            <StatPill label="Commandes actives" value={d.stats.ordersActive} color="#059669" />
            <StatPill label="RDV à venir" value={d.stats.appointmentsUpcoming} color="#2563eb" />
            <StatPill label="Alertes IoT" value={d.stats.iotAlertCount} color="#d97706" />
            <StatPill label="Points fidélité" value={d.loyalty?.points ?? 0} color="#b45309" />
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gap: 20, gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
        <DashboardCard icon={Package} title="Commande en cours" to="/client-orders" accent="#059669">
          {order ? (
            <>
              <p style={{ margin: '0 0 6px', fontWeight: 800, fontSize: 15 }}>
                #{String(order.id).slice(-6)} — {STATUS_LABELS[order.status] || order.status}
              </p>
              <p style={{ margin: '0 0 8px', color: '#64748b', fontSize: 14 }}>
                {(order.items || []).map((i) => i.productId?.name).filter(Boolean).join(', ') || 'Articles'}
              </p>
              <p style={{ margin: 0, fontWeight: 700, color: '#059669' }}>
                {Number(order.total || 0).toFixed(2)} DT
              </p>
            </>
          ) : (
            <p style={{ margin: 0, color: '#94a3b8' }}>Aucune commande en cours.</p>
          )}
        </DashboardCard>

        <DashboardCard icon={Calendar} title="Prochain RDV véto" to="/veterinary" accent="#2563eb">
          {appt ? (
            <>
              <p style={{ margin: '0 0 6px', fontWeight: 800, fontSize: 15 }}>
                {appt.petName} — {appt.type}
              </p>
              <p style={{ margin: 0, color: '#64748b', fontSize: 14 }}>
                {formatDate(appt.date)}
                {appt.visitMode === 'teleconsult' ? ' · Téléconsultation' : ' · Cabinet'}
              </p>
            </>
          ) : (
            <p style={{ margin: 0, color: '#94a3b8' }}>Aucun rendez-vous planifié.</p>
          )}
        </DashboardCard>

        <DashboardCard icon={Gift} title="Points fidélité" to="/client-loyalty" accent="#d97706">
          <div style={{ fontSize: 36, fontWeight: 900, color: '#b45309' }}>
            {d.loyalty?.points ?? 0} <span style={{ fontSize: 16, fontWeight: 700 }}>pts</span>
          </div>
          <p style={{ margin: '8px 0 0', fontSize: 13, color: '#92400e' }}>
            Niveau {d.loyalty?.tier || 'standard'} — 1 pt = 1 DT dépensé
          </p>
        </DashboardCard>

        <DashboardCard icon={Droplets} title="Alertes IoT" to="/client-iot" accent="#7c3aed">
          {alerts.length === 0 ? (
            <p style={{ margin: 0, color: '#94a3b8' }}>Tout est nominal.</p>
          ) : (
            <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
              {alerts.slice(0, 3).map((a) => (
                <li key={a.id} style={{
                  display: 'flex',
                  gap: 8,
                  alignItems: 'flex-start',
                  padding: '8px 0',
                  borderBottom: '1px solid #f1f5f9',
                  fontSize: 13,
                }}>
                  <AlertTriangle size={14} color={a.level === 'critical' ? '#ef4444' : '#f59e0b'} style={{ flexShrink: 0, marginTop: 2 }} />
                  <span>{a.message}</span>
                </li>
              ))}
            </ul>
          )}
        </DashboardCard>
      </div>
    </div>
  );
};

export default ClientDashboardPage;
