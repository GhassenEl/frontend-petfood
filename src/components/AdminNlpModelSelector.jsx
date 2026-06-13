import React, { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, CheckCircle2, RefreshCw, Sparkles } from 'lucide-react';
import {
  fetchNlpModelBenchmark,
  updateNlpModelConfig,
} from '../services/nlpModelService';

const modeLabel = {
  auto: 'Automatique (meilleur F1)',
  manual: 'Manuel (choix admin)',
};

const AdminNlpModelSelector = ({ compact = false }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [selectionMode, setSelectionMode] = useState('auto');
  const [manualModelId, setManualModelId] = useState('bert');

  const load = useCallback(() => {
    setLoading(true);
    setError('');
    fetchNlpModelBenchmark()
      .then((res) => {
        setData(res);
        setSelectionMode(res.activeModel?.selectionMode || 'auto');
        setManualModelId(res.activeModel?.id || res.recommendedModelId || 'bert');
      })
      .catch((err) => {
        setData(null);
        setError(err.response?.data?.error || 'Benchmark NLP indisponible.');
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const applyConfig = async (mode, modelId) => {
    setSaving(true);
    setError('');
    try {
      const res = await updateNlpModelConfig({
        selectionMode: mode,
        modelId: mode === 'manual' ? modelId : undefined,
      });
      setSelectionMode(res.activeModel.selectionMode);
      setManualModelId(res.activeModel.id);
      setData((prev) => (prev ? { ...prev, benchmark: res.benchmark, activeModel: res.activeModel } : prev));
      window.alert(`Modèle actif : ${res.activeModel.label}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Échec enregistrement du modèle.');
    } finally {
      setSaving(false);
    }
  };

  const pct = (v) => (v != null ? `${(v * 100).toFixed(1)} %` : '—');

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        ...card,
        padding: compact ? 18 : 24,
        marginBottom: compact ? 16 : 24,
      }}
    >
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <Brain size={22} color="#7c3aed" />
        <h3 style={{ margin: 0, fontSize: compact ? 16 : 18, fontWeight: 800, flex: 1 }}>
          Modèles NLP — prédiction texte
        </h3>
        <span style={badge}>
          <Sparkles size={12} /> BERT · LSTM · GRU
        </span>
        <button type="button" onClick={load} disabled={loading} style={btnRefresh}>
          <RefreshCw size={14} /> Actualiser
        </button>
      </div>

      <p style={{ margin: '0 0 14px', fontSize: 13, color: '#64748b', lineHeight: 1.55 }}>
        Comparaison sur corpus de validation français (avis & réclamations).
        Métrique principale : <strong>F1</strong> (équilibre précision / rappel).
      </p>

      {loading && <p style={muted}>Calcul des métriques…</p>}
      {error && <p style={{ color: '#b91c1c', margin: '0 0 10px' }}>{error}</p>}

      {!loading && data && (
        <>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 16, alignItems: 'center' }}>
            <label style={labelStyle}>
              Mode de sélection
              <select
                value={selectionMode}
                onChange={(e) => setSelectionMode(e.target.value)}
                style={selectStyle}
              >
                <option value="auto">Automatique — meilleur F1</option>
                <option value="manual">Manuel — choix admin</option>
              </select>
            </label>
            {selectionMode === 'manual' && (
              <label style={labelStyle}>
                Modèle actif
                <select
                  value={manualModelId}
                  onChange={(e) => setManualModelId(e.target.value)}
                  style={selectStyle}
                >
                  {(data.benchmark || []).map((row) => (
                    <option key={row.id} value={row.id}>
                      {row.label} (F1 {pct(row.f1)})
                    </option>
                  ))}
                </select>
              </label>
            )}
            <button
              type="button"
              disabled={saving}
              onClick={() => applyConfig(selectionMode, manualModelId)}
              style={btnPrimary}
            >
              {saving ? 'Enregistrement…' : 'Appliquer le modèle'}
            </button>
          </div>

          <p style={{ margin: '0 0 10px', fontSize: 12, color: '#047857', fontWeight: 600 }}>
            Actif : {data.activeModel?.label} — {modeLabel[data.activeModel?.selectionMode] || 'auto'}
            {data.activeModel?.updatedAt
              ? ` · maj ${new Date(data.activeModel.updatedAt).toLocaleString('fr-FR')}`
              : ''}
          </p>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ textAlign: 'left', color: '#64748b', borderBottom: '2px solid #e2e8f0' }}>
                  <th style={th}>#</th>
                  <th style={th}>Modèle</th>
                  <th style={th}>Accuracy</th>
                  <th style={th}>Precision</th>
                  <th style={th}>Recall</th>
                  <th style={th}>F1</th>
                  <th style={th}>Statut</th>
                </tr>
              </thead>
              <tbody>
                {(data.benchmark || []).map((row) => (
                  <tr
                    key={row.id}
                    style={{
                      background: row.selected ? '#f5f3ff' : 'transparent',
                      fontWeight: row.selected ? 700 : 400,
                      borderBottom: '1px solid #f1f5f9',
                    }}
                  >
                    <td style={td}>{row.rank}</td>
                    <td style={td}>
                      <div>{row.label}</div>
                      <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 400 }}>{row.description}</div>
                    </td>
                    <td style={td}>{pct(row.accuracy)}</td>
                    <td style={td}>{pct(row.precision)}</td>
                    <td style={td}>{pct(row.recall)}</td>
                    <td style={td}>{pct(row.f1)}</td>
                    <td style={td}>
                      {row.selected && (
                        <span style={{ color: '#7c3aed', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          <CheckCircle2 size={14} /> Actif
                        </span>
                      )}
                      {!row.selected && row.recommended && (
                        <span style={{ color: '#059669', fontSize: 12 }}>Recommandé</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p style={{ margin: '12px 0 0', fontSize: 12, color: '#94a3b8' }}>
            {data.insight} · {data.validation?.samples} échantillons · tâche : {data.validation?.task}
          </p>
        </>
      )}
    </motion.div>
  );
};

const card = {
  background: 'white',
  borderRadius: 18,
  boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
  border: '1px solid #f0f0f0',
};

const badge = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 4,
  fontSize: 11,
  fontWeight: 700,
  color: '#7c3aed',
  background: '#f3e8ff',
  padding: '4px 10px',
  borderRadius: 999,
};

const btnRefresh = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  padding: '6px 12px',
  borderRadius: 8,
  border: '1px solid #e5e7eb',
  background: 'white',
  cursor: 'pointer',
  fontSize: 13,
};

const btnPrimary = {
  padding: '8px 14px',
  borderRadius: 10,
  border: 'none',
  background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
  color: 'white',
  fontWeight: 700,
  cursor: 'pointer',
  fontSize: 13,
  alignSelf: 'flex-end',
};

const labelStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: 4,
  fontSize: 12,
  fontWeight: 700,
  color: '#475569',
};

const selectStyle = {
  padding: '8px 10px',
  borderRadius: 8,
  border: '1px solid #e5e7eb',
  fontSize: 13,
  minWidth: 200,
};

const th = { padding: '8px 10px' };
const td = { padding: '10px' };
const muted = { fontSize: 13, color: '#64748b', margin: 0 };

export default AdminNlpModelSelector;
