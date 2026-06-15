import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Navigation } from 'lucide-react';
import api from '../utils/api';
import { DEMO_LIVREUR_ORDERS, withDemoFallback } from '../utils/livreurDemoData';
import LivreurDeliveryMap, { getOrderCoords } from '../components/LivreurDeliveryMap';
import usePlatformRefresh from '../hooks/usePlatformRefresh';

const LivreurMapPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const res = await api.get('/orders');
      const all = withDemoFallback(res.data || [], DEMO_LIVREUR_ORDERS);
      setOrders(
        all.filter((o) => ['pending', 'shipped'].includes(o.status))
      );
    } catch (error) {
      console.error('Map orders error:', error);
      setOrders(DEMO_LIVREUR_ORDERS.filter((o) => ['pending', 'shipped'].includes(o.status)));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  usePlatformRefresh(fetchOrders);

  const withGps = orders.filter((o) => getOrderCoords(o));
  const withoutGps = orders.filter((o) => !getOrderCoords(o));

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🗺️</div>
        <p style={{ color: '#888' }}>Chargement de la carte...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '24px' }}>
        <h1 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 800 }}>🗺️ Carte des livraisons</h1>
        <p style={{ color: '#888', marginTop: '8px' }}>
          {orders.length} livraison(s) · {withGps.length} avec GPS
        </p>
      </motion.div>

      <LivreurDeliveryMap orders={orders} height={440} />

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '20px',
          marginTop: 24,
        }}
      >
        {[...withGps, ...withoutGps].map((order, i) => {
          const coords = getOrderCoords(order);
          const mapsQuery = encodeURIComponent(order.address || 'Tunis');
          return (
            <motion.div
              key={order._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="card-animal"
              style={{ padding: '20px' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    background: 'rgba(39,174,96,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <MapPin size={20} color="#27ae60" />
                </div>
                <div>
                  <p style={{ margin: 0, fontWeight: 700 }}>#{order._id?.slice(-6)}</p>
                  <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#888' }}>
                    {order.region && `${order.region} · `}{order.total} DT · {order.status}
                  </p>
                </div>
              </div>
              <p style={{ margin: '0 0 12px', fontSize: '0.9rem', color: '#555' }}>
                <strong>Adresse:</strong> {order.address || 'Non spécifiée'}
              </p>
              <p style={{ margin: '0 0 12px', fontSize: '0.9rem', color: '#555' }}>
                <strong>Téléphone:</strong> {order.phone || 'Non spécifié'}
              </p>
              <a
                href={
                  coords
                    ? `https://www.google.com/maps/dir/?api=1&destination=${coords.lat},${coords.lng}`
                    : `https://www.google.com/maps/search/?api=1&query=${mapsQuery}`
                }
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '10px 16px',
                  background: '#27ae60',
                  color: 'white',
                  borderRadius: 10,
                  textDecoration: 'none',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                }}
              >
                <Navigation size={16} />
                Itinéraire
              </a>
            </motion.div>
          );
        })}
      </div>

      {orders.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#999' }}>
          <div style={{ fontSize: '4rem', marginBottom: '16px' }}>🎉</div>
          <p>Aucune livraison en cours</p>
        </div>
      )}
    </div>
  );
};

export default LivreurMapPage;
