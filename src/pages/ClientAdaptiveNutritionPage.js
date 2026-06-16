import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarDays,
  Target,
  RefreshCw,
  Brain,
  Utensils,
  TrendingUp,
  ShieldAlert,
  User,
  Award,
  FlaskConical,
  ChefHat,
  BookOpen,
  ArrowRightLeft,
  Pill,
  Sparkles,
} from 'lucide-react';
import AdaptiveNutritionPanel from '../components/AdaptiveNutritionPanel';
import IntelligentNutritionProgramPanel from '../components/IntelligentNutritionProgramPanel';
import DailyRationPanel from '../components/DailyRationPanel';
import NutritionRiskPanel from '../components/NutritionRiskPanel';
import WeeklyDietPlanPanel from '../components/WeeklyDietPlanPanel';
import ProductCompatibilityPanel from '../components/ProductCompatibilityPanel';
import PetNutritionProfilePanel from '../components/PetNutritionProfilePanel';
import PetFoodTnScorePanel from '../components/PetFoodTnScorePanel';
import IngredientAnalysisPanel from '../components/IngredientAnalysisPanel';
import MultiProductMenuPanel from '../components/MultiProductMenuPanel';
import FoodJournalPanel from '../components/FoodJournalPanel';
import FoodTransitionPanel from '../components/FoodTransitionPanel';
import TherapeuticNutritionPanel from '../components/TherapeuticNutritionPanel';
import FutureNutritionPanel from '../components/FutureNutritionPanel';
import { loadAdaptiveNutritionPack } from '../services/adaptiveNutritionService';
import usePlatformRefresh from '../hooks/usePlatformRefresh';
import './ClientAdaptiveNutrition.css';

const SECTIONS = [
  {
    id: 'profile',
    label: 'Profil & produits',
    tabs: [
      { id: 'profile', label: 'Profil nutritionnel', icon: User },
      { id: 'score', label: 'Score PetFoodTN', icon: Award },
      { id: 'ingredients', label: 'Ingrédients IA', icon: FlaskConical },
      { id: 'compatibility', label: 'Compatibilité', icon: Target },
    ],
  },
  {
    id: 'plans',
    label: 'Plans alimentaires',
    tabs: [
      { id: 'program', label: 'Programme IA', icon: Brain },
      { id: 'ration', label: 'Ration journalière', icon: Utensils },
      { id: 'menus', label: 'Menus hebdo', icon: ChefHat },
      { id: 'weekly', label: 'Régime simple', icon: CalendarDays },
      { id: 'transition', label: 'Transition', icon: ArrowRightLeft },
    ],
  },
  {
    id: 'follow',
    label: 'Suivi & santé',
    tabs: [
      { id: 'journal', label: 'Journal alimentaire', icon: BookOpen },
      { id: 'evolution', label: 'Suivi évolutif', icon: TrendingUp },
      { id: 'risks', label: 'Risques', icon: ShieldAlert },
      { id: 'therapeutic', label: 'Thérapeutique', icon: Pill },
      { id: 'future', label: 'Prédictions', icon: Sparkles },
    ],
  },
];

const ClientAdaptiveNutritionPage = () => {
  const [sectionId, setSectionId] = useState('profile');
  const [tab, setTab] = useState('profile');
  const [loading, setLoading] = useState(true);
  const [pack, setPack] = useState(null);
  const [petIndex, setPetIndex] = useState(0);
  const [options, setOptions] = useState({
    activityLevel: 'moyen',
    goal: 'maintien',
    isNeutered: true,
    mealCount: 2,
  });

  const activeSection = useMemo(
    () => SECTIONS.find((s) => s.id === sectionId) || SECTIONS[0],
    [sectionId],
  );

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setPack(await loadAdaptiveNutritionPack(options));
    } catch (e) {
      console.error(e);
      setPack(null);
    } finally {
      setLoading(false);
    }
  }, [options]);

  useEffect(() => {
    load();
  }, [load]);

  usePlatformRefresh(load, [load]);

  const current = pack?.pets?.[petIndex] || null;
  const riskCount = current?.intelligentProgram?.riskAnalysis?.risks?.length ?? 0;

  const handleSectionChange = (id) => {
    setSectionId(id);
    const section = SECTIONS.find((s) => s.id === id);
    if (section?.tabs[0]) setTab(section.tabs[0].id);
  };

  return (
    <div className="an-page">
      <h1>Profil nutritionnel intelligent</h1>
      <p className="an-lead">
        Profil dynamique par animal, analyse des ingrédients, score PetFoodTN, menus hebdomadaires,
        journal alimentaire, transition progressive, alimentation thérapeutique et prédiction des besoins futurs.
      </p>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 16, alignItems: 'flex-end' }}>
        <label className="an-pet-select">
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
        <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12, fontWeight: 700, color: '#64748b' }}>
          Activité
          <select
            value={options.activityLevel}
            onChange={(e) => setOptions((o) => ({ ...o, activityLevel: e.target.value }))}
            style={{ padding: '10px 12px', borderRadius: 10, border: '1px solid #e2e8f0' }}
          >
            <option value="faible">Faible</option>
            <option value="moyen">Moyenne</option>
            <option value="eleve">Élevée</option>
          </select>
        </label>
        <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12, fontWeight: 700, color: '#64748b' }}>
          Objectif
          <select
            value={options.goal}
            onChange={(e) => setOptions((o) => ({ ...o, goal: e.target.value }))}
            style={{ padding: '10px 12px', borderRadius: 10, border: '1px solid #e2e8f0' }}
          >
            <option value="maintien">Maintien</option>
            <option value="perte">Perte de poids</option>
            <option value="prise">Prise de masse</option>
          </select>
        </label>
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
          Recalculer IA
        </button>
        <Link to="/pet-calories" style={{ fontSize: 13, fontWeight: 700, color: '#ea580c', marginLeft: 'auto' }}>
          Calculateur calories détaillé →
        </Link>
      </div>

      <div className="an-sections" role="tablist" aria-label="Sections nutrition">
        {SECTIONS.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            className={`an-section-btn ${sectionId === id ? 'is-active' : ''}`}
            onClick={() => handleSectionChange(id)}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="an-tabs" role="tablist">
        {activeSection.tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={tab === id}
            className={`an-tab ${tab === id ? 'is-active' : ''}`}
            onClick={() => setTab(id)}
          >
            <Icon size={16} aria-hidden />
            {label}
            {id === 'risks' && riskCount > 0 && (
              <span className="an-tab-badge">{riskCount}</span>
            )}
          </button>
        ))}
      </div>

      <div className="an-panel-wrap" role="tabpanel">
        {tab === 'profile' && <PetNutritionProfilePanel data={current} loading={loading} />}
        {tab === 'score' && <PetFoodTnScorePanel scores={current?.petFoodTnScores} loading={loading} />}
        {tab === 'ingredients' && (
          <IngredientAnalysisPanel analyses={current?.ingredientAnalyses} loading={loading} />
        )}
        {tab === 'compatibility' && (
          <ProductCompatibilityPanel scores={current?.productScores} loading={loading} />
        )}
        {tab === 'program' && <IntelligentNutritionProgramPanel data={current} loading={loading} />}
        {tab === 'ration' && <DailyRationPanel data={current} loading={loading} />}
        {tab === 'menus' && <MultiProductMenuPanel menu={current?.multiProductMenu} loading={loading} />}
        {tab === 'weekly' && <WeeklyDietPlanPanel plan={current?.weeklyPlan} loading={loading} />}
        {tab === 'transition' && <FoodTransitionPanel plan={current?.transitionPlan} loading={loading} />}
        {tab === 'journal' && <FoodJournalPanel journal={current?.foodJournal} loading={loading} />}
        {tab === 'evolution' && <AdaptiveNutritionPanel data={current} loading={loading} />}
        {tab === 'risks' && <NutritionRiskPanel data={current} loading={loading} />}
        {tab === 'therapeutic' && (
          <TherapeuticNutritionPanel data={current?.therapeuticNutrition} loading={loading} />
        )}
        {tab === 'future' && <FutureNutritionPanel timeline={current?.futureTimeline} loading={loading} />}
      </div>
    </div>
  );
};

export default ClientAdaptiveNutritionPage;
