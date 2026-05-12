import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import api from '../utils/api';

const LivreurDashboard = () => {
  const [stats, setStats] = useState({
    todayDeliveries: 0,
    pendingDeliveries: 0,
    totalDeliveries: 0,
    rating: 0
  });
  const [todayOrders, setTodayOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const ordersRes = await api.get('/orders');
      const orders = ordersRes.data || [];
      
      const today = new Date().toISOString().split('T')[0];
      const todayOrders = orders.filter(o => 
        o.createdAt && o.createdAt.startsWith(today)
      );
      
      setStats({
        todayDeliveries: todayOrders.filter(o => o.status === 'delivered').length,
        pendingDeliveries: orders.filter(o => o.status === 'shipped').length,
        totalDeliveries: orders.filter(o => o.status === 'delivered').length,
        rating: 4.8
      });
      
      setTodayOrders(orders.filter(o => ['pending', 'shipped'].includes(o.status)).slice(0, 5));
    } catch (error) {
      console.error('Livreur dashboard error:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (orderId, status) => {
    try {
      await api.put(`/orders/${orderId}`, { status });
      fetchData();
    } catch (error) {
      window.alert('Erreur mise à jour statut');
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: '16px', animation: 'float 2s ease-in-out infinite' }}>🚚</div>
        <p style={{ color: '#888' }}>Chargement...</p>
      </div>
    );
  }

  const statCards = [
    { label: 'Livraisons aujourd\'hui', value: stats.todayDeliveries, icon: '📦', color: '#27ae60' },
    { label: 'En attente', value: stats.pendingDeliveries, icon: '⏳', color: '#f39c12' },
    { label: 'Total livrées', value: stats.totalDeliveries, icon: '✅', color: '#3498db' },
    { label: 'Note', value: `${stats.rating}⭐`, icon: '⭐', color: '#e67e22' },
  ];

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          background: 'linear-gradient(135deg, rgba(39,174,96,0.08) 0%, rgba(46,204,113,0.06) 100%)',
          borderRadius: '24px',
          padding: '32px',
          marginBottom: '28px',
          border: '1px solid rgba(39,174,96,0.1)',
        }}
      >
        <h1 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 800, color: '#333' }}>
          🚚 Bonjour, Livreur !
        </h1>
        <p style={{ margin: '8px 0 0', color: '#777' }}>
          Voici vos livraisons du jour
        </p>
      </motion.div>

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
            transition={{ delay: i * 0.1 }}
            className="stat-card"
          >
            <div style={{ fontSize: '2rem', marginBottom: '8px' }}>{card.icon}</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: card.color }}>{card.value}</div>
            <div style={{ fontSize: '0.85rem', color: '#888', marginTop: '4px' }}>{card.label}</div>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="card-animal"
        style={{ padding: '24px' }}
      >
        <h3 style={{ margin: '0 0 20px', fontSize: '1.1rem', fontWeight: 700 }}>
          📦 Commandes à livrer
        </h3>
        {todayOrders.length === 0 ? (
          <p style={{ color: '#999', textAlign: 'center', padding: '20px' }}>
            Aucune commande en attente 🎉
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {todayOrders.map(order => (
              <div key={order._id} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                padding: '16px',
                background: 'rgba(0,0,0,0.02)',
                borderRadius: '14px',
              }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: order.status === 'shipped' ? 'rgba(243,156,18,0.1)' : 'rgba(39,174,96,0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem',
                }}>
                  📦
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontWeight: 700 }}>Commande #{order._id?.slice(-6)}</p>
                  <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: '#888' }}>
                    {order.address || 'Adresse non spécifiée'} — {order.total} DT
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {order.status === 'pending' && (
                    <button
                      onClick={() => updateStatus(order._id, 'shipped')}
                      style={{
                        padding: '8px 16px',
                        background: '#f39c12',
                        color: 'white',
                        border: 'none',
                        borderRadius: '10px',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      🚚 Prendre
                    </button>
                  )}
                  {order.status === 'shipped' && (
                    <button
                      onClick={() => updateStatus(order._id, 'delivered')}
                      style={{
                        padding: '8px 16px',
                        background: '#27ae60',
                        color: 'white',
                        border: 'none',
                        borderRadius: '10px',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      ✅ Livrée
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default LivreurDashboard;

