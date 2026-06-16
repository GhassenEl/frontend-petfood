import React, { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Sparkles, Search, MessageCircle, GitCompare, Heart, Lightbulb, Calendar } from 'lucide-react';
import VisitorLayout from '../layouts/VisitorLayout';
import { loadVisitorIntelligenceHub } from '../services/visitorIntelligenceHubService';
import VisitorNlSearchPanel from '../components/VisitorNlSearchPanel';
import VisitorConversationalAssistant from '../components/VisitorConversationalAssistant';
import VisitorSmartComparatorPanel from '../components/VisitorSmartComparatorPanel';
import SmartWishlistPanel from '../components/SmartWishlistPanel';
import VisitorExplainableRecsPanel from '../components/VisitorExplainableRecsPanel';
import VisitorFutureNutritionPanel from '../components/VisitorFutureNutritionPanel';
import './VisitorIntelligenceHub.css';
import './ClientExplainableAi.css';

const TABS = [
  { id: 'search', label: 'Recherche IA', icon: Search },
  { id: 'explain', label: 'Explications IA', icon: Lightbulb },
  { id: 'future', label: 'Besoins futurs', icon: Calendar },
  { id: 'chat', label: 'Assistant', icon: MessageCircle },
  { id: 'compare', label: 'Comparateur', icon: GitCompare },
  { id: 'wishlist', label: 'Souhaits IA', icon: Heart },
];

const PET_TYPES = [
  { id: 'dog', label: 'Chien' },
  { id: 'cat', label: 'Chat' },
];

const TAB_IDS = TABS.map((t) => t.id);

const VisitorIntelligenceHubPage = () => {
  const [searchParams] = useSearchParams();
  const [tab, setTab] = useState(
    TAB_IDS.includes(searchParams.get('tab')) ? searchParams.get('tab') : 'search',
  );
  const [pack, setPack] = useState(null);
  const [petType, setPetType] = useState('cat');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setPack(await loadVisitorIntelligenceHub(petType));
    } finally {
      setLoading(false);
    }
  }, [petType]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const t = searchParams.get('tab');
    if (t && TAB_IDS.includes(t)) setTab(t);
  }, [searchParams]);

  return (
    <VisitorLayout>
      <div className="vis-intel-page">
        <header className="vis-intel-hero">
          <h1><Sparkles size={26} aria-hidden /> Intelligence visiteur</h1>
          <p>
            Recherche en langage naturel, explications des recommandations, prédiction des besoins
            alimentaires, assistant, comparateur et liste de souhaits — sans compte requis.
          </p>
        </header>

        <div className="vis-intel-toolbar">
          <div className="vis-intel-tabs">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                className={`vis-intel-tab${tab === id ? ' vis-intel-tab--active' : ''}`}
                onClick={() => setTab(id)}
              >
                <Icon size={15} aria-hidden /> {label}
              </button>
            ))}
          </div>
          {(tab === 'wishlist' || tab === 'explain' || tab === 'future') && (
            <label className="vis-intel-pet-pick">
              Animal
              <select value={petType} onChange={(e) => setPetType(e.target.value)}>
                {PET_TYPES.map((t) => (
                  <option key={t.id} value={t.id}>{t.label}</option>
                ))}
              </select>
            </label>
          )}
        </div>

        {loading && !pack ? (
          <p className="vis-intel-muted">Chargement…</p>
        ) : (
          <>
            {tab === 'search' && <VisitorNlSearchPanel products={pack?.products || []} />}
            {tab === 'explain' && (
              <VisitorExplainableRecsPanel products={pack?.products || []} loading={loading} />
            )}
            {tab === 'future' && <VisitorFutureNutritionPanel loading={loading} />}
            {tab === 'chat' && (
              <VisitorConversationalAssistant quickQuestions={pack?.quickQuestions || []} />
            )}
            {tab === 'compare' && (
              <VisitorSmartComparatorPanel
                products={pack?.products || []}
                reviewsByProductId={pack?.reviewsByProductId || {}}
              />
            )}
            {tab === 'wishlist' && (
              <SmartWishlistPanel suggestions={pack?.wishlistSuggestions || []} />
            )}
          </>
        )}
      </div>
    </VisitorLayout>
  );
};

export default VisitorIntelligenceHubPage;
