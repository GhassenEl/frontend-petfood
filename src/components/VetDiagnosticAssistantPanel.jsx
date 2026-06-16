import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Stethoscope, Search } from 'lucide-react';
import { runDiagnosticAnalysis } from '../services/vetIntelligenceHubService';

const SEV = { urgent: '#dc2626', soon: '#d97706', routine: '#0ea5e9' };

const VetDiagnosticAssistantPanel = ({ patients = [], demo, loading: packLoading }) => {
  const [petId, setPetId] = useState(patients[0]?.id || '');
  const [symptoms, setSymptoms] = useState('Grattage excessif, rougeurs zone ventrale');
  const [ownerNotes, setOwnerNotes] = useState('');
  const [result, setResult] = useState(demo || null);
  const [loading, setLoading] = useState(false);

  const pet = patients.find((p) => p.id === petId) || patients[0];

  const analyze = async (e) => {
    e?.preventDefault();
    if (!symptoms.trim()) return;
    setLoading(true);
    try {
      const data = await runDiagnosticAnalysis({
        symptoms,
        ownerNotes,
        pet: pet ? { name: pet.petName, type: pet.type, weightKg: pet.weightKg } : {},
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
        <Stethoscope size={16} aria-hidden />
        L&apos;IA analyse les symptômes renseignés par le propriétaire et suggère des pistes diagnostiques et examens complémentaires.
      </p>

      <form className="vetih-form" onSubmit={analyze}>
        <label>
          Patient
          <select value={petId} onChange={(e) => setPetId(e.target.value)}>
            {patients.map((p) => (
              <option key={p.id} value={p.id}>{p.petName} — {p.ownerName}</option>
            ))}
          </select>
        </label>
        <label>
          Symptômes (saisie propriétaire / téléconsult)
          <textarea rows={3} value={symptoms} onChange={(e) => setSymptoms(e.target.value)} placeholder="Ex. grattage, vomissements, boiterie…" />
        </label>
        <label>
          Notes complémentaires
          <textarea rows={2} value={ownerNotes} onChange={(e) => setOwnerNotes(e.target.value)} placeholder="Durée, contexte, alimentation récente…" />
        </label>
        <button type="submit" className="vetih-btn" disabled={loading}>
          <Search size={16} aria-hidden /> {loading ? 'Analyse…' : 'Analyser les symptômes'}
        </button>
      </form>

      {result && (
        <div className="vetih-results">
          <div className="vetih-badge-row">
            <span className="vetih-badge" style={{ background: SEV[result.urgency] || '#64748b' }}>
              {result.urgencyLabel || result.urgency}
            </span>
            {result.source && <span className="vetih-tag">{result.source === 'api' ? 'API ML' : 'Moteur local'}</span>}
          </div>
          <p className="vetih-ai-text">{result.aiSummary}</p>

          <h4>Pistes diagnostiques</h4>
          <ul className="vetih-list">
            {(result.diagnosticHypotheses || []).map((h, i) => (
              <li key={i} className="vetih-card">
                <strong>{h.condition}</strong>
                <span className="vetih-conf">{h.confidence}</span>
                <p>{h.rationale}</p>
              </li>
            ))}
          </ul>

          <h4>Examens complémentaires suggérés</h4>
          <ul className="vetih-list vetih-list--compact">
            {(result.screeningRecommendations || []).map((ex, i) => (
              <li key={i}>🔬 <strong>{ex.test}</strong> — {ex.reason}</li>
            ))}
          </ul>

          <p className="vetih-disclaimer">{result.disclaimer}</p>
          <Link to="/vet/diagnostics" className="vetih-link">Ouvrir détection précoce complète →</Link>
        </div>
      )}
    </div>
  );
};

export default VetDiagnosticAssistantPanel;
