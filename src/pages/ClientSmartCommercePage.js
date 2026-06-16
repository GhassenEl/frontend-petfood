import React, { useCallback, useEffect, useState } from 'react';
import { Sparkles, Package, GitCompare } from 'lucide-react';
import ComplementaryProductsPanel from '../components/ComplementaryProductsPanel';
import SmartReplenishmentPanel from '../components/SmartReplenishmentPanel';
import ProductSmartComparator from '../components/ProductSmartComparator';
import { loadSmartCommerceData } from '../services/smartCommerceService';
import './ClientSmartCommerce.css';

const TABS = [
  { id: 'suggestions', label: 'Suggestions personnalisées', icon: Sparkles },
  { id: 'replenishment', label: 'Réapprovisionnement intelligent', icon: Package },
  { id: 'compare', label: 'Comparateur intelligent', icon: GitCompare },
];

const ClientSmartCommercePage = () => {
  const [tab, setTab] = useState('suggestions');
  const [loading, setLoading] = useState(true);
  const [complementary, setComplementary] = useState([]);
  const [replenishment, setReplenishment] = useState([]);
  const [products, setProducts] = useState([]);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await loadSmartCommerceData();
      setComplementary(data.complementary || []);
      setReplenishment(data.replenishment || []);
      setProducts(data.products || []);
    } catch (e) {
      setError('Chargement en mode démo — certaines données sont estimées localement.');
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="sc-page">
      <h1>E-commerce avancé</h1>
      <p className="sc-lead">
        Suggestions complémentaires selon vos achats, réapprovisionnement prédictif et comparateur
        multi-critères (composition, nutrition, prix, avis clients).
      </p>

      <div className="sc-tabs" role="tablist" aria-label="E-commerce avancé">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={tab === id}
            className={`sc-tab ${tab === id ? 'is-active' : ''}`}
            onClick={() => setTab(id)}
          >
            <Icon size={16} aria-hidden style={{ verticalAlign: 'middle', marginRight: 6 }} />
            {label}
          </button>
        ))}
      </div>

      {error && <p className="sc-muted">{error}</p>}

      <div className="sc-tab-panel" role="tabpanel">
        {tab === 'suggestions' && (
          <>
            <h2 style={{ marginTop: 0, fontSize: 18 }}>Produits complémentaires</h2>
            <p className="sc-muted">
              Proposition automatique selon vos achats précédents et le profil de vos animaux.
            </p>
            <ComplementaryProductsPanel items={complementary} loading={loading} />
          </>
        )}

        {tab === 'replenishment' && (
          <>
            <h2 style={{ marginTop: 0, fontSize: 18 }}>Réapprovisionnement intelligent</h2>
            <p className="sc-muted">
              L&apos;IA estime la date de fin probable de stock et recommande une commande avant rupture.
            </p>
            <SmartReplenishmentPanel plans={replenishment} loading={loading} />
          </>
        )}

        {tab === 'compare' && (
          <>
            <h2 style={{ marginTop: 0, fontSize: 18 }}>Comparateur intelligent</h2>
            <ProductSmartComparator products={products} />
          </>
        )}
      </div>
    </div>
  );
};

export default ClientSmartCommercePage;
