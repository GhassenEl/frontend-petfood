import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { Package, Users, Star, AlertTriangle, TrendingUp, Clock, ArrowRight } from 'lucide-react';
import api from '../utils/api';
import AdminTopProductsAI from '../components/AdminTopProductsAI';
import AdminSalesForecast from '../components/AdminSalesForecast';
import AdminMLInsights from '../components/AdminMLInsights';
import AdminMlPanel from '../components/AdminMlPanel';

const COLORS = ['#e67e22', '#27ae60', '#3498db', '#9b59b6', '#e74c3c', '#f39c12'];

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalOrders: 0, totalRevenue: 0, totalUsers: 0,
    totalReviews: 0, totalComplaints: 0, pendingOrders: 0
  });
  const [chartData, setChartData] = useState([]);
  const [statusData, setStatusData] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    fetchChartData();
    fetchRecentActivity();
  }, []);

  const fetchStats = async () => {
    try {
      const [ordersRes, usersRes, reviewsRes, complaintsRes] = await Promise.all([
        api.get('/orders/stats'),
        api.get('/users/count'),
        api.get('/reviews/count'),
        api.get('/complaints/count'),
      ]);
      setStats({
        totalOrders: ordersRes.data.total || 0,
        totalRevenue: ordersRes.data.revenue || 0,
        totalUsers: usersRes.data.count || 0,
        totalReviews: reviewsRes.data.count || 0,
        totalComplaints: complaintsRes.data.count || 0,
        pendingOrders: ordersRes.data.pending || 0,
      });
    } catch (error) {
      console.error('Dashboard error', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchChartData = async () => {
    try {
      const ordersRes = await api.get('/orders');
      const orders = ordersRes.data || [];

      const monthly = {};
      orders.forEach(o => {
        const date = new Date(o.createdAt);
        const key = `${date.getMonth() + 1}/${date.getFullYear()}`;
        monthly[key] = (monthly[key] || 0) + (o.total || 0);
      });
      setChartData(Object.entries(monthly).map(([name, value]) => ({ name, value })).slice(-6));

      const statusCounts = {};
      orders.forEach(o => {
        statusCounts[o.status] = (statusCounts[o.status] || 0) + 1;
      });
      setStatusData(Object.entries(statusCounts).map(([name, value]) => ({ name, value })));
    } catch (error) {
      console.error('Chart data error', error);
    }
  };

  const fetchRecentActivity = async () => {
    try {
      const [ordersRes, reviewsRes, complaintsRes] = await Promise.all([
        api.get('/orders?limit=5'),
        api.get('/reviews?limit=3'),
        api.get('/complaints/all?limit=3'),
      ]);

      const activities = [
        ...(ordersRes.data || []).map(o => ({
          type: 'order',
          icon: '📦',
          text: `Commande #${o._id?.slice(-6)} — ${o.total} DT`,
          time: o.createdAt,
          color: '#e67e22'
        })),
        ...(reviewsRes.data || []).map(r => {
          const preview = r.comment?.length > 100 ? r.comment.substring(0, 100) + '...' : r.comment;
          return {
            type: 'review',
            icon: '⭐',
            text: `Avis ${r.rating}/5 — ${preview}`,
            fullComment: r.comment,
            time: r.createdAt,
            color: '#f39c12'
          }
        }),
        ...(complaintsRes.data || []).map(c => ({
          type: 'complaint',
          icon: '⚠️',
          text: `Réclamation: ${c.subject}`,
          time: c.createdAt,
          color: '#e74c3c'
        })),
      ]
        .sort((a, b) => new Date(b.time) - new Date(a.time))
        .slice(0, 8);

      setRecentActivity(activities);
    } catch (error) {
      console.error('Activity error', error);
    }
  };

  const statCards = [
    { label: 'Commandes', value: stats.totalOrders, icon: '📦', color: '#e67e22', bg: 'rgba(230,126,34,0.1)', link: '/admin/orders' },
    { label: 'Chiffre d\'affaires', value: `${stats.totalRevenue.toLocaleString()} DT`, icon: '💰', color: '#27ae60', bg: 'rgba(39,174,96,0.1)', link: '/admin/invoices' },
    { label: 'Utilisateurs', value: stats.totalUsers, icon: '👥', color: '#3498db', bg: 'rgba(52,152,219,0.1)', link: '/admin/users' },
    { label: 'Avis', value: stats.totalReviews, icon: '⭐', color: '#f39c12', bg: 'rgba(243,156,18,0.1)', link: '/admin/reviews' },
    { label: 'Réclamations', value: stats.totalComplaints, icon: '⚠️', color: '#e74c3c', bg: 'rgba(231,76,60,0.1)', link: '/admin/complaints' },
    { label: 'En attente', value: stats.pendingOrders, icon: '⏳', color: '#9b59b6', bg: 'rgba(155,89,182,0.1)', link: '/admin/orders' },
  ];

  const quickActions = [
    { label: 'Nouveau Produit', icon: <Package size={18} />, color: '#e67e22', link: '/admin/products' },
    { label: 'Promotions produits', icon: <Package size={18} />, color: '#8e44ad', link: '/admin/promotions' },
    { label: 'Utilisateurs', icon: <Users size={18} />, color: '#3498db', link: '/admin/users' },
    { label: 'Avis', icon: <Star size={18} />, color: '#f39c12', link: '/admin/reviews' },
    { label: 'Réclamations', icon: <AlertTriangle size={18} />, color: '#e74c3c', link: '/admin/complaints' },
  ];

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
      {/* Hero */}
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
              Bonjour, El JEzi Ghassen !
            </h1>
            <p style={{ margin: '6px 0 0', color: '#777', fontSize: '0.95rem' }}>
              Voici ce qui se passe sur PetfoodTN aujourd'hui 🐕🐈
            </p>
          </div>
        </div>

        {/* Quick Actions */}
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

      {/* Stat Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
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
            style={{ cursor: 'pointer' }}
            onClick={() => navigate(card.link)}
            whileHover={{ y: -4, boxShadow: '0 12px 40px rgba(0,0,0,0.1)' }}
          >
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '14px',
              background: card.bg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem',
              marginBottom: '12px',
            }}>
              {card.icon}
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: card.color, lineHeight: 1 }}>
              {card.value}
            </div>
            <div style={{ fontSize: '0.85rem', color: '#888', marginTop: '6px', fontWeight: 500 }}>
              {card.label}
            </div>
          </motion.div>
        ))}
      </div>

      <AdminTopProductsAI />

      <AdminSalesForecast />
      <AdminMlPanel compact />
      <AdminMLInsights />

      {/* Charts Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: '20px',
        marginBottom: '28px',
      }}>
        {/* Revenue Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="card-animal"
          style={{ padding: '24px' }}
        >
          <h3 style={{ margin: '0 0 20px', fontSize: '1rem', fontWeight: 700, color: '#444', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TrendingUp size={18} color="#e67e22" /> Chiffre d'affaires
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                formatter={(value) => [`${value} DT`, 'Revenus']}
              />
              <Bar dataKey="value" fill="#e67e22" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Status Pie */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="card-animal"
          style={{ padding: '24px' }}
        >
          <h3 style={{ margin: '0 0 20px', fontSize: '1rem', fontWeight: 700, color: '#444', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock size={18} color="#3498db" /> Statut des commandes
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={4}
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center', marginTop: '12px' }}>
            {statusData.map((entry, index) => (
              <span key={entry.name} style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: COLORS[index % COLORS.length] }} />
                {entry.name}
              </span>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Recent Activity */}
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
          {recentActivity.length === 0 ? (
            <p style={{ color: '#999', textAlign: 'center', padding: '20px' }}>Aucune activité récente 🐾</p>
          ) : (
            recentActivity.map((activity, i) => (
              <motion.div
                key={i}
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
                  transition: 'background 0.2s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(230,126,34,0.04)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.02)'}
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
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default AdminDashboard;

