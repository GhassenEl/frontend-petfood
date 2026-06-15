import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../utils/api';
import { livreurCancelOrder } from '../services/orderService';
import { withDemoDashboard, withDemoStats } from '../utils/livreurDemoData';
import LivreurMissionPanel from '../components/LivreurMissionPanel';
import LivreurDashboardCharts from '../components/LivreurDashboardCharts';
import RealtimeStatsCharts from '../components/RealtimeStatsCharts';
import DeliveryProofModal from '../components/DeliveryProofModal';
import useLivreurGps from '../hooks/useLivreurGps';
import usePlatformRefresh from '../hooks/usePlatformRefresh';

const oid = (o) => o?.id || o?._id;

const LivreurDashboard = () => {
  const [data, setData] = useState(null);
  const [chartStats, setChartStats] = useState(null);
  const [chartsLoading, setChartsLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [proofOrder, setProofOrder] = useState(null);
  const [claiming, setClaiming] = useState(null);
  const [cancelling, setCancelling] = useState(null);

  const isAvailable = data?.livreur?.isAvailable !== false;
  useLivreurGps(isAvailable && (data?.stats?.activeDeliveries > 0 || data?.pool?.length > 0));

  useEffect(() => {
    fetchData();
    const loadCharts = () => api.get('/livreur/stats')
      .then(({ data: s }) => setChartStats(withDemoStats(s)))
      .catch(console.error)
      .finally(() => setChartsLoading(false));
    loadCharts();
    const poll = window.setInterval(() => {
      fetchData();
      loadCharts();
    }, 12000);
    return () => window.clearInterval(poll);
  }, []);

  usePlatformRefresh(() => {
    fetchData();
  });

  const fetchData = async () => {
    try {
      const { data: dash } = await api.get('/livreur/dashboard');
      setData(withDemoDashboard(dash));
    } catch (error) {
      console.error('Livreur dashboard error:', error);
      setData(withDemoDashboard(null));
    } finally {
      setLoading(false);
    }
  };

  const claimOrder = async (orderId) => {
    setClaiming(orderId);
    try {
      await api.post(`/livreur/orders/${orderId}/claim`);
      fetchData();
    } catch (error) {
      window.alert(error.response?.data?.error || 'Impossible de prendre cette course');
    } finally {
      setClaiming(null);
    }
  };

  const completeDelivery = async (payload) => {
    const id = oid(proofOrder);
    await api.post(`/livreur/orders/${id}/complete`, payload);
    setProofOrder(null);
    fetchData();
  };

  const cancelDelivery = async (orderId) => {
    const reason = window.prompt('Motif d\'annulation (optionnel) :');
    if (reason === null) return;
    setCancelling(orderId);
    try {
      await livreurCancelOrder(orderId, { reason: reason?.trim() || undefined });
      fetchData();
    } catch (error) {
      window.alert(error.response?.data?.error || 'Impossible d\'annuler cette course');
    } finally {
      setCancelling(null);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🚚</div>
        <p style={{ color: '#888' }}>Chargement...</p>
      </div>
    );
  }

  const { livreur, stats, alerts = [], pool = [], active = [] } = data || {};
  const statCards = [
    { label: 'Livraisons aujourd\'hui', value: stats?.todayDeliveries ?? 0, icon: '📦', color: '#27ae60' },
    { label: 'Gains du jour', value: `${stats?.todayEarnings ?? 0} DT`, icon: '💰', color: '#059669' },
    { label: 'En cours', value: stats?.activeDeliveries ?? 0, icon: '🚚', color: '#3498db' },
    { label: 'File d\'attente zone', value: stats?.pendingPool ?? 0, icon: '⏳', color: '#f39c12' },
  ];

  const alertStyle = (level) => ({
    padding: '12px 16px',
    borderRadius: 12,
    marginBottom: 8,
    fontSize: 14,
    background: level === 'critical' ? '#fef2f2' : level === 'warning' ? '#fffbeb' : '#eff6ff',
    color: level === 'critical' ? '#b91c1c' : level === 'warning' ? '#b45309' : '#1d4ed8',
    border: `1px solid ${level === 'critical' ? '#fecaca' : level === 'warning' ? '#fde68a' : '#bfdbfe'}`,
  });

  const renderOrderRow = (order, actions) => (
    <div key={oid(order)} style={{
      display: 'flex', alignItems: 'center', gap: 16, padding: 16,
      background: 'rgba(0,0,0,0.02)', borderRadius: 14,
    }}>
      <div style={{
        width: 48, height: 48, borderRadius: 12,
        background: order.status === 'shipped' ? 'rgba(243,156,18,0.1)' : 'rgba(39,174,96,0.1)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem',
      }}>📦</div>
      <div style={{ flex: 1 }}>
        <p style={{ margin: 0, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          #{String(oid(order)).slice(-6)} · {order.total} DT
        </p>
        <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: '#888' }}>
          {order.address || 'Adresse non spécifiée'}
        </p>
      </div>
      {actions}
    </div>
  );

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          background: 'linear-gradient(135deg, rgba(39,174,96,0.08) 0%, rgba(46,204,113,0.06) 100%)',
          borderRadius: 24, padding: 32, marginBottom: 28, border: '1px solid rgba(39,174,96,0.1)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 800, color: '#333' }}>
              🚚 Bonjour{livreur?.name ? `, ${livreur.name.split(' ')[0]}` : ''} !
            </h1>
            <p style={{ margin: '8px 0 0', color: '#777' }}>
              {livreur?.region ? `Zone : ${livreur.region}` : 'Espace livreur'}
              {livreur?.isAvailable === false && ' · ⏸ En pause'}
            </p>
          </div>
          <Link to="/livreur/stats" style={{
            padding: '10px 16px', background: '#7c3aed', color: 'white', borderRadius: 12,
            fontWeight: 700, textDecoration: 'none', fontSize: 13,
          }}>
            📊 Statistiques
          </Link>
          <Link to="/livreur/bi" style={{
            padding: '10px 16px', background: '#1d4ed8', color: 'white', borderRadius: 12,
            fontWeight: 700, textDecoration: 'none', fontSize: 13,
          }}>
            📈 Dashboard BI
          </Link>
          <Link to="/livreur/route" style={{
            padding: '12px 20px', background: '#059669', color: 'white', borderRadius: 12,
            fontWeight: 700, textDecoration: 'none', fontSize: 14,
          }}>
            🛣️ Tournée optimisée
          </Link>
        </div>
      </motion.div>

      <RealtimeStatsCharts role="livreur" />

      <LivreurDashboardCharts stats={chartStats} loading={chartsLoading} />

      {alerts.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          {alerts.map((a, i) => (
            <div key={i} style={alertStyle(a.level)}>{a.message}</div>
          ))}
        </div>
      )}

      <LivreurMissionPanel onMissionChange={() => fetchData()} />

      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 16, marginBottom: 28,
      }}>
        {statCards.map((card, i) => (
          <motion.div key={card.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="stat-card">
            <div style={{ fontSize: '2rem', marginBottom: 8 }}>{card.icon}</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: card.color }}>{card.value}</div>
            <div style={{ fontSize: '0.85rem', color: '#888', marginTop: 4 }}>{card.label}</div>
          </motion.div>
        ))}
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card-animal" style={{ padding: 24, marginBottom: 20 }}>
        <h3 style={{ margin: '0 0 16px', fontSize: '1.1rem', fontWeight: 700 }}>🚚 Mes livraisons en cours</h3>
        {active.length === 0 ? (
          <p style={{ color: '#999', textAlign: 'center', padding: 16 }}>Aucune livraison active</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {active.map((order) => renderOrderRow(order, (
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button type="button" onClick={() => setProofOrder(order)} style={btnGreen}>✅ Clôturer</button>
                <button
                  type="button"
                  onClick={() => cancelDelivery(oid(order))}
                  disabled={cancelling === oid(order)}
                  style={btnCancel}
                >
                  {cancelling === oid(order) ? '…' : 'Annuler'}
                </button>
              </div>
            )))}
          </div>
        )}
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="card-animal" style={{ padding: 24 }}>
        <h3 style={{ margin: '0 0 16px', fontSize: '1.1rem', fontWeight: 700 }}>📦 Commandes disponibles (zone)</h3>
        {pool.length === 0 ? (
          <p style={{ color: '#999', textAlign: 'center', padding: 16 }}>Aucune commande en attente 🎉</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {pool.map((order) => renderOrderRow(order, (
              <button
                type="button"
                disabled={claiming === oid(order)}
                onClick={() => claimOrder(oid(order))}
                style={{ ...btnOrange, opacity: claiming === oid(order) ? 0.7 : 1 }}
              >
                {claiming === oid(order) ? '…' : '🚚 Prendre'}
              </button>
            )))}
          </div>
        )}
      </motion.div>

      {proofOrder && (
        <DeliveryProofModal
          orderId={oid(proofOrder)}
          onClose={() => setProofOrder(null)}
          onComplete={completeDelivery}
        />
      )}
    </div>
  );
};

const btnGreen = {
  padding: '8px 16px', background: '#27ae60', color: 'white', border: 'none',
  borderRadius: 10, fontWeight: 600, cursor: 'pointer',
};
const btnOrange = {
  padding: '8px 16px', background: '#f39c12', color: 'white', border: 'none',
  borderRadius: 10, fontWeight: 600, cursor: 'pointer',
};
const btnCancel = {
  padding: '8px 16px', background: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca',
  borderRadius: 10, fontWeight: 600, cursor: 'pointer',
};

export default LivreurDashboard;
