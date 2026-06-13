import React, { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Navigation, MapPin, Route, RefreshCw, Phone } from 'lucide-react';
import api from '../utils/api';
import { withDemoRoute } from '../utils/livreurDemoData';
import LivreurDeliveryMap from '../components/LivreurDeliveryMap';
import LivreurMissionPanel from '../components/LivreurMissionPanel';
import useLivreurGps from '../hooks/useLivreurGps';

const LivreurRoutePage = () => {
  const [route, setRoute] = useState(null);
  const [loading, setLoading] = useState(true);
  const [gps, setGps] = useState(null);

  const loadRoute = useCallback(async (coords) => {
    setLoading(true);
    try {
      const qs = coords ? `?lat=${coords.lat}&lng=${coords.lng}` : '';
      const { data } = await api.get(`/livreur/route${qs}`);
      setRoute(withDemoRoute(data));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRoute();
  }, [loadRoute]);

  const useMyPosition = () => {
    if (!navigator.geolocation) {
      window.alert('GPS non disponible sur cet appareil');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setGps(coords);
        try {
          await api.post('/livreur/gps', coords);
        } catch { /* ignore */ }
        loadRoute(coords);
      },
      () => window.alert('Impossible d\'obtenir votre position')
    );
  };

  const orders = route?.stops?.map((s) => s.order) || [];
  const hasStops = (route?.stops || []).length > 0;
  useLivreurGps(hasStops);

  if (loading && !route) {
    return <div style={{ padding: 40, textAlign: 'center' }}>Calcul de la tournée…</div>;
  }

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 10 }}>
          <Route color="#059669" /> Tournée optimisée
        </h1>
        <p style={{ color: '#64748b', marginTop: 8 }}>
          Ordre suggéré par GPS pour une tournée fluide
        </p>
      </motion.div>

      {route?.summary && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 20 }}>
          <Kpi icon="📍" label="Arrêts" value={route.summary.stopCount} />
          <Kpi icon="🛣️" label="Distance est." value={`${route.summary.estimatedKm} km`} />
          <Kpi icon="⏱️" label="Durée est." value={`${route.summary.estimatedMinutes} min`} />
        </div>
      )}

      <LivreurMissionPanel />

      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <button type="button" onClick={useMyPosition} style={btnPrimary}>
          <Navigation size={16} /> Optimiser depuis ma position
        </button>
        <button type="button" onClick={() => loadRoute(gps)} style={btnOutline}>
          <RefreshCw size={16} /> Actualiser
        </button>
        {gps && <span style={{ fontSize: 13, color: '#64748b', alignSelf: 'center' }}>GPS : {gps.lat.toFixed(4)}, {gps.lng.toFixed(4)}</span>}
      </div>

      <LivreurDeliveryMap orders={orders} height={360} />

      <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {(route?.stops || []).length === 0 ? (
          <p style={{ textAlign: 'center', color: '#94a3b8', padding: 32 }}>Aucun arrêt en cours — revenez plus tard 🎉</p>
        ) : (
          route.stops.map(({ order, stopNumber, distanceKm, hasGps, mapsUrl }) => (
            <div key={order.id || order._id} style={stopCard}>
              <div style={{
                width: 36, height: 36, borderRadius: '50%', background: '#059669', color: 'white',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, flexShrink: 0,
              }}>
                {stopNumber}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  #{String(order.id || order._id).slice(-6)} · {order.total} DT
                </div>
                <div style={{ fontSize: 13, color: '#64748b', display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
                  <MapPin size={14} /> {order.address || 'Adresse non renseignée'}
                </div>
                <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>
                  {order.status === 'shipped' ? '🚚 En livraison' : '⏳ En attente'} · ~{distanceKm} km {hasGps ? '· GPS ✓' : ''}
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <a href={mapsUrl} target="_blank" rel="noopener noreferrer" style={linkBtn}>Itinéraire</a>
                {order.phone && (
                  <a href={`tel:${order.phone}`} style={{ ...linkBtn, background: '#eff6ff', color: '#1d4ed8' }}>
                    <Phone size={12} style={{ verticalAlign: 'middle' }} /> Appeler
                  </a>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const Kpi = ({ icon, label, value }) => (
  <div style={{ background: 'white', borderRadius: 16, padding: '14px 16px', border: '1px solid #e5e7eb', textAlign: 'center' }}>
    <div style={{ fontSize: 20 }}>{icon}</div>
    <div style={{ fontSize: 20, fontWeight: 800, marginTop: 4 }}>{value}</div>
    <div style={{ fontSize: 11, color: '#64748b' }}>{label}</div>
  </div>
);

const stopCard = {
  display: 'flex', gap: 14, alignItems: 'center', padding: 16, background: 'white',
  borderRadius: 16, border: '1px solid #e5e7eb', boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
};

const btnPrimary = {
  display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 18px',
  background: '#059669', color: 'white', border: 'none', borderRadius: 12, fontWeight: 700, cursor: 'pointer',
};

const btnOutline = {
  display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 18px',
  background: 'white', color: '#059669', border: '2px solid #059669', borderRadius: 12, fontWeight: 700, cursor: 'pointer',
};

const linkBtn = {
  padding: '8px 12px', borderRadius: 10, background: '#ecfdf5', color: '#047857',
  fontWeight: 700, fontSize: 12, textDecoration: 'none', textAlign: 'center',
};

export default LivreurRoutePage;
