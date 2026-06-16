import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Pill, Sparkles } from 'lucide-react';
import { runPrescriptionAssist } from '../services/vetIntelligenceHubService';

const VetPrescriptionAssistantPanel = ({ patients = [], demo, loading: packLoading }) => {
  const [petId, setPetId] = useState(patients[0]?.id || '');
  const [diagnosis, setDiagnosis] = useState('Dermatite allergique');
  const [symptoms, setSymptoms] = useState('grattage, prurit');
  const [result, setResult] = useState(demo || null);
  const [loading, setLoading] = useState(false);

  const pet = patients.find((p) => p.id === petId) || patients[0];

  const generate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await runPrescriptionAssist({
        diagnosis,
        symptoms,
        pet: { name: pet?.petName, type: pet?.type, weightKg: pet?.weightKg },
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
        <Pill size={16} aria-hidden />
        Proposition automatique de traitements et compléments alimentaires adaptés au profil de l&apos;animal.
      </p>

      <form className="vetih-form" onSubmit={generate}>
        <label>
          Patient
          <select value={petId} onChange={(e) => setPetId(e.target.value)}>
            {patients.map((p) => (
              <option key={p.id} value={p.id}>{p.petName} ({p.weightKg} kg)</option>
            ))}
          </select>
        </label>
        <label>
          Diagnostic / hypothèse
          <input value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} />
        </label>
        <label>
          Symptômes associés
          <input value={symptoms} onChange={(e) => setSymptoms(e.target.value)} />
        </label>
        <button type="submit" className="vetih-btn" disabled={loading}>
          <Sparkles size={16} aria-hidden /> {loading ? 'Génération…' : 'Générer ordonnance assistée'}
        </button>
      </form>

      {result && (
        <div className="vetih-results">
          <p className="vetih-ai-text">{result.aiSummary}</p>
          <h4>Médicaments proposés</h4>
          <ul className="vetih-list">
            {(result.medications || []).map((m, i) => (
              <li key={i} className="vetih-card">
                <strong>{m.medication || m.name}</strong>
                <p>{m.dosage} · {m.frequency} · {m.duration}</p>
                {m.rationale && <p className="vetih-muted-inline">{m.rationale}</p>}
              </li>
            ))}
          </ul>
          {(result.supplements || []).length > 0 && (
            <>
              <h4>Compléments</h4>
              <ul className="vetih-list vetih-list--compact">
                {result.supplements.map((s, i) => (
                  <li key={i}>💊 {s.name} — {s.dosage} ({s.rationale})</li>
                ))}
              </ul>
            </>
          )}
          <p className="vetih-disclaimer">{result.disclaimer}</p>
          <Link to="/vet/prescriptions" className="vetih-link">Créer ordonnance officielle →</Link>
        </div>
      )}
    </div>
  );
};

export default VetPrescriptionAssistantPanel;
