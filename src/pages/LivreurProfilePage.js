import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import api from '../utils/api';

const LivreurProfilePage = () => {
  const [profile, setProfile] = useState(null);
const [loading, setLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get('/users/profile');
      setProfile(res.data);
    } catch (error) {
      console.error('Profile error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: '16px', animation: 'float 2s ease-in-out infinite' }}>👤</div>
        <p style={{ color: '#888' }}>Chargement...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', maxWidth: '600px', margin: '0 auto' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          background: 'white',
          borderRadius: '24px',
          padding: '40px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
          textAlign: 'center',
        }}
      >
        {!imageError ? (
          <img 
            src="https://images.unsplash.com/photo-1558618047-3c8c76bbb17e?w=300&h=300&fit=crop&crop=face" 
            alt="Livreur Profile" 
            className="w-[100px] h-[100px] rounded-full object-cover mx-auto mb-6 shadow-2xl ring-4 ring-emerald-200/50 hover:scale-105 transition-transform duration-300 cursor-pointer drop-shadow-lg block" 
            onError={() => setImageError(true)}
          />
        ) : (
          <div 
            className="w-[100px] h-[100px] rounded-full mx-auto mb-6 shadow-2xl ring-4 ring-emerald-200/50 flex items-center justify-center drop-shadow-lg" 
            style={{
              background: 'linear-gradient(135deg,#27ae60,#2ecc71)',
              fontSize: '3rem',
              boxShadow: '0 8px 24px rgba(39,174,96,0.3)'
            }}
          >
            🚚
          </div>
        )}

        <h1 style={{ margin: '0 0 8px', fontSize: '1.5rem', fontWeight: 800 }}>
          {profile?.name || 'Livreur'}
        </h1>
        <p style={{ margin: '0 0 24px', color: '#888', fontSize: '0.9rem' }}>
          {profile?.email || 'livreur@petfood.tn'}
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', textAlign: 'left' }}>
          <div style={{ padding: '16px', background: 'rgba(0,0,0,0.02)', borderRadius: '12px' }}>
            <p style={{ margin: '0 0 4px', fontSize: '0.8rem', color: '#888' }}>Téléphone</p>
            <p style={{ margin: 0, fontWeight: 600 }}>{profile?.phone || 'Non renseigné'}</p>
          </div>
          <div style={{ padding: '16px', background: 'rgba(0,0,0,0.02)', borderRadius: '12px' }}>
            <p style={{ margin: '0 0 4px', fontSize: '0.8rem', color: '#888' }}>Adresse</p>
            <p style={{ margin: 0, fontWeight: 600 }}>{profile?.address || 'Non renseignée'}</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default LivreurProfilePage;

