import React, { useCallback, useEffect, useState } from 'react';
import { BarChart3, LineChart, AlertTriangle, Brain } from 'lucide-react';
import AdminAnalyticsDashboard from '../components/AdminAnalyticsDashboard';
import AdminSalesForecastPanel from '../components/AdminSalesForecastPanel';
import AdminRiskProductsPanel from '../components/AdminRiskProductsPanel';
import AdminSalesForecast from '../components/AdminSalesForecast';
import { loadAnalyticsDecisionPack } from '../services/analyticsDecisionService';
import usePlatformRefresh from '../hooks/usePlatformRefresh';
import './AdminAnalyticsDecision.css';

const TABS = [
  { id: 'dashboard', label: 'Tableau de bord analytique', icon: BarChart3 },
  { id: 'forecast', label: 'Prévision des ventes (ML)', icon: LineChart },
  { id: 'risk', label: 'Produits à risque', icon: AlertTriangle },
];

const AdminAnalyticsDecisionPage = () => {
  const [tab, setTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [pack, setPack] = useState(null);
  const [demoNote, setDemoNote] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setDemoNote('');
    try {
      const data = await loadAnalyticsDecisionPack();
      setPack(data);
    } catch (e) {
      console.error(e);
      setDemoNote('Mode démo — données estimées localement.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  usePlatformRefresh(load, [load]);

  return (
    <div className="aad-page">
      <h1>Analyse &amp; décision</h1>
      <p className="aad-lead">
        Visualisation des ventes, produits populaires, satisfaction client, tendances marché,
        prévisions ML et détection des produits à risque.
      </p>

      {demoNote && <p className="aad-lead" style={{ color: '#0d9488' }}>{demoNote}</p>}

      <div className="aad-tabs" role="tablist" aria-label="Analyse et décision">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={tab === id}
            className={`aad-tab ${tab === id ? 'is-active' : ''}`}
            onClick={() => setTab(id)}
          >
            <Icon size={16} aria-hidden />
            {label}
          </button>
        ))}
      </div>

      <div className="aad-panel-wrap" role="tabpanel">
        {tab === 'dashboard' && (
          <>
            <h2 style={{ marginTop: 0, fontSize: 18 }}>Tableau de bord analytique</h2>
            <AdminAnalyticsDashboard
              dashboard={pack?.dashboard}
              salesChart={pack?.salesChart}
              loading={loading}
            />
          </>
        )}

        {tab === 'forecast' && (
          <>
            <h2 style={{ marginTop: 0, fontSize: 18, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Brain size={20} aria-hidden />
              Prévision des ventes — optimisation stocks
            </h2>
            <p className="aad-lead" style={{ marginBottom: 16 }}>
              Machine Learning (régression) pour anticiper la demande et ajuster les réapprovisionnements.
            </p>
            <AdminSalesForecastPanel forecast={pack?.salesForecast} loading={loading} />
            <div style={{ marginTop: 24, borderTop: '1px solid #e2e8f0', paddingTop: 20 }}>
              <p className="aad-lead" style={{ fontSize: 13 }}>
                Prévision avancée (API FastAPI) — comparaison avec le modèle local :
              </p>
              <AdminSalesForecast />
            </div>
          </>
        )}

        {tab === 'risk' && (
          <>
            <h2 style={{ marginTop: 0, fontSize: 18 }}>Détection des produits à risque</h2>
            <p className="aad-lead" style={{ marginBottom: 16 }}>
              Produits avec avis négatifs récurrents ou faible taux de satisfaction.
            </p>
            <AdminRiskProductsPanel items={pack?.atRiskProducts} loading={loading} />
          </>
        )}
      </div>
    </div>
  );
};

export default AdminAnalyticsDecisionPage;
