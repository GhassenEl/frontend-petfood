import React, { useCallback, useEffect, useState } from 'react';
import { Utensils, Sparkles, AlertTriangle, Droplets, Scale } from 'lucide-react';
import api from '../utils/api';
import { mergeVetClients } from '../utils/vetDemoData';
import { getVetNutritionRecommendation } from '../services/vetService';
import { DEMO_VET_NUTRITION } from '../utils/vetDemoData';
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
  const [ownerId, setOwnerId] = useState('');
  const [petName, setPetName] = useState('');
  const [advice, setAdvice] = useState(null);
  const [loading, setLoading] = useState(false);

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

  const generate = async (e) => {
    e.preventDefault();
    if (!ownerId || !petName) return;
    setLoading(true);
    try {
      const data = await getVetNutritionRecommendation(ownerId, petName);
      setAdvice({ ...DEMO_VET_NUTRITION, ...data });
    } catch {
      setAdvice(DEMO_VET_NUTRITION);
    } finally {
      setLoading(false);
    }
  };

  const selectedClient = clients.find((c) => (c.id || c._id) === ownerId);
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
          <Utensils size={24} color="#16a34a" /> Conseils nutritionnels
        </h1>
        <p style={{ margin: '8px 0 0', color: '#64748b', maxWidth: 560 }}>
          Plans alimentaires personnalisés selon le profil de l&apos;animal : poids, activité, pathologies et préférences.
        </p>
      </header>

      <form onSubmit={generate} style={card}>
        <h2 style={{ margin: '0 0 16px', fontSize: '1rem' }}>Sélection du patient</h2>
        <div style={{ display: 'grid', gap: 14, gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
          <label style={{ fontWeight: 600, fontSize: '0.85rem' }}>
            Client
            <select
              required
              value={ownerId}
              onChange={(e) => setOwnerId(e.target.value)}
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
            <input
              required
              value={petName}
              onChange={(e) => setPetName(e.target.value)}
              list="vet-pets"
              placeholder="Nom de l'animal"
              style={{ display: 'block', width: '100%', marginTop: 4, padding: 10, borderRadius: 10, border: '1px solid #e2e8f0' }}
            />
            <datalist id="vet-pets">
              {(selectedClient?.pets || []).map((p) => (
                <option key={p.name || p} value={typeof p === 'string' ? p : p.name} />
              ))}
            </datalist>
          </label>
        </div>
        <button
          type="submit"
          disabled={loading}
          style={{
            marginTop: 16, padding: '12px 20px', borderRadius: 10, border: 'none',
            background: '#16a34a', color: 'white', fontWeight: 700, cursor: 'pointer',
          }}
        >
          <Sparkles size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} />
          {loading ? 'Analyse en cours…' : 'Générer le plan nutritionnel'}
        </button>
      </form>

      {advice && (
        <>
          <div style={{ ...card, background: 'linear-gradient(135deg,#fff,#f0fdf4)' }}>
            <h2 style={{ margin: '0 0 12px' }}>Plan — {petName}</h2>
            <p style={{ color: '#475569', lineHeight: 1.6 }}>{advice.summary || advice.notes}</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10, marginTop: 16 }}>
              <StatBox icon={<Scale size={18} />} label="Apport journalier" value={`${advice.calories?.dailyKcal || advice.dailyCalories || '—'} kcal`} />
              <StatBox icon={<Utensils size={18} />} label="Croquettes/jour" value={`${advice.calories?.dryFoodGramsPerDay || '—'} g`} />
              <StatBox icon={<Utensils size={18} />} label="Pâtée/jour" value={`${advice.calories?.wetFoodGramsPerDay || '—'} g`} />
              <StatBox icon={<Droplets size={18} />} label="Hydratation" value={advice.hydration?.dailyMl ? `${advice.hydration.dailyMl} ml` : '—'} />
            </div>
            {(profile.species || profile.weightKg) && (
              <p style={{ margin: '12px 0 0', fontSize: 13, color: '#64748b' }}>
                Profil : {profile.species || '—'} · {profile.weightKg ? `${profile.weightKg} kg` : ''}
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
                  <li key={f.name} style={{ padding: '10px 0', borderBottom: '1px solid #f1f5f9' }}>
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
