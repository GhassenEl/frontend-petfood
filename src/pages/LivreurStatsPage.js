import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import api from '../utils/api';

const COLORS = ['#27ae60', '#f39c12', '#3498db', '#e74c3c'];

const LivreurStatsPage = () => {
  const [stats, setStats] = useState({
    weeklyData: [],
    statusData: [],
    totalEarnings: 0,
    avgTime: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await api.get('/orders');
      const orders = res.data || [];
      
      const weekly = {};
      orders.forEach(o => {
        const date = new Date(o.createdAt);
        const key = `${date.getDate()}/${date.getMonth() + 1}`;
        if (!weekly[key]) weekly[key] = { name: key, livrées: 0, enCours: 0 };
        if (o.status === 'delivered') weekly[key].livrées++;
        else if (o.status === 'shipped') weekly[key].enCours++;
      });
      
      const statusCounts = {};
      orders.forEach(o => {
        statusCounts[o.status] = (statusCounts[o.status] || 0) + 1;
      });
      
      setStats({
        weeklyData: Object.values(weekly).slice(-7),
        statusData: Object.entries(statusCounts).map(([name, value]) => ({ name, value })),
        totalEarnings: orders.filter(o => o.status === 'delivered').reduce((sum, o) => sum + (o.total || 0), 0),
        avgTime: 25
      });
    } catch (error) {
      console.error('Stats error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: '16px', animation: 'float 2s ease-in-out infinite' }}>📈</div>
        <p style={{ color: '#888' }}>Chargement des statistiques...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '24px' }}
      >
        📈 Mes Statistiques
      </motion.h1>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '28px',
      }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="stat-card">
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#27ae60' }}>{stats.totalEarnings.toFixed(2)} DT</div>
          <div style={{ fontSize: '0.85rem', color: '#888', marginTop: '4px' }}>Chiffre total livré</div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="stat-card">
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#3498db' }}>{stats.avgTime} min</div>
          <div style={{ fontSize: '0.85rem', color: '#888', marginTop: '4px' }}>Temps moyen de livraison</div>
        </motion.div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: '20px',
      }}>
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="card-animal" style={{ padding: '24px' }}>
          <h3 style={{ margin: '0 0 20px', fontSize: '1rem', fontWeight: 700 }}>Livraisons par jour</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={stats.weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
              <Bar dataKey="livrées" fill="#27ae60" radius={[8, 8, 0, 0]} />
              <Bar dataKey="enCours" fill="#f39c12" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="card-animal" style={{ padding: '24px' }}>
          <h3 style={{ margin: '0 0 20px', fontSize: '1rem', fontWeight: 700 }}>Répartition des statuts</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={stats.statusData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value">
                {stats.statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    </div>
  );
};

export default LivreurStatsPage;

