import React, { useCallback, useEffect, useState } from 'react';
import { Utensils, Sparkles } from 'lucide-react';
import api from '../utils/api';
import { mergeVetClients } from '../utils/vetDemoData';
import { getVetNutritionRecommendation } from '../services/vetService';
import { DEMO_VET_NUTRITION } from '../utils/vetDemoData';
import usePlatformRefresh from '../hooks/usePlatformRefresh';

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
      setAdvice(data);
    } catch {
      setAdvice(DEMO_VET_NUTRITION);
    } finally {
      setLoading(false);
    }
  };

  const selectedClient = clients.find((c) => (c.id || c._id) === ownerId);

  return (
    <div style={{ padding: 24, maxWidth: 720 }}>
      <header style={{ marginBottom: 20, padding: 20, borderRadius: 16, background: 'linear-gradient(135deg,#f0fdf4,#dcfce7)' }}>
        <h1 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8, fontSize: '1.4rem' }}>
          <Utensils size={22} /> Conseils nutritionnels
        </h1>
        <p style={{ margin: '8px 0 0', color: '#64748b' }}>Fournir des recommandations alimentaires personnalisées à vos patients.</p>
      </header>

      <form onSubmit={generate} style={{ background: 'white', padding: 20, borderRadius: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', marginBottom: 20 }}>
        <label style={{ display: 'block', marginBottom: 12, fontWeight: 600, fontSize: '0.85rem' }}>
          Client
          <select required value={ownerId} onChange={(e) => setOwnerId(e.target.value)} style={{ display: 'block', width: '100%', marginTop: 4, padding: 10, borderRadius: 10, border: '1px solid #e2e8f0' }}>
            <option value="">— Choisir —</option>
            {clients.map((c) => (
              <option key={c.id || c._id} value={c.id || c._id}>{c.name}</option>
            ))}
          </select>
        </label>
        <label style={{ display: 'block', marginBottom: 16, fontWeight: 600, fontSize: '0.85rem' }}>
          Animal
          <input required value={petName} onChange={(e) => setPetName(e.target.value)} list="vet-pets" placeholder="Nom de l'animal" style={{ display: 'block', width: '100%', marginTop: 4, padding: 10, borderRadius: 10, border: '1px solid #e2e8f0' }} />
          <datalist id="vet-pets">
            {(selectedClient?.pets || []).map((p) => (
              <option key={p.name || p} value={typeof p === 'string' ? p : p.name} />
            ))}
          </datalist>
        </label>
        <button type="submit" disabled={loading} style={{ padding: '10px 18px', borderRadius: 10, border: 'none', background: '#16a34a', color: 'white', fontWeight: 700, cursor: 'pointer' }}>
          <Sparkles size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} />
          {loading ? 'Analyse…' : 'Générer les conseils'}
        </button>
      </form>

      {advice && (
        <div style={{ background: 'white', padding: 20, borderRadius: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <h2 style={{ marginTop: 0 }}>Recommandation — {petName}</h2>
          <p><strong>Ration journalière :</strong> {advice.calories?.dailyKcal || advice.dailyCalories || '—'} kcal</p>
          <p><strong>Grammes croquettes/jour :</strong> {advice.calories?.dryFoodGramsPerDay || '—'} g</p>
          <p style={{ color: '#475569' }}>{advice.summary || advice.notes}</p>
          {advice.productRecommendations?.food?.length > 0 && (
            <ul>{advice.productRecommendations.food.map((f) => <li key={f.name}>{f.name}</li>)}</ul>
          )}
          {advice.tips?.length > 0 && (
            <ul>{advice.tips.map((t) => <li key={t}>{t}</li>)}</ul>
          )}
        </div>
      )}
    </div>
  );
};

export default VetNutritionAdvicePage;
