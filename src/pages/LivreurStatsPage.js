import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import api from '../utils/api';
import RoleMlPanel from '../components/RoleMlPanel';

const COLORS = ['#27ae60', '#f39c12', '#3498db', '#e74c3c', '#9b59b6'];

const LivreurStatsPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const { data } = await api.get('/livreur/stats');
      setStats(data);
    } catch (error) {
      console.error('Stats error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📈</div>
        <p style={{ color: '#888' }}>Chargement des statistiques...</p>
      </div>
    );
  }

  const statusData = Object.entries(stats?.statusBreakdown || {}).map(([name, value]) => ({
    name: { pending: 'En attente', shipped: 'En cours', delivered: 'Livrées', cancelled: 'Annulées', paid: 'Payées' }[name] || name,
    value,
  }));
  const dailyChart = stats?.dailyChart || [];
  const tooltipStyle = { borderRadius: 12, border: 'none', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', fontSize: 13 };

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: 8 }}>
        📈 Mes Statistiques
      </motion.h1>
      {stats?.region && (
        <p style={{ color: '#64748b', marginBottom: 16 }}>Zone {stats.region} · commission {stats.commissionPerDelivery} DT / livraison</p>
      )}

      <RoleMlPanel role="livreur" compact />

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

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="card-animal" style={{ padding: 24 }}>
          <h3 style={{ margin: '0 0 20px', fontSize: '1rem', fontWeight: 700 }}>Livraisons (7 jours)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={dailyChart}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
              <Tooltip contentStyle={tooltipStyle} formatter={(value, name) => [value, name]} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="count" name="Livraisons" fill="#27ae60" radius={[8, 8, 0, 0]} />
              <Bar dataKey="commission" name="Commission (DT)" fill="#059669" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="card-animal" style={{ padding: 24 }}>
          <h3 style={{ margin: '0 0 20px', fontSize: '1rem', fontWeight: 700 }}>Répartition des statuts</h3>
          {statusData.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#94a3b8', padding: 40 }}>Pas encore de données</p>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={statusData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value" nameKey="name">
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </motion.div>
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
