import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Phone, Clock, Navigation, Store } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import usePlatformCity from '../hooks/usePlatformCity';

const StoreLocatorPage = () => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [nearbyStores, setNearbyStores] = useState([]);
  const { selectedCity } = usePlatformCity();

  useEffect(() => {
    const fetchStores = async () => {
      try {
        const params = selectedCity ? { city: selectedCity } : {};
        const res = await api.get('/users/store-locations', { params });
        setStores(res.data || []);
      } catch (error) {
        console.error('Stores error', error);
        setStores([]);
      } finally {
        setLoading(false);
      }
    };

    const fetchNearbyStores = async (lat, lng) => {
      try {
        const q = new URLSearchParams({ lat, lng, radius: 80 });
        if (selectedCity) q.set('city', selectedCity);
        const res = await api.get(`/users/store-locations?${q}`);
        setNearbyStores(res.data || []);
      } catch (error) {
        console.error('Nearby stores error', error);
      }
    };

    const getUserLocation = async () => {
      try {
        if (navigator.permissions) {
          const perm = await navigator.permissions.query({ name: 'geolocation' });
          if (perm.state === 'denied') {
            fetchNearbyStores(36.8065, 10.1815);
            return;
          }
        }
      } catch {
        /* permissions API indisponible */
      }

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
            setUserLocation(loc);
            fetchNearbyStores(loc.lat, loc.lng);
          },
          () => {
            fetchNearbyStores(36.8065, 10.1815);
          },
          { timeout: 10000, maximumAge: 120000 }
        );
      } else {
        fetchNearbyStores(36.8065, 10.1815);
      }
    };

    fetchStores();
    getUserLocation();
  }, [selectedCity]);

  const openInMaps = (lat, lng, name) => {
    window.open(`https://www.google.com/maps?q=${lat},${lng}(${encodeURIComponent(name)})`, '_blank');
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
        <div style={{ fontSize: '3rem', animation: 'float 2s ease-in-out infinite' }}>🐾</div>
        <p style={{ color: '#888' }}>Chargement des magasins...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          background: 'linear-gradient(135deg, rgba(230,126,34,0.08) 0%, rgba(39,174,96,0.06) 100%)',
          borderRadius: '24px',
          padding: '32px',
          marginBottom: '28px',
          border: '1px solid rgba(230,126,34,0.1)',
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🏪</div>
        <h1 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 800, color: '#333' }}>
          Nos Magasins PetfoodTN
        </h1>
        <p style={{ margin: '8px 0 0', color: '#777', fontSize: '0.95rem' }}>
          {selectedCity ? `Magasins et services à ${selectedCity}` : 'Trouvez le magasin le plus proche de chez vous'} 🐕🐈
        </p>
        <p style={{ margin: '12px 0 0', fontSize: '0.9rem' }}>
          <Link to="/client-cities" style={{ color: '#0d9488', fontWeight: 700, marginRight: 12 }}>
            Voir toutes nos villes →
          </Link>
          <Link to="/client-relay-points" style={{ color: '#1d4ed8', fontWeight: 700 }}>
            Points relais partenaires →
          </Link>
        </p>
        {userLocation && (
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            marginTop: '12px',
            padding: '6px 14px',
            background: 'rgba(39,174,96,0.1)',
            color: '#27ae60',
            borderRadius: '20px',
            fontSize: '0.8rem',
            fontWeight: 600,
          }}>
            <MapPin size={14} /> Localisation activée
          </span>
        )}
      </motion.div>

      {/* Nearby Stores */}
      {nearbyStores.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{ marginBottom: '32px' }}
        >
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Navigation size={20} color="#e67e22" /> Près de vous
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            {nearbyStores.map((store, i) => (
              <motion.div
                key={store.id}
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                transition={{ delay: 0.3 + i * 0.1 }}
                style={{
                  background: 'white',
                  borderRadius: '18px',
                  padding: '20px',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
                  border: '2px solid rgba(230,126,34,0.15)',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <div style={{
                  position: 'absolute',
                  top: '-20px',
                  right: '-20px',
                  width: '80px',
                  height: '80px',
                  background: 'rgba(230,126,34,0.06)',
                  borderRadius: '50%',
                }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    background: 'linear-gradient(135deg, #e67e22, #d35400)',
                    borderRadius: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    boxShadow: '0 4px 14px rgba(230,126,34,0.3)',
                  }}>
                    <Store size={24} />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#333' }}>{store.name}</h3>
                    {store.distance && (
                      <span style={{ fontSize: '0.8rem', color: '#e67e22', fontWeight: 600 }}>
                        {Math.round(store.distance * 10) / 10} km
                      </span>
                    )}
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#555' }}>
                    <MapPin size={14} color="#888" /> {store.address}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#555' }}>
                    <Phone size={14} color="#888" /> {store.phone}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#555' }}>
                    <Clock size={14} color="#888" /> {store.hours}
                  </div>
                </div>
                <button
                  onClick={() => openInMaps(store.lat, store.lng, store.name)}
                  style={{
                    marginTop: '14px',
                    width: '100%',
                    padding: '10px',
                    background: 'linear-gradient(135deg, #e67e22, #d35400)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    boxShadow: '0 4px 14px rgba(230,126,34,0.3)',
                    transition: 'transform 0.2s',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                  <Navigation size={16} /> Ouvrir dans Maps
                </button>
              </motion.div>
            ))}
          </div>
        </motion.section>
      )}

      {/* All Stores */}
      <motion.section
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Store size={20} color="#27ae60" /> Tous nos magasins
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          {stores.map((store, i) => (
            <motion.div
              key={store.id}
              variants={itemVariants}
              style={{
                background: 'white',
                borderRadius: '18px',
                padding: '20px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
                border: '1px solid #f0f0f0',
                transition: 'transform 0.3s, box-shadow 0.3s',
              }}
              whileHover={{ y: -4, boxShadow: '0 12px 40px rgba(0,0,0,0.1)' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <div style={{
                  width: '44px',
                  height: '44px',
                  background: 'linear-gradient(135deg, #27ae60, #2ecc71)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                }}>
                  <Store size={20} />
                </div>
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#333' }}>{store.name}</h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#555' }}>
                  <MapPin size={14} color="#888" /> {store.address}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#555' }}>
                  <Phone size={14} color="#888" /> {store.phone}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#555' }}>
                  <Clock size={14} color="#888" /> {store.hours}
                </div>
              </div>
              <button
                onClick={() => openInMaps(store.lat, store.lng, store.name)}
                style={{
                  marginTop: '14px',
                  width: '100%',
                  padding: '10px',
                  background: '#f9fafb',
                  color: '#333',
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#e67e22';
                  e.currentTarget.style.color = 'white';
                  e.currentTarget.style.borderColor = '#e67e22';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#f9fafb';
                  e.currentTarget.style.color = '#333';
                  e.currentTarget.style.borderColor = '#e5e7eb';
                }}
              >
                <Navigation size={16} /> Voir sur la carte
              </button>
            </motion.div>
          ))}
        </div>
      </motion.section>
    </div>
  );
};

export default StoreLocatorPage;

