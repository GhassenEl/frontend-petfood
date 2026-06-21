import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Stethoscope, MessageCircle, Store, TrendingUp, RefreshCw, Pill } from 'lucide-react';
import PetHealthRecommendationPanel from '../components/PetHealthRecommendationPanel';
import usePlatformRefresh from '../hooks/usePlatformRefresh';
import { loadVetIntelligencePack } from '../services/vetIntelligenceService';
import { getMarketplaceRecommendation } from '../utils/intelligentVetMarketplace';
import VetConversationalAssistant from '../components/VetConversationalAssistant';
import IntelligentVetMarketplacePanel from '../components/IntelligentVetMarketplacePanel';
import FutureNeedsPredictionPanel from '../components/FutureNeedsPredictionPanel';
import './ClientVetIntelligence.css';

const TABS = [
  { id: 'assistant', label: 'Assistant IA', icon: MessageCircle },
  { id: 'health', label: 'Symptômes & traitements', icon: Pill },
  { id: 'marketplace', label: 'Marketplace véto', icon: Store },
  { id: 'predictions', label: 'Besoins futurs', icon: TrendingUp },
];

const ClientVetIntelligencePage = () => {
  const [tab, setTab] = useState('assistant');
  const [loading, setLoading] = useState(true);
  const [pack, setPack] = useState(null);
  const [specialty, setSpecialty] = useState('');
  const [petIndex, setPetIndex] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setPack(await loadVetIntelligencePack());
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

  const marketplace = useMemo(() => {
    if (!pack?.allVets?.length) return { vets: [], summary: '', best: null };
    return getMarketplaceRecommendation(pack.allVets, {
      specialty: specialty || null,
      lat: pack.position?.lat,
      lng: pack.position?.lng,
      region: pack.profileRegion,
    });
  }, [pack, specialty]);

  const futurePrediction = pack?.futureByPet?.[petIndex] || null;

  if (loading && !pack) {
    return <div className="vetintel-page"><p className="vetintel-loading">Chargement…</p></div>;
  }

  return (
    <div className="vetintel-page">
      <h1>
        <Stethoscope size={26} style={{ verticalAlign: 'middle', marginRight: 8 }} aria-hidden />
        Intelligence vétérinaire
      </h1>
      <p className="vetintel-lead">
        Assistant conversationnel pré-consultation, marketplace vétérinaire intelligente
        et prédiction de vos futurs achats selon la consommation et le profil animal.
      </p>

      <div className="vetintel-toolbar">
        <div className="vetintel-tabs">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              className={`vetintel-tab${tab === id ? ' vetintel-tab--active' : ''}`}
              onClick={() => setTab(id)}
            >
              <Icon size={16} aria-hidden /> {label}
            </button>
          ))}
        </div>
        <button type="button" className="vetintel-btn vetintel-btn--ghost" onClick={load} disabled={loading}>
          <RefreshCw size={16} aria-hidden /> Actualiser
        </button>
      </div>

      {tab === 'assistant' && (
        <VetConversationalAssistant
          pets={pack?.pets || []}
          quickQuestions={pack?.quickQuestions || []}
        />
      )}

      {tab === 'health' && (
        <PetHealthRecommendationPanel compact />
      )}

      {tab === 'marketplace' && (
        <>
          <IntelligentVetMarketplacePanel
            vets={marketplace.vets}
            summary={marketplace.summary}
            specialties={pack?.specialties || []}
            selectedSpecialty={specialty}
            onSpecialtyChange={setSpecialty}
          />
          <p className="vetintel-footer-link">
            <Link to="/client-geo-services">Services géolocalisés →</Link>
          </p>
        </>
      )}

      {tab === 'predictions' && (
        <>
          <label className="vetintel-select" style={{ marginBottom: 16 }}>
            <span>Animal</span>
            <select value={petIndex} onChange={(e) => setPetIndex(Number(e.target.value))}>
              {(pack?.pets || []).map((p, i) => (
                <option key={p.id || i} value={i}>{p.name}</option>
              ))}
            </select>
          </label>
          <FutureNeedsPredictionPanel
            prediction={futurePrediction}
            petName={pack?.pets?.[petIndex]?.name}
          />
        </>
      )}
    </div>
  );
};

export default ClientVetIntelligencePage;
