import React, { useCallback, useEffect, useState } from 'react';
import { Sparkles, Pill, AlertTriangle, CheckCircle2 } from 'lucide-react';
import {
  fetchMedicationRecommendations,
  applyRecommendationsToRows,
} from '../services/vetMedicationService';

const priorityColor = {
  high: '#dc2626',
  medium: '#d97706',
  low: '#64748b',
};

const card = {
  background: 'white',
  borderRadius: 14,
  border: '1px solid #e5e7eb',
  padding: 16,
  marginBottom: 12,
};

/**
 * Panneau recommandation médicaments — diagnostic, symptômes, espèce, poids.
 */
const VetMedicationRecommender = ({
  petContext = {},
  diagnosis: diagnosisProp = '',
  symptoms: symptomsProp = '',
  onApply,
  compact = false,
  showInputs = true,
}) => {
  const [diagnosis, setDiagnosis] = useState(diagnosisProp);
  const [symptoms, setSymptoms] = useState(symptomsProp);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState(new Set());

  useEffect(() => {
    if (diagnosisProp !== undefined) setDiagnosis(diagnosisProp);
  }, [diagnosisProp]);

  useEffect(() => {
    if (symptomsProp !== undefined) setSymptoms(symptomsProp);
  }, [symptomsProp]);

  const runRecommend = useCallback(async () => {
    if (!diagnosis?.trim() && !symptoms?.trim()) {
      setError('Saisissez un diagnostic ou des symptômes.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const data = await fetchMedicationRecommendations({
        diagnosis: diagnosis.trim(),
        symptoms: symptoms.trim(),
        animalType: petContext.animalType || petContext.type,
        weightKg: petContext.weightKg ?? petContext.weight,
        petName: petContext.petName || petContext.name,
        breed: petContext.breed,
        ageYears: petContext.ageYears,
      });
      setResult(data);
      setSelected(new Set(data.recommendations.slice(0, 3).map((r) => r.id)));
    } catch {
      setError('Recommandation indisponible.');
      setResult(null);
    } finally {
      setLoading(false);
    }
  }, [diagnosis, symptoms, petContext]);

  const toggleSelect = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleApply = () => {
    if (!result?.recommendations?.length || !onApply) return;
    const picked = result.recommendations.filter((r) => selected.has(r.id));
    if (!picked.length) {
      window.alert('Sélectionnez au moins un médicament.');
      return;
    }
    onApply(applyRecommendationsToRows(picked));
  };

  const inputStyle = {
    width: '100%',
    padding: '10px 12px',
    borderRadius: 10,
    border: '1px solid #e5e7eb',
    fontSize: 14,
    boxSizing: 'border-box',
  };

  return (
    <div style={{ ...card, background: compact ? '#f8fafc' : 'white', border: '1px solid #c4b5fd' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <Sparkles size={20} color="#7c3aed" />
        <h3 style={{ margin: 0, fontSize: compact ? 15 : 17, fontWeight: 800, color: '#5b21b6' }}>
          Recommandation médicaments
        </h3>
        {petContext.petName || petContext.name ? (
          <span style={{ fontSize: 12, color: '#64748b', marginLeft: 'auto' }}>
            {petContext.petName || petContext.name}
            {petContext.weightKg || petContext.weight ? ` · ${petContext.weightKg || petContext.weight} kg` : ''}
          </span>
        ) : null}
      </div>

      {showInputs && (
        <div style={{ display: 'grid', gap: 10, marginBottom: 12 }}>
          <label style={{ fontSize: 12, fontWeight: 700, color: '#475569' }}>
            Diagnostic
            <input
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              placeholder="Ex: Dermatite allergique, Arthrose…"
              style={{ ...inputStyle, marginTop: 4 }}
            />
          </label>
          <label style={{ fontSize: 12, fontWeight: 700, color: '#475569' }}>
            Symptômes (optionnel)
            <textarea
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              rows={2}
              placeholder="Grattage, boiterie, vomissements…"
              style={{ ...inputStyle, marginTop: 4, resize: 'vertical' }}
            />
          </label>
        </div>
      )}

      <button
        type="button"
        onClick={runRecommend}
        disabled={loading}
        style={{
          padding: '10px 18px',
          borderRadius: 10,
          border: 'none',
          background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
          color: 'white',
          fontWeight: 700,
          cursor: loading ? 'wait' : 'pointer',
          fontSize: 14,
        }}
      >
        {loading ? 'Analyse en cours…' : '💊 Recommander des médicaments'}
      </button>

      {error && (
        <p style={{ margin: '10px 0 0', fontSize: 13, color: '#dc2626' }}>{error}</p>
      )}

      {result && (
        <div style={{ marginTop: 16 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12, alignItems: 'center' }}>
            {result.diseases?.length > 0 && (
              <span style={{ fontSize: 12, color: '#047857', fontWeight: 600 }}>
                Pathologies détectées : {result.diseases.join(', ')}
              </span>
            )}
            <span style={{
              fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 999,
              background: result.source === 'hybrid' ? '#dcfce7' : '#eff6ff',
              color: result.source === 'hybrid' ? '#166534' : '#1d4ed8',
            }}
            >
              {result.source === 'hybrid' ? 'Protocole + API/IA' : 'Protocole clinique'}
            </span>
          </div>

          {result.recommendations.length === 0 ? (
            <p style={{ color: '#64748b', fontSize: 13 }}>Aucun protocole trouvé — affinez le diagnostic.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {result.recommendations.map((rec) => (
                <label
                  key={rec.id}
                  style={{
                    display: 'block',
                    padding: 12,
                    borderRadius: 12,
                    border: selected.has(rec.id) ? '2px solid #7c3aed' : '1px solid #e5e7eb',
                    background: selected.has(rec.id) ? '#faf5ff' : '#fff',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <input
                      type="checkbox"
                      checked={selected.has(rec.id)}
                      onChange={() => toggleSelect(rec.id)}
                      style={{ marginTop: 4 }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center', marginBottom: 4 }}>
                        <Pill size={14} color="#7c3aed" />
                        <strong style={{ fontSize: 14 }}>{rec.name}</strong>
                        <span style={{
                          fontSize: 10, fontWeight: 800, padding: '2px 8px', borderRadius: 6,
                          background: `${priorityColor[rec.priority] || '#94a3b8'}22`,
                          color: priorityColor[rec.priority] || '#64748b',
                        }}
                        >
                          {rec.disease}
                        </span>
                        {rec.lowStock && (
                          <span style={{ fontSize: 10, color: '#b45309', display: 'flex', alignItems: 'center', gap: 4 }}>
                            <AlertTriangle size={12} /> Stock bas ({rec.stockQty})
                          </span>
                        )}
                        {!rec.lowStock && rec.inStock && (
                          <span style={{ fontSize: 10, color: '#059669', display: 'flex', alignItems: 'center', gap: 4 }}>
                            <CheckCircle2 size={12} /> En stock
                          </span>
                        )}
                      </div>
                      <p style={{ margin: '0 0 4px', fontSize: 13, color: '#334155' }}>
                        {rec.dosage} · {rec.frequency} · {rec.duration}
                        {rec.quantity ? ` · qté ${rec.quantity}` : ''}
                      </p>
                      <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>{rec.rationale}</p>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          )}

          {onApply && result.recommendations.length > 0 && (
            <button
              type="button"
              onClick={handleApply}
              style={{
                marginTop: 12,
                padding: '10px 16px',
                borderRadius: 10,
                border: 'none',
                background: '#059669',
                color: 'white',
                fontWeight: 700,
                cursor: 'pointer',
                fontSize: 13,
              }}
            >
              Appliquer la sélection à l&apos;ordonnance ({selected.size})
            </button>
          )}

          <p style={{ margin: '12px 0 0', fontSize: 11, color: '#94a3b8' }}>{result.disclaimer}</p>
        </div>
      )}
    </div>
  );
};

export default VetMedicationRecommender;
