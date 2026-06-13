import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, Save, ExternalLink } from 'lucide-react';
import { fetchVisitorAdminConfig, updateVisitorAdminConfig } from '../services/adminService';
import './AdminPages.css';

const AdminVisitorsPage = () => {
  const [config, setConfig] = useState(null);
  const [stats, setStats] = useState(null);
  const [demo, setDemo] = useState(false);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    const { data, stats: s, demo: isDemo } = await fetchVisitorAdminConfig();
    setConfig(data);
    setStats(s);
    setDemo(isDemo);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const set = (key, value) => setConfig((c) => ({ ...c, [key]: value }));

  const save = async () => {
    const { data } = await updateVisitorAdminConfig(config);
    setConfig(data);
    setMsg('Configuration visiteur enregistrée.');
    setTimeout(() => setMsg(''), 3000);
  };

  if (loading || !config) {
    return <div className="adm-page"><p>Chargement…</p></div>;
  }

  return (
    <div className="adm-page">
      <header className="adm-hero">
        <h1>
          <Eye size={24} />
          Gestion espace visiteur
          {demo && <span className="adm-demo-pill">Mode démo</span>}
        </h1>
        <p>
          Réservé à l&apos;administrateur — activation des sections publiques, CTAs et statistiques de fréquentation.
        </p>
      </header>

      {msg && <p className="adm-msg">{msg}</p>}

      <div className="adm-export-row">
        <Link to="/visitor" target="_blank" rel="noopener noreferrer" className="adm-btn adm-btn--ghost adm-btn--sm">
          <ExternalLink size={14} /> Prévisualiser le hub
        </Link>
        <Link to="/admin/vendors" className="adm-btn adm-btn--ghost adm-btn--sm">Vendeurs →</Link>
        <Link to="/admin/moderators" className="adm-btn adm-btn--ghost adm-btn--sm">Modérateurs →</Link>
      </div>

      {stats && (
        <div className="adm-card">
          <h2>Statistiques (aperçu)</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 12 }}>
            <StatKpi label="Visiteurs / jour" value={stats.dailyVisitors} />
            <StatKpi label="Visiteurs / semaine" value={stats.weeklyVisitors} />
            <StatKpi label="Vues produits" value={stats.productViews} />
            <StatKpi label="Utilisations outils" value={stats.toolUses} />
            <StatKpi label="Conversion inscription" value={`${stats.registrationConversions} %`} />
          </div>
          {stats.topPages?.length > 0 && (
            <table className="adm-table" style={{ marginTop: 16 }}>
              <thead>
                <tr><th>Page</th><th>Vues</th></tr>
              </thead>
              <tbody>
                {stats.topPages.map((p) => (
                  <tr key={p.path}>
                    <td>{p.label}</td>
                    <td>{p.views?.toLocaleString('fr-FR')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      <div className="adm-card">
        <h2>Accès public</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Toggle label="Hub visiteur actif" checked={!!config.hubEnabled} onChange={(v) => set('hubEnabled', v)} />
          <Toggle label="Catalogue produits public" checked={!!config.productsPublic} onChange={(v) => set('productsPublic', v)} />
          <Toggle label="Outils nutrition publics" checked={!!config.toolsPublic} onChange={(v) => set('toolsPublic', v)} />
          <Toggle label="Infos, FAQ et avis publics" checked={!!config.infoPublic} onChange={(v) => set('infoPublic', v)} />
          <Toggle label="CTA inscription visible" checked={!!config.showRegistrationCta} onChange={(v) => set('showRegistrationCta', v)} />
          <Toggle label="Lien espace vendeur sur le hub" checked={!!config.showVendorCta} onChange={(v) => set('showVendorCta', v)} />
          <Toggle label="Lien espace modérateur sur le hub" checked={!!config.showModeratorCta} onChange={(v) => set('showModeratorCta', v)} />
        </div>
      </div>

      <div className="adm-card">
        <h2>Paramètres avancés</h2>
        <div className="adm-form-grid">
          <label>
            Produits max en aperçu
            <input type="number" min="10" value={config.maxProductsPreview || 50} onChange={(e) => set('maxProductsPreview', Number(e.target.value))} />
          </label>
          <label className="full" style={{ gridColumn: '1 / -1' }}>
            Message maintenance visiteur
            <input value={config.maintenanceMessage || ''} onChange={(e) => set('maintenanceMessage', e.target.value)} placeholder="Laisser vide si aucun" />
          </label>
        </div>
      </div>

      <button type="button" className="adm-btn adm-btn--primary" onClick={save}>
        <Save size={16} /> Enregistrer
      </button>

      <p style={{ marginTop: 16, fontSize: '0.8rem', color: '#94a3b8' }}>
        La gestion des comptes <strong>vendeur</strong> et <strong>modérateur</strong> se fait exclusivement depuis l&apos;espace admin.
        Les modérateurs ne peuvent pas créer ni suspendre ces acteurs.
      </p>
    </div>
  );
};

const StatKpi = ({ label, value }) => (
  <div style={{ textAlign: 'center', padding: 12, background: '#f8fafc', borderRadius: 10 }}>
    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{label}</div>
    <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a' }}>{value}</div>
  </div>
);

const Toggle = ({ label, checked, onChange }) => (
  <label className="adm-toggle">
    <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
    {label}
  </label>
);

export default AdminVisitorsPage;
