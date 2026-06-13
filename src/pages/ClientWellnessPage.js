import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { Scale, GitCompare, AlertTriangle, Trophy } from 'lucide-react';
import api from '../utils/api';
import {
  compareProducts,
  fetchPetWeightTracking,
  logPetWeight,
} from '../services/ecosystemService';
import { formatDT } from '../utils/formatCurrency';

const card = {
  background: '#fff',
  borderRadius: 16,
  padding: 20,
  boxShadow: '0 2px 14px rgba(15, 23, 42, 0.06)',
  marginBottom: 16,
};

const alertColor = { high: '#dc2626', medium: '#d97706', low: '#64748b' };

const ClientWellnessPage = () => {
  const [section, setSection] = useState('weight');
  const [products, setProducts] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [compareResult, setCompareResult] = useState(null);
  const [compareLoading, setCompareLoading] = useState(false);

  const [pets, setPets] = useState([]);
  const [petId, setPetId] = useState('');
  const [weightInput, setWeightInput] = useState('');
  const [weightNote, setWeightNote] = useState('');
  const [tracking, setTracking] = useState(null);
  const [weightLoading, setWeightLoading] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    api.get('/products').then((r) => setProducts((r.data || []).filter((p) => p.category === 'nourriture' || /croquette|nourrit/i.test(p.name || '')).slice(0, 40))).catch(() => {});
    api.get('/pets').then((r) => {
      const list = r.data || [];
      setPets(list);
      if (list[0]?.id) setPetId(list[0].id);
    }).catch(() => {});
  }, []);

  const loadWeight = useCallback(async () => {
    if (!petId) return;
    setWeightLoading(true);
    try {
      const t = await fetchPetWeightTracking(petId);
      setTracking(t);
    } catch (e) {
      setMsg(e.response?.data?.error || 'Erreur suivi poids');
    } finally {
      setWeightLoading(false);
    }
  }, [petId]);

  useEffect(() => {
    if (section === 'weight' && petId) loadWeight();
  }, [section, petId, loadWeight]);

  const toggleProduct = (id) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 4) return prev;
      return [...prev, id];
    });
  };

  const runCompare = async () => {
    if (selectedIds.length < 2) {
      setMsg('Choisissez au moins 2 produits');
      return;
    }
    setCompareLoading(true);
    setMsg('');
    try {
      const r = await compareProducts(selectedIds);
      setCompareResult(r);
    } catch (e) {
      setMsg(e.response?.data?.error || 'Comparaison impossible');
    } finally {
      setCompareLoading(false);
    }
  };

  const submitWeight = async (e) => {
    e.preventDefault();
    const w = Number(weightInput);
    if (!petId || !w) return;
    setMsg('');
    try {
      const r = await logPetWeight(petId, { weightKg: w, note: weightNote });
      setTracking(r.tracking);
      setWeightInput('');
      setWeightNote('');
      setMsg('Poids enregistré');
    } catch (err) {
      setMsg(err.response?.data?.error || 'Erreur');
    }
  };

  const chartData = tracking?.series || [];

  return (
    <div style={{ padding: 24, maxWidth: 1100, margin: '0 auto' }}>
      <h1 style={{ margin: '0 0 8px', fontWeight: 800 }}>Nutrition & suivi du poids</h1>
      <p style={{ color: '#64748b', marginBottom: 20 }}>
        Comparateur produits (nutrition + qualité/prix) et courbes de poids avec alertes intelligentes.
      </p>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={() => setSection('weight')}
          style={tabBtn(section === 'weight')}
        >
          <Scale size={16} /> Suivi du poids
        </button>
        <button
          type="button"
          onClick={() => setSection('compare')}
          style={tabBtn(section === 'compare')}
        >
          <GitCompare size={16} /> Comparateur produits
        </button>
      </div>

      {msg && <p style={{ color: '#0d9488', marginBottom: 12 }}>{msg}</p>}

      {section === 'weight' && (
        <>
          <div style={card}>
            <h2 style={{ marginTop: 0, fontSize: 18 }}>Suivi du poids intelligent</h2>
            {pets.length > 0 && (
              <select value={petId} onChange={(e) => setPetId(e.target.value)} style={{ padding: 10, borderRadius: 8, marginBottom: 12 }}>
                {pets.map((p) => (
                  <option key={p.id} value={p.id}>{p.name} ({p.type})</option>
                ))}
              </select>
            )}
            <form onSubmit={submitWeight} style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'flex-end' }}>
              <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 13 }}>
                Poids (kg)
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={weightInput}
                  onChange={(e) => setWeightInput(e.target.value)}
                  style={{ padding: 10, borderRadius: 8, width: 120 }}
                  placeholder={tracking?.pet?.currentWeightKg ?? '12.5'}
                />
              </label>
              <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 13, flex: 1, minWidth: 160 }}>
                Note (optionnel)
                <input
                  value={weightNote}
                  onChange={(e) => setWeightNote(e.target.value)}
                  style={{ padding: 10, borderRadius: 8 }}
                  placeholder="Après repas, consultation…"
                />
              </label>
              <button type="submit" className="btn btn-primary">Enregistrer</button>
            </form>
          </div>

          {weightLoading && <p style={{ color: '#94a3b8' }}>Chargement…</p>}

          {tracking && (
            <>
              {(tracking.alerts || []).length > 0 && (
                <div style={{ ...card, background: '#fff7ed', border: '1px solid #fed7aa' }}>
                  <h3 style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <AlertTriangle size={18} color="#ea580c" /> Alertes poids
                  </h3>
                  <ul style={{ margin: 0, paddingLeft: 18 }}>
                    {tracking.alerts.map((a, i) => (
                      <li key={i} style={{ marginBottom: 6, color: alertColor[a.severity] || '#334155' }}>
                        {a.message}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div style={card}>
                <h3 style={{ marginTop: 0 }}>Courbe d&apos;évolution</h3>
                {chartData.length > 1 ? (
                  <ResponsiveContainer width="100%" height={280}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                      <YAxis domain={['auto', 'auto']} tick={{ fontSize: 11 }} unit=" kg" />
                      <Tooltip formatter={(v) => [`${v} kg`, 'Poids']} />
                      <ReferenceLine
                        y={tracking.pet?.currentWeightKg}
                        stroke="#94a3b8"
                        strokeDasharray="4 4"
                        label={{ value: 'Actuel', position: 'right', fontSize: 10 }}
                      />
                      <Line type="monotone" dataKey="weightKg" stroke="#0d9488" strokeWidth={3} dot={{ r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <p style={{ color: '#94a3b8' }}>Enregistrez au moins 2 pesées pour afficher la courbe.</p>
                )}
                {tracking.stats && (
                  <p style={{ fontSize: 13, color: '#64748b', marginTop: 12 }}>
                    Min {tracking.stats.minKg} kg · Max {tracking.stats.maxKg} kg · Variation{' '}
                    {tracking.stats.change30d >= 0 ? '+' : ''}
                    {tracking.stats.change30d} kg · {tracking.stats.entries} mesure(s)
                  </p>
                )}
              </div>
            </>
          )}
        </>
      )}

      {section === 'compare' && (
        <>
          <div style={card}>
            <h2 style={{ marginTop: 0, fontSize: 18 }}>Comparateur de produits</h2>
            <p style={{ fontSize: 14, color: '#64748b' }}>Sélectionnez 2 à 4 croquettes / aliments à comparer.</p>
            <div style={{ maxHeight: 220, overflowY: 'auto', marginBottom: 12 }}>
              {products.map((p) => (
                <label
                  key={p.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '8px 0',
                    borderBottom: '1px solid #f8fafc',
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(p.id)}
                    onChange={() => toggleProduct(p.id)}
                  />
                  <span style={{ flex: 1 }}>{p.name}</span>
                  <span style={{ fontWeight: 700 }}>{formatDT(p.discountPrice || p.price, { decimals: 0 })}</span>
                </label>
              ))}
            </div>
            <button type="button" className="btn btn-primary" onClick={runCompare} disabled={compareLoading}>
              {compareLoading ? 'Analyse…' : 'Comparer (nutrition + qualité/prix)'}
            </button>
          </div>

          {compareResult && (
            <>
              <div style={{ ...card, background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                <p style={{ margin: 0, lineHeight: 1.6 }}>{compareResult.summary}</p>
                <p style={{ margin: '8px 0 0', fontSize: 11, color: '#64748b' }}>{compareResult.disclaimer}</p>
              </div>

              <div style={card}>
                <h3 style={{ marginTop: 0 }}>Comparaison nutritionnelle</h3>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                        <th style={{ padding: 8, textAlign: 'left' }}>Produit</th>
                        <th style={{ padding: 8 }}>Protéines %</th>
                        <th style={{ padding: 8 }}>Lipides %</th>
                        <th style={{ padding: 8 }}>Fibres %</th>
                        <th style={{ padding: 8 }}>kcal/100g</th>
                      </tr>
                    </thead>
                    <tbody>
                      {compareResult.products.map((p) => (
                        <tr key={p.productId} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: 8 }}>{p.name}</td>
                          <td style={{ padding: 8, textAlign: 'center' }}>{p.nutrition.proteinPercent}</td>
                          <td style={{ padding: 8, textAlign: 'center' }}>{p.nutrition.fatPercent}</td>
                          <td style={{ padding: 8, textAlign: 'center' }}>{p.nutrition.fiberPercent}</td>
                          <td style={{ padding: 8, textAlign: 'center' }}>{p.nutrition.kcalPer100g}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div style={card}>
                <h3 style={{ marginTop: 0 }}>
                  <Trophy size={18} style={{ verticalAlign: 'middle' }} /> Rapport qualité / prix
                </h3>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                      <th style={{ padding: 8, textAlign: 'left' }}>Produit</th>
                      <th style={{ padding: 8 }}>Prix</th>
                      <th style={{ padding: 8 }}>Prix/kg</th>
                      <th style={{ padding: 8 }}>Qualité /100</th>
                      <th style={{ padding: 8 }}>Indice valeur</th>
                      <th style={{ padding: 8 }}>Verdict</th>
                    </tr>
                  </thead>
                  <tbody>
                    {compareResult.qualityPriceReport.map((r) => (
                      <tr key={r.productId} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: 8 }}>{r.name}</td>
                        <td style={{ padding: 8, textAlign: 'center' }}>{formatDT(r.price)}</td>
                        <td style={{ padding: 8, textAlign: 'center' }}>{r.pricePerKg} DT</td>
                        <td style={{ padding: 8, textAlign: 'center' }}>{r.qualityScore}</td>
                        <td style={{ padding: 8, textAlign: 'center', fontWeight: 700 }}>{r.valueIndex}</td>
                        <td style={{ padding: 8, fontSize: 12 }}>{r.verdict}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </>
      )}

      <p style={{ marginTop: 16 }}>
        <Link to="/client-products">Boutique</Link>
        {' · '}
        <Link to="/pet-calories">Calculateur calories</Link>
      </p>
    </div>
  );
};

const tabBtn = (active) => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  padding: '10px 16px',
  borderRadius: 10,
  border: 'none',
  cursor: 'pointer',
  fontWeight: 600,
  background: active ? '#0d9488' : '#f1f5f9',
  color: active ? '#fff' : '#475569',
});

export default ClientWellnessPage;
