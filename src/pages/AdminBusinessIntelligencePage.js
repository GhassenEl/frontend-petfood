import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BarChart3, Users, TrendingUp, Package, RefreshCw, MapPin, Layers } from 'lucide-react';
import ClientSegmentationPanel from '../components/ClientSegmentationPanel';
import MarketTrendsPanel from '../components/MarketTrendsPanel';
import PredictiveStockPanel from '../components/PredictiveStockPanel';
import AdminGeographicSalesPanel from '../components/AdminGeographicSalesPanel';
import BiPlatformSnapshotPanel from '../components/BiPlatformSnapshotPanel';
import { loadBusinessIntelligencePack } from '../services/businessIntelligenceService';
import usePlatformRefresh from '../hooks/usePlatformRefresh';
import './AdminBusinessIntelligence.css';

const TABS = [
  { id: 'platform', label: 'Vue plateforme', icon: Layers },
  { id: 'segments', label: 'Segmentation clients', icon: Users },
  { id: 'trends', label: 'Tendances marché', icon: TrendingUp },
  { id: 'stock', label: 'Stocks prédictifs', icon: Package },
  { id: 'geo', label: 'Ventes géographiques', icon: MapPin },
];

const AdminBusinessIntelligencePage = () => {
  const [tab, setTab] = useState('platform');
  const [pack, setPack] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setPack(await loadBusinessIntelligencePack());
    } catch (e) {
      console.error(e);
      setPack(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  usePlatformRefresh(load, [load]);

  const kpi = pack?.kpi || {};

  return (
    <div className="bi-page">
      <h1>
        <BarChart3 size={26} style={{ verticalAlign: 'middle', marginRight: 8 }} aria-hidden />
        Business Intelligence
      </h1>
      <p className="bi-lead">
        Segmentation clients, tendances marché, stocks prédictifs — plus audience live, clinique vet et capteurs IoT.
      </p>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 16, alignItems: 'center' }}>
        <button
          type="button"
          onClick={load}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '10px 16px',
            borderRadius: 10,
            border: '1px solid #e2e8f0',
            background: '#f9fafb',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          <RefreshCw size={16} aria-hidden />
          Actualiser
        </button>
        <Link to="/admin/powerbi" style={{ fontSize: 13, fontWeight: 700, color: '#1e40af', marginLeft: 'auto' }}>
          Power BI →
        </Link>
        <Link to="/admin/live-audience" style={{ fontSize: 13, fontWeight: 700, color: '#1e40af' }}>
          Audience live →
        </Link>
        <Link to="/admin/stock-bi" style={{ fontSize: 13, fontWeight: 700, color: '#1e40af' }}>
          Stock BI →
        </Link>
      </div>

      <div className="bi-kpi-row">
        <div className="bi-kpi">
          <span>Clients segmentés</span>
          <strong>{pack?.segmentation?.totalClients ?? '—'}</strong>
        </div>
        <div className="bi-kpi">
          <span>Top catégorie</span>
          <strong>{kpi.topCategory}</strong>
        </div>
        <div className="bi-kpi">
          <span>SKU à risque stock</span>
          <strong>{kpi.atRiskStock ?? '—'}</strong>
        </div>
        <div className="bi-kpi">
          <span>En ligne (live)</span>
          <strong>{kpi.onlineUsers ?? '—'}</strong>
        </div>
        <div className="bi-kpi">
          <span>Cas vet actifs</span>
          <strong>{kpi.vetActiveCases ?? '—'}</strong>
        </div>
        <div className="bi-kpi">
          <span>Alertes IoT</span>
          <strong>{kpi.iotAlerts ?? '—'}</strong>
        </div>
      </div>

      <div className="bi-tabs" role="tablist">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={tab === id}
            className={`bi-tab ${tab === id ? 'is-active' : ''}`}
            onClick={() => setTab(id)}
          >
            <Icon size={16} aria-hidden />
            {label}
          </button>
        ))}
      </div>

      <div className="bi-panel-wrap" role="tabpanel">
        {tab === 'platform' && (
          <>
            <h2 style={{ marginTop: 0, fontSize: 18 }}>Vue plateforme — vet, IoT &amp; audience</h2>
            <p className="bi-lead" style={{ marginBottom: 16 }}>
              Données live agrégées depuis l&apos;API : sessions connectées, dossiers vétérinaires et capteurs PetFoodIoT.
            </p>
            <BiPlatformSnapshotPanel snapshot={pack?.platform} loading={loading} />
          </>
        )}
        {tab === 'segments' && (
          <>
            <h2 style={{ marginTop: 0, fontSize: 18 }}>Segmentation automatique des clients</h2>
            <ClientSegmentationPanel segmentation={pack?.segmentation} loading={loading} />
          </>
        )}
        {tab === 'trends' && (
          <>
            <h2 style={{ marginTop: 0, fontSize: 18 }}>Détection des tendances du marché</h2>
            <MarketTrendsPanel marketTrends={pack?.marketTrends} loading={loading} />
          </>
        )}
        {tab === 'stock' && (
          <>
            <h2 style={{ marginTop: 0, fontSize: 18 }}>Analyse prédictive des stocks</h2>
            <p className="bi-lead" style={{ marginBottom: 12 }}>
              Prévision des ruptures avant qu&apos;elles ne se produisent (vélocité + stock actuel).
            </p>
            <PredictiveStockPanel predictions={pack?.stockPredictions} loading={loading} />
          </>
        )}
        {tab === 'geo' && (
          <>
            <h2 style={{ marginTop: 0, fontSize: 18 }}>Répartition géographique du chiffre d&apos;affaires</h2>
            <AdminGeographicSalesPanel loading={loading} />
          </>
        )}
      </div>
    </div>
  );
};

export default AdminBusinessIntelligencePage;
