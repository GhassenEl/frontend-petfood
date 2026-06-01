import React, { useCallback, useEffect, useState } from 'react';
import { MapPin, Navigation, Phone, Package, RefreshCw } from 'lucide-react';
import api from '../utils/api';
import DeliveryProofModal from './DeliveryProofModal';

const oid = (o) => o?.id || o?._id;

const LivreurMissionPanel = ({ onMissionChange }) => {
  const [mission, setMission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [proofOrder, setProofOrder] = useState(null);

  const load = useCallback(async () => {
    try {
      const { data } = await api.get('/livreur/mission');
      setMission(data);
      onMissionChange?.(data);
    } catch (e) {
      console.error('Mission load error:', e);
    } finally {
      setLoading(false);
    }
  }, [onMissionChange]);

  useEffect(() => {
    load();
    const t = setInterval(load, 30000);
    return () => clearInterval(t);
  }, [load]);

  const completeDelivery = async (payload) => {
    const id = oid(proofOrder);
    const res = await api.post(`/livreur/orders/${id}/complete`, payload);
    setProofOrder(null);
    await load();
    return res;
  };

  if (loading) {
    return (
      <div style={panelStyle}>
        <p style={{ margin: 0, color: '#94a3b8', textAlign: 'center' }}>Chargement mission…</p>
      </div>
    );
  }

  if (!mission?.active) {
    return (
      <div style={{ ...panelStyle, background: 'linear-gradient(135deg, #f8fafc, #ecfdf5)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>✅</div>
          <p style={{ margin: 0, fontWeight: 700, color: '#334155' }}>Aucune course active</p>
          <p style={{ margin: '6px 0 0', fontSize: 13, color: '#64748b' }}>Prenez une commande depuis le pool ci-dessous</p>
        </div>
      </div>
    );
  }

  const { order, navigation } = mission;

  return (
    <>
      <div style={{ ...panelStyle, border: '2px solid #059669', background: 'linear-gradient(135deg, #ecfdf5 0%, #ffffff 100%)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 14 }}>
          <div>
            <span style={{ fontSize: 11, fontWeight: 800, color: '#047857', letterSpacing: 1 }}>MISSION EN COURS</span>
            <h3 style={{ margin: '4px 0 0', fontSize: '1.2rem', fontWeight: 800 }}>
              #{String(oid(order)).slice(-6)} · {order.total} DT
            </h3>
            {order.clientName && (
              <p style={{ margin: '4px 0 0', fontSize: 13, color: '#64748b' }}>Client : {order.clientName}</p>
            )}
          </div>
          <button type="button" onClick={load} style={refreshBtn} title="Actualiser">
            <RefreshCw size={16} />
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 12 }}>
          <MapPin size={18} color="#059669" style={{ flexShrink: 0, marginTop: 2 }} />
          <p style={{ margin: 0, fontSize: 14, color: '#334155', lineHeight: 1.4 }}>{order.address || 'Adresse non renseignée'}</p>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
          {navigation?.distanceKm != null && (
            <Badge>📍 {navigation.distanceKm} km</Badge>
          )}
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {navigation?.mapsUrl && (
            <a href={navigation.mapsUrl} target="_blank" rel="noopener noreferrer" style={actionBtn}>
              <Navigation size={16} /> Itinéraire
            </a>
          )}
          {order.phone && (
            <a href={`tel:${order.phone}`} style={{ ...actionBtn, background: '#eff6ff', color: '#1d4ed8' }}>
              <Phone size={16} /> Appeler
            </a>
          )}
          <button type="button" onClick={() => setProofOrder(order)} style={{ ...actionBtn, background: '#059669', color: 'white', border: 'none' }}>
            <Package size={16} /> Clôturer livraison
          </button>
        </div>
      </div>

      {proofOrder && (
        <DeliveryProofModal
          orderId={oid(proofOrder)}
          orderLabel={`#${String(oid(proofOrder)).slice(-6)}`}
          onClose={() => setProofOrder(null)}
          onComplete={completeDelivery}
        />
      )}
    </>
  );
};

const Badge = ({ children }) => (
  <span style={{
    padding: '6px 10px',
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 700,
    background: '#f1f5f9',
    color: '#475569',
  }}>
    {children}
  </span>
);

const panelStyle = {
  padding: 20,
  borderRadius: 18,
  marginBottom: 20,
  boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
};

const refreshBtn = {
  background: 'white',
  border: '1px solid #e5e7eb',
  borderRadius: 10,
  padding: 8,
  cursor: 'pointer',
  color: '#64748b',
};

const actionBtn = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  padding: '10px 14px',
  borderRadius: 12,
  background: '#ecfdf5',
  color: '#047857',
  fontWeight: 700,
  fontSize: 13,
  textDecoration: 'none',
  cursor: 'pointer',
};

export default LivreurMissionPanel;
