import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Flame, Package, PawPrint, Scale, MapPin, Sparkles } from 'lucide-react';
import VisitorLayout from '../layouts/VisitorLayout';
import { fetchVisitorPacks, fetchVisitorProducts, fetchVisitorIntelligence } from '../services/visitorService';
import { VISITOR_BREED_GUIDES } from '../utils/visitorDemoData';
import { DEMO_ADMIN_REGIONS } from '../utils/adminDemoData';
import {
  calculatePetCalories,
  PET_TYPE_LABELS,
} from '../utils/petCalorieCalculator';
import { buildPetNutritionRecommendation } from '../utils/petNutritionRecommender';
import { formatDT } from '../utils/formatCurrency';
import { getEffectiveDiscount, getPromoPrice, isOnPromotion } from '../utils/productDetails';
import { resolveNaturalProductImage } from '../utils/productImages';
import api from '../utils/api';
import './VisitorPages.css';

const TOOL_TABS = ['simulator', 'packs', 'breeds', 'compare', 'stores', 'recommendations'];

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
    TOOL_TABS.includes(searchParams.get('tab')) ? searchParams.get('tab') : 'simulator',
  );

  useEffect(() => {
    const t = searchParams.get('tab');
    if (t && TOOL_TABS.includes(t)) setTab(t);
  }, [searchParams]);

  const [form, setForm] = useState(defaultForm);
  const [result, setResult] = useState(null);
  const [packs, setPacks] = useState([]);
  const [packDemo, setPackDemo] = useState(false);
  const [packLoading, setPackLoading] = useState(false);
  const [breedFilter, setBreedFilter] = useState('all');
  const [products, setProducts] = useState([]);
  const [productsDemo, setProductsDemo] = useState(false);
  const [productsLoading, setProductsLoading] = useState(false);
  const [compareIds, setCompareIds] = useState([]);
  const [compareSearch, setCompareSearch] = useState('');
  const [stores, setStores] = useState([]);
  const [storesLoading, setStoresLoading] = useState(false);
  const [storeRegion, setStoreRegion] = useState('all');
  const [recoQuery, setRecoQuery] = useState('croquettes');
  const [recoProducts, setRecoProducts] = useState([]);
  const [recoSummary, setRecoSummary] = useState('');
  const [sentimentTrends, setSentimentTrends] = useState(null);
  const [recoLoading, setRecoLoading] = useState(false);
  const [recoDemo, setRecoDemo] = useState(false);

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

  const loadProducts = useCallback(async () => {
    setProductsLoading(true);
    const { data, demo } = await fetchVisitorProducts();
    setProducts(data || []);
    setProductsDemo(demo);
    setProductsLoading(false);
  }, []);

  useEffect(() => {
    if (tab === 'compare') loadProducts();
  }, [tab, loadProducts]);

  const loadStores = useCallback(async () => {
    setStoresLoading(true);
    try {
      const res = await api.get('/users/store-locations');
      setStores(res.data || []);
    } catch {
      setStores([]);
    }
    setStoresLoading(false);
  }, []);

  useEffect(() => {
    if (tab === 'stores') loadStores();
  }, [tab, loadStores]);

  const loadRecommendations = useCallback(async () => {
    setRecoLoading(true);
    const result = await fetchVisitorIntelligence({
      q: recoQuery,
      petType: form.type,
      breed: form.breed,
      ageYears: form.ageYears,
      weightKg: form.weight,
      limit: 8,
    });
    setRecoProducts(result.recommendations || []);
    setRecoSummary(result.profileSummary || '');
    setSentimentTrends(result.sentimentTrends || null);
    setRecoDemo(result.demo);
    setRecoLoading(false);
  }, [recoQuery, form.type, form.breed, form.ageYears, form.weight]);

  useEffect(() => {
    if (tab === 'recommendations') loadRecommendations();
  }, [tab, loadRecommendations]);

  const compareProducts = useMemo(
    () => compareIds.map((id) => products.find((p) => String(p.id || p._id) === String(id))).filter(Boolean),
    [compareIds, products],
  );

  const compareCandidates = useMemo(() => {
    const q = compareSearch.trim().toLowerCase();
    return products.filter((p) => {
      if (compareIds.includes(String(p.id || p._id))) return false;
      if (!q) return true;
      return `${p.name} ${p.category || ''} ${p.animalType || ''}`.toLowerCase().includes(q);
    }).slice(0, 12);
  }, [products, compareIds, compareSearch]);

  const storeRegions = useMemo(() => {
    const fromStores = [...new Set(stores.map((s) => s.region || s.city).filter(Boolean))];
    return fromStores.length ? fromStores : DEMO_ADMIN_REGIONS;
  }, [stores]);

  const filteredStores = useMemo(() => {
    if (storeRegion === 'all') return stores;
    return stores.filter((s) => (s.region || s.city) === storeRegion);
  }, [stores, storeRegion]);

  const addToCompare = (id) => {
    const sid = String(id);
    if (compareIds.includes(sid) || compareIds.length >= 3) return;
    setCompareIds((prev) => [...prev, sid]);
  };

  const removeFromCompare = (id) => {
    setCompareIds((prev) => prev.filter((x) => x !== String(id)));
  };

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
          <p>Simulateur nutritionnel, packs alimentaires, comparateur produits et points de vente — sans inscription.</p>
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
          <button type="button" className={`vis-tab${tab === 'compare' ? ' vis-tab--active' : ''}`} onClick={() => setTab('compare')}>
            <Scale size={14} /> Comparateur
          </button>
          <button type="button" className={`vis-tab${tab === 'stores' ? ' vis-tab--active' : ''}`} onClick={() => setTab('stores')}>
            <MapPin size={14} /> Points de vente
          </button>
          <button type="button" className={`vis-tab${tab === 'recommendations' ? ' vis-tab--active' : ''}`} onClick={() => setTab('recommendations')}>
            <Sparkles size={14} /> Recommandations IA
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

        {tab === 'compare' && (
          <div className="vis-card">
            <h2>Comparateur produits</h2>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: 16 }}>
              Comparez jusqu&apos;à 3 produits côte à côte (prix, stock, promo).
              {productsDemo && <span className="vis-badge vis-badge--demo" style={{ marginLeft: 8 }}>Mode démo</span>}
            </p>
            {productsLoading ? (
              <p className="vis-empty">Chargement du catalogue…</p>
            ) : (
              <>
                <input
                  type="search"
                  placeholder="Rechercher un produit à ajouter…"
                  value={compareSearch}
                  onChange={(e) => setCompareSearch(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid #e2e8f0', marginBottom: 12 }}
                />
                {compareCandidates.length > 0 && compareIds.length < 3 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
                    {compareCandidates.map((p) => (
                      <button
                        key={p.id || p._id}
                        type="button"
                        className="vis-btn vis-btn--ghost vis-btn--sm"
                        onClick={() => addToCompare(p.id || p._id)}
                      >
                        + {p.name}
                      </button>
                    ))}
                  </div>
                )}
                {compareProducts.length === 0 ? (
                  <p className="vis-empty">Ajoutez des produits pour lancer la comparaison.</p>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: `repeat(${compareProducts.length}, minmax(180px, 1fr))`, gap: 12, overflowX: 'auto' }}>
                    {compareProducts.map((p) => {
                      const onPromo = isOnPromotion(p);
                      const price = onPromo ? getPromoPrice(p) : Number(p.price);
                      return (
                        <div key={p.id || p._id} className="vis-pack-card">
                          <img
                            src={resolveNaturalProductImage(p)}
                            alt=""
                            style={{ width: '100%', height: 100, objectFit: 'cover', borderRadius: 8, marginBottom: 8 }}
                          />
                          <h3 style={{ fontSize: '0.95rem', margin: '0 0 8px' }}>{p.name}</h3>
                          <p style={{ margin: '4px 0', fontSize: '0.85rem' }}><strong>Prix :</strong> {formatDT(price)}</p>
                          {onPromo && (
                            <p style={{ margin: '4px 0', fontSize: '0.85rem', color: '#dc2626' }}>
                              Promo -{getEffectiveDiscount(p)} %
                            </p>
                          )}
                          <p style={{ margin: '4px 0', fontSize: '0.85rem' }}><strong>Stock :</strong> {p.stock ?? '—'}</p>
                          <p style={{ margin: '4px 0', fontSize: '0.85rem' }}><strong>Catégorie :</strong> {p.category || '—'}</p>
                          <p style={{ margin: '4px 0', fontSize: '0.85rem' }}><strong>Espèce :</strong> {p.animalType || '—'}</p>
                          <button type="button" className="vis-btn vis-btn--ghost vis-btn--sm" style={{ marginTop: 8 }} onClick={() => removeFromCompare(p.id || p._id)}>
                            Retirer
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
                <div className="vis-cta-banner" style={{ marginTop: 16 }}>
                  <span>Commandez après création de compte client.</span>
                  <Link to="/visitor/products" className="vis-btn vis-btn--primary">Voir le catalogue</Link>
                </div>
              </>
            )}
          </div>
        )}

        {tab === 'stores' && (
          <div className="vis-card">
            <h2>Points de vente & animaleries</h2>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: 16 }}>
              Trouvez une boutique partenaire près de chez vous.
            </p>
            <select
              value={storeRegion}
              onChange={(e) => setStoreRegion(e.target.value)}
              style={{ marginBottom: 16, padding: '10px 12px', borderRadius: 10, border: '1px solid #e2e8f0' }}
            >
              <option value="all">Toutes les régions</option>
              {storeRegions.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
            {storesLoading ? (
              <p className="vis-empty">Chargement des points de vente…</p>
            ) : filteredStores.length === 0 ? (
              <p className="vis-empty">Aucun point de vente pour cette région.</p>
            ) : (
              filteredStores.map((s) => (
                <div key={s.id || s._id || s.name} className="vis-breed-card" style={{ marginBottom: 12 }}>
                  <h4 style={{ margin: '0 0 6px' }}>{s.name || s.shopName}</h4>
                  <p style={{ margin: '4px 0', fontSize: '0.85rem', color: '#64748b' }}>
                    <MapPin size={12} style={{ verticalAlign: 'middle' }} /> {s.address || s.region || s.city}
                  </p>
                  {s.phone && <p style={{ margin: '4px 0', fontSize: '0.85rem' }}>📞 {s.phone}</p>}
                  {s.hours && <p style={{ margin: '4px 0', fontSize: '0.85rem' }}>🕐 {s.hours}</p>}
                  {s.lat && s.lng && (
                    <a
                      href={`https://www.google.com/maps?q=${s.lat},${s.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="vis-btn vis-btn--ghost vis-btn--sm"
                      style={{ marginTop: 8, display: 'inline-block' }}
                    >
                      Ouvrir dans Maps
                    </a>
                  )}
                </div>
              ))
            )}
            <Link to="/login" className="vis-btn vis-btn--ghost" style={{ marginTop: 12 }}>
              Carte interactive (connexion client) →
            </Link>
          </div>
        )}

        {tab === 'recommendations' && (
          <div className="vis-card">
            <h2>Recommandations IA personnalisées</h2>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: 16 }}>
              Profil animal (simulateur), historique de navigation et analyse des avis clients — scores de pertinence et satisfaction.
              {recoDemo && <span className="vis-badge vis-badge--demo" style={{ marginLeft: 8 }}>Mode démo</span>}
            </p>
            {sentimentTrends && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 10, marginBottom: 16, padding: 14, background: '#f0fdf4', borderRadius: 12, border: '1px solid #bbf7d0' }}>
                <div><small style={{ color: '#64748b' }}>Positifs 30j</small><p style={{ margin: '4px 0 0', fontWeight: 800, color: '#059669' }}>{sentimentTrends.positivePct}%</p></div>
                <div><small style={{ color: '#64748b' }}>Négatifs 30j</small><p style={{ margin: '4px 0 0', fontWeight: 800, color: '#dc2626' }}>{sentimentTrends.negativePct}%</p></div>
                <div><small style={{ color: '#64748b' }}>Tendance</small><p style={{ margin: '4px 0 0', fontWeight: 800 }}>{sentimentTrends.trending === 'positive' ? '📈 Positive' : sentimentTrends.trending === 'negative' ? '📉 Négative' : '➡️ Stable'}</p></div>
              </div>
            )}
            {sentimentTrends?.summary && (
              <p style={{ fontSize: '0.85rem', color: '#475569', marginBottom: 12 }}>{sentimentTrends.summary}</p>
            )}
            <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
              <input
                type="search"
                value={recoQuery}
                onChange={(e) => setRecoQuery(e.target.value)}
                placeholder="ex. croquettes chat sans céréales"
                style={{ flex: 1, minWidth: 200, padding: '10px 12px', borderRadius: 10, border: '1px solid #e2e8f0' }}
              />
              <button type="button" className="vis-btn vis-btn--primary" onClick={loadRecommendations} disabled={recoLoading}>
                Rechercher
              </button>
            </div>
            {recoSummary && <p style={{ fontSize: '0.85rem', color: '#0f766e', marginBottom: 12 }}>{recoSummary}</p>}
            {recoLoading ? (
              <p className="vis-empty">Analyse des avis en cours…</p>
            ) : recoProducts.length === 0 ? (
              <p className="vis-empty">Aucun produit — essayez « croquettes chien » ou « friandises chat ».</p>
            ) : (
              recoProducts.map((p) => (
                <div key={p.id || p._id} className="vis-pack-card" style={{ marginBottom: 12 }}>
                  <h3>{p.name}</h3>
                  <p style={{ margin: '4px 0', color: '#0284c7', fontWeight: 700 }}>{formatDT(p.price)}</p>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 6 }}>
                    {p.relevanceScore != null && (
                      <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 999, background: '#dbeafe', color: '#1d4ed8' }}>
                        Pertinence {p.relevanceScore}%
                      </span>
                    )}
                    {p.satisfactionScore != null && (
                      <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 999, background: '#dcfce7', color: '#166534' }}>
                        Satisfaction {p.satisfactionScore}%
                      </span>
                    )}
                    {p.profileMatch && (
                      <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 999, background: '#fef3c7', color: '#b45309' }}>
                        Profil animal
                      </span>
                    )}
                  </div>
                  <p style={{ margin: '4px 0', fontSize: '0.85rem', color: '#475569' }}>{p.recommendedReason || p.reason}</p>
                  {p.description && (
                    <p style={{ margin: '6px 0 0', fontSize: '0.8rem', color: '#94a3b8' }}>{p.description.slice(0, 120)}{p.description.length > 120 ? '…' : ''}</p>
                  )}
                </div>
              ))
            )}
            <p style={{ marginTop: 12, fontSize: '0.85rem', color: '#64748b' }}>
              Posez aussi vos questions au chatbot visiteur (bouton en bas à droite).
            </p>
          </div>
        )}
      </div>
    </VisitorLayout>
  );
};

export default VisitorToolsPage;
