import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { TrendingUp } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';
import PowerBiDashboardPanel from '../components/PowerBiDashboardPanel';
import {
  DEMO_ADMIN_ORDERS,
  buildDemoRevenueChart,
  withDemoFallback,
  withDemoStats,
} from '../utils/adminDemoData';
import usePlatformRefresh from '../hooks/usePlatformRefresh';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState(withDemoStats(null));
  const [chartData, setChartData] = useState(buildDemoRevenueChart());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    fetchChartData();
    const id = window.setInterval(() => {
      fetchStats();
      fetchChartData();
    }, 5000);
    return () => window.clearInterval(id);
  }, []);

  usePlatformRefresh(() => {
    fetchStats();
    fetchChartData();
  });

  const fetchStats = async () => {
    try {
      const ordersRes = await api.get('/orders/stats').catch(() => ({ data: {} }));
      setStats(withDemoStats({
        totalOrders: ordersRes.data.total || 0,
        totalRevenue: ordersRes.data.revenue || 0,
        pendingOrders: ordersRes.data.pending || 0,
      }));
    } catch (error) {
      console.error('Dashboard error', error);
      setStats(withDemoStats(null));
    } finally {
      setLoading(false);
    }
  };

  const fetchChartData = async () => {
    try {
      const ordersRes = await api.get('/orders');
      const orders = withDemoFallback(ordersRes.data || [], DEMO_ADMIN_ORDERS);
      setChartData(buildDemoRevenueChart(orders));
    } catch (error) {
      console.error('Chart data error', error);
      setChartData(buildDemoRevenueChart());
    }
  };

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
          backgroundImage: 'linear-gradient(135deg, rgba(15,23,42,0.82) 0%, rgba(30,64,175,0.72) 100%), url(https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=1400&q=80)',
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
              Tableau de bord — ventes &amp; chiffre d&apos;affaires
            </p>
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

      <PowerBiDashboardPanel
        salesOnly
        revenueData={chartData}
        totalRevenue={stats.totalRevenue}
      />

      <motion.button
        type="button"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        whileHover={{ y: -2 }}
        onClick={() => navigate('/admin/powerbi')}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          marginTop: '8px',
          padding: '12px 18px',
          background: 'white',
          border: '1px solid #e5e7eb',
          borderRadius: '14px',
          fontSize: '0.9rem',
          fontWeight: 700,
          color: '#6366f1',
          cursor: 'pointer',
          boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
        }}
      >
        <TrendingUp size={18} />
        Analyses avancées Power BI →
      </motion.button>
    </div>
  );
};

export default AdminDashboard;
