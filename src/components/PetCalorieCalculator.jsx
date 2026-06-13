import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Flame, Scale, Utensils, AlertCircle, RefreshCw, Sparkles,
  ShoppingCart, ChevronDown, ChevronUp,
} from 'lucide-react';
import { getPets } from '../services/userService';
import { getAllPetCalories, updatePetWeight } from '../services/petCalorieService';
import { getPetNutritionWithProducts } from '../services/petNutritionService';
import { PET_TYPE_LABELS } from '../utils/petCalorieCalculator';
import { getPetPhoto, getPetEmoji } from '../utils/petAvatars';

const cardStyle = {
  background: 'white',
  borderRadius: 16,
  padding: 20,
  border: '1px solid #e5e7eb',
  boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
};

const selectStyle = {
  padding: '10px 12px',
  borderRadius: 10,
  border: '1px solid #e5e7eb',
  fontSize: 14,
  fontWeight: 600,
  background: 'white',
};

const priorityColor = {
  high: '#dc2626',
  medium: '#d97706',
  low: '#64748b',
};

const weightBadge = {
  ideal: { bg: '#dcfce7', color: '#166534', label: 'Poids idéal' },
  lean: { bg: '#fef9c3', color: '#854d0e', label: 'Plutôt maigre' },
  heavy: { bg: '#ffedd5', color: '#9a3412', label: 'Léger surpoids' },
  overweight: { bg: '#fee2e2', color: '#991b1b', label: 'Surpoids' },
  underweight: { bg: '#dbeafe', color: '#1d4ed8', label: 'Sous-poids' },
  unknown: { bg: '#f1f5f9', color: '#64748b', label: 'Poids à compléter' },
};

const getDiscountedPrice = (product) => {
  const price = Number(product.price || 0);
  const discount = Number(product.discount || 0);
  return Number((price * (1 - discount / 100)).toFixed(2));
};

/**
 * Calories + recommandations nutritionnelles personnalisées (poids, race, âge).
 */
const PetCalorieCalculator = ({ compact = false }) => {
  const [options, setOptions] = useState({
    activityLevel: 'moyen',
    goal: 'maintien',
    isNeutered: true,
    mealCount: 2,
    kcalPer100g: 350,
  });
  const [nutritionPets, setNutritionPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [weightEdits, setWeightEdits] = useState({});
  const [savingId, setSavingId] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getPetNutritionWithProducts(options);
      setNutritionPets(data.pets || []);
    } catch {
      try {
        const { DEMO_NUTRITION_PETS } = await import('../utils/clientDemoData');
        const fetched = await getPets().catch(() => []);
        const pets = fetched?.length ? fetched : DEMO_NUTRITION_PETS;
        const { buildAllPetNutritionRecommendations, matchProductsForPet } = await import('../utils/petNutritionRecommender');
        const api = (await import('../utils/api')).default;
        const productsRes = await api.get('/products').catch(() => ({ data: [] }));
        const built = buildAllPetNutritionRecommendations(pets || [], options);
        setNutritionPets(
          built.map((rec) => ({
            ...rec,
            suggestedProducts: matchProductsForPet(productsRes.data || [], rec, 3),
          })),
        );
      } catch {
        try {
          const calorieData = await getAllPetCalories(options);
          setNutritionPets((calorieData.pets || []).map((r) => ({ ...r, calories: r, recommendations: [] })));
        } catch {
          setError('Impossible de charger les animaux.');
          setNutritionPets([]);
        }
      }
    } finally {
      setLoading(false);
    }
  }, [options]);

  useEffect(() => {
    load();
  }, [load]);

  const handleSaveWeight = async (petId) => {
    const w = weightEdits[petId];
    if (!w || Number(w) <= 0) return;
    setSavingId(petId);
    try {
      await updatePetWeight(petId, w);
      await load();
      setWeightEdits((prev) => {
        const next = { ...prev };
        delete next[petId];
        return next;
      });
    } catch {
      setError('Erreur lors de la mise à jour du poids.');
    } finally {
      setSavingId(null);
    }
  };

  const addToCart = (product) => {
    window.dispatchEvent(new CustomEvent('addToCart', {
      detail: { ...product, originalPrice: product.price, price: getDiscountedPrice(product) },
    }));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: compact ? 16 : 24 }}>
      {!compact && (
        <div
          style={{
            background: 'linear-gradient(135deg, #fff7ed, #ffedd5)',
            borderRadius: 18,
            padding: 24,
            border: '1px solid #fed7aa',
          }}
        >
          <h2 style={{ margin: '0 0 8px', fontSize: 22, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 10 }}>
            <Sparkles size={24} color="#ea580c" />
            Nutrition personnalisée par animal
          </h2>
          <p style={{ margin: 0, color: '#64748b', fontSize: 14, maxWidth: 620 }}>
            Recommandations basées sur le <strong>poids</strong>, la <strong>race</strong> et l&apos;<strong>âge</strong>
            {' '}
            de chaque compagnon : calories, plan de repas et produits adaptés.
          </p>
        </div>
      )}

      <div style={{ ...cardStyle, display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'flex-end' }}>
        <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12, fontWeight: 700, color: '#64748b' }}>
          Activité
          <select
            style={selectStyle}
            value={options.activityLevel}
            onChange={(e) => setOptions((o) => ({ ...o, activityLevel: e.target.value }))}
          >
            <option value="faible">Faible</option>
            <option value="moyen">Moyenne</option>
            <option value="eleve">Élevée</option>
          </select>
        </label>
        <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12, fontWeight: 700, color: '#64748b' }}>
          Objectif
          <select
            style={selectStyle}
            value={options.goal}
            onChange={(e) => setOptions((o) => ({ ...o, goal: e.target.value }))}
          >
            <option value="maintien">Maintien</option>
            <option value="perte">Perte de poids</option>
            <option value="prise">Prise de poids</option>
          </select>
        </label>
        <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12, fontWeight: 700, color: '#64748b' }}>
          Repas / jour
          <select
            style={selectStyle}
            value={options.mealCount}
            onChange={(e) => setOptions((o) => ({ ...o, mealCount: Number(e.target.value) }))}
          >
            {[1, 2, 3, 4].map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </label>
        <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12, fontWeight: 700, color: '#64748b' }}>
          kcal / 100 g
          <input
            type="number"
            min={250}
            max={450}
            style={{ ...selectStyle, width: 100 }}
            value={options.kcalPer100g}
            onChange={(e) => setOptions((o) => ({ ...o, kcalPer100g: Number(e.target.value) || 350 }))}
          />
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 600, paddingBottom: 4 }}>
          <input
            type="checkbox"
            checked={options.isNeutered}
            onChange={(e) => setOptions((o) => ({ ...o, isNeutered: e.target.checked }))}
          />
          Stérilisé
        </label>
        <button
          type="button"
          onClick={load}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '10px 16px', borderRadius: 10, border: '1px solid #e5e7eb',
            background: '#f9fafb', fontWeight: 700, cursor: 'pointer',
          }}
        >
          <RefreshCw size={16} />
          Actualiser
        </button>
      </div>

      {error && (
        <p style={{ color: '#dc2626', fontWeight: 600, margin: 0 }}>{error}</p>
      )}

      {loading ? (
        <p style={{ color: '#94a3b8' }}>Analyse nutritionnelle en cours…</p>
      ) : nutritionPets.length === 0 ? (
        <div style={{ ...cardStyle, textAlign: 'center', color: '#64748b' }}>
          <p style={{ margin: '0 0 12px' }}>Aucun animal enregistré.</p>
          <Link to="/veterinary" style={{ color: '#ea580c', fontWeight: 700 }}>
            Ajouter un animal (race, poids, date de naissance)
          </Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: compact ? '1fr' : '1fr', gap: 20 }}>
          {nutritionPets.map((rec) => {
            const r = rec.calories || rec;
            const petId = rec.petId || r.petId;
            const type = rec.type || r.type || 'other';
            const wb = weightBadge[rec.weightStatus] || weightBadge.unknown;
            const isOpen = expandedId === petId;

            return (
              <article key={petId || rec.name} style={{ ...cardStyle, borderLeft: '4px solid #f97316' }}>
                <div style={{ display: 'flex', gap: 14, marginBottom: 14, flexWrap: 'wrap' }}>
                  <img
                    src={getPetPhoto(type, rec.breed)}
                    alt=""
                    style={{ width: 56, height: 56, borderRadius: '50%', objectFit: 'cover' }}
                  />
                  <div style={{ flex: 1, minWidth: 180 }}>
                    <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>{rec.name || r.name}</h3>
                    <p style={{ margin: '4px 0 8px', fontSize: 13, color: '#64748b' }}>
                      {getPetEmoji(type, rec.breed)} {PET_TYPE_LABELS[type] || type}
                      {rec.breed ? ` · ${rec.breed}` : ''}
                      {rec.lifeStageLabel ? ` · ${rec.lifeStageLabel}` : r.lifeStage ? ` · ${r.lifeStage}` : ''}
                      {rec.ageYears != null ? ` · ${rec.ageYears} an(s)` : r.ageYears != null ? ` · ${r.ageYears} an(s)` : ''}
                    </p>
                    <span style={{
                      fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 999,
                      background: wb.bg, color: wb.color,
                    }}
                    >
                      {wb.label}
                      {rec.idealWeightKg ? ` (${rec.idealWeightKg.min}–${rec.idealWeightKg.max} kg)` : ''}
                    </span>
                  </div>
                </div>

                {(r.needsWeight || rec.calories?.needsWeight) ? (
                  <div style={{ background: '#fffbeb', padding: 12, borderRadius: 12, marginBottom: 12 }}>
                    <p style={{ margin: '0 0 10px', fontSize: 13, color: '#92400e' }}>
                      {r.message || 'Renseignez le poids pour activer les recommandations.'}
                    </p>
                    {petId && (
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <input
                          type="number"
                          step="0.1"
                          min="0.1"
                          placeholder="Poids (kg)"
                          value={weightEdits[petId] ?? ''}
                          onChange={(e) => setWeightEdits((prev) => ({ ...prev, [petId]: e.target.value }))}
                          style={{ ...selectStyle, flex: 1 }}
                        />
                        <button
                          type="button"
                          disabled={savingId === petId}
                          onClick={() => handleSaveWeight(petId)}
                          style={{
                            padding: '10px 14px', borderRadius: 10, border: 'none',
                            background: '#ea580c', color: 'white', fontWeight: 700, cursor: 'pointer',
                          }}
                        >
                          {savingId === petId ? '…' : 'Enregistrer'}
                        </button>
                      </div>
                    )}
                  </div>
                ) : r.supported || rec.calories?.supported ? (
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                      gap: 10,
                      marginBottom: 14,
                    }}
                  >
                    <div style={{ background: '#fff7ed', padding: 14, borderRadius: 12, textAlign: 'center' }}>
                      <div style={{ fontSize: 26, fontWeight: 900, color: '#ea580c' }}>{r.dailyKcal}</div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: '#9a3412' }}>kcal / jour</div>
                    </div>
                    <div style={{ background: '#f0fdf4', padding: 14, borderRadius: 12, textAlign: 'center' }}>
                      <div style={{ fontSize: 26, fontWeight: 900, color: '#059669' }}>{r.dryFoodGramsPerDay} g</div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: '#047857' }}>{r.foodLabel || 'aliment'} / jour</div>
                    </div>
                    <div style={{ background: '#eff6ff', padding: 14, borderRadius: 12, textAlign: 'center' }}>
                      <div style={{ fontSize: 26, fontWeight: 900, color: '#2563eb' }}>{r.gramsPerMeal} g</div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: '#1d4ed8' }}>× {r.mealCount} repas</div>
                    </div>
                  </div>
                ) : null}

                {(rec.recommendations?.length > 0) && (
                  <div style={{ marginBottom: 12 }}>
                    <button
                      type="button"
                      onClick={() => setExpandedId(isOpen ? null : petId)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 8, width: '100%',
                        padding: '10px 12px', borderRadius: 10, border: '1px solid #fed7aa',
                        background: '#fffbeb', cursor: 'pointer', fontWeight: 700, fontSize: 14, color: '#9a3412',
                      }}
                    >
                      <Flame size={16} />
                      Recommandations nutrition ({rec.recommendations.length})
                      {isOpen ? <ChevronUp size={16} style={{ marginLeft: 'auto' }} /> : <ChevronDown size={16} style={{ marginLeft: 'auto' }} />}
                    </button>
                    {isOpen && (
                      <ul style={{ margin: '10px 0 0', padding: 0, listStyle: 'none' }}>
                        {rec.recommendations.map((item) => (
                          <li
                            key={item.id}
                            style={{
                              padding: '10px 12px', marginBottom: 8, borderRadius: 10,
                              background: '#f8fafc', borderLeft: `3px solid ${priorityColor[item.priority] || '#94a3b8'}`,
                            }}
                          >
                            <p style={{ margin: 0, fontSize: 13, fontWeight: 800, color: '#334155' }}>{item.title}</p>
                            <p style={{ margin: '4px 0 0', fontSize: 13, color: '#64748b', lineHeight: 1.5 }}>{item.text}</p>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}

                {rec.mealPlan && (
                  <div style={{ background: '#f0fdf4', padding: 12, borderRadius: 12, marginBottom: 12, fontSize: 13, color: '#166534' }}>
                    <strong><Utensils size={14} style={{ verticalAlign: 'middle' }} /> Plan repas :</strong>
                    {' '}
                    {rec.mealPlan.gramsPerDay} g {rec.mealPlan.foodLabel || 'aliment'}/jour répartis en {rec.mealPlan.mealsPerDay} repas
                    {rec.mealPlan.split?.patée ? ` · ${rec.mealPlan.split.croquettes}% croquettes / ${rec.mealPlan.split.patée}% pâtée` : ''}
                    {rec.mealPlan.split?.foin ? ` · ${rec.mealPlan.split.foin}% foin (libre) / ${rec.mealPlan.split.granulés}% granulés` : ''}
                    {rec.mealPlan.split?.graines && !rec.mealPlan.split?.patée ? ` · ${Object.entries(rec.mealPlan.split).map(([k, v]) => `${v}% ${k}`).join(' / ')}` : ''}.
                    {' '}
                    {rec.mealPlan.notes}
                  </div>
                )}

                {rec.suggestedProducts?.length > 0 && (
                  <div style={{ marginTop: 8 }}>
                    <p style={{ margin: '0 0 10px', fontSize: 13, fontWeight: 800, color: '#059669' }}>
                      Produits suggérés pour {rec.name}
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                      {rec.suggestedProducts.map((product) => (
                        <div
                          key={product._id || product.id}
                          style={{
                            flex: '1 1 200px', padding: 12, borderRadius: 12,
                            border: '1px solid #bbf7d0', background: '#fff',
                          }}
                        >
                          <p style={{ margin: '0 0 4px', fontWeight: 700, fontSize: 13 }}>{product.name}</p>
                          <p style={{ margin: '0 0 8px', fontSize: 11, color: '#64748b' }}>{product.recommendedReason}</p>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontWeight: 800, color: '#059669' }}>{getDiscountedPrice(product)} DT</span>
                            <button
                              type="button"
                              onClick={() => addToCart(product)}
                              style={{
                                padding: '6px 10px', border: 'none', borderRadius: 8,
                                background: '#10b981', color: '#fff', fontSize: 11, fontWeight: 700, cursor: 'pointer',
                                display: 'flex', alignItems: 'center', gap: 4,
                              }}
                            >
                              <ShoppingCart size={12} /> Panier
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <p style={{ margin: '12px 0 0', fontSize: 11, color: '#94a3b8', display: 'flex', gap: 6, alignItems: 'flex-start' }}>
                  <AlertCircle size={14} style={{ flexShrink: 0, marginTop: 1 }} />
                  {rec.disclaimer || r.message || 'Consultez votre vétérinaire en cas de doute.'}
                </p>

                {(r.supported || rec.calories?.supported) && (
                  <p style={{ margin: '8px 0 0', fontSize: 12, color: '#64748b' }}>
                    <Scale size={12} style={{ verticalAlign: 'middle' }} />
                    {' '}
                    Poids : <strong>{r.weightKg} kg</strong>
                    {r.rer ? ` — RER ${r.rer} × ${r.merFactor}` : ''}
                    {' · '}
                    <Link to="/veterinary" style={{ color: '#ea580c', fontWeight: 700 }}>Mettre à jour le profil</Link>
                  </p>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PetCalorieCalculator;
