import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { validatePassword, getPasswordStrength } from '../utils/loginValidation';
import { mapAuthError } from '../utils/authErrors';
import RegionSelect from '../components/RegionSelect';

const TABS = [
  { id: 'profile', label: 'Profil', icon: '👤' },
  { id: 'password', label: 'Mot de passe', icon: '🔐' },
];

const AdminProfilePage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('profile');
  const [profile, setProfile] = useState({ name: '', email: '', phone: '', address: '', region: '' });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get('/users/profile');
      setProfile({
        name: res.data.name || '',
        email: res.data.email || '',
        phone: res.data.phone || '',
        address: res.data.address || '',
        region: res.data.region || '',
      });
    } catch (error) {
      setMessage({ type: 'error', text: 'Impossible de charger le profil.' });
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!profile.name.trim()) {
      setMessage({ type: 'error', text: 'Le nom est requis.' });
      return;
    }
    setSaving(true);
    setMessage(null);
    try {
      await api.put('/users/profile', { ...profile, name: profile.name.trim() });
      setMessage({ type: 'success', text: 'Profil mis à jour avec succès.' });
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.error || 'Erreur lors de la mise à jour.' });
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);

    const currentErr = !passwordForm.currentPassword ? 'Mot de passe actuel requis.' : '';
    const newErr = validatePassword(passwordForm.newPassword);
    let confirmErr = '';
    if (!passwordForm.confirmPassword) confirmErr = 'Confirmez le nouveau mot de passe.';
    else if (passwordForm.newPassword !== passwordForm.confirmPassword) confirmErr = 'Les mots de passe ne correspondent pas.';

    if (currentErr || newErr || confirmErr) {
      setMessage({ type: 'error', text: currentErr || newErr || confirmErr });
      return;
    }

    setSaving(true);
    try {
      await api.put('/auth/change-password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setMessage({ type: 'success', text: 'Mot de passe modifié. Reconnexion…' });
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => {
        logout();
        navigate('/login');
      }, 2000);
    } catch (error) {
      setMessage({
        type: 'error',
        text: mapAuthError(error.response?.data?.error, 'Impossible de modifier le mot de passe.'),
      });
    } finally {
      setSaving(false);
    }
  };

  const strength = getPasswordStrength(passwordForm.newPassword);

  if (loading) {
    return (
      <div style={s.loader}>
        <div style={s.spinner} />
        <p>Chargement du profil…</p>
      </div>
    );
  }

  return (
    <div style={s.page}>
      <div style={s.hero}>
        <div style={s.avatar}>{profile.name?.charAt(0).toUpperCase() || 'A'}</div>
        <div>
          <h1 style={s.title}>Mon profil administrateur</h1>
          <p style={s.subtitle}>{profile.email || user?.email}</p>
          <span style={s.roleBadge}>Administration</span>
        </div>
      </div>

      {message && (
        <div style={{ ...s.alert, ...(message.type === 'success' ? s.alertSuccess : s.alertError) }} role="alert">
          {message.type === 'success' ? '✅' : '⚠'} {message.text}
        </div>
      )}

      <div style={s.tabs}>
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            style={{ ...s.tabBtn, ...(tab === t.id ? s.tabBtnActive : {}) }}
            onClick={() => { setTab(t.id); setMessage(null); }}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      <div style={s.card}>
        {tab === 'profile' && (
          <form onSubmit={handleProfileSubmit}>
            <h2 style={s.cardTitle}>Informations personnelles</h2>
            <div style={s.field}>
              <label style={s.label}>Email</label>
              <input value={profile.email} disabled style={{ ...s.input, background: '#f9fafb', color: '#6b7280' }} />
              <p style={s.hint}>L&apos;email ne peut pas être modifié.</p>
            </div>
            <div style={s.field}>
              <label style={s.label}>Nom complet *</label>
              <input
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                style={s.input}
                required
              />
            </div>
            <div style={s.row2}>
              <div style={s.field}>
                <label style={s.label}>Téléphone</label>
                <input
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  style={s.input}
                  placeholder="+216 …"
                />
              </div>
            </div>
            <div style={s.field}>
              <RegionSelect
                label="Région / ville"
                value={profile.region}
                onChange={(region) => setProfile({ ...profile, region })}
                hint="Utilisée pour le filtrage régional et les statistiques par zone."
                showIcon
              />
            </div>
            <div style={s.field}>
              <label style={s.label}>Adresse</label>
              <textarea
                rows={3}
                value={profile.address}
                onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                style={{ ...s.input, resize: 'vertical' }}
                placeholder="Adresse professionnelle…"
              />
            </div>
            <button type="submit" disabled={saving} style={s.submitBtn}>
              {saving ? 'Enregistrement…' : 'Enregistrer le profil'}
            </button>
          </form>
        )}

        {tab === 'password' && (
          <form onSubmit={handlePasswordSubmit}>
            <h2 style={s.cardTitle}>Changer le mot de passe</h2>
            <p style={s.hint}>Après modification, vous serez déconnecté pour des raisons de sécurité.</p>

            <div style={s.field}>
              <label style={s.label}>Mot de passe actuel *</label>
              <input
                type={showPasswords ? 'text' : 'password'}
                autoComplete="current-password"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                style={s.input}
              />
            </div>
            <div style={s.field}>
              <label style={s.label}>Nouveau mot de passe *</label>
              <input
                type={showPasswords ? 'text' : 'password'}
                autoComplete="new-password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                style={s.input}
              />
              {passwordForm.newPassword && (
                <div style={{ marginTop: '8px' }}>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    {[0, 1, 2, 3].map((i) => (
                      <div
                        key={i}
                        style={{
                          flex: 1,
                          height: '4px',
                          borderRadius: '2px',
                          background: i < strength.score ? strength.color : '#e5e7eb',
                        }}
                      />
                    ))}
                  </div>
                  {strength.label && (
                    <span style={{ fontSize: '11px', color: strength.color }}>{strength.label}</span>
                  )}
                </div>
              )}
            </div>
            <div style={s.field}>
              <label style={s.label}>Confirmer le mot de passe *</label>
              <input
                type={showPasswords ? 'text' : 'password'}
                autoComplete="new-password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                style={s.input}
              />
            </div>
            <label style={s.checkLabel}>
              <input
                type="checkbox"
                checked={showPasswords}
                onChange={(e) => setShowPasswords(e.target.checked)}
              />
              Afficher les mots de passe
            </label>
            <button type="submit" disabled={saving} style={s.submitBtn}>
              {saving ? 'Modification…' : 'Modifier le mot de passe'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

const s = {
  page: { padding: '24px', maxWidth: '720px', margin: '0 auto' },
  loader: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '40vh', gap: '12px' },
  spinner: { width: '32px', height: '32px', border: '3px solid #d1fae5', borderTopColor: '#10b981', borderRadius: '50%', animation: 'spin 1s linear infinite' },
  hero: { display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '24px', flexWrap: 'wrap' },
  avatar: { width: '72px', height: '72px', borderRadius: '50%', background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '28px', boxShadow: '0 8px 24px rgba(16,185,129,0.35)' },
  title: { margin: 0, fontSize: '24px', fontWeight: 800, color: '#065f46' },
  subtitle: { margin: '4px 0 8px', fontSize: '14px', color: '#6b7280' },
  roleBadge: { display: 'inline-block', padding: '4px 12px', borderRadius: '20px', background: '#fef3c7', color: '#92400e', fontSize: '12px', fontWeight: 700 },
  alert: { padding: '12px 16px', borderRadius: '12px', marginBottom: '16px', fontSize: '14px', fontWeight: 600, border: '1px solid' },
  alertSuccess: { background: '#d1fae5', color: '#047857', borderColor: '#6ee7b7' },
  alertError: { background: '#fee2e2', color: '#991b1b', borderColor: '#fca5a5' },
  tabs: { display: 'flex', gap: '8px', marginBottom: '16px' },
  tabBtn: { padding: '10px 18px', border: '1px solid #e5e7eb', borderRadius: '12px', background: 'white', cursor: 'pointer', fontSize: '14px', fontWeight: 600, color: '#6b7280' },
  tabBtnActive: { background: '#ecfdf5', borderColor: '#6ee7b7', color: '#047857' },
  card: { background: 'white', borderRadius: '18px', padding: '28px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', border: '1px solid #e5e7eb' },
  cardTitle: { margin: '0 0 20px', fontSize: '18px', fontWeight: 800, color: '#111827' },
  field: { marginBottom: '16px' },
  label: { display: 'block', fontSize: '13px', fontWeight: 700, color: '#374151', marginBottom: '6px' },
  input: { width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1px solid #e5e7eb', fontSize: '14px', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' },
  hint: { fontSize: '12px', color: '#9ca3af', margin: '4px 0 0' },
  row2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' },
  checkLabel: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#4b5563', marginBottom: '16px', cursor: 'pointer' },
  submitBtn: { width: '100%', padding: '14px', background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 700, fontSize: '15px', cursor: 'pointer', marginTop: '8px' },
};

export default AdminProfilePage;
