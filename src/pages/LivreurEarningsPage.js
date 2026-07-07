import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, TrendingUp, Calendar, Package, CreditCard, BarChart3 } from 'lucide-react';
import api from '../utils/api';
import { DEMO_LIVREUR_ORDERS, getLivreurCommission, withDemoFallback, buildDailyChart } from '../utils/livreurDemoData';
import usePlatformRefresh from '../hooks/usePlatformRefresh';

const LivreurEarningsPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('all');

  const fetchOrders = async () => {
    try {
      const res = await api.get('/orders');
      setOrders(withDemoFallback(res.data || [], DEMO_LIVREUR_ORDERS));
    } catch (error) {
      console.error('Earnings error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  usePlatformRefresh(fetchOrders);

  const getFilteredOrders = () => {
    const delivered = orders.filter(o => o.status === 'delivered');
    const now = new Date();

    if (dateRange === 'today') {
      const today = now.toISOString().split('T')[0];
      return delivered.filter(o => o.createdAt && o.createdAt.startsWith(today));
    }
    if (dateRange === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return delivered.filter(o => o.createdAt && new Date(o.createdAt) >= weekAgo);
    }
    if (dateRange === 'month') {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      return delivered.filter(o => o.createdAt && new Date(o.createdAt) >= monthAgo);
    }
    return delivered;
  };

  const filteredOrders = getFilteredOrders();
  const totalEarnings = filteredOrders.reduce((sum, o) => sum + getLivreurCommission(o), 0);
  const totalDeliveries = filteredOrders.length;
  const avgEarning = totalDeliveries > 0 ? totalEarnings / totalDeliveries : 0;

  const todayStr = new Date().toISOString().split('T')[0];
  const todayDeliveries = orders.filter(o => o.status === 'delivered' && o.createdAt && o.createdAt.startsWith(todayStr)).length;
  const todayEarnings = orders
    .filter(o => o.status === 'delivered' && o.createdAt && o.createdAt.startsWith(todayStr))
    .reduce((sum, o) => sum + getLivreurCommission(o), 0);

  const weeklyData = () => {
    const data = {};
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const key = d.toISOString().split('T')[0];
      const label = d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' });
      data[key] = { label, earnings: 0, count: 0 };
    }
    orders.filter(o => o.status === 'delivered').forEach(o => {
      const date = o.createdAt ? o.createdAt.split('T')[0] : null;
      if (date && data[date]) {
        data[date].earnings += getLivreurCommission(o);
        data[date].count += 1;
      }
    });
    return Object.values(data);
  };

  const chartData = (() => {
    const values = weeklyData();
    if (values.every((d) => d.earnings === 0)) {
      return buildDailyChart().map((d) => ({
        label: d.label,
        earnings: d.commission,
        count: d.count,
      }));
    }
    return values;
  })();
  const maxEarnings = Math.max(...chartData.map(d => d.earnings), 1);

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: '16px', animation: 'float 2s ease-in-out infinite' }}>💰</div>
        <p style={{ color: '#888' }}>Chargement des gains...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: '24px' }}
      >
        <h1 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 800 }}>💰 Mes Gains</h1>
        <p style={{ color: '#888', marginTop: '8px' }}>
          Commission de {getLivreurCommission({})} DT par livraison — suivez vos revenus
        </p>
      </motion.div>

      {/* Summary cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '28px',
      }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="stat-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <DollarSign size={20} color="#27ae60" />
            <span style={{ fontSize: '0.85rem', color: '#888' }}>Gains totaux</span>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#27ae60' }}>{totalEarnings.toFixed(2)} DT</div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="stat-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <Package size={20} color="#3498db" />
            <span style={{ fontSize: '0.85rem', color: '#888' }}>Livraisons</span>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#3498db' }}>{totalDeliveries}</div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="stat-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <TrendingUp size={20} color="#e67e22" />
            <span style={{ fontSize: '0.85rem', color: '#888' }}>Moyenne / livraison</span>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#e67e22' }}>{avgEarning.toFixed(2)} DT</div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="stat-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <Calendar size={20} color="#9b59b6" />
            <span style={{ fontSize: '0.85rem', color: '#888' }}>Aujourd'hui</span>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#9b59b6' }}>{todayEarnings.toFixed(2)} DT</div>
          <div style={{ fontSize: '0.75rem', color: '#aaa', marginTop: '4px' }}>{todayDeliveries} livraison(s)</div>
        </motion.div>
      </div>

      {/* Date filter */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {[
          { key: 'all', label: 'Tout' },
          { key: 'today', label: 'Aujourd\'hui' },
          { key: 'week', label: 'Cette semaine' },
          { key: 'month', label: 'Ce mois' },
        ].map(opt => (
          <button
            key={opt.key}
            onClick={() => setDateRange(opt.key)}
            style={{
              padding: '10px 20px',
              borderRadius: '12px',
              border: 'none',
              background: dateRange === opt.key ? '#27ae60' : 'rgba(0,0,0,0.04)',
              color: dateRange === opt.key ? 'white' : '#555',
              fontWeight: 600,
              fontSize: '0.9rem',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Weekly chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card-animal"
        style={{ padding: '24px', marginBottom: '24px' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
          <BarChart3 size={20} color="#333" />
          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>Activité des 7 derniers jours</h3>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px', height: '200px', paddingBottom: '30px', position: 'relative' }}>
          {chartData.map((d, i) => (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              <div style={{ position: 'relative', width: '100%', display: 'flex', justifyContent: 'center' }}>
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${(d.earnings / maxEarnings) * 160}px` }}
                  transition={{ delay: i * 0.05, duration: 0.5 }}
                  style={{
                    width: '100%',
                    maxWidth: '50px',
                    background: d.earnings > 0 ? 'linear-gradient(to top, #27ae60, #2ecc71)' : '#e5e7eb',
                    borderRadius: '8px 8px 0 0',
                    minHeight: d.earnings > 0 ? '4px' : '4px',
                  }}
                />
                {d.earnings > 0 && (
                  <div style={{
                    position: 'absolute',
                    top: '-22px',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    color: '#27ae60',
                    whiteSpace: 'nowrap',
                  }}>
                    {d.earnings.toFixed(0)} DT
                  </div>
                )}
              </div>
              <span style={{ fontSize: '0.7rem', color: '#888', textAlign: 'center' }}>{d.label}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Earnings history */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card-animal"
        style={{ padding: '24px' }}
      >
        <h3 style={{ margin: '0 0 20px', fontSize: '1.1rem', fontWeight: 700 }}>
          📜 Historique des gains
        </h3>
        {filteredOrders.length === 0 ? (
          <p style={{ color: '#999', textAlign: 'center', padding: '20px' }}>
            Aucun gain pour cette période
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {filteredOrders.map((order, i) => (
              <motion.div
                key={order._id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  padding: '14px 16px',
                  background: 'rgba(0,0,0,0.02)',
                  borderRadius: '12px',
                }}
              >
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  background: 'rgba(39,174,96,0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <CreditCard size={18} color="#27ae60" />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: '0.95rem' }}>
                    Commande #{order._id?.slice(-6)}
                  </p>
                  <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#888' }}>
                    {order.address || 'Adresse non spécifiée'}
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ margin: 0, fontWeight: 700, color: '#27ae60', fontSize: '1rem' }}>
                    +{getLivreurCommission(order).toFixed(2)} DT
                  </p>
                  <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: '#aaa' }}>
                    Commande {order.total} DT · {order.createdAt ? new Date(order.createdAt).toLocaleDateString('fr-FR') : ''}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default LivreurEarningsPage;

