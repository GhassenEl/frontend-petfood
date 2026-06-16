import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Store, TrendingUp, Package, DollarSign, FileText, Star, Target, RefreshCw,
} from 'lucide-react';
import usePlatformRefresh from '../hooks/usePlatformRefresh';
import { loadMerchantIntelligencePack } from '../services/merchantIntelligenceService';
import AdminSalesForecastPanel from '../components/AdminSalesForecastPanel';
import PredictiveStockPanel from '../components/PredictiveStockPanel';
import AdminPriceOptimizationPanel from '../components/AdminPriceOptimizationPanel';
import AdminProductDescriptionsPanel from '../components/AdminProductDescriptionsPanel';
import AdminBatchReviewAnalysisPanel from '../components/AdminBatchReviewAnalysisPanel';
import AdminMarketingCampaignsPanel from '../components/AdminMarketingCampaignsPanel';
import './AdminMerchantIntelligence.css';

const TABS = [
  { id: 'forecast', label: 'Prévision ventes', icon: TrendingUp },
  { id: 'stock', label: 'Stock intelligent', icon: Package },
  { id: 'pricing', label: 'Optimisation prix', icon: DollarSign },
  { id: 'descriptions', label: 'Descriptions IA', icon: FileText },
  { id: 'reviews', label: 'Analyse avis', icon: Star },
  { id: 'marketing', label: 'Marketing IA', icon: Target },
];

const AdminMerchantIntelligencePage = () => {
  const [tab, setTab] = useState('forecast');
  const [pack, setPack] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setPack(await loadMerchantIntelligencePack());
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

  return (
    <div className="mi-page">
      <h1>
        <Store size={26} style={{ verticalAlign: 'middle', marginRight: 8 }} aria-hidden />
        Intelligence marchande
      </h1>
      <p className="mi-lead">
        Prévision des ventes, alertes stock, optimisation des prix, génération de fiches produits,
        analyse des avis et recommandations marketing ciblées.
      </p>

      <div className="mi-toolbar">
        <div className="mi-tabs">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              className={`mi-tab${tab === id ? ' mi-tab--active' : ''}`}
              onClick={() => setTab(id)}
            >
              <Icon size={15} aria-hidden /> {label}
            </button>
          ))}
        </div>
        <button type="button" className="mi-btn-ghost" onClick={load} disabled={loading}>
          <RefreshCw size={16} aria-hidden /> Actualiser
        </button>
      </div>

      {tab === 'forecast' && (
        <AdminSalesForecastPanel forecast={pack?.salesForecast} loading={loading} />
      )}
      {tab === 'stock' && (
        <>
          <PredictiveStockPanel predictions={pack?.stockAlerts || []} loading={loading} />
          <p className="mi-footer-link">
            <Link to="/admin/stock">Gestion stock complète →</Link>
          </p>
        </>
      )}
      {tab === 'pricing' && (
        <AdminPriceOptimizationPanel items={pack?.priceOptimizations || []} />
      )}
      {tab === 'descriptions' && (
        <AdminProductDescriptionsPanel descriptions={pack?.descriptions || []} />
      )}
      {tab === 'reviews' && (
        <AdminBatchReviewAnalysisPanel analysis={pack?.reviewAnalysis || []} />
      )}
      {tab === 'marketing' && (
        <>
          <AdminMarketingCampaignsPanel marketing={pack?.marketing} />
          <p className="mi-footer-link">
            <Link to="/admin/promotions">Promotions →</Link>
          </p>
        </>
      )}
    </div>
  );
};

export default AdminMerchantIntelligencePage;
