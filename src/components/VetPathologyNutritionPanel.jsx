import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Utensils, Sparkles } from 'lucide-react';
import { runNutritionPathology } from '../services/vetIntelligenceHubService';

const PATHOLOGIES = [
  'Allergie / dermatite',
  'Obésité',
  'Diabète',
  'Arthrose',
  'Insuffisance rénale',
];

const VetPathologyNutritionPanel = ({ patients = [], demo, dossier, loading: packLoading }) => {
  const [petId, setPetId] = useState(patients[0]?.id || '');
  const [pathology, setPathology] = useState('Allergie / dermatite');
  const [result, setResult] = useState(demo || null);
  const [loading, setLoading] = useState(false);

  const pet = patients.find((p) => p.id === petId) || patients[0];

  const generate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await runNutritionPathology({
        pathology,
        pet: { name: pet?.petName, type: pet?.type, weightKg: pet?.weightKg },
        allergies: dossier?.allergies || '',
      });
      setResult(data);
    } finally {
      setLoading(false);
    }
  };

  if (packLoading) return <p className="vetih-muted">Chargement…</p>;

  return (
    <div className="vetih-panel">
      <p className="vetih-summary">
        <Utensils size={16} aria-hidden />
        Suggestion automatique de régimes alimentaires adaptés aux pathologies détectées (obésité, diabète, allergies…).
      </p>

      <form className="vetih-form" onSubmit={generate}>
        <label>
          Patient
          <select value={petId} onChange={(e) => setPetId(e.target.value)}>
            {patients.map((p) => (
              <option key={p.id} value={p.id}>{p.petName}</option>
            ))}
          </select>
        </label>
        <label>
          Pathologie / indication
          <select value={pathology} onChange={(e) => setPathology(e.target.value)}>
            {PATHOLOGIES.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </label>
        <button type="submit" className="vetih-btn vetih-btn--green" disabled={loading}>
          <Sparkles size={16} aria-hidden /> {loading ? 'Analyse…' : 'Recommander un régime'}
        </button>
      </form>

      {result && (
        <div className="vetih-results">
          <p className="vetih-ai-text">{result.aiSummary}</p>
          {(result.plans || []).map((plan, i) => (
            <div key={i} className="vetih-card vetih-card--plan">
              <h4>{plan.pathology}</h4>
              <p><strong>Régime :</strong> {plan.diet}</p>
              <p><strong>Objectif calorique :</strong> {plan.kcalTarget}</p>
              <p><strong>Aliments recommandés :</strong> {plan.foods?.join(', ')}</p>
              <p><strong>À éviter :</strong> {plan.avoid?.join(', ')}</p>
              <p><strong>Suivi :</strong> {plan.monitoring?.join(', ')}</p>
            </div>
          ))}
          <Link to="/vet/nutrition" className="vetih-link">Conseils nutrition complets →</Link>
        </div>
      )}
    </div>
  );
};

export default VetPathologyNutritionPanel;
