import React, { useEffect, useState } from 'react';
import api from '../utils/api';

const OrderTrackingPanel = ({ orderId }) => {
  const [tracking, setTracking] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const { data } = await api.get(`/orders/${orderId}/tracking`);
      setTracking(data);
    } catch {
      setTracking(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!orderId) return undefined;
    load();
    const t = setInterval(load, 20000);
    return () => clearInterval(t);
  }, [orderId]);

  if (loading) return <p style={{ fontSize: 13, color: '#6b7280' }}>Chargement du suivi…</p>;
  if (!tracking || tracking.status !== 'shipped') return null;

  const gps = tracking.livreur?.gps;

  return (
    <div style={{
      marginTop: 14,
      padding: 16,
      borderRadius: 14,
      background: 'linear-gradient(135deg, #eff6ff 0%, #ecfdf5 100%)',
      border: '1px solid #bfdbfe',
    }}>
      <p style={{ margin: '0 0 10px', fontWeight: 800, color: '#1d4ed8', fontSize: 14 }}>
        🚚 Livraison en cours
      </p>
      {tracking.livreur?.name && (
        <p style={{ margin: '0 0 6px', fontSize: 13, color: '#374151' }}>
          Livreur : <strong>{tracking.livreur.name}</strong>
        </p>
      )}
      {gps?.lat != null && (
        <a
          href={`https://www.google.com/maps?q=${gps.lat},${gps.lng}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-block',
            marginTop: 10,
            fontSize: 13,
            fontWeight: 700,
            color: '#059669',
          }}
        >
          Voir position livreur sur la carte →
        </a>
      )}
    </div>
  );
};

export default OrderTrackingPanel;
