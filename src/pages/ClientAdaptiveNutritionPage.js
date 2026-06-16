import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, CalendarDays, Target, RefreshCw } from 'lucide-react';
import AdaptiveNutritionPanel from '../components/AdaptiveNutritionPanel';
import WeeklyDietPlanPanel from '../components/WeeklyDietPlanPanel';
import ProductCompatibilityPanel from '../components/ProductCompatibilityPanel';
import { loadAdaptiveNutritionPack } from '../services/adaptiveNutritionService';
import usePlatformRefresh from '../hooks/usePlatformRefresh';
import './ClientAdaptiveNutrition.css';

const TABS = [
  { id: 'adaptive', label: 'Recommandations IA', icon: Sparkles },
  { id: 'weekly', label: 'Régime hebdomadaire', icon: CalendarDays },
  { id: 'compatibility', label: 'Score compatibilité', icon: Target },
];

const ClientAdaptiveNutritionPage = () => {
  const [tab, setTab] = useState('adaptive');
  const [loading, setLoading] = useState(true);
  const [pack, setPack] = useState(null);
  const [petIndex, setPetIndex] = useState(0);
  const [options, setOptions] = useState({
    activityLevel: 'moyen',
    goal: 'maintien',
    isNeutered: true,
    mealCount: 2,
  });

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

  return (
    <div className="an-page">
      <h1>Nutrition adaptative IA</h1>
      <p className="an-lead">
        L&apos;IA ajuste les recommandations selon l&apos;évolution du poids, l&apos;âge et l&apos;activité.
        Plans hebdomadaires et score de compatibilité produit-animal.
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
          Calculateur calories →
        </Link>
      </div>

      <div className="an-tabs" role="tablist">
        {TABS.map(({ id, label, icon: Icon }) => (
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
          </button>
        ))}
      </div>

      <div className="an-panel-wrap" role="tabpanel">
        {tab === 'adaptive' && (
          <AdaptiveNutritionPanel data={current} loading={loading} />
        )}
        {tab === 'weekly' && (
          <WeeklyDietPlanPanel plan={current?.weeklyPlan} loading={loading} />
        )}
        {tab === 'compatibility' && (
          <ProductCompatibilityPanel scores={current?.productScores} loading={loading} />
        )}
      </div>
    </div>
  );
};

export default ClientAdaptiveNutritionPage;
