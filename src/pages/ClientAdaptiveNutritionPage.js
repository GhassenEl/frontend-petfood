import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  FileText,
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
import {
  generateNutritionPlan,
  formatPlanAsText,
  normalizePet,
  persistNutritionPlan,
} from '../services/nutritionPlanService';
import { PET_TYPE_LABELS } from '../utils/petCalorieCalculator';
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
  const navigate = useNavigate();
  const [sectionId, setSectionId] = useState('profile');
  const [tab, setTab] = useState('profile');
  const [loading, setLoading] = useState(true);
  const [pack, setPack] = useState(null);
  const [petIndex, setPetIndex] = useState(0);
  const [generatingPetKey, setGeneratingPetKey] = useState(null);
  const [generatedPlans, setGeneratedPlans] = useState({});
  const [activePlanPetKey, setActivePlanPetKey] = useState(null);
  const [planToast, setPlanToast] = useState('');
  const [planError, setPlanError] = useState('');
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
  const activeGeneratedPlan = activePlanPetKey ? generatedPlans[activePlanPetKey] : null;

  const petKeyForEntry = (entry, index) =>
    String(entry?.pet?.id || entry?.pet?._id || `idx-${index}`);

  const handleGeneratePlan = async (entry, index) => {
    const rawPet = entry?.pet || {};
    const petKey = petKeyForEntry(entry, index);
    const weight = rawPet.weightKg ?? rawPet.weight ?? entry?.recommendation?.weightKg;

    if (!rawPet.name) {
      setPlanError('Animal sans nom — impossible de générer le plan.');
      return;
    }
    if (!weight || Number(weight) <= 0) {
      setPlanError(`Renseignez le poids de ${rawPet.name} (profil animal ou calculateur calories).`);
      return;
    }

    setGeneratingPetKey(petKey);
    setPlanError('');
    setPlanToast('');

    try {
      const pet = normalizePet({ ...rawPet, weight });
      const plan = await generateNutritionPlan({
        pet,
        options,
        useAi: true,
        aiContext: {
          pets: [{
            type: pet.type,
            name: pet.name,
            weightKg: pet.weightKg,
            breed: pet.breed,
            age: pet.ageYears,
          }],
          nutritionPreferences: {
            goal: options.goal,
            activityLevel: options.activityLevel,
            mealCount: options.mealCount,
          },
        },
        aiMessage:
          `Génère un plan alimentaire professionnel pour ${pet.name} `
          + `(${PET_TYPE_LABELS[pet.type] || pet.type}). `
          + 'Sections : profil, portions, routine repas, aliments recommandés, suivi hebdomadaire.',
      });

      const planText = plan.aiPlan || formatPlanAsText(plan);
      await persistNutritionPlan({
        planText,
        pet,
        goal: options.goal,
        metadata: {
          activityLevel: options.activityLevel,
          mealCount: options.mealCount,
        },
      });

      setGeneratedPlans((prev) => ({
        ...prev,
        [petKey]: { ...plan, planText, pet },
      }));
      setActivePlanPetKey(petKey);
      setPetIndex(index);
      setSectionId('plans');
      setTab('weekly');
      setPlanToast(`Plan nutritionnel généré et sauvegardé pour ${pet.name}.`);
    } catch (e) {
      console.error(e);
      setPlanError('Génération du plan impossible. Réessayez dans un instant.');
    } finally {
      setGeneratingPetKey(null);
    }
  };

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

      {(pack?.pets || []).length > 0 && (
        <div className="an-pet-plans-row">
          <p className="an-pet-plans-title">Générer un plan NutriPro par animal</p>
          <div className="an-pet-plans-grid">
            {(pack.pets || []).map((entry, index) => {
              const pet = entry.pet || {};
              const petKey = petKeyForEntry(entry, index);
              const isGenerating = generatingPetKey === petKey;
              const hasPlan = !!generatedPlans[petKey];
              const weight = pet.weightKg ?? pet.weight ?? entry?.recommendation?.weightKg;

              return (
                <div
                  key={petKey}
                  className={`an-pet-plan-card ${petIndex === index ? 'is-selected' : ''}`}
                >
                  <div>
                    <strong>{pet.name || `Animal ${index + 1}`}</strong>
                    <span className="an-pet-plan-meta">
                      {PET_TYPE_LABELS[pet.type] || pet.type || '—'}
                      {weight ? ` · ${weight} kg` : ' · poids manquant'}
                    </span>
                  </div>
                  <div className="an-pet-plan-actions">
                    {hasPlan && (
                      <button
                        type="button"
                        className="an-pet-plan-view"
                        onClick={() => {
                          setActivePlanPetKey(petKey);
                          setPetIndex(index);
                        }}
                      >
                        Voir plan
                      </button>
                    )}
                    <button
                      type="button"
                      className="an-pet-plan-generate"
                      disabled={isGenerating || loading}
                      onClick={() => handleGeneratePlan(entry, index)}
                    >
                      <Sparkles size={14} aria-hidden />
                      {isGenerating ? 'Génération…' : 'Générer plan'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          {planError && <p className="an-plan-error">{planError}</p>}
          {planToast && <p className="an-plan-success">{planToast}</p>}
        </div>
      )}

      {activeGeneratedPlan && (
        <div className="an-generated-plan">
          <div className="an-generated-plan-header">
            <h2>
              <FileText size={20} aria-hidden />
              Plan — {activeGeneratedPlan.pet?.name}
            </h2>
            <div className="an-generated-plan-links">
              <button type="button" onClick={() => navigate('/nutripro-history')}>
                Historique NutriPro
              </button>
              <Link to="/smart-food-agent">Ouvrir NutriPro →</Link>
            </div>
          </div>
          {activeGeneratedPlan.calories?.supported && (
            <p className="an-generated-plan-stats">
              {activeGeneratedPlan.calories.dailyKcal} kcal/j ·{' '}
              {activeGeneratedPlan.calories.dryFoodGramsPerDay} g/jour ·{' '}
              {activeGeneratedPlan.calories.gramsPerMeal} g × {activeGeneratedPlan.calories.mealCount} repas
            </p>
          )}
          <pre className="an-generated-plan-text">{activeGeneratedPlan.planText}</pre>
        </div>
      )}

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
