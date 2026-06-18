import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp, BarChart3, Boxes,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';
import AdminDashboardCharts from '../components/AdminDashboardCharts';
import RealtimeStatsCharts from '../components/RealtimeStatsCharts';
import {
  DEMO_ADMIN_ORDERS,
  DEMO_ADMIN_USERS,
  buildDemoRevenueChart,
  buildDemoStatusChart,
  buildDemoOrdersDailyChart,
  buildDemoUsersGrowthChart,
  withDemoFallback,
  withDemoStats,
} from '../utils/adminDemoData';
import usePlatformRefresh from '../hooks/usePlatformRefresh';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState(withDemoStats(null));
  const [chartData, setChartData] = useState(buildDemoRevenueChart());
  const [statusData, setStatusData] = useState(buildDemoStatusChart());
  const [dailyData, setDailyData] = useState(buildDemoOrdersDailyChart());
  const [usersData, setUsersData] = useState(buildDemoUsersGrowthChart());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    fetchChartData();
    const id = window.setInterval(() => {
      fetchStats();
      fetchChartData();
    }, 15000);
    return () => window.clearInterval(id);
  }, []);

  usePlatformRefresh(() => {
    fetchStats();
    fetchChartData();
  });

  const fetchStats = async () => {
    try {
      const [ordersRes, usersRes, reviewsRes, complaintsRes] = await Promise.all([
        api.get('/orders/stats').catch(() => ({ data: {} })),
        api.get('/users/count').catch(() => ({ data: {} })),
        api.get('/reviews/count').catch(() => ({ data: {} })),
        api.get('/complaints/count').catch(() => ({ data: {} })),
      ]);
      setStats(withDemoStats({
        totalOrders: ordersRes.data.total || 0,
        totalRevenue: ordersRes.data.revenue || 0,
        totalUsers: usersRes.data.count || 0,
        totalReviews: reviewsRes.data.count || 0,
        totalComplaints: complaintsRes.data.count || 0,
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
      const [ordersRes, usersRes] = await Promise.all([
        api.get('/orders'),
        api.get('/users').catch(() => ({ data: [] })),
      ]);
      const orders = withDemoFallback(ordersRes.data || [], DEMO_ADMIN_ORDERS);
      const users = withDemoFallback(usersRes.data || [], DEMO_ADMIN_USERS);
      setChartData(buildDemoRevenueChart(orders));
      setStatusData(buildDemoStatusChart(orders));
      setDailyData(buildDemoOrdersDailyChart(orders));
      setUsersData(buildDemoUsersGrowthChart(users));
    } catch (error) {
      console.error('Chart data error', error);
      setChartData(buildDemoRevenueChart());
      setStatusData(buildDemoStatusChart());
      setDailyData(buildDemoOrdersDailyChart());
      setUsersData(buildDemoUsersGrowthChart());
    }
  };

  const statCards = [
    { label: 'Commandes', value: stats.totalOrders, icon: '📦', color: '#e67e22', bg: 'rgba(230,126,34,0.1)', link: '/admin/orders' },
    { label: 'Chiffre d\'affaires', value: `${Number(stats.totalRevenue).toLocaleString('fr-FR')} DT`, icon: '💰', color: '#27ae60', bg: 'rgba(39,174,96,0.1)', link: '/admin/sales' },
    { label: 'Utilisateurs', value: stats.totalUsers, icon: '👥', color: '#3498db', bg: 'rgba(52,152,219,0.1)', link: '/admin/users' },
    { label: 'Avis', value: stats.totalReviews, icon: '⭐', color: '#f39c12', bg: 'rgba(243,156,18,0.1)', link: '/admin/reviews' },
    { label: 'Réclamations', value: stats.totalComplaints, icon: '⚠️', color: '#e74c3c', bg: 'rgba(231,76,60,0.1)', link: '/admin/complaints' },
    { label: 'En attente', value: stats.pendingOrders, icon: '⏳', color: '#9b59b6', bg: 'rgba(155,89,182,0.1)', link: '/admin/orders' },
  ];

  const biShortcuts = [
    { label: 'Power BI', icon: <BarChart3 size={18} />, color: '#6366f1', link: '/admin/powerbi' },
    { label: 'Business Intelligence', icon: <TrendingUp size={18} />, color: '#1e40af', link: '/admin/business-intelligence' },
    { label: 'Gestion stock', icon: <Boxes size={18} />, color: '#2563eb', link: '/admin/stock' },
    { label: 'Ventes & CA', icon: <TrendingUp size={18} />, color: '#e67e22', link: '/admin/sales' },
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
          <span style={{ fontSize: '2.5rem' }}>🐾</span>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.9rem', fontWeight: 800, color: 'white' }}>
              Bonjour, {displayName} !
            </h1>
            <p style={{ margin: '8px 0 0', color: 'rgba(255,255,255,0.88)', fontSize: '0.95rem' }}>
              Tableau de bord PetfoodTN — chiens, chats et compagnons 🐕🐈🐰
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

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '12px',
        marginBottom: '28px',
      }}>
        {biShortcuts.map((item) => (
          <motion.button
            key={item.label}
            type="button"
            whileHover={{ y: -2 }}
            onClick={() => navigate(item.link)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '14px 18px',
              background: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '14px',
              fontSize: '0.9rem',
              fontWeight: 700,
              color: item.color,
              cursor: 'pointer',
              boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
            }}
          >
            {item.icon}
            {item.label}
          </motion.button>
        ))}
      </div>

      <RealtimeStatsCharts role="admin" />

      <AdminDashboardCharts
        revenueData={chartData}
        statusData={statusData}
        dailyData={dailyData}
        usersData={usersData}
      />
    </div>
  );
};

export default AdminDashboard;
