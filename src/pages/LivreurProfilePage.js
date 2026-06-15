import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import api from '../utils/api';
import usePlatformRefresh from '../hooks/usePlatformRefresh';
import RegionSelect from '../components/RegionSelect';

const LivreurProfilePage = () => {
  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '', region: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const fetchProfile = async () => {
    try {
      const res = await api.get('/users/profile');
      setForm({
        name: res.data?.name || '',
        email: res.data?.email || '',
        phone: res.data?.phone || '',
        address: res.data?.address || '',
        region: res.data?.region || '',
      });
    } catch (error) {
      console.error('Profile error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  usePlatformRefresh(fetchProfile);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      await api.put('/users/profile', {
        name: form.name,
        phone: form.phone,
        address: form.address,
        region: form.region || null,
      });
      setMessage('✅ Profil mis à jour');
    } catch (error) {
      setMessage('❌ ' + (error.response?.data?.error || 'Erreur'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <p style={{ color: '#888' }}>Chargement...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', maxWidth: '560px', margin: '0 auto' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ background: 'white', borderRadius: '24px', padding: '32px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}
      >
        <h1 style={{ margin: '0 0 8px', fontSize: '1.5rem', fontWeight: 800 }}>👤 Mon profil</h1>
        <p style={{ margin: '0 0 24px', color: '#888', fontSize: '0.9rem' }}>{form.email}</p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <label style={{ fontWeight: 600, fontSize: '0.85rem' }}>
            Nom
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              style={inputStyle}
            />
          </label>
          <label style={{ fontWeight: 600, fontSize: '0.85rem' }}>
            Téléphone
            <input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              style={inputStyle}
            />
          </label>
          <label style={{ fontWeight: 600, fontSize: '0.85rem' }}>
            Adresse
            <input
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              style={inputStyle}
            />
          </label>
          <RegionSelect
            label="Zone de livraison"
            value={form.region}
            onChange={(region) => setForm({ ...form, region })}
            hint="Région où vous effectuez vos livraisons — visible par l'administration."
            showIcon
          />
          {message && <p style={{ margin: 0, fontWeight: 600 }}>{message}</p>}
          <button type="submit" disabled={saving} style={saveBtnStyle}>
            {saving ? 'Enregistrement...' : '💾 Enregistrer'}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

const inputStyle = {
  width: '100%',
  marginTop: 6,
  padding: '12px 14px',
  borderRadius: 12,
  border: '1px solid #e5e7eb',
  boxSizing: 'border-box',
  fontSize: 14,
};

const saveBtnStyle = {
  padding: '12px 18px',
  background: 'linear-gradient(135deg, #27ae60, #2ecc71)',
  color: 'white',
  border: 'none',
  borderRadius: 12,
  fontWeight: 700,
  cursor: 'pointer',
};

export default LivreurProfilePage;
