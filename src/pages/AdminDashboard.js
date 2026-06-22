import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';
import {
  withDemoStats,
  buildDemoRevenueChart,
  buildDemoOrdersDailyChart,
  buildDemoStatusChart,
  buildDemoUsersGrowthChart,
  mergeAdminBiCharts,
  DEMO_ADMIN_ORDERS,
  DEMO_ADMIN_USERS,
  withDemoFallback,
} from '../utils/adminDemoData';
import { DEMO_LIVREUR_STATS } from '../utils/livreurDemoData';
import usePlatformRefresh from '../hooks/usePlatformRefresh';
import useAnalyticsHub from '../hooks/useAnalyticsHub';
import PowerBiDashboardPanel from '../components/PowerBiDashboardPanel';
import AdminPowerBiInsightsPanel from '../components/AdminPowerBiInsightsPanel';
import AdminDashboardCharts from '../components/AdminDashboardCharts';
import AdminDashboardSalesPanel from '../components/AdminDashboardSalesPanel';
import { HERO_BACKGROUND } from '../utils/platformImages';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState(withDemoStats(null));
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState(DEMO_ADMIN_ORDERS);
  const { data: analyticsData } = useAnalyticsHub();

  const fetchStats = useCallback(async () => {
    try {
      const [statsRes, ordersRes] = await Promise.all([
        api.get('/orders/stats').catch(() => ({ data: {} })),
        api.get('/orders').catch(() => ({ data: [] })),
      ]);
      setOrders(withDemoFallback(ordersRes.data, DEMO_ADMIN_ORDERS));
      setStats(withDemoStats({
        totalOrders: statsRes.data.total || 0,
        totalRevenue: statsRes.data.revenue || 0,
        pendingOrders: statsRes.data.pending || 0,
      }));
    } catch (error) {
      console.error('Dashboard error', error);
      setStats(withDemoStats(null));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    const id = window.setInterval(fetchStats, 5000);
    return () => window.clearInterval(id);
  }, [fetchStats]);

  usePlatformRefresh(fetchStats);

  const revenueData = buildDemoRevenueChart(orders);
  const dailyData = buildDemoOrdersDailyChart(orders);
  const statusData = buildDemoStatusChart(orders);
  const usersData = buildDemoUsersGrowthChart(DEMO_ADMIN_USERS);
  const biCharts = mergeAdminBiCharts(analyticsData?.biCharts);

  const statCards = [
    {
      label: 'Chiffre d\'affaires',
      value: `${Number(stats.totalRevenue).toLocaleString('fr-FR')} DT`,
      icon: '💰',
      color: '#27ae60',
      link: '/admin/sales',
    },
    {
      label: 'Commandes',
      value: stats.totalOrders,
      icon: '📦',
      color: '#e67e22',
      link: '/admin/orders',
    },
    {
      label: 'En attente',
      value: stats.pendingOrders,
      icon: '⏳',
      color: '#9b59b6',
      link: '/admin/orders',
    },
  ];

  const displayName = user?.name || 'Administrateur';

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: '16px', animation: 'float 2s ease-in-out infinite' }}>🐾</div>
        <p style={{ color: '#888' }}>Chargement du dashboard...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="hero-animal"
        style={{
          backgroundImage: `linear-gradient(135deg, rgba(15,23,42,0.82) 0%, rgba(30,64,175,0.72) 100%), url(${HERO_BACKGROUND})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          borderRadius: '24px',
          padding: '36px 32px',
          marginBottom: '28px',
          border: '1px solid rgba(255,255,255,0.12)',
          color: 'white',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ fontSize: '2.5rem' }}>📊</span>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.9rem', fontWeight: 800, color: 'white' }}>
              Bonjour, {displayName} !
            </h1>
            <p style={{ margin: '8px 0 0', color: 'rgba(255,255,255,0.88)', fontSize: '0.95rem' }}>
              Tableau de bord Power BI — ventes, pharmacie, maladies &amp; livraisons
            </p>
            <Link
              to="/admin/powerbi"
              style={{
                display: 'inline-flex',
                marginTop: 12,
                padding: '8px 14px',
                borderRadius: 10,
                background: 'rgba(242,200,17,0.95)',
                color: '#252423',
                fontWeight: 700,
                fontSize: 13,
                textDecoration: 'none',
              }}
            >
              Hub Power BI complet →
            </Link>
          </div>
        </div>
      </motion.div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
        gap: '16px',
        marginBottom: '28px',
      }}>
        {statCards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.08 }}
            className="stat-card"
            style={{ cursor: 'pointer', textAlign: 'center', padding: '20px 16px' }}
            onClick={() => navigate(card.link)}
            whileHover={{ y: -4, boxShadow: '0 12px 40px rgba(0,0,0,0.1)' }}
          >
            <div style={{ fontSize: '1.6rem', marginBottom: '8px' }}>{card.icon}</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: card.color, lineHeight: 1 }}>
              {card.value}
            </div>
            <div style={{ fontSize: '0.85rem', color: '#888', marginTop: '8px', fontWeight: 600 }}>
              {card.label}
            </div>
          </motion.div>
        ))}
      </div>

      <AdminDashboardSalesPanel />

      <AdminDashboardCharts
        revenueData={revenueData}
        dailyData={dailyData}
        statusData={statusData}
        usersData={usersData}
      />

      <PowerBiDashboardPanel
        compact
        totalRevenue={stats.totalRevenue}
        revenueData={revenueData}
        dailyData={dailyData}
      />

      <AdminPowerBiInsightsPanel
        biCharts={biCharts}
        livreurStats={DEMO_LIVREUR_STATS}
        compact
      />
    </div>
  );
};

export default AdminDashboard;
