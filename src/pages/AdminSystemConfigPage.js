import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Settings, Save, Shield, Truck, Bell, Cpu, Store } from 'lucide-react';
import { fetchSystemConfig, updateSystemConfig } from '../services/adminService';
import SecurityThreatPanel from '../components/SecurityThreatPanel';
import './AdminPages.css';

const TABS = [
  { id: 'general', label: 'Général', icon: Settings },
  { id: 'security', label: 'Sécurité', icon: Shield },
  { id: 'marketplace', label: 'Marketplace', icon: Store },
  { id: 'delivery', label: 'Livraison', icon: Truck },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'integrations', label: 'Intégrations', icon: Cpu },
];

const LANGUAGES = [
  { id: 'fr', label: 'Français' },
  { id: 'ar', label: 'Arabe' },
  { id: 'en', label: 'Anglais' },
];

const TIMEZONES = [
  'Africa/Tunis',
  'Europe/Paris',
  'UTC',
];

const AdminSystemConfigPage = () => {
  const [config, setConfig] = useState(null);
  const [demo, setDemo] = useState(false);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [tab, setTab] = useState('general');

  const load = useCallback(async () => {
    setLoading(true);
    const { data, demo: isDemo } = await fetchSystemConfig();
    setConfig(data);
    setDemo(isDemo);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const set = (key, value) => setConfig((c) => ({ ...c, [key]: value }));

  const save = async () => {
    const { data } = await updateSystemConfig(config);
    setConfig(data);
    setMsg('Configuration globale enregistrée.');
    setTimeout(() => setMsg(''), 3000);
  };

  if (loading || !config) {
    return <div className="adm-page"><p>Chargement de la configuration…</p></div>;
  }

  return (
    <div className="adm-page" style={{ maxWidth: 1100 }}>
      <header className="adm-hero">
        <h1>
          <Settings size={24} />
          Configuration globale du système
          {demo && <span className="adm-demo-pill">Mode démo</span>}
        </h1>
        <p>
          Paramètres centralisés PetfoodTN — plateforme, sécurité, marketplace, livraison, notifications et intégrations.
        </p>
      </header>

      {msg && <p className="adm-msg">{msg}</p>}

      <div className="adm-tabs" role="tablist">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={tab === id}
            className={`adm-tab ${tab === id ? 'adm-tab--active' : ''}`}
            onClick={() => setTab(id)}
          >
            <Icon size={15} /> {label}
          </button>
        ))}
      </div>

      {tab === 'general' && (
        <div className="adm-card">
          <h2>Identité & accès public</h2>
          <div className="adm-form-grid">
            <label>
              Nom plateforme
              <input value={config.platformName || ''} onChange={(e) => set('platformName', e.target.value)} />
            </label>
            <label>
              Slogan
              <input value={config.platformTagline || ''} onChange={(e) => set('platformTagline', e.target.value)} />
            </label>
            <label>
              Langue par défaut
              <select value={config.defaultLanguage || 'fr'} onChange={(e) => set('defaultLanguage', e.target.value)}>
                {LANGUAGES.map((l) => <option key={l.id} value={l.id}>{l.label}</option>)}
              </select>
            </label>
            <label>
              Fuseau horaire
              <select value={config.timezone || 'Africa/Tunis'} onChange={(e) => set('timezone', e.target.value)}>
                {TIMEZONES.map((tz) => <option key={tz} value={tz}>{tz}</option>)}
              </select>
            </label>
            <label>
              Devise
              <input value={config.defaultCurrency || 'DT'} onChange={(e) => set('defaultCurrency', e.target.value)} />
            </label>
            <label>
              Version API
              <input value={config.apiVersion || 'v1'} onChange={(e) => set('apiVersion', e.target.value)} />
            </label>
            <label>
              E-mail support
              <input type="email" value={config.supportEmail || ''} onChange={(e) => set('supportEmail', e.target.value)} />
            </label>
            <label>
              Téléphone support
              <input value={config.supportPhone || ''} onChange={(e) => set('supportPhone', e.target.value)} />
            </label>
            <label style={{ gridColumn: '1 / -1' }}>
              Message maintenance
              <input value={config.maintenanceMessage || ''} onChange={(e) => set('maintenanceMessage', e.target.value)} placeholder="Affiché si mode maintenance actif" />
            </label>
          </div>
          <div className="adm-toggle-group">
            <Toggle checked={!!config.maintenanceMode} onChange={(v) => set('maintenanceMode', v)} label="Mode maintenance global" />
            <Toggle checked={config.allowGuestBrowsing !== false} onChange={(v) => set('allowGuestBrowsing', v)} label="Navigation visiteur sans compte" />
            <Toggle checked={config.allowClientSelfRegistration !== false} onChange={(v) => set('allowClientSelfRegistration', v)} label="Inscription client libre" />
          </div>
        </div>
      )}

      {tab === 'security' && (
        <>
          <div className="adm-card">
            <h2>Sécurité & sessions</h2>
            <div className="adm-form-grid">
              <label>
                Timeout session (min)
                <input type="number" min="5" max="480" value={config.sessionTimeoutMinutes || 60} onChange={(e) => set('sessionTimeoutMinutes', Number(e.target.value))} />
              </label>
              <label>
                Tentatives login max
                <input type="number" min="3" max="20" value={config.maxLoginAttempts || 5} onChange={(e) => set('maxLoginAttempts', Number(e.target.value))} />
              </label>
              <label>
                Rétention logs (jours)
                <input type="number" min="7" max="365" value={config.logRetentionDays || 90} onChange={(e) => set('logRetentionDays', Number(e.target.value))} />
              </label>
            </div>
            <div className="adm-toggle-group">
              <Toggle checked={config.requireEmailVerification !== false} onChange={(v) => set('requireEmailVerification', v)} label="Vérification e-mail obligatoire à l'inscription" />
              <Toggle checked={!!config.backupEnabled} onChange={(v) => set('backupEnabled', v)} label="Sauvegardes automatiques activées" />
              <Toggle checked={config.cookieConsentRequired !== false} onChange={(v) => set('cookieConsentRequired', v)} label="Bannière consentement cookies (RGPD)" />
              <Toggle checked={config.antivirusScanEnabled !== false} onChange={(v) => set('antivirusScanEnabled', v)} label="Scan anti-virus / anti-menaces actif" />
              <Toggle checked={!!config.blockThreatsAutomatically} onChange={(v) => set('blockThreatsAutomatically', v)} label="Bloquer automatiquement les contenus dangereux" />
            </div>
          </div>
          <div className="adm-card" style={{ marginTop: 16 }}>
            <h2>Détection anti-virus & menaces</h2>
            <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: 0 }}>
              Analyse des messages, scripts, URLs suspectes et signatures malware (EICAR, exécutables, injections).
            </p>
            <SecurityThreatPanel />
          </div>
        </>
      )}

      {tab === 'marketplace' && (
        <div className="adm-card">
          <h2>Marketplace & modération</h2>
          <div className="adm-form-grid">
            <label>
              Commission vendeur (%)
              <input type="number" min="0" max="50" step="0.5" value={config.vendorCommissionRate || 12} onChange={(e) => set('vendorCommissionRate', Number(e.target.value))} />
            </label>
            <label>
              Max produits / vendeur
              <input type="number" min="10" value={config.maxProductsPerVendor || 200} onChange={(e) => set('maxProductsPerVendor', Number(e.target.value))} />
            </label>
            <label>
              Note vendeur minimale
              <input type="number" min="0" max="5" step="0.1" value={config.minVendorRating || 3} onChange={(e) => set('minVendorRating', Number(e.target.value))} />
            </label>
            <label>
              Seuil NLP faux avis (0–1)
              <input type="number" min="0" max="1" step="0.05" value={config.autoModerationNlpThreshold || 0.85} onChange={(e) => set('autoModerationNlpThreshold', Number(e.target.value))} />
            </label>
          </div>
          <div className="adm-toggle-group">
            <Toggle checked={!!config.allowVendorSelfRegistration} onChange={(v) => set('allowVendorSelfRegistration', v)} label="Inscription vendeur en libre-service" />
            <Toggle checked={!!config.autoApproveVendors} onChange={(v) => set('autoApproveVendors', v)} label="Validation automatique des vendeurs" />
            <Toggle checked={config.requireModeratorApproval !== false} onChange={(v) => set('requireModeratorApproval', v)} label="Validation modérateur obligatoire (produits)" />
          </div>
          <p style={{ marginTop: 12, fontSize: '0.8rem', color: '#64748b' }}>
            Gestion des comptes : <Link to="/admin/vendors">Vendeurs</Link>
            {' · '}
            <Link to="/admin/moderators">Modérateurs</Link>
            {' · '}
            <Link to="/admin/visitors">Espace visiteur</Link>
          </p>
        </div>
      )}

      {tab === 'delivery' && (
        <div className="adm-card">
          <h2>Commandes & livraison</h2>
          <div className="adm-form-grid">
            <label>
              Seuil livraison gratuite ({config.defaultCurrency || 'DT'})
              <input type="number" min="0" value={config.freeShippingThreshold ?? 150} onChange={(e) => set('freeShippingThreshold', Number(e.target.value))} />
            </label>
            <label>
              Montant max commande ({config.defaultCurrency || 'DT'})
              <input type="number" min="100" value={config.maxOrderAmount ?? 5000} onChange={(e) => set('maxOrderAmount', Number(e.target.value))} />
            </label>
            <label>
              Délai livraison par défaut (jours)
              <input type="number" min="1" max="30" value={config.defaultDeliveryDays ?? 3} onChange={(e) => set('defaultDeliveryDays', Number(e.target.value))} />
            </label>
          </div>
        </div>
      )}

      {tab === 'notifications' && (
        <div className="adm-card">
          <h2>Canaux de notification</h2>
          <div className="adm-toggle-group">
            <Toggle checked={!!config.emailNotificationsEnabled} onChange={(v) => set('emailNotificationsEnabled', v)} label="Notifications e-mail" />
            <Toggle checked={!!config.smsNotificationsEnabled} onChange={(v) => set('smsNotificationsEnabled', v)} label="Notifications SMS" />
            <Toggle checked={config.pushNotificationsEnabled !== false} onChange={(v) => set('pushNotificationsEnabled', v)} label="Notifications push (app & navigateur)" />
          </div>
        </div>
      )}

      {tab === 'integrations' && (
        <div className="adm-card">
          <h2>Modules & services connectés</h2>
          <div className="adm-toggle-group">
            <Toggle checked={config.groqAssistantEnabled !== false} onChange={(v) => set('groqAssistantEnabled', v)} label="Assistant IA Groq (chat)" />
            <Toggle checked={config.nlpModelsEnabled !== false} onChange={(v) => set('nlpModelsEnabled', v)} label="Modèles NLP (avis, modération)" />
            <Toggle checked={config.iotFeaturesEnabled !== false} onChange={(v) => set('iotFeaturesEnabled', v)} label="Fonctionnalités IoT (distributeur, fontaine)" />
          </div>
          <p style={{ marginTop: 16, fontSize: '0.8rem', color: '#64748b' }}>
            <Link to="/admin/nlp-models">Configurer les modèles NLP →</Link>
            {' · '}
            <Link to="/admin/activity-logs">Journaux d&apos;activité →</Link>
          </p>
        </div>
      )}

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', marginTop: 8 }}>
        <button type="button" className="adm-btn adm-btn--primary" onClick={save}>
          <Save size={16} /> Enregistrer la configuration globale
        </button>
        {config.updatedAt && (
          <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
            Dernière mise à jour : {new Date(config.updatedAt).toLocaleString('fr-FR')}
          </span>
        )}
      </div>
    </div>
  );
};

const Toggle = ({ checked, onChange, label }) => (
  <label className="adm-toggle">
    <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
    {label}
  </label>
);

export default AdminSystemConfigPage;
