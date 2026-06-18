import React, { useCallback, useEffect, useState } from 'react';
import { BarChart3, Users, Store, AlertOctagon, History } from 'lucide-react';
import { fetchModeratorAnalytics, MOD_ACTION_LABELS } from '../services/moderatorService';
import './ModeratorPages.css';

const ModeratorAnalyticsPage = () => {
  const [data, setData] = useState(null);
  const [demo, setDemo] = useState(false);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('users');

  const load = useCallback(async () => {
    setLoading(true);
    const { data: analytics, demo: isDemo } = await fetchModeratorAnalytics();
    setData(analytics);
    setDemo(isDemo);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return <div className="mod-page"><p className="mod-empty">Chargement des rapports…</p></div>;
  }

  const { userStats, vendorActivity, reportedProducts, history } = data || {};

  return (
    <div className="mod-page">
      <header className="mod-hero">
        <h1><BarChart3 size={24} /> Rapports & statistiques {demo && <span className="mod-demo-pill">Mode démo</span>}</h1>
        <p>Statistiques utilisateurs, activité vendeurs, produits signalés et historique des modérations.</p>
      </header>

      <div className="mod-tabs">
        <button type="button" className={`mod-tab${tab === 'users' ? ' mod-tab--active' : ''}`} onClick={() => setTab('users')}>
          <Users size={14} /> Utilisateurs
        </button>
        <button type="button" className={`mod-tab${tab === 'vendors' ? ' mod-tab--active' : ''}`} onClick={() => setTab('vendors')}>
          <Store size={14} /> Vendeurs
        </button>
        <button type="button" className={`mod-tab${tab === 'reported' ? ' mod-tab--active' : ''}`} onClick={() => setTab('reported')}>
          <AlertOctagon size={14} /> Produits signalés
        </button>
        <button type="button" className={`mod-tab${tab === 'history' ? ' mod-tab--active' : ''}`} onClick={() => setTab('history')}>
          <History size={14} /> Historique
        </button>
      </div>

      {tab === 'users' && userStats && (
        <>
          <div className="mod-kpi-grid">
            <div className="mod-kpi"><span>Total utilisateurs</span><strong>{userStats.total}</strong></div>
            <div className="mod-kpi"><span>Actifs</span><strong>{userStats.active}</strong></div>
            <div className="mod-kpi"><span>Suspendus</span><strong>{userStats.suspended}</strong></div>
          </div>
          <div className="mod-card">
            <h2>Répartition par rôle</h2>
            <table className="mod-table">
              <thead><tr><th>Rôle</th><th>Nombre</th></tr></thead>
              <tbody>
                {Object.entries(userStats.byRole || {}).map(([role, count]) => (
                  <tr key={role}><td>{role}</td><td>{count}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {tab === 'vendors' && (
        <div className="mod-card">
          <h2>Activité des vendeurs (30 jours)</h2>
          <table className="mod-table">
            <thead>
              <tr><th>Boutique</th><th>Produits ajoutés</th><th>Commandes</th><th>Réclamations</th><th>Statut</th></tr>
            </thead>
            <tbody>
              {(vendorActivity || []).map((v) => (
                <tr key={v.vendorId}>
                  <td>{v.shopName}</td>
                  <td>{v.productsAdded}</td>
                  <td>{v.orders30d}</td>
                  <td>{v.complaints}</td>
                  <td><span className={`mod-badge mod-badge--${v.status}`}>{v.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'reported' && (
        <div className="mod-card">
          <h2>Produits les plus signalés</h2>
          <table className="mod-table">
            <thead>
              <tr><th>Produit</th><th>Vendeur</th><th>Signalements</th><th>Motif</th></tr>
            </thead>
            <tbody>
              {(reportedProducts || []).map((p) => (
                <tr key={p.id}>
                  <td>{p.name}</td>
                  <td>{p.vendorName}</td>
                  <td><strong style={{ color: '#dc2626' }}>{p.reports}</strong></td>
                  <td>{p.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'history' && (
        <div className="mod-card">
          <h2>Historique des modérations</h2>
          {(history || []).map((h) => (
            <div key={h.id} className="mod-history-item">
              <span>
                <strong>{MOD_ACTION_LABELS[h.action] || h.action}</strong> — {h.target}
                <br /><small style={{ color: '#94a3b8' }}>{h.moderator}</small>
              </span>
              <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>
                {new Date(h.at).toLocaleString('fr-FR')}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ModeratorAnalyticsPage;
