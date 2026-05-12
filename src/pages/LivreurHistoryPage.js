import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import api from '../utils/api';

const LivreurHistoryPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await api.get('/orders');
      setOrders((res.data || []).filter(o => o.status === 'delivered'));
    } catch (error) {
      console.error('History error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: '16px', animation: 'float 2s ease-in-out infinite' }}>📜</div>
        <p style={{ color: '#888' }}>Chargement...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1000px', margin: '0 auto' }}>
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '24px' }}
      >
        📜 Historique des livraisons
      </motion.h1>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {orders.length === 0 ? (
          <p style={{ color: '#999', textAlign: 'center', padding: '40px' }}>Aucune livraison effectuée</p>
        ) : (
          orders.map((order, i) => (
            <motion.div
              key={order._id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                padding: '16px 20px',
                background: 'white',
                borderRadius: '14px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              }}
            >
              <div style={{ fontSize: '1.5rem' }}>✅</div>
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontWeight: 700 }}>Commande #{order._id?.slice(-6)}</p>
                <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: '#888' }}>
                  {order.address || 'Adresse non spécifiée'}
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ margin: 0, fontWeight: 700, color: '#27ae60' }}>{order.total} DT</p>
                <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: '#aaa' }}>
                  {order.createdAt ? new Date(order.createdAt).toLocaleDateString('fr-FR') : ''}
                </p>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default LivreurHistoryPage;

