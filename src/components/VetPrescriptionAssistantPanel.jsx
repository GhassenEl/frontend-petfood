import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Pill, Sparkles, RefreshCw, CheckCircle, FileDown } from 'lucide-react';
import { runPrescriptionAssist } from '../services/vetIntelligenceHubService';
import { refinePrescriptionDraft, applyPrescriptionDraft } from '../services/vetMlAssistService';
import { exportPrescriptionPdf } from '../utils/prescriptionPdf';

const VetPrescriptionAssistantPanel = ({ patients = [], demo, loading: packLoading }) => {
  const navigate = useNavigate();
  const [petId, setPetId] = useState(patients[0]?.id || '');
  const [diagnosis, setDiagnosis] = useState('Dermatite allergique');
  const [symptoms, setSymptoms] = useState('grattage, prurit');
  const [refinementNote, setRefinementNote] = useState('');
  const [result, setResult] = useState(demo || null);
  const [loading, setLoading] = useState(false);
  const [applying, setApplying] = useState(false);

  const pet = patients.find((p) => p.id === petId) || patients[0];

  const generate = async (e) => {
    e?.preventDefault();
    setLoading(true);
    try {
      const data = await runPrescriptionAssist({
        diagnosis,
        symptoms,
        ownerId: pet?.ownerId,
        petId: pet?.id,
        petName: pet?.petName,
        animalType: pet?.type,
        pet: { name: pet?.petName, type: pet?.type, weightKg: pet?.weightKg },
      });
      setResult(data);
      setRefinementNote('');
    } finally {
      setLoading(false);
    }
  };

  const refine = async () => {
    if (!result?.draftId || !refinementNote.trim()) return;
    setLoading(true);
    try {
      const data = await refinePrescriptionDraft(result.draftId, { refinementNote });
      setResult(data);
      setRefinementNote('');
    } finally {
      setLoading(false);
    }
  };

  const applyOfficial = async () => {
    if (!result?.draftId) {
      navigate(`/vet/prescriptions?petName=${encodeURIComponent(pet?.petName || '')}&ownerId=${pet?.ownerId || ''}`);
      return;
    }
    setApplying(true);
    try {
      await applyPrescriptionDraft(result.draftId);
      navigate('/vet/prescriptions');
    } catch {
      navigate(`/vet/prescriptions?petName=${encodeURIComponent(pet?.petName || '')}`);
    } finally {
      setApplying(false);
    }
  };

  const downloadPdf = () => {
    if (!result) return;
    exportPrescriptionPdf({
      petName: pet?.petName || result.petName,
      animalType: pet?.type || result.animalType,
      ownerName: pet?.ownerName,
      diagnosis,
      symptoms,
      medications: result.medications,
      supplements: result.supplements,
      instructions: result.instructions,
      aiSummary: result.aiSummary,
      draftId: result.draftId,
      disclaimer: result.disclaimer,
    });
  };

  if (packLoading) return <p className="vetih-muted">Chargement…</p>;

  return (
    <div className="vetih-panel">
      <p className="vetih-summary">
        <Pill size={16} aria-hidden />
        Agent IA — ordonnance dynamique selon diagnostic, espèce, poids et stock pharmacie clinique.
        Ajustez le brouillon avant validation.
      </p>

      <form className="vetih-form" onSubmit={generate}>
        <label>
          Patient
          <select value={petId} onChange={(e) => setPetId(e.target.value)}>
            {patients.map((p) => (
              <option key={p.id} value={p.id}>{p.petName} ({p.weightKg} kg) — {p.type}</option>
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
          <div className="vetih-badge-row">
            {result.source && (
              <span className="vetih-tag">{result.source === 'groq' ? 'IA Groq' : result.source === 'api' ? 'API ML' : 'Catalogue clinique'}</span>
            )}
            {result.fitScore != null && (
              <span className="vetih-tag">Cohérence : {Math.round(result.fitScore * 100)} %</span>
            )}
            {result.draftId && <span className="vetih-tag">Brouillon #{result.draftId.slice(0, 8)}</span>}
          </div>

          <p className="vetih-ai-text">{result.aiSummary}</p>

          {result.fitRecommendation && (
            <p className="vetih-muted-inline">{result.fitRecommendation}</p>
          )}

          <h4>Médicaments proposés</h4>
          <ul className="vetih-list">
            {(result.medications || []).map((m, i) => (
              <li key={i} className="vetih-card">
                <strong>{m.medication || m.name}</strong>
                {!m.inStock && m.inStock !== undefined && (
                  <span className="vetih-badge" style={{ background: '#fef2f2', color: '#b91c1c', marginLeft: 8 }}>
                    Stock faible
                  </span>
                )}
                <p>{m.dosage} · {m.frequency} · {m.duration}</p>
                {m.rationale && <p className="vetih-muted-inline">{m.rationale}</p>}
                {(m.warnings || []).map((w, j) => (
                  <p key={j} className="vetih-muted-inline" style={{ color: '#b45309' }}>⚠ {w}</p>
                ))}
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

          {result.instructions && (
            <>
              <h4>Consignes</h4>
              <p className="vetih-muted-inline">{result.instructions}</p>
            </>
          )}

          {result.draftId && (
            <div className="vetih-form" style={{ marginTop: 16 }}>
              <label>
                Affiner le brouillon (instructions au modèle)
                <textarea
                  rows={2}
                  value={refinementNote}
                  onChange={(e) => setRefinementNote(e.target.value)}
                  placeholder="Ex. réduire la durée, éviter les AINS, privilégier un médicament du stock…"
                />
              </label>
              <button type="button" className="vetih-btn vetih-btn--outline" onClick={refine} disabled={loading || !refinementNote.trim()}>
                <RefreshCw size={16} aria-hidden /> Régénérer avec ajustement
              </button>
            </div>
          )}

          <p className="vetih-disclaimer">{result.disclaimer}</p>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 12 }}>
            <button type="button" className="vetih-btn vetih-btn--outline" onClick={downloadPdf}>
              <FileDown size={16} aria-hidden /> Exporter PDF
            </button>
            {result.draftId && pet?.ownerId && (
              <button type="button" className="vetih-btn" onClick={applyOfficial} disabled={applying}>
                <CheckCircle size={16} aria-hidden />
                {applying ? 'Création…' : 'Valider et créer ordonnance officielle'}
              </button>
            )}
            <Link to="/vet/prescriptions" className="vetih-link">Éditer manuellement →</Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default VetPrescriptionAssistantPanel;
