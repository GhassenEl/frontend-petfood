import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Stethoscope, Search, AlertTriangle, Syringe } from 'lucide-react';
import { COMMON_SYMPTOMS } from '../config/petHealthRecommendationCatalog';
import { analyzePetHealth } from '../services/petHealthRecommendationService';
import { DEMO_NUTRITION_PETS } from '../utils/clientDemoData';
import api from '../utils/api';
import './PetHealthRecommendationPanel.css';

const URGENCY_CLASS = { urgent: 'phr-urgency--urgent', soon: 'phr-urgency--soon', routine: 'phr-urgency--routine' };

const PetHealthRecommendationPanel = ({ compact = false }) => {
  const [pets, setPets] = useState(DEMO_NUTRITION_PETS);
  const [petId, setPetId] = useState('demo-nut-1');
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [symptomText, setSymptomText] = useState('');
  const [ownerNotes, setOwnerNotes] = useState('');
  const [knownChronic, setKnownChronic] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/pets').then(({ data }) => {
      if (Array.isArray(data) && data.length) {
        setPets(data);
        setPetId(data[0].id || data[0]._id);
      }
    }).catch(() => {});
  }, []);

  useEffect(() => {
    const p = pets.find((x) => (x.id || x._id) === petId);
    if (!p) return;
    const chronic = p.chronicConditions || (p.chronicDiseases ? [p.chronicDiseases] : []);
    setKnownChronic(chronic.join(', '));
  }, [petId, pets]);

  const pet = pets.find((p) => (p.id || p._id) === petId) || pets[0];
  const petProfile = pet ? {
    id: pet.id || pet._id,
    name: pet.name,
    type: pet.type || pet.petType || 'dog',
    weightKg: pet.weightKg || pet.weight,
    breed: pet.breed,
  } : null;

  const toggleSymptom = (id) => {
    setSelectedSymptoms((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const runAnalysis = useCallback(async (e) => {
    e?.preventDefault();
    if (!symptomText.trim() && !selectedSymptoms.length) return;
    setLoading(true);
    try {
      setResult(await analyzePetHealth({
        pet: petProfile,
        petId,
        symptoms: symptomText,
        selectedSymptoms,
        ownerNotes,
        knownChronic: knownChronic.split(/[,;]/).map((s) => s.trim()).filter(Boolean),
      }));
    } finally {
      setLoading(false);
    }
  }, [petProfile, petId, symptomText, selectedSymptoms, ownerNotes, knownChronic]);

  return (
    <div className="phr-panel">
      <header className="phr-header">
        <h2><Stethoscope size={20} style={{ verticalAlign: 'middle', marginRight: 6 }} />Recommandations santé</h2>
        <p>
          Détection symptômes, maladies chroniques et proposition de traitements (médicaments, vaccins, gélules).
          {!compact && ' Mode indicatif — consultation vétérinaire requise pour prescription.'}
        </p>
      </header>

      <form className="phr-form" onSubmit={runAnalysis}>
        <label>
          Animal
          <select value={petId} onChange={(e) => setPetId(e.target.value)}>
            {pets.map((p) => (
              <option key={p.id || p._id} value={p.id || p._id}>
                {p.name} — {p.type === 'cat' ? 'Chat' : 'Chien'}
                {p.breed ? ` (${p.breed})` : ''}
              </option>
            ))}
          </select>
        </label>

        <div>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#475569' }}>Symptômes observés</span>
          <div className="phr-symptom-grid" style={{ marginTop: 8 }}>
            {COMMON_SYMPTOMS.map((s) => (
              <button
                key={s.id}
                type="button"
                className={`phr-symptom-chip${selectedSymptoms.includes(s.id) ? ' is-selected' : ''}`}
                onClick={() => toggleSymptom(s.id)}
              >
                {s.icon} {s.label}
              </button>
            ))}
          </div>
        </div>

        <label>
          Décrivez les symptômes
          <textarea
            rows={3}
            value={symptomText}
            onChange={(e) => setSymptomText(e.target.value)}
            placeholder="Ex. Max se gratte depuis 3 jours, vomissements matinaux, boite patte arrière…"
          />
        </label>

        <label>
          Maladies chroniques connues (optionnel)
          <input
            type="text"
            value={knownChronic}
            onChange={(e) => setKnownChronic(e.target.value)}
            placeholder="Ex. arthrose, dermatite, diabète…"
            style={{ padding: '10px 12px', borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 14 }}
          />
        </label>

        {!compact && (
          <label>
            Contexte / notes
            <textarea
              rows={2}
              value={ownerNotes}
              onChange={(e) => setOwnerNotes(e.target.value)}
              placeholder="Durée, alimentation récente, traitements en cours…"
            />
          </label>
        )}

        <button type="submit" className="phr-btn" disabled={loading}>
          <Search size={16} /> {loading ? 'Analyse en cours…' : 'Analyser & recommander'}
        </button>
      </form>

      {result && (
        <>
          <div className="phr-section">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center', marginBottom: 10 }}>
              <span className={`phr-urgency ${URGENCY_CLASS[result.urgency] || ''}`}>
                {result.urgencyLabel}
              </span>
              {result.mode === 'demo' && <span style={{ fontSize: 11, color: '#64748b' }}>Mode démo</span>}
              {result.requiresVet && (
                <span style={{ fontSize: 12, color: '#dc2626', fontWeight: 700 }}>
                  <AlertTriangle size={14} style={{ verticalAlign: 'middle' }} /> Consultation vétérinaire recommandée
                </span>
              )}
            </div>
            <p style={{ margin: 0, fontSize: 14, color: '#475569', lineHeight: 1.5 }}>{result.aiSummary}</p>
          </div>

          {result.detectedSymptoms?.length > 0 && (
            <div className="phr-section">
              <h3>Symptômes détectés ({result.petName})</h3>
              <div className="phr-symptom-grid">
                {result.detectedSymptoms.map((s) => (
                  <span key={s.id} className="phr-symptom-chip is-selected">{s.icon} {s.label}</span>
                ))}
              </div>
            </div>
          )}

          {result.diagnosis?.diagnosticHypotheses?.length > 0 && (
            <div className="phr-section">
              <h3>Pistes diagnostiques</h3>
              <ul className="phr-hypothesis-list">
                {result.diagnosis.diagnosticHypotheses.map((h, i) => (
                  <li key={i}>
                    <strong>{h.condition}</strong>
                    <span>{h.confidence}</span>
                    <p style={{ margin: '4px 0 0', fontSize: 12, color: '#64748b' }}>{h.rationale}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {result.chronicConditions?.length > 0 && (
            <div className="phr-section">
              <h3>Maladies chroniques identifiées</h3>
              {result.chronicConditions.map((c) => (
                <div key={c.id} className="phr-chronic-card">
                  <strong>{c.name}</strong>
                  <small>{c.confidence}</small>
                  <p>{c.description}</p>
                  <p><em>Surveillance : {c.monitoring}</em></p>
                </div>
              ))}
            </div>
          )}

          {result.vaccines?.length > 0 && (
            <div className="phr-section">
              <h3><Syringe size={16} style={{ verticalAlign: 'middle' }} /> Vaccins recommandés</h3>
              {result.vaccines.map((v) => (
                <div key={v.id} className={`phr-vaccine-row${v.status === 'En retard' ? ' is-late' : ''}`}>
                  <div>
                    <strong>{v.name}</strong>
                    <div style={{ fontSize: 11, color: '#64748b' }}>{v.description}</div>
                  </div>
                  <span style={{ fontWeight: 800, fontSize: 12 }}>{v.status}</span>
                </div>
              ))}
            </div>
          )}

          {result.treatments?.length > 0 && (
            <div className="phr-section">
              <h3>Traitements recommandés</h3>
              <div className="phr-treatment-grid">
                {result.treatments.map((t) => (
                  <article key={t.id} className={`phr-treatment-card${t.priority === 'high' ? ' phr-treatment-card--high' : ''}`}>
                    <span className="phr-treatment-type" style={{ color: t.typeMeta?.color }}>
                      {t.typeMeta?.icon} {t.typeMeta?.label || t.type}
                    </span>
                    <h4>{t.name}</h4>
                    <p><strong>Posologie :</strong> {t.dosage}</p>
                    <p>{t.frequency} · {t.duration}</p>
                    <p>{t.rationale}</p>
                    {t.otc === false && (
                      <small style={{ color: '#dc2626', fontWeight: 700 }}>Prescription vétérinaire requise</small>
                    )}
                    {t.inStock === false && (
                      <small style={{ color: '#d97706' }}>Stock pharmacie à vérifier</small>
                    )}
                  </article>
                ))}
              </div>
            </div>
          )}

          <div className="phr-actions">
            <Link to="/veterinary" className="phr-link">Téléconsultation véto →</Link>
            <Link to="/medical-dossier" className="phr-link">Dossier médical →</Link>
            <Link to="/client-products" className="phr-link">Pharmacie en ligne →</Link>
          </div>

          <p className="phr-disclaimer">{result.disclaimer}</p>
        </>
      )}
    </div>
  );
};

export default PetHealthRecommendationPanel;
