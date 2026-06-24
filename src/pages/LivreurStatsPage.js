import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../utils/api';
import { withDemoStats, DEMO_LIVREUR_STATS } from '../utils/livreurDemoData';
import LivreurDashboardCharts from '../components/LivreurDashboardCharts';

const LivreurStatsPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const { data } = await api.get('/livreur/stats');
      setStats(withDemoStats(data));
    } catch (error) {
      console.error('Stats error:', error);
      setStats(DEMO_LIVREUR_STATS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const id = window.setInterval(fetchStats, 12000);
    return () => window.clearInterval(id);
  }, []);

  usePlatformRefresh(fetchStats);

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📈</div>
        <p style={{ color: '#888' }}>Chargement des statistiques...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: 8 }}>
        📈 Mes Statistiques
      </motion.h1>
      {stats?.region && (
        <p style={{ color: '#64748b', marginBottom: 8 }}>
          Zone {stats.region} · commission {stats.commissionPerDelivery} DT / livraison
        </p>
      )}
      <LivreurDashboardCharts stats={stats} loading={false} />

      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
        gap: 16, marginBottom: 28,
      }}>
        <Kpi label="Total livrées" value={stats?.totalDelivered ?? 0} color="#27ae60" />
        <Kpi label="Commission totale" value={`${stats?.totalCommission ?? 0} DT`} color="#059669" />
        <Kpi label="Cette semaine" value={stats?.weekDelivered ?? 0} color="#3498db" />
        <Kpi label="Gains semaine" value={`${stats?.weekCommission ?? 0} DT`} color="#059669" />
        <Kpi label="Temps moyen" value={stats?.avgDeliveryMinutes != null ? `${stats.avgDeliveryMinutes} min` : '—'} color="#6366f1" />
        <Kpi label="Ponctualité" value={`${stats?.onTimeRate ?? 95}%`} color="#e67e22" />
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 14,
      }}
      >
        {Object.entries(stats?.statusBreakdown || {}).map(([key, value]) => (
          <div key={key} className="stat-card" style={{ textAlign: 'center', padding: 16 }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#334155' }}>{value}</div>
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>
              {{
                pending: 'En attente',
                shipped: 'En cours',
                delivered: 'Livrées',
                cancelled: 'Annulées',
                paid: 'Payées',
              }[key] || key}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const Kpi = ({ label, value, color }) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="stat-card">
    <div style={{ fontSize: '1.5rem', fontWeight: 800, color }}>{value}</div>
    <div style={{ fontSize: '0.85rem', color: '#888', marginTop: 4 }}>{label}</div>
  </motion.div>
);

export default LivreurStatsPage;
