import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Brain, MessageSquareText, HeartPulse, Search, RefreshCw } from 'lucide-react';
import ProductExplanationPanel from '../components/ProductExplanationPanel';
import EarlyHealthRiskPanel from '../components/EarlyHealthRiskPanel';
import NaturalLanguageSearchPanel from '../components/NaturalLanguageSearchPanel';
import { loadExplainableAiPack, runNaturalLanguageSearch } from '../services/explainableAiService';
import usePlatformRefresh from '../hooks/usePlatformRefresh';
import './ClientExplainableAi.css';

const TABS = [
  { id: 'explain', label: 'Explainable AI', icon: Brain },
  { id: 'health', label: 'Risques santé précoces', icon: HeartPulse },
  { id: 'search', label: 'Recherche intelligente', icon: Search },
];

const ClientExplainableAiPage = () => {
  const [tab, setTab] = useState('explain');
  const [loading, setLoading] = useState(true);
  const [pack, setPack] = useState(null);
  const [petIndex, setPetIndex] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setPack(await loadExplainableAiPack());
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

  const current = pack?.pets?.[petIndex] || null;
  const handleSearch = (query) => runNaturalLanguageSearch(pack?.products || [], query);

  return (
    <div className="xai-page">
      <h1>
        <Brain size={26} style={{ verticalAlign: 'middle', marginRight: 8 }} aria-hidden />
        Intelligence artificielle avancée
      </h1>
      <p className="xai-lead">
        Explicabilité des recommandations, détection précoce des risques de santé et recherche produits en langage naturel.
      </p>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 16, alignItems: 'center' }}>
        {tab !== 'search' && (
          <label className="xai-pet-select">
            <span style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#64748b', marginBottom: 4 }}>
              Animal
            </span>
            <select
              value={petIndex}
              onChange={(e) => setPetIndex(Number(e.target.value))}
              disabled={loading || !pack?.pets?.length}
            >
              {(pack?.pets || []).map((p, i) => (
                <option key={p.pet?.id || i} value={i}>
                  {p.pet?.name || `Animal ${i + 1}`}
                </option>
              ))}
            </select>
          </label>
        )}
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
        <Link to="/client-advanced-ai" style={{ fontSize: 13, fontWeight: 700, color: '#7c3aed', marginLeft: 'auto' }}>
          IA avancée →
        </Link>
      </div>

      <div className="xai-tabs" role="tablist">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={tab === id}
            className={`xai-tab ${tab === id ? 'is-active' : ''}`}
            onClick={() => setTab(id)}
          >
            <Icon size={16} aria-hidden />
            {label}
          </button>
        ))}
      </div>

      <div className="xai-panel-wrap" role="tabpanel">
        {tab === 'explain' && (
          <>
            <h2 style={{ marginTop: 0, fontSize: 18 }}>
              <MessageSquareText size={20} style={{ verticalAlign: 'middle', marginRight: 6 }} aria-hidden />
              Pourquoi ce produit ?
            </h2>
            <p className="xai-lead" style={{ marginBottom: 12 }}>
              Âge, race, lipides, avis vétérinaires — chaque recommandation est justifiée.
            </p>
            <ProductExplanationPanel items={current?.explainedProducts} loading={loading} />
          </>
        )}

        {tab === 'health' && (
          <>
            <h2 style={{ marginTop: 0, fontSize: 18 }}>Détection précoce des risques</h2>
            <p className="xai-lead" style={{ marginBottom: 12 }}>
              Analyse des habitudes alimentaires, du poids et du carnet médical pour {current?.pet?.name || 'votre animal'}.
            </p>
            <EarlyHealthRiskPanel risks={current?.healthRisks} loading={loading} />
          </>
        )}

        {tab === 'search' && (
          <>
            <h2 style={{ marginTop: 0, fontSize: 18 }}>Moteur de recherche intelligent</h2>
            <NaturalLanguageSearchPanel
              products={pack?.products}
              onSearch={handleSearch}
              loading={loading}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default ClientExplainableAiPage;
