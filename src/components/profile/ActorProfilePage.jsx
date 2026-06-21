import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/api';
import RegionSelect from '../RegionSelect';
import SidebarAvatar from '../SidebarAvatar';
import usePlatformRefresh from '../../hooks/usePlatformRefresh';
import { validatePassword, getPasswordStrength, validateName } from '../../utils/loginValidation';
import { mapAuthError } from '../../utils/authErrors';
import { DEFAULT_PROFILE_PREFS, getRoleProfileConfig } from '../../config/roleProfileConfig';
import {
  computeProfileCompletion,
  getProfileExtras,
  getProfilePrefs,
  getStoredAvatar,
  saveProfileExtras,
  saveProfilePrefs,
  saveStoredAvatar,
} from '../../utils/profileExtrasStorage';
import './ActorProfilePage.css';

const TABS = [
  { id: 'profile', label: 'Profil', icon: '👤' },
  { id: 'password', label: 'Sécurité', icon: '🔐' },
  { id: 'preferences', label: 'Préférences', icon: '🔔' },
];

const PREFS_ITEMS = [
  { key: 'emailNotifications', label: 'Notifications par email', desc: 'Alertes importantes et messages système' },
  { key: 'smsNotifications', label: 'Notifications SMS', desc: 'Rappels urgents et codes de livraison' },
  { key: 'orderUpdates', label: 'Suivi des commandes', desc: 'Statut des commandes et livraisons' },
  { key: 'marketingEmails', label: 'Offres et actualités', desc: 'Promotions, nouveautés et conseils' },
];

const ActorProfilePage = ({ role: roleProp }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const fileRef = useRef(null);

  const role = roleProp || user?.role || 'client';
  const config = useMemo(() => getRoleProfileConfig(role), [role]);
  const accent = config.accent;

  const [tab, setTab] = useState('profile');
  const [profile, setProfile] = useState({ name: '', email: '', phone: '', address: '', region: '' });
  const [extras, setExtras] = useState({});
  const [prefs, setPrefs] = useState({ ...DEFAULT_PROFILE_PREFS });
  const [avatarUrl, setAvatarUrl] = useState('');
  const [avatarDraft, setAvatarDraft] = useState('');
  const [showAvatarEditor, setShowAvatarEditor] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [showPasswords, setShowPasswords] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  const completion = useMemo(
    () => computeProfileCompletion(profile, extras, config),
    [profile, extras, config],
  );

  const themeStyle = {
    '--ap-primary': accent.primary,
    '--ap-secondary': accent.secondary,
    '--ap-light': accent.light,
    '--ap-badge-bg': accent.badgeBg,
    '--ap-badge-color': accent.badgeColor,
  };

  const loadProfile = useCallback(async () => {
    try {
      const res = await api.get('/users/profile');
      const data = res.data || {};
      const email = data.email || user?.email || '';
      setProfile({
        name: data.name || '',
        email,
        phone: data.phone || '',
        address: data.address || '',
        region: data.region || '',
      });
      setExtras(getProfileExtras(email, role));
      setPrefs({ ...DEFAULT_PROFILE_PREFS, ...getProfilePrefs(email, role) });
      const stored = getStoredAvatar(email) || data.avatarUrl || '';
      setAvatarUrl(stored);
      setAvatarDraft(stored);
    } catch {
      setMessage({ type: 'error', text: 'Impossible de charger le profil.' });
    } finally {
      setLoading(false);
    }
  }, [role, user?.email]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  usePlatformRefresh(loadProfile);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    const nameErr = validateName(profile.name);
    if (nameErr) {
      setMessage({ type: 'error', text: nameErr });
      return;
    }
    setSaving(true);
    setMessage(null);
    try {
      await api.put('/users/profile', {
        name: profile.name.trim(),
        phone: profile.phone?.trim() || '',
        address: profile.address?.trim() || '',
        region: profile.region?.trim() || null,
      });
      saveProfileExtras(profile.email, role, extras);
      if (avatarUrl) saveStoredAvatar(profile.email, avatarUrl);
      setMessage({ type: 'success', text: 'Profil mis à jour avec succès.' });
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.error || 'Erreur lors de la mise à jour.' });
    } finally {
      setSaving(false);
    }
  };

  const handlePrefsSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      saveProfilePrefs(profile.email, role, prefs);
      setMessage({ type: 'success', text: 'Préférences enregistrées.' });
    } catch {
      setMessage({ type: 'error', text: 'Erreur lors de l\'enregistrement.' });
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
    else if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      confirmErr = 'Les mots de passe ne correspondent pas.';
    }
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

  const handleAvatarFile = (e) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    if (file.size > 512000) {
      setMessage({ type: 'error', text: 'Image trop volumineuse (max 500 Ko).' });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setAvatarDraft(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const applyAvatar = () => {
    setAvatarUrl(avatarDraft);
    if (profile.email) saveStoredAvatar(profile.email, avatarDraft);
    setShowAvatarEditor(false);
    setMessage({ type: 'success', text: 'Photo de profil mise à jour.' });
  };

  const removeAvatar = () => {
    setAvatarUrl('');
    setAvatarDraft('');
    if (profile.email) saveStoredAvatar(profile.email, '');
    setShowAvatarEditor(false);
  };

  const strength = getPasswordStrength(passwordForm.newPassword);
  const displayUser = { ...profile, avatarUrl };

  if (loading) {
    return (
      <div className="actor-profile" style={themeStyle}>
        <div className="actor-profile__loader">
          <div className="actor-profile__spinner" />
          <p>Chargement du profil…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="actor-profile" style={themeStyle}>
      <div className="actor-profile__hero">
        <div className="actor-profile__avatar-wrap">
          <SidebarAvatar
            user={displayUser}
            role={role === 'support' ? 'service_client' : role}
            className="actor-profile__avatar"
            style={{ width: 88, height: 88, borderRadius: '50%', objectFit: 'cover' }}
          />
          <button
            type="button"
            className="actor-profile__avatar-btn"
            onClick={() => setShowAvatarEditor((v) => !v)}
            title="Modifier la photo"
            aria-label="Modifier la photo de profil"
          >
            📷
          </button>
        </div>
        <div className="actor-profile__hero-text">
          <h1 className="actor-profile__title">
            {config.icon} {config.title}
          </h1>
          <p className="actor-profile__email">{profile.email || user?.email}</p>
          <span className="actor-profile__badge">{config.badge}</span>
          <div className="actor-profile__completion">
            <div className="actor-profile__completion-label">
              <span>Profil complété</span>
              <span>{completion}%</span>
            </div>
            <div className="actor-profile__completion-bar">
              <div className="actor-profile__completion-fill" style={{ width: `${completion}%` }} />
            </div>
          </div>
          {showAvatarEditor && (
            <div className="actor-profile__avatar-modal">
              <label className="actor-profile__label">URL de l&apos;image ou import</label>
              <input
                className="actor-profile__input"
                value={avatarDraft.startsWith('data:') ? '' : avatarDraft}
                onChange={(e) => setAvatarDraft(e.target.value)}
                placeholder="https://…"
              />
              <input ref={fileRef} type="file" accept="image/*" hidden onChange={handleAvatarFile} />
              <div className="actor-profile__avatar-actions">
                <button type="button" className="actor-profile__btn-secondary" onClick={() => fileRef.current?.click()}>
                  Importer une photo
                </button>
                <button type="button" className="actor-profile__btn-secondary" onClick={applyAvatar}>
                  Appliquer
                </button>
                {avatarUrl && (
                  <button type="button" className="actor-profile__btn-secondary actor-profile__btn-danger" onClick={removeAvatar}>
                    Supprimer
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {message && (
        <div
          className={`actor-profile__alert actor-profile__alert--${message.type}`}
          role="alert"
        >
          {message.type === 'success' ? '✅' : '⚠'} {message.text}
        </div>
      )}

      <div className="actor-profile__layout">
        <div>
          <div className="actor-profile__tabs">
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                className={`actor-profile__tab${tab === t.id ? ' actor-profile__tab--active' : ''}`}
                onClick={() => { setTab(t.id); setMessage(null); }}
              >
                {t.icon} {t.label}
              </button>
            ))}
          </div>

          <div className="actor-profile__card">
            {tab === 'profile' && (
              <form onSubmit={handleProfileSubmit}>
                <h2 className="actor-profile__card-title">Informations personnelles</h2>
                <p className="actor-profile__card-desc">Coordonnées visibles selon votre rôle sur la plateforme.</p>

                <div className="actor-profile__field">
                  <label className="actor-profile__label">Email</label>
                  <input
                    value={profile.email}
                    disabled
                    className="actor-profile__input actor-profile__input--disabled"
                  />
                  <p className="actor-profile__hint">L&apos;email ne peut pas être modifié.</p>
                </div>

                <div className="actor-profile__row2">
                  <div className="actor-profile__field">
                    <label className="actor-profile__label">Nom complet *</label>
                    <input
                      value={profile.name}
                      onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                      className="actor-profile__input"
                      required
                    />
                  </div>
                  <div className="actor-profile__field">
                    <label className="actor-profile__label">Téléphone</label>
                    <input
                      value={profile.phone}
                      onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                      className="actor-profile__input"
                      placeholder="+216 …"
                    />
                  </div>
                </div>

                <div className="actor-profile__field">
                  <RegionSelect
                    label={config.regionLabel}
                    value={profile.region}
                    onChange={(region) => setProfile({ ...profile, region })}
                    hint={config.regionHint}
                    showIcon
                  />
                </div>

                <div className="actor-profile__field">
                  <label className="actor-profile__label">{config.addressLabel}</label>
                  <textarea
                    rows={3}
                    value={profile.address}
                    onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                    className="actor-profile__textarea"
                    placeholder={config.addressPlaceholder}
                  />
                </div>

                {config.extraFields?.length > 0 && (
                  <>
                    <h3 className="actor-profile__section-title">Informations {config.badge.toLowerCase()}</h3>
                    {config.extraFields.map((field) => (
                      <div key={field.key} className="actor-profile__field">
                        <label className="actor-profile__label">{field.label}</label>
                        {field.type === 'textarea' ? (
                          <textarea
                            rows={3}
                            value={extras[field.key] || ''}
                            onChange={(e) => setExtras({ ...extras, [field.key]: e.target.value })}
                            className="actor-profile__textarea"
                            placeholder={field.placeholder}
                          />
                        ) : (
                          <input
                            value={extras[field.key] || ''}
                            onChange={(e) => setExtras({ ...extras, [field.key]: e.target.value })}
                            className="actor-profile__input"
                            placeholder={field.placeholder}
                          />
                        )}
                      </div>
                    ))}
                  </>
                )}

                <button type="submit" disabled={saving} className="actor-profile__submit">
                  {saving ? 'Enregistrement…' : 'Enregistrer le profil'}
                </button>
              </form>
            )}

            {tab === 'password' && (
              <form onSubmit={handlePasswordSubmit}>
                <h2 className="actor-profile__card-title">Changer le mot de passe</h2>
                <p className="actor-profile__card-desc">
                  Après modification, vous serez déconnecté pour des raisons de sécurité.
                </p>

                <div className="actor-profile__field">
                  <label className="actor-profile__label">Mot de passe actuel *</label>
                  <input
                    type={showPasswords ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                    className="actor-profile__input"
                  />
                </div>
                <div className="actor-profile__field">
                  <label className="actor-profile__label">Nouveau mot de passe *</label>
                  <input
                    type={showPasswords ? 'text' : 'password'}
                    autoComplete="new-password"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    className="actor-profile__input"
                  />
                  {passwordForm.newPassword && (
                    <div className="actor-profile__strength">
                      <div className="actor-profile__strength-bars">
                        {[0, 1, 2, 3].map((i) => (
                          <div
                            key={i}
                            className="actor-profile__strength-bar"
                            style={{ background: i < strength.score ? strength.color : '#e5e7eb' }}
                          />
                        ))}
                      </div>
                      {strength.label && (
                        <span className="actor-profile__strength-label" style={{ color: strength.color }}>
                          {strength.label}
                        </span>
                      )}
                    </div>
                  )}
                </div>
                <div className="actor-profile__field">
                  <label className="actor-profile__label">Confirmer le mot de passe *</label>
                  <input
                    type={showPasswords ? 'text' : 'password'}
                    autoComplete="new-password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    className="actor-profile__input"
                  />
                </div>
                <label className="actor-profile__check">
                  <input
                    type="checkbox"
                    checked={showPasswords}
                    onChange={(e) => setShowPasswords(e.target.checked)}
                  />
                  Afficher les mots de passe
                </label>
                <button type="submit" disabled={saving} className="actor-profile__submit">
                  {saving ? 'Modification…' : 'Modifier le mot de passe'}
                </button>
              </form>
            )}

            {tab === 'preferences' && (
              <form onSubmit={handlePrefsSubmit}>
                <h2 className="actor-profile__card-title">Préférences de communication</h2>
                <p className="actor-profile__card-desc">
                  Choisissez comment PetfoodTN peut vous contacter.
                </p>

                {PREFS_ITEMS.map((item) => (
                  <label key={item.key} className="actor-profile__check">
                    <input
                      type="checkbox"
                      checked={Boolean(prefs[item.key])}
                      onChange={(e) => setPrefs({ ...prefs, [item.key]: e.target.checked })}
                    />
                    <span>
                      <strong>{item.label}</strong>
                      <br />
                      <span style={{ fontSize: 12, color: '#9ca3af' }}>{item.desc}</span>
                    </span>
                  </label>
                ))}

                <div className="actor-profile__field" style={{ marginTop: 16 }}>
                  <label className="actor-profile__label">Langue de l&apos;interface</label>
                  <select
                    className="actor-profile__select"
                    value={prefs.language}
                    onChange={(e) => setPrefs({ ...prefs, language: e.target.value })}
                  >
                    <option value="fr">Français</option>
                    <option value="ar">العربية</option>
                    <option value="en">English</option>
                  </select>
                </div>

                <button type="submit" disabled={saving} className="actor-profile__submit">
                  {saving ? 'Enregistrement…' : 'Enregistrer les préférences'}
                </button>
              </form>
            )}
          </div>
        </div>

        {config.quickLinks?.length > 0 && (
          <aside className="actor-profile__quicklinks">
            <h3 className="actor-profile__quicklinks-title">Accès rapides</h3>
            {config.quickLinks.map((link) => (
              <Link key={link.to} to={link.to} className="actor-profile__quicklink">
                <span>{link.icon}</span>
                {link.label}
              </Link>
            ))}
          </aside>
        )}
      </div>
    </div>
  );
};

export default ActorProfilePage;
