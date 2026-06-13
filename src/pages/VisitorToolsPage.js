import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Flame, Package, PawPrint } from 'lucide-react';
import VisitorLayout from '../layouts/VisitorLayout';
import { fetchVisitorPacks } from '../services/visitorService';
import { VISITOR_BREED_GUIDES } from '../utils/visitorDemoData';
import {
  calculatePetCalories,
  PET_TYPE_LABELS,
} from '../utils/petCalorieCalculator';
import { buildPetNutritionRecommendation } from '../utils/petNutritionRecommender';
import { formatDT } from '../utils/formatCurrency';
import './VisitorPages.css';

const PET_TYPES = [
  { id: 'dog', label: '🐕 Chien' },
  { id: 'cat', label: '🐈 Chat' },
  { id: 'bird', label: '🐦 Oiseau' },
  { id: 'fish', label: '🐟 Poisson' },
  { id: 'rabbit', label: '🐰 Lapin' },
  { id: 'hamster', label: '🐹 Hamster' },
  { id: 'reptile', label: '🦎 Reptile' },
  { id: 'other', label: '🐾 NAC / autre' },
];

const defaultForm = {
  name: 'Mon animal',
  type: 'dog',
  breed: 'Sloughi',
  weight: '20',
  ageYears: '4',
  activityLevel: 'moyen',
  goal: 'maintien',
  isNeutered: true,
};

const VisitorToolsPage = () => {
  const [searchParams] = useSearchParams();
  const [tab, setTab] = useState(
    ['simulator', 'packs', 'breeds'].includes(searchParams.get('tab')) ? searchParams.get('tab') : 'simulator',
  );

  useEffect(() => {
    const t = searchParams.get('tab');
    if (t && ['simulator', 'packs', 'breeds'].includes(t)) setTab(t);
  }, [searchParams]);

  const [form, setForm] = useState(defaultForm);
  const [result, setResult] = useState(null);
  const [packs, setPacks] = useState([]);
  const [packDemo, setPackDemo] = useState(false);
  const [packLoading, setPackLoading] = useState(false);
  const [breedFilter, setBreedFilter] = useState('all');

  const runSimulation = () => {
    const pet = {
      name: form.name,
      type: form.type,
      breed: form.breed,
      weight: Number(form.weight),
      weightKg: Number(form.weight),
      birthDate: null,
    };
    const options = {
      activityLevel: form.activityLevel,
      goal: form.goal,
      isNeutered: form.isNeutered,
      ageYears: Number(form.ageYears),
    };
    const calories = calculatePetCalories(pet, options);
    const nutrition = buildPetNutritionRecommendation(pet, options);
    setResult({ calories, nutrition });
  };

  const loadPacks = useCallback(async () => {
    setPackLoading(true);
    const { data, demo } = await fetchVisitorPacks({ petType: form.type });
    setPacks(data?.packs || []);
    setPackDemo(demo);
    setPackLoading(false);
  }, [form.type]);

  useEffect(() => {
    if (tab === 'packs') loadPacks();
  }, [tab, loadPacks]);

  const filteredBreeds = useMemo(() => {
    if (breedFilter === 'all') return VISITOR_BREED_GUIDES;
    return VISITOR_BREED_GUIDES.filter((g) => g.type === breedFilter);
  }, [breedFilter]);

  const setField = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  return (
    <VisitorLayout>
      <div className="vis-page">
        <header className="vis-hero">
          <h1><Flame size={26} /> Outils PetFoodTN</h1>
          <p>Simulateur nutritionnel, packs alimentaires et guide des races — sans inscription.</p>
        </header>

        <div className="vis-tabs">
          <button type="button" className={`vis-tab${tab === 'simulator' ? ' vis-tab--active' : ''}`} onClick={() => setTab('simulator')}>
            <Flame size={14} /> Simulateur nutrition
          </button>
          <button type="button" className={`vis-tab${tab === 'packs' ? ' vis-tab--active' : ''}`} onClick={() => setTab('packs')}>
            <Package size={14} /> Packs alimentaires
          </button>
          <button type="button" className={`vis-tab${tab === 'breeds' ? ' vis-tab--active' : ''}`} onClick={() => setTab('breeds')}>
            <PawPrint size={14} /> Races & besoins
          </button>
        </div>

        {tab === 'simulator' && (
          <div className="vis-card">
            <h2>Simuler une recommandation nutritionnelle</h2>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: 16 }}>
              Entrez les caractéristiques de votre animal pour estimer calories et ration journalière.
            </p>
            <div className="vis-form-grid">
              <label>
                Nom
                <input value={form.name} onChange={(e) => setField('name', e.target.value)} />
              </label>
              <label>
                Espèce
                <select value={form.type} onChange={(e) => setField('type', e.target.value)}>
                  {PET_TYPES.map((t) => (
                    <option key={t.id} value={t.id}>{t.label}</option>
                  ))}
                </select>
              </label>
              <label>
                Race
                <input value={form.breed} onChange={(e) => setField('breed', e.target.value)} placeholder="ex. Sloughi" />
              </label>
              <label>
                Poids (kg)
                <input type="number" min="0.01" step="0.01" value={form.weight} onChange={(e) => setField('weight', e.target.value)} />
              </label>
              <label>
                Âge (années)
                <input type="number" min="0" step="0.5" value={form.ageYears} onChange={(e) => setField('ageYears', e.target.value)} />
              </label>
              <label>
                Activité
                <select value={form.activityLevel} onChange={(e) => setField('activityLevel', e.target.value)}>
                  <option value="faible">Faible</option>
                  <option value="moyen">Moyenne</option>
                  <option value="eleve">Élevée</option>
                </select>
              </label>
              <label>
                Objectif
                <select value={form.goal} onChange={(e) => setField('goal', e.target.value)}>
                  <option value="maintien">Maintien</option>
                  <option value="perte">Perte de poids</option>
                  <option value="prise">Prise de poids</option>
                </select>
              </label>
              <label>
                Stérilisé
                <select value={form.isNeutered ? 'yes' : 'no'} onChange={(e) => setField('isNeutered', e.target.value === 'yes')}>
                  <option value="yes">Oui</option>
                  <option value="no">Non</option>
                </select>
              </label>
            </div>
            <button type="button" className="vis-btn vis-btn--primary" style={{ marginTop: 16 }} onClick={runSimulation}>
              Calculer la recommandation
            </button>

            {result && (
              <div className="vis-sim-result">
                <h3>{form.name} — {PET_TYPE_LABELS[form.type] || form.type}</h3>
                {result.calories?.supported === false ? (
                  <p>{result.calories.message}</p>
                ) : (
                  <>
                    <p><strong>Calories/jour :</strong> {result.calories?.dailyKcal ?? '—'} kcal</p>
                    <p><strong>Ration sèche estimée :</strong> {result.calories?.dryFoodGrams ?? '—'} g/jour</p>
                    <p><strong>Repas :</strong> {result.calories?.mealCount ?? 2} × {result.calories?.gramsPerMeal ?? '—'} g</p>
                  </>
                )}
                {result.nutrition?.tips?.length > 0 && (
                  <ul style={{ margin: '12px 0 0', paddingLeft: 20, color: '#166534' }}>
                    {result.nutrition.tips.slice(0, 4).map((tip) => (
                      <li key={tip}>{tip}</li>
                    ))}
                  </ul>
                )}
                <p style={{ marginTop: 12, fontSize: '0.85rem', color: '#15803d' }}>
                  Créez un compte pour sauvegarder le profil et recevoir des recommandations produits personnalisées.
                </p>
              </div>
            )}
          </div>
        )}

        {tab === 'packs' && (
          <div className="vis-card">
            <h2>Packs alimentaires</h2>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontWeight: 600, fontSize: '0.85rem', color: '#475569' }}>
                Filtrer par espèce{' '}
                <select value={form.type} onChange={(e) => setField('type', e.target.value)} style={{ marginLeft: 8, padding: '8px 12px', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                  {PET_TYPES.map((t) => (
                    <option key={t.id} value={t.id}>{t.label}</option>
                  ))}
                </select>
              </label>
              {packDemo && <span className="vis-badge vis-badge--demo" style={{ marginLeft: 10 }}>Mode démo</span>}
            </div>
            {packLoading ? (
              <p className="vis-empty">Chargement des packs…</p>
            ) : packs.length === 0 ? (
              <p className="vis-empty">Aucun pack pour cette espèce.</p>
            ) : (
              packs.map((pk) => (
                <div key={pk.id} className="vis-pack-card" style={{ marginBottom: 12 }}>
                  <h3>{pk.icon} {pk.label}</h3>
                  <p style={{ color: '#64748b', margin: '0 0 8px', fontSize: '0.9rem' }}>{pk.description}</p>
                  <p style={{ margin: '0 0 8px' }}>
                    <strong style={{ color: '#0284c7', fontSize: '1.1rem' }}>{formatDT(pk.totalPrice)}</strong>
                    {pk.originalPrice > pk.totalPrice && (
                      <span className="vis-product-card__old">{formatDT(pk.originalPrice)}</span>
                    )}
                    <span className="vis-badge vis-badge--promo" style={{ marginLeft: 8 }}>-{pk.discountPercent}%</span>
                  </p>
                  <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: 0 }}>
                    {pk.ageHint} · {(pk.items || []).length} article(s)
                  </p>
                </div>
              ))
            )}
            <div className="vis-cta-banner">
              <span>Commandez un pack après connexion client.</span>
              <Link to="/register" className="vis-btn vis-btn--primary">S&apos;inscrire</Link>
            </div>
          </div>
        )}

        {tab === 'breeds' && (
          <div className="vis-card">
            <h2>Races et besoins alimentaires</h2>
            <select
              value={breedFilter}
              onChange={(e) => setBreedFilter(e.target.value)}
              style={{ marginBottom: 16, padding: '10px 12px', borderRadius: 10, border: '1px solid #e2e8f0' }}
            >
              <option value="all">Toutes les espèces</option>
              {PET_TYPES.map((t) => (
                <option key={t.id} value={t.id}>{t.label}</option>
              ))}
            </select>
            {filteredBreeds.map((group) => (
              <div key={group.type} style={{ marginBottom: 20 }}>
                <h3 style={{ color: '#0c4a6e', margin: '0 0 10px' }}>{group.icon} {group.label}</h3>
                {group.breeds.map((b) => (
                  <div key={b.name} className="vis-breed-card">
                    <h4>{b.name}</h4>
                    <p><strong>Origine :</strong> {b.origin} · <strong>Poids idéal :</strong> {b.idealKg} kg</p>
                    <p style={{ marginTop: 6 }}>{b.needs}</p>
                  </div>
                ))}
              </div>
            ))}
            <Link to="/visitor/tools" className="vis-btn vis-btn--ghost" onClick={() => { setTab('simulator'); setField('breed', 'Sloughi'); }}>
              Tester avec le simulateur →
            </Link>
          </div>
        )}
      </div>
    </VisitorLayout>
  );
};

export default VisitorToolsPage;
