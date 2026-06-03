import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Flame, Scale, Utensils, AlertCircle, RefreshCw } from 'lucide-react';
import { getPets } from '../services/userService';
import { getAllPetCalories, updatePetWeight } from '../services/petCalorieService';
import { PET_TYPE_LABELS } from '../utils/petCalorieCalculator';
import { getPetPhoto, PET_EMOJI } from '../utils/petAvatars';

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

/**
 * Calculateur de calories journalières pour chaque animal du client.
 */
const PetCalorieCalculator = ({ compact = false }) => {
  const [options, setOptions] = useState({
    activityLevel: 'moyen',
    goal: 'maintien',
    isNeutered: true,
    mealCount: 2,
    kcalPer100g: 350,
  });
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [weightEdits, setWeightEdits] = useState({});
  const [savingId, setSavingId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getAllPetCalories(options);
      setResults(data.pets || []);
    } catch (err) {
      try {
        const pets = await getPets();
        const { calculatePetCalories } = await import('../utils/petCalorieCalculator');
        setResults((pets || []).map((p) => calculatePetCalories(p, options)));
      } catch {
        setError('Impossible de charger les animaux.');
        setResults([]);
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
            <Flame size={24} color="#ea580c" />
            Calories par animal
          </h2>
          <p style={{ margin: 0, color: '#64748b', fontSize: 14, maxWidth: 560 }}>
            Estimation des besoins énergétiques (RER × MER) et équivalent en grammes de croquettes.
            À valider avec votre vétérinaire.
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
          kcal / 100 g croquettes
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
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '10px 16px',
            borderRadius: 10,
            border: '1px solid #e5e7eb',
            background: '#f9fafb',
            fontWeight: 700,
            cursor: 'pointer',
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
        <p style={{ color: '#94a3b8' }}>Calcul en cours…</p>
      ) : results.length === 0 ? (
        <div style={{ ...cardStyle, textAlign: 'center', color: '#64748b' }}>
          <p style={{ margin: '0 0 12px' }}>Aucun animal enregistré.</p>
          <Link to="/veterinary" style={{ color: '#ea580c', fontWeight: 700 }}>
            Ajouter un animal via Santé & vétérinaire
          </Link>
          {' '}ou complétez un RDV avec le poids de l’animal.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: compact ? '1fr' : 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {results.map((r) => {
            const petId = r.petId;
            const type = r.type || 'other';
            return (
              <article key={petId || r.name} style={{ ...cardStyle, borderLeft: '4px solid #f97316' }}>
                <div style={{ display: 'flex', gap: 14, marginBottom: 14 }}>
                  <img
                    src={getPetPhoto(type)}
                    alt=""
                    style={{ width: 56, height: 56, borderRadius: '50%', objectFit: 'cover' }}
                  />
                  <div>
                    <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800 }}>{r.name}</h3>
                    <p style={{ margin: '4px 0 0', fontSize: 13, color: '#64748b' }}>
                      {PET_EMOJI[type] || '🐾'} {PET_TYPE_LABELS[type] || type}
                      {r.lifeStage ? ` · ${r.lifeStage}` : ''}
                      {r.ageYears != null ? ` · ${r.ageYears} an(s)` : ''}
                    </p>
                  </div>
                </div>

                {r.needsWeight ? (
                  <div style={{ background: '#fffbeb', padding: 12, borderRadius: 12, marginBottom: 12 }}>
                    <p style={{ margin: '0 0 10px', fontSize: 13, color: '#92400e' }}>{r.message}</p>
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
                            padding: '10px 14px',
                            borderRadius: 10,
                            border: 'none',
                            background: '#ea580c',
                            color: 'white',
                            fontWeight: 700,
                            cursor: 'pointer',
                          }}
                        >
                          {savingId === petId ? '…' : 'Enregistrer'}
                        </button>
                      </div>
                    )}
                  </div>
                ) : r.supported ? (
                  <>
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: 10,
                        marginBottom: 12,
                      }}
                    >
                      <div style={{ background: '#fff7ed', padding: 14, borderRadius: 12, textAlign: 'center' }}>
                        <div style={{ fontSize: 28, fontWeight: 900, color: '#ea580c' }}>{r.dailyKcal}</div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: '#9a3412' }}>kcal / jour</div>
                      </div>
                      <div style={{ background: '#f0fdf4', padding: 14, borderRadius: 12, textAlign: 'center' }}>
                        <div style={{ fontSize: 28, fontWeight: 900, color: '#059669' }}>{r.dryFoodGramsPerDay} g</div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: '#047857' }}>croquettes / jour</div>
                      </div>
                    </div>
                    <ul style={{ margin: 0, padding: '0 0 0 18px', fontSize: 13, color: '#475569', lineHeight: 1.6 }}>
                      <li>
                        <Scale size={12} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                        Poids : <strong>{r.weightKg} kg</strong> — RER {r.rer} kcal × {r.merFactor}
                      </li>
                      <li>
                        <Utensils size={12} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                        ~<strong>{r.gramsPerMeal} g</strong> par repas ({r.mealCount} repas)
                      </li>
                    </ul>
                  </>
                ) : (
                  <div style={{ background: '#f8fafc', padding: 12, borderRadius: 12 }}>
                    {r.dailyKcal != null && (
                      <p style={{ margin: '0 0 6px', fontWeight: 800, color: '#334155' }}>
                        ~{r.dailyKcal} kcal/jour (estimation)
                      </p>
                    )}
                    <p style={{ margin: 0, fontSize: 13, color: '#64748b' }}>{r.message}</p>
                  </div>
                )}

                <p style={{ margin: '12px 0 0', fontSize: 11, color: '#94a3b8', display: 'flex', gap: 6, alignItems: 'flex-start' }}>
                  <AlertCircle size={14} style={{ flexShrink: 0, marginTop: 1 }} />
                  {r.message || 'Consultez votre vétérinaire en cas de doute.'}
                </p>

                {r.supported && (
                  <Link
                    to="/smart-food-agent"
                    style={{
                      display: 'inline-block',
                      marginTop: 12,
                      fontSize: 13,
                      fontWeight: 700,
                      color: '#ea580c',
                    }}
                  >
                    Plan détaillé avec NutriPro →
                  </Link>
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
