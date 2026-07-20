import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Utensils, Sparkles, AlertTriangle, Droplets, Scale } from 'lucide-react';
import api from '../utils/api';
import { mergeVetClients } from '../utils/vetDemoData';
import { DEMO_VET_NUTRITION } from '../utils/vetDemoData';
import { PET_TYPE_LABELS } from '../utils/petCalorieCalculator';
import { generateNutritionPlan, normalizePet } from '../services/nutritionPlanService';
import usePlatformRefresh from '../hooks/usePlatformRefresh';

const card = {
  background: 'white',
  padding: 20,
  borderRadius: 14,
  boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
  marginBottom: 16,
};

const VetNutritionAdvicePage = () => {
  const [clients, setClients] = useState([]);
  const [mode, setMode] = useState('dossier');
  const [ownerId, setOwnerId] = useState('');
  const [petId, setPetId] = useState('');
  const [petName, setPetName] = useState('');
  const [petType, setPetType] = useState('dog');
  const [petWeight, setPetWeight] = useState('');
  const [petAge, setPetAge] = useState('');
  const [petBreed, setPetBreed] = useState('');
  const [advice, setAdvice] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadClients = useCallback(async () => {
    try {
      const { data } = await api.get('/vet/clients');
      setClients(mergeVetClients(data));
    } catch {
      setClients(mergeVetClients([]));
    }
  }, []);

  useEffect(() => {
    loadClients();
  }, [loadClients]);

  usePlatformRefresh(loadClients);

  useEffect(() => {
    if (mode !== 'dossier' || !clients.length || ownerId) return;
    const first = clients[0];
    const firstPet = first?.pets?.[0];
    if (!first || !firstPet) return;
    setOwnerId(first.id || first._id);
    setPetId(firstPet.id || '');
    setPetName(firstPet.name || '');
    setPetType(firstPet.type || 'dog');
    if (firstPet.weightKg != null) setPetWeight(String(firstPet.weightKg));
    else if (firstPet.weight != null) setPetWeight(String(firstPet.weight));
    if (firstPet.ageYears != null) setPetAge(String(firstPet.ageYears));
    setPetBreed(firstPet.breed || '');
  }, [clients, mode, ownerId]);

  const selectedClient = useMemo(
    () => clients.find((c) => (c.id || c._id) === ownerId),
    [clients, ownerId],
  );
  const petsForClient = selectedClient?.pets || [];

  const applyPet = (pet) => {
    if (!pet) return;
    setPetId(pet.id || '');
    setPetName(pet.name || '');
    setPetType(pet.type || 'dog');
    setPetBreed(pet.breed || '');
    if (pet.weightKg != null) setPetWeight(String(pet.weightKg));
    else if (pet.weight != null) setPetWeight(String(pet.weight));
    if (pet.ageYears != null) setPetAge(String(pet.ageYears));
  };

  const handleClientChange = (id) => {
    setOwnerId(id);
    const client = clients.find((c) => (c.id || c._id) === id);
    const firstPet = client?.pets?.[0];
    if (firstPet) applyPet(firstPet);
    else {
      setPetId('');
      setPetName('');
    }
  };

  const handlePetSelect = (id) => {
    setPetId(id);
    const pet = petsForClient.find((p) => String(p.id) === String(id) || p.name === id);
    if (pet) applyPet(pet);
  };

  const generate = async (e) => {
    e.preventDefault();
    setError('');
    if (!petName.trim()) {
      setError('Indiquez le nom de l\'animal.');
      return;
    }
    if (!petWeight || Number(petWeight) <= 0) {
      setError('Le poids (kg) est requis pour calculer le plan.');
      return;
    }

    setLoading(true);
    try {
      const pet = normalizePet({
        id: petId || undefined,
        name: petName.trim(),
        type: petType,
        weight: petWeight,
        breed: petBreed,
        ageYears: petAge ? Number(petAge) : undefined,
      });

      const data = await generateNutritionPlan({
        pet,
        ownerId: mode === 'dossier' ? ownerId : undefined,
        options: { activityLevel: 'moyen', goal: 'maintien', mealCount: 2 },
      });

      setAdvice({ ...DEMO_VET_NUTRITION, ...data, petName: pet.name });
    } catch {
      const pet = normalizePet({
        name: petName.trim(),
        type: petType,
        weight: petWeight,
        breed: petBreed,
        ageYears: petAge ? Number(petAge) : undefined,
      });
      const data = await generateNutritionPlan({ pet, options: { activityLevel: 'moyen', goal: 'maintien' } });
      setAdvice({ ...DEMO_VET_NUTRITION, ...data, petName: pet.name });
    } finally {
      setLoading(false);
    }
  };

  const profile = advice?.petProfile || {};
  const macros = advice?.macros || {};
  const mealPlan = advice?.mealPlan || [];
  const foods = advice?.productRecommendations?.food || [];
  const tips = advice?.tips || [];
  const warnings = advice?.warnings || [];

  return (
    <div style={{ padding: 24, maxWidth: 900, margin: '0 auto' }}>
      <header style={{
        marginBottom: 20,
        padding: 24,
        borderRadius: 16,
        background: 'linear-gradient(135deg,#f0fdf4,#dcfce7)',
        border: '1px solid #bbf7d0',
      }}
      >
        <h1 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8, fontSize: '1.5rem' }}>
          <Utensils size={24} color="#16a34a" /> Bilan nutritionnel
        </h1>
        <p style={{ margin: '8px 0 0', color: '#64748b', maxWidth: 560 }}>
          Réalisez un <strong>bilan nutritionnel vétérinaire</strong> : analyse du régime, calories et plan alimentaire
          pour tout patient (chien, chat, NAC, oiseau, reptile…).
        </p>
      </header>

      <form onSubmit={generate} style={card}>
        <h2 style={{ margin: '0 0 16px', fontSize: '1rem' }}>Sélection du patient</h2>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
          <button
            type="button"
            onClick={() => setMode('dossier')}
            style={{
              padding: '8px 14px', borderRadius: 999, border: 'none', cursor: 'pointer', fontWeight: 700,
              background: mode === 'dossier' ? '#16a34a' : '#f1f5f9',
              color: mode === 'dossier' ? 'white' : '#475569',
            }}
          >
            Patient enregistré
          </button>
          <button
            type="button"
            onClick={() => { setMode('libre'); setOwnerId(''); }}
            style={{
              padding: '8px 14px', borderRadius: 999, border: 'none', cursor: 'pointer', fontWeight: 700,
              background: mode === 'libre' ? '#16a34a' : '#f1f5f9',
              color: mode === 'libre' ? 'white' : '#475569',
            }}
          >
            Animal libre (tout type)
          </button>
        </div>

        {mode === 'dossier' && (
          <div style={{ display: 'grid', gap: 14, gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', marginBottom: 14 }}>
            <label style={{ fontWeight: 600, fontSize: '0.85rem' }}>
              Client
              <select
                required
                value={ownerId}
                onChange={(e) => handleClientChange(e.target.value)}
                style={{ display: 'block', width: '100%', marginTop: 4, padding: 10, borderRadius: 10, border: '1px solid #e2e8f0' }}
              >
                <option value="">— Choisir —</option>
                {clients.map((c) => (
                  <option key={c.id || c._id} value={c.id || c._id}>{c.name}</option>
                ))}
              </select>
            </label>
            <label style={{ fontWeight: 600, fontSize: '0.85rem' }}>
              Animal
              <select
                required
                value={petId || petName}
                onChange={(e) => handlePetSelect(e.target.value)}
                style={{ display: 'block', width: '100%', marginTop: 4, padding: 10, borderRadius: 10, border: '1px solid #e2e8f0' }}
              >
                {petsForClient.map((p) => (
                  <option key={p.id || p.name} value={p.id || p.name}>
                    {PET_TYPE_LABELS[p.type] || p.type} — {p.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
        )}

        <div style={{ display: 'grid', gap: 14, gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
          <label style={{ fontWeight: 600, fontSize: '0.85rem' }}>
            Nom animal *
            <input
              required
              value={petName}
              onChange={(e) => setPetName(e.target.value)}
              style={{ display: 'block', width: '100%', marginTop: 4, padding: 10, borderRadius: 10, border: '1px solid #e2e8f0' }}
            />
          </label>
          <label style={{ fontWeight: 600, fontSize: '0.85rem' }}>
            Espèce *
            <select
              value={petType}
              onChange={(e) => setPetType(e.target.value)}
              style={{ display: 'block', width: '100%', marginTop: 4, padding: 10, borderRadius: 10, border: '1px solid #e2e8f0' }}
            >
              {Object.entries(PET_TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </label>
          <label style={{ fontWeight: 600, fontSize: '0.85rem' }}>
            Poids (kg) *
            <input
              required
              type="number"
              step="0.1"
              min="0.01"
              value={petWeight}
              onChange={(e) => setPetWeight(e.target.value)}
              style={{ display: 'block', width: '100%', marginTop: 4, padding: 10, borderRadius: 10, border: '1px solid #e2e8f0' }}
            />
          </label>
          <label style={{ fontWeight: 600, fontSize: '0.85rem' }}>
            Âge (années)
            <input
              type="number"
              step="0.1"
              min="0"
              value={petAge}
              onChange={(e) => setPetAge(e.target.value)}
              style={{ display: 'block', width: '100%', marginTop: 4, padding: 10, borderRadius: 10, border: '1px solid #e2e8f0' }}
            />
          </label>
          <label style={{ fontWeight: 600, fontSize: '0.85rem', gridColumn: 'span 2' }}>
            Race
            <input
              value={petBreed}
              onChange={(e) => setPetBreed(e.target.value)}
              placeholder="Ex: Labrador, Siamois, Hollandais…"
              style={{ display: 'block', width: '100%', marginTop: 4, padding: 10, borderRadius: 10, border: '1px solid #e2e8f0' }}
            />
          </label>
        </div>

        {error && <p style={{ color: '#b91c1c', fontSize: 14, marginTop: 12 }}>{error}</p>}

        <button
          type="submit"
          disabled={loading}
          style={{
            marginTop: 16, padding: '12px 20px', borderRadius: 10, border: 'none',
            background: '#16a34a', color: 'white', fontWeight: 700, cursor: 'pointer',
          }}
        >
          <Sparkles size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} />
          {loading ? 'Analyse en cours…' : 'Générer le bilan nutritionnel'}
        </button>
      </form>

      {advice && (
        <>
          <div style={{ ...card, background: 'linear-gradient(135deg,#fff,#f0fdf4)' }}>
            <h2 style={{ margin: '0 0 12px' }}>Bilan — {advice.petName || petName}</h2>
            <p style={{ color: '#475569', lineHeight: 1.6 }}>{advice.summary || advice.notes}</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10, marginTop: 16 }}>
              <StatBox icon={<Scale size={18} />} label="Apport journalier" value={`${advice.calories?.dailyKcal || advice.dailyCalories || '—'} kcal`} />
              <StatBox icon={<Utensils size={18} />} label="Croquettes/jour" value={`${advice.calories?.dryFoodGramsPerDay || '—'} g`} />
              <StatBox icon={<Utensils size={18} />} label="Pâtée/jour" value={`${advice.calories?.wetFoodGramsPerDay || '—'} g`} />
              <StatBox icon={<Droplets size={18} />} label="Hydratation" value={advice.hydration?.dailyMl ? `${advice.hydration.dailyMl} ml` : '—'} />
            </div>
            {(profile.species || profile.weightKg || petType) && (
              <p style={{ margin: '12px 0 0', fontSize: 13, color: '#64748b' }}>
                Profil : {PET_TYPE_LABELS[profile.species || petType] || profile.species || petType}
                {profile.weightKg || petWeight ? ` · ${profile.weightKg || petWeight} kg` : ''}
                {profile.activity ? ` · Activité ${profile.activity}` : ''}
                {profile.condition ? ` · ${profile.condition}` : ''}
              </p>
            )}
          </div>

          {Object.keys(macros).length > 0 && (
            <div style={card}>
              <h3 style={{ margin: '0 0 12px' }}>Macronutriments cibles</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {Object.entries(macros).map(([k, v]) => (
                  <span key={k} style={{ padding: '6px 12px', borderRadius: 999, background: '#ecfdf5', color: '#047857', fontSize: 13, fontWeight: 700 }}>
                    {k} : {v}
                  </span>
                ))}
              </div>
            </div>
          )}

          {mealPlan.length > 0 && (
            <div style={card}>
              <h3 style={{ margin: '0 0 12px' }}>Répartition des repas</h3>
              <div style={{ display: 'grid', gap: 10 }}>
                {mealPlan.map((m) => (
                  <div key={m.time} style={{ display: 'flex', gap: 12, padding: 12, background: '#f8fafc', borderRadius: 12, alignItems: 'center' }}>
                    <span style={{ fontWeight: 800, color: '#16a34a', minWidth: 48 }}>{m.time}</span>
                    <div>
                      <strong>{m.label}</strong>
                      <p style={{ margin: '2px 0 0', fontSize: 13, color: '#64748b' }}>{m.portion} · ~{m.kcal} kcal</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {foods.length > 0 && (
            <div style={card}>
              <h3 style={{ margin: '0 0 12px' }}>Produits recommandés</h3>
              <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                {foods.map((f) => (
                  <li key={f.name || f.id} style={{ padding: '10px 0', borderBottom: '1px solid #f1f5f9' }}>
                    <strong>{f.name}</strong>
                    {f.reason && <span style={{ display: 'block', fontSize: 13, color: '#64748b', marginTop: 2 }}>{f.reason}</span>}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {tips.length > 0 && (
            <div style={card}>
              <h3 style={{ margin: '0 0 12px' }}>💡 Conseils pratiques</h3>
              <ul style={{ margin: 0, paddingLeft: 20, color: '#475569', lineHeight: 1.7 }}>
                {tips.map((t) => <li key={t}>{t}</li>)}
              </ul>
            </div>
          )}

          {warnings.length > 0 && (
            <div style={{ ...card, background: '#fffbeb', border: '1px solid #fcd34d' }}>
              <h3 style={{ margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: 8, color: '#92400e' }}>
                <AlertTriangle size={18} /> Points de vigilance
              </h3>
              <ul style={{ margin: 0, paddingLeft: 20, color: '#78350f', lineHeight: 1.7 }}>
                {warnings.map((w) => <li key={w}>{w}</li>)}
              </ul>
            </div>
          )}

          {advice.hydration?.note && (
            <p style={{ fontSize: 13, color: '#0369a1', margin: 0 }}>
              <Droplets size={14} style={{ verticalAlign: 'middle' }} /> {advice.hydration.note}
            </p>
          )}
        </>
      )}
    </div>
  );
};

const StatBox = ({ icon, label, value }) => (
  <div style={{ padding: 14, background: 'white', borderRadius: 12, border: '1px solid #e2e8f0', textAlign: 'center' }}>
    <div style={{ color: '#16a34a', marginBottom: 4 }}>{icon}</div>
    <div style={{ fontSize: 18, fontWeight: 800 }}>{value}</div>
    <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>{label}</div>
  </div>
);

export default VetNutritionAdvicePage;
