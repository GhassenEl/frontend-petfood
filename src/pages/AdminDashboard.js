import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Package, Users, Star, AlertTriangle, TrendingUp, ArrowRight, Store,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';
import AdminDashboardCharts from '../components/AdminDashboardCharts';
import RealtimeStatsCharts from '../components/RealtimeStatsCharts';
import {
  DEMO_ADMIN_ORDERS,
  DEMO_ADMIN_USERS,
  buildDemoRecentActivity,
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
  const [recentActivity, setRecentActivity] = useState(buildDemoRecentActivity());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    fetchChartData();
    fetchRecentActivity();
    const id = window.setInterval(() => {
      fetchStats();
      fetchChartData();
    }, 15000);
    return () => window.clearInterval(id);
  }, []);

  usePlatformRefresh(() => {
    fetchStats();
    fetchChartData();
    fetchRecentActivity();
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

  const fetchRecentActivity = async () => {
    try {
      const [ordersRes, reviewsRes, complaintsRes] = await Promise.all([
        api.get('/orders?limit=5').catch(() => ({ data: [] })),
        api.get('/reviews?limit=3').catch(() => ({ data: [] })),
        api.get('/complaints/all?limit=3').catch(() => ({ data: [] })),
      ]);

      const orders = withDemoFallback(ordersRes.data || [], DEMO_ADMIN_ORDERS);
      const activities = [
        ...orders.slice(0, 5).map((o) => ({
          type: 'order',
          icon: '📦',
          text: `Commande #${String(o._id || o.id).slice(-6)} — ${o.total} DT`,
          time: o.createdAt,
          color: '#e67e22',
        })),
        ...(reviewsRes.data || []).map((r) => {
          const preview = r.comment?.length > 100 ? `${r.comment.substring(0, 100)}...` : r.comment;
          return {
            type: 'review',
            icon: '⭐',
            text: `Avis ${r.rating}/5 — ${preview}`,
            time: r.createdAt,
            color: '#f39c12',
          };
        }),
        ...(complaintsRes.data || []).map((c) => ({
          type: 'complaint',
          icon: '⚠️',
          text: `Réclamation: ${c.subject}`,
          time: c.createdAt,
          color: '#e74c3c',
        })),
      ]
        .sort((a, b) => new Date(b.time) - new Date(a.time))
        .slice(0, 8);

      setRecentActivity(activities.length ? activities : buildDemoRecentActivity());
    } catch (error) {
      console.error('Activity error', error);
      setRecentActivity(buildDemoRecentActivity());
    }
  };

  const statCards = [
    { label: 'Commandes', value: stats.totalOrders, icon: '📦', color: '#e67e22', bg: 'rgba(230,126,34,0.1)', link: '/admin/orders' },
    { label: 'Chiffre d\'affaires', value: `${Number(stats.totalRevenue).toLocaleString('fr-FR')} DT`, icon: '💰', color: '#27ae60', bg: 'rgba(39,174,96,0.1)', link: '/admin/invoices' },
    { label: 'Utilisateurs', value: stats.totalUsers, icon: '👥', color: '#3498db', bg: 'rgba(52,152,219,0.1)', link: '/admin/users' },
    { label: 'Avis', value: stats.totalReviews, icon: '⭐', color: '#f39c12', bg: 'rgba(243,156,18,0.1)', link: '/admin/reviews' },
    { label: 'Réclamations', value: stats.totalComplaints, icon: '⚠️', color: '#e74c3c', bg: 'rgba(231,76,60,0.1)', link: '/admin/complaints' },
    { label: 'En attente', value: stats.pendingOrders, icon: '⏳', color: '#9b59b6', bg: 'rgba(155,89,182,0.1)', link: '/admin/orders' },
  ];

  const quickActions = [
    { label: 'Ventes & CA', icon: <TrendingUp size={18} />, color: '#e67e22', link: '/admin/sales' },
    { label: 'Stock & alertes', icon: <Package size={18} />, color: '#2563eb', link: '/admin/stock' },
    { label: 'Promotions', icon: <Star size={18} />, color: '#d97706', link: '/admin/promotions' },
    { label: 'Power BI', icon: <TrendingUp size={18} />, color: '#6366f1', link: '/admin/powerbi' },
    { label: 'Modèles NLP', icon: <TrendingUp size={18} />, color: '#7c3aed', link: '/admin/nlp-models' },
    { label: 'Config. globale', icon: <TrendingUp size={18} />, color: '#ea580c', link: '/admin/system' },
    { label: 'Espace visiteur', icon: <Users size={18} />, color: '#0284c7', link: '/admin/visitors' },
    { label: 'Utilisateurs', icon: <Users size={18} />, color: '#3498db', link: '/admin/users' },
    { label: 'Fournisseurs & partenariats', icon: <Store size={18} />, color: '#0d9488', link: '/admin/partners' },
    { label: 'Modérateurs', icon: <Users size={18} />, color: '#d97706', link: '/admin/moderators' },
    { label: 'Remboursements', icon: <TrendingUp size={18} />, color: '#7c3aed', link: '/admin/refunds' },
    { label: 'Réclamations', icon: <AlertTriangle size={18} />, color: '#e74c3c', link: '/admin/complaints' },
  ];

  const firstName = user?.name?.split(' ')[0] || 'Admin';

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
          background: 'linear-gradient(135deg, rgba(230,126,34,0.08) 0%, rgba(39,174,96,0.06) 100%)',
          borderRadius: '24px',
          padding: '32px',
          marginBottom: '28px',
          border: '1px solid rgba(230,126,34,0.1)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px' }}>
          <span style={{ fontSize: '2.5rem' }}>👋</span>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 800, color: '#333' }}>
              Bonjour, {firstName} !
            </h1>
            <p style={{ margin: '6px 0 0', color: '#777', fontSize: '0.95rem' }}>
              Voici ce qui se passe sur PetfoodTN aujourd&apos;hui 🐕🐈
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '16px' }}>
          {quickActions.map((action) => (
            <motion.button
              key={action.label}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate(action.link)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 18px',
                background: 'white',
                border: 'none',
                borderRadius: '14px',
                fontSize: '0.85rem',
                fontWeight: 600,
                color: action.color,
                cursor: 'pointer',
                boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
              }}
            >
              {action.icon}
              {action.label}
              <ArrowRight size={14} />
            </motion.button>
          ))}
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

      <RealtimeStatsCharts role="admin" />

      <AdminDashboardCharts
        revenueData={chartData}
        statusData={statusData}
        dailyData={dailyData}
        usersData={usersData}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="card-animal"
        style={{ padding: '24px' }}
      >
        <h3 style={{ margin: '0 0 20px', fontSize: '1rem', fontWeight: 700, color: '#444', display: 'flex', alignItems: 'center', gap: '8px' }}>
          🔔 Activité récente
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {recentActivity.map((activity, i) => (
            <motion.div
              key={`${activity.type}-${i}`}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 + i * 0.05 }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                padding: '12px 16px',
                borderRadius: '14px',
                background: 'rgba(0,0,0,0.02)',
              }}
            >
              <span style={{ fontSize: '1.3rem' }}>{activity.icon}</span>
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600, color: '#444' }}>{activity.text}</p>
                <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: '#aaa' }}>
                  {activity.time ? new Date(activity.time).toLocaleString('fr-FR') : ''}
                </p>
              </div>
              <span style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: activity.color,
                flexShrink: 0,
              }} />
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default AdminDashboard;
