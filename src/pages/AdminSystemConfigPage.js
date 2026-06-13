import React, { useCallback, useEffect, useState } from 'react';
import { Settings, Save } from 'lucide-react';
import { fetchSystemConfig, updateSystemConfig } from '../services/adminService';
import './AdminPages.css';

const AdminSystemConfigPage = () => {
  const [config, setConfig] = useState(null);
  const [demo, setDemo] = useState(false);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');

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
    setMsg('Configuration enregistrée.');
    setTimeout(() => setMsg(''), 3000);
  };

  if (loading || !config) {
    return <div className="adm-page"><p>Chargement…</p></div>;
  }

  return (
    <div className="adm-page">
      <header className="adm-hero">
        <h1><Settings size={24} /> Configuration du système {demo && <span className="adm-demo-pill">Mode démo</span>}</h1>
        <p>Paramètres globaux PetfoodTN — commissions, modération, notifications et rétention des logs.</p>
      </header>

      {msg && <p className="adm-msg">{msg}</p>}

      <div className="adm-card">
        <h2>Plateforme</h2>
        <div className="adm-form-grid">
          <label>
            Nom plateforme
            <input value={config.platformName || ''} onChange={(e) => set('platformName', e.target.value)} />
          </label>
          <label>
            E-mail support
            <input type="email" value={config.supportEmail || ''} onChange={(e) => set('supportEmail', e.target.value)} />
          </label>
          <label>
            Devise
            <input value={config.defaultCurrency || 'DT'} onChange={(e) => set('defaultCurrency', e.target.value)} />
          </label>
          <label>
            Timeout session (min)
            <input type="number" min="5" value={config.sessionTimeoutMinutes || 60} onChange={(e) => set('sessionTimeoutMinutes', Number(e.target.value))} />
          </label>
          <label>
            Rétention logs (jours)
            <input type="number" min="7" value={config.logRetentionDays || 90} onChange={(e) => set('logRetentionDays', Number(e.target.value))} />
          </label>
        </div>
      </div>

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
            Seuil NLP faux avis (0–1)
            <input type="number" min="0" max="1" step="0.05" value={config.autoModerationNlpThreshold || 0.85} onChange={(e) => set('autoModerationNlpThreshold', Number(e.target.value))} />
          </label>
        </div>
        <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <label className="adm-toggle">
            <input type="checkbox" checked={!!config.maintenanceMode} onChange={(e) => set('maintenanceMode', e.target.checked)} />
            Mode maintenance (accès lecture seule visiteurs)
          </label>
          <label className="adm-toggle">
            <input type="checkbox" checked={!!config.emailNotificationsEnabled} onChange={(e) => set('emailNotificationsEnabled', e.target.checked)} />
            Notifications e-mail actives
          </label>
          <label className="adm-toggle">
            <input type="checkbox" checked={!!config.allowVendorSelfRegistration} onChange={(e) => set('allowVendorSelfRegistration', e.target.checked)} />
            Inscription vendeur en libre-service
          </label>
          <label className="adm-toggle">
            <input type="checkbox" checked={config.requireModeratorApproval !== false} onChange={(e) => set('requireModeratorApproval', e.target.checked)} />
            Validation modérateur obligatoire (produits)
          </label>
        </div>
      </div>

      <button type="button" className="adm-btn adm-btn--primary" onClick={save}>
        <Save size={16} /> Enregistrer la configuration
      </button>
      {config.updatedAt && (
        <p style={{ marginTop: 12, fontSize: '0.8rem', color: '#94a3b8' }}>
          Dernière mise à jour : {new Date(config.updatedAt).toLocaleString('fr-FR')}
        </p>
      )}
    </div>
  );
};

export default AdminSystemConfigPage;
