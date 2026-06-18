import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Phone, Clock, Navigation, Store } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { DEMO_STORE_LOCATIONS } from '../utils/clientDemoData';

const StoreLocatorPage = () => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStores = async () => {
      try {
        const res = await api.get('/users/store-locations');
        const list = res.data || [];
        setStores(list.length ? list : DEMO_STORE_LOCATIONS);
      } catch (error) {
        console.error('Stores error', error);
        setStores(DEMO_STORE_LOCATIONS);
      } finally {
        setLoading(false);
      }
    };

    fetchStores();
  }, []);

  const openInMaps = (lat, lng, name) => {
    window.open(`https://www.google.com/maps?q=${lat},${lng}(${encodeURIComponent(name)})`, '_blank');
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
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
          Tous nos points de vente partenaires en Tunisie 🐕🐈
        </p>
        <p style={{ margin: '12px 0 0', fontSize: '0.9rem' }}>
          <Link to="/client-relay-points" style={{ color: '#1d4ed8', fontWeight: 700 }}>
            Points relais partenaires →
          </Link>
        </p>
      </motion.div>

      <motion.section
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Store size={20} color="#27ae60" /> Tous nos magasins ({stores.length})
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          {stores.map((store, i) => (
            <motion.div
              key={store.id || `store-${i}`}
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
                type="button"
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
