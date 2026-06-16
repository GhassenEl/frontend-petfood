import React, { useCallback, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Brain, Route, Clock, AlertTriangle, Package, Navigation, Camera,
  BarChart3, Leaf, RefreshCw, Thermometer,
} from 'lucide-react';
import usePlatformRefresh from '../hooks/usePlatformRefresh';
import DemoModePill from '../components/DemoModePill';
import { loadLivreurIntelligenceHubPack } from '../services/livreurIntelligenceHubService';
import LivreurRouteOptimizationPanel from '../components/LivreurRouteOptimizationPanel';
import LivreurEtaPredictionPanel from '../components/LivreurEtaPredictionPanel';
import LivreurDelayDetectionPanel from '../components/LivreurDelayDetectionPanel';
import LivreurParcelPriorityPanel from '../components/LivreurParcelPriorityPanel';
import LivreurNavigationAssistantPanel from '../components/LivreurNavigationAssistantPanel';
import LivreurDeliveryVerificationPanel from '../components/LivreurDeliveryVerificationPanel';
import LivreurPerformancePanel from '../components/LivreurPerformancePanel';
import LivreurEcoOptimizationPanel from '../components/LivreurEcoOptimizationPanel';
import DeliveryColdChainPanel from '../components/DeliveryColdChainPanel';
import './LivreurIntelligenceHub.css';

const TABS = [
  { id: 'routes', label: 'Tournées', icon: Route },
  { id: 'cold-chain', label: 'Chaîne du froid', icon: Thermometer },
  { id: 'eta', label: 'ETA', icon: Clock },
  { id: 'delays', label: 'Retards', icon: AlertTriangle },
  { id: 'parcels', label: 'Colis', icon: Package },
  { id: 'navigation', label: 'Navigation', icon: Navigation },
  { id: 'verification', label: 'Vérification', icon: Camera },
  { id: 'performance', label: 'Performances', icon: BarChart3 },
  { id: 'eco', label: 'Éco', icon: Leaf },
];

const TAB_IDS = TABS.map((t) => t.id);

const LivreurIntelligenceHubPage = () => {
  const [searchParams] = useSearchParams();
  const [tab, setTab] = useState(
    TAB_IDS.includes(searchParams.get('tab')) ? searchParams.get('tab') : 'routes',
  );
  const [pack, setPack] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setPack(await loadLivreurIntelligenceHubPack());
    } catch (e) {
      console.error(e);
      setPack(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const t = searchParams.get('tab');
    if (t && TAB_IDS.includes(t)) setTab(t);
  }, [searchParams]);

  usePlatformRefresh(load, [load]);

  const intel = pack?.intelligence || {};

  return (
    <div className="livih-page">
      <h1>
        <Brain size={26} aria-hidden />
        Intelligence livraison
      </h1>
      <p className="livih-lead">
        Optimisation tournées, prédiction ETA, détection retards, priorisation colis, navigation,
        vérification livraison, performances et optimisation écologique.
      </p>

      {pack?.mode === 'demo' && <DemoModePill />}

      <div className="livih-stats-bar">
        <div className="livih-stat-bar">
          <strong>{pack?.optimizedRoute?.summary?.stopCount ?? '—'}</strong>
          <span>Arrêts tournée</span>
        </div>
        <div className="livih-stat-bar">
          <strong>{intel.delayCount ?? 0}</strong>
          <span>Alertes retard</span>
        </div>
        <div className="livih-stat-bar">
          <strong>{intel.priorityParcels ?? 0}</strong>
          <span>Colis prioritaires</span>
        </div>
        <div className="livih-stat-bar">
          <strong>-{intel.ecoSavingPercent ?? 0}%</strong>
          <span>CO₂ économisable</span>
        </div>
      </div>

      <div className="livih-toolbar">
        <div className="livih-tabs" role="tablist" aria-label="Intelligence livreur">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={tab === id}
              className={`livih-tab${tab === id ? ' livih-tab--active' : ''}`}
              onClick={() => setTab(id)}
            >
              <Icon size={14} aria-hidden /> {label}
              {id === 'delays' && (intel.delayCount || 0) > 0 && (
                <span className="livih-tab-badge">{intel.delayCount}</span>
              )}
            </button>
          ))}
        </div>
        <button type="button" className="livih-btn-ghost" onClick={load} disabled={loading}>
          <RefreshCw size={16} aria-hidden /> Actualiser
        </button>
      </div>

      {tab === 'routes' && (
        <LivreurRouteOptimizationPanel route={pack?.optimizedRoute} loading={loading} />
      )}
      {tab === 'cold-chain' && (
        <DeliveryColdChainPanel role="livreur" title="Capteurs véhicule — livraison en cours" />
      )}
      {tab === 'eta' && (
        <LivreurEtaPredictionPanel
          eta={pack?.eta}
          stops={pack?.optimizedRoute?.stops}
          loading={loading}
        />
      )}
      {tab === 'delays' && (
        <LivreurDelayDetectionPanel delays={pack?.delays} loading={loading} />
      )}
      {tab === 'parcels' && (
        <LivreurParcelPriorityPanel parcels={pack?.parcels} loading={loading} />
      )}
      {tab === 'navigation' && (
        <LivreurNavigationAssistantPanel navigation={pack?.navigation} loading={loading} />
      )}
      {tab === 'verification' && (
        <LivreurDeliveryVerificationPanel verifications={pack?.verifications} loading={loading} />
      )}
      {tab === 'performance' && (
        <LivreurPerformancePanel performance={pack?.performance} loading={loading} />
      )}
      {tab === 'eco' && (
        <LivreurEcoOptimizationPanel eco={pack?.eco} loading={loading} />
      )}

      <p style={{ marginTop: 24, fontSize: 13, color: '#94a3b8' }}>
        Modules :{' '}
        <Link to="/livreur/route">Tournée</Link>
        {' · '}
        <Link to="/livreur/delivery-cold-chain">Chaîne du froid IoT</Link>
        {' · '}
        <Link to="/livreur/map">Carte</Link>
        {' · '}
        <Link to="/livreur/ml">ML risques</Link>
        {' · '}
        <Link to="/livreur/stats">Stats</Link>
      </p>
    </div>
  );
};

export default LivreurIntelligenceHubPage;
