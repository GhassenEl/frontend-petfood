import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import usePlatformRefresh from '../hooks/usePlatformRefresh';

const VetProfilePage = () => {
  const [form, setForm] = useState({ name: '', email: '', phone: '' });
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
      await api.put('/users/profile', { name: form.name, phone: form.phone });
      setMessage('✅ Profil mis à jour');
    } catch (error) {
      setMessage('❌ ' + (error.response?.data?.error || 'Erreur'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div style={{ padding: 40, textAlign: 'center' }}>Chargement...</div>;
  }

  return (
    <div style={{ padding: 24, maxWidth: 560, margin: '0 auto' }}>
      <div style={{ background: 'white', borderRadius: 24, padding: 32, boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
        <div style={{ fontSize: '3rem', textAlign: 'center', marginBottom: 12 }}>🩺</div>
        <h1 style={{ margin: '0 0 8px', fontSize: '1.5rem', fontWeight: 800, textAlign: 'center' }}>Mon profil</h1>
        <p style={{ margin: '0 0 24px', color: '#888', textAlign: 'center' }}>{form.email}</p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <label style={{ fontWeight: 600, fontSize: '0.85rem' }}>
            Nom
            <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} style={inputStyle} />
          </label>
          <label style={{ fontWeight: 600, fontSize: '0.85rem' }}>
            Téléphone
            <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} style={inputStyle} />
          </label>
          {message && <p style={{ margin: 0, fontWeight: 600 }}>{message}</p>}
          <button type="submit" disabled={saving} style={saveBtnStyle}>
            {saving ? 'Enregistrement...' : '💾 Enregistrer'}
          </button>
        </form>
      </div>
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
};

const saveBtnStyle = {
  padding: '12px 18px',
  background: 'linear-gradient(135deg, #0ea5e9, #0284c7)',
  color: 'white',
  border: 'none',
  borderRadius: 12,
  fontWeight: 700,
  cursor: 'pointer',
};

export default VetProfilePage;
