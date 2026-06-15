import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, AreaChart, Area,
} from 'recharts';
import api from '../utils/api';
import { formatDT } from '../utils/formatCurrency';
import { mergeVetBiData } from '../utils/vetDemoData';
import usePlatformRefresh from '../hooks/usePlatformRefresh';

const COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4', '#ec4899', '#84cc16'];

const PERIOD_OPTIONS = [
  { value: '', label: 'Toute la période' },
  { value: '30', label: '30 derniers jours' },
  { value: '90', label: '90 derniers jours' },
  { value: '365', label: '12 mois' },
];

const cardStyle = {
  background: 'white',
  borderRadius: 16,
  padding: 24,
  boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
  border: '1px solid #f1f5f9',
};

const VetBiDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [periodDays, setPeriodDays] = useState('90');
  const [animalFilter, setAnimalFilter] = useState('all');
  const [tableSearch, setTableSearch] = useState('');
  const [lastRefresh, setLastRefresh] = useState(null);

  const fetchBi = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const qs = periodDays ? `?days=${periodDays}` : '';
      const { data: res } = await api.get(`/vet/bi/dashboard${qs}`);
      setData(mergeVetBiData(res));
      setLastRefresh(new Date());
    } catch (err) {
      setData(mergeVetBiData(null));
      setError('');
    } finally {
      setLoading(false);
    }
  }, [periodDays]);

  useEffect(() => {
    fetchBi();
  }, [fetchBi]);

  usePlatformRefresh(fetchBi);

  const pieData = useMemo(() => {
    if (!data?.diseaseByAnimal) return [];
    const filtered = animalFilter === 'all'
      ? data.diseaseByAnimal
      : data.diseaseByAnimal.filter((d) => d.animal === animalFilter);
    return filtered.slice(0, 8).map((d) => ({
      name: d.disease.length > 22 ? `${d.disease.slice(0, 20)}…` : d.disease,
      fullName: d.disease,
      value: d.count,
      animalPercent: d.percent,
      animal: d.animal,
    }));
  }, [data, animalFilter]);

  const animals = useMemo(() => {
    if (!data?.diseaseByAnimal) return [];
    return [...new Set(data.diseaseByAnimal.map((d) => d.animal))];
  }, [data]);

  const filteredTreatments = useMemo(() => {
    const rows = data?.diseaseTreatments ?? [];
    const q = tableSearch.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (r) =>
        r.disease?.toLowerCase().includes(q) ||
        r.medication?.toLowerCase().includes(q) ||
        r.animalTypes?.toLowerCase().includes(q)
    );
  }, [data, tableSearch]);

  const exportCsv = () => {
    const rows = data?.diseaseTreatments ?? [];
    if (!rows.length) return;
    const header = 'maladie,animaux,medicament,dosage,frequence,duree,quantite,stock,emplacement';
    const body = rows.map((r) =>
      [r.disease, r.animalTypes, r.medication, r.dosage, r.frequency, r.duration, r.quantity, r.stockQty, r.pharmacy || r.location]
        .map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`)
        .join(',')
    );
    const blob = new Blob([[header, ...body].join('\n')], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vet-bi-referentiel-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading && !data) {
    return (
      <div style={{ padding: 48, textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: 16 }}>📊</div>
        <p style={{ color: '#64748b' }}>Chargement du dashboard BI…</p>
      </div>
    );
  }

  const summary = data?.summary || {};

  return (
    <div style={{ padding: 24, maxWidth: 1440, margin: '0 auto' }}>
      {/* En-tête */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          background: 'linear-gradient(135deg, #0ea5e9 0%, #059669 100%)',
          borderRadius: 24,
          padding: '28px 32px',
          marginBottom: 24,
          color: 'white',
          display: 'flex',
          flexWrap: 'wrap',
          gap: 16,
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div>
          <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 800 }}>Dashboard BI — Santé animale</h1>
          <p style={{ margin: '8px 0 0', opacity: 0.9, fontSize: 14 }}>
            Analyses cliniques, pharmacie et référentiel maladie → traitement
          </p>
          {lastRefresh && (
            <p style={{ margin: '6px 0 0', fontSize: 12, opacity: 0.75 }}>
              MAJ {lastRefresh.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
            </p>
          )}
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <select
            value={periodDays}
            onChange={(e) => setPeriodDays(e.target.value)}
            style={{ padding: '10px 14px', borderRadius: 12, border: 'none', fontWeight: 600, cursor: 'pointer' }}
          >
            {PERIOD_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <button type="button" onClick={fetchBi} disabled={loading} style={headerBtn}>
            {loading ? '…' : '↻ Actualiser'}
          </button>
          <button type="button" onClick={exportCsv} style={headerBtnOutline}>
            ⬇ Export CSV
          </button>
        </div>
      </motion.div>

      {error && (
        <div style={{ ...cardStyle, marginBottom: 20, borderLeft: '4px solid #ef4444', color: '#b91c1c' }}>
          ⚠ {error}
        </div>
      )}

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14, marginBottom: 24 }}>
        {[
          { label: 'Cas cliniques', value: summary.totalCases, icon: '🩺', color: '#0ea5e9' },
          { label: 'Ce mois-ci', value: summary.casesThisMonth, icon: '📅', color: '#6366f1' },
          { label: 'Maladies distinctes', value: summary.totalDiseases, icon: '🦠', color: '#f59e0b' },
          { label: 'Mappings référentiel', value: summary.mappingCount, icon: '🔗', color: '#8b5cf6' },
          { label: 'Médicaments catalogue', value: summary.totalMedications, icon: '💊', color: '#10b981' },
          { label: 'Valeur stock', value: formatDT(summary.stockValue), icon: '💰', color: '#059669', isText: true },
          { label: 'Alertes stock', value: summary.lowStock, icon: '⚠️', color: '#ef4444' },
        ].map((kpi) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{ ...cardStyle, borderLeft: `4px solid ${kpi.color}` }}
          >
            <div style={{ fontSize: '1.3rem' }}>{kpi.icon}</div>
            <p style={{ margin: '6px 0 2px', fontSize: kpi.isText ? '1.1rem' : '1.5rem', fontWeight: 800, color: kpi.color }}>
              {kpi.value ?? 0}
            </p>
            <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>{kpi.label}</p>
          </motion.div>
        ))}
      </div>

      {(data?.insights?.length ?? 0) > 0 && (
        <div style={{ ...cardStyle, marginBottom: 24, background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)' }}>
          <h2 style={{ margin: '0 0 12px', fontSize: '1rem', fontWeight: 800, color: '#065f46' }}>
            💡 Synthèse
          </h2>
          <ul style={{ margin: 0, paddingLeft: 20, color: '#334155', lineHeight: 1.7, fontSize: 14 }}>
            {data.insights.map((line, i) => (
              <li key={i}>{line}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Graphiques ligne 1 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20, marginBottom: 24 }}>
        <div style={cardStyle}>
          <h2 style={chartTitle}>📈 Évolution des cas (6 mois)</h2>
          {(data?.casesByMonth?.length ?? 0) === 0 ? (
            <EmptyChart />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={data.casesByMonth}>
                <defs>
                  <linearGradient id="casesGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0ea5e9" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#0ea5e9" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v) => [`${v} cas`, 'Activité']} />
                <Area type="monotone" dataKey="count" stroke="#0ea5e9" strokeWidth={2} fill="url(#casesGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        <div style={cardStyle}>
          <h2 style={chartTitle}>🐾 Répartition par espèce</h2>
          {(data?.animalDistribution?.length ?? 0) === 0 ? (
            <EmptyChart />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={data.animalDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="animal" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} />
                <Tooltip formatter={(v, _n, p) => [`${v} cas (${p.payload.percent} %)`, 'Consultations']} />
                <Bar dataKey="count" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Graphiques ligne 2 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 20, marginBottom: 24 }}>
        <div style={cardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
            <h2 style={{ ...chartTitle, margin: 0 }}>Maladies par animal</h2>
            <select
              value={animalFilter}
              onChange={(e) => setAnimalFilter(e.target.value)}
              style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13 }}
            >
              <option value="all">Tous</option>
              {animals.map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>
          {pieData.length === 0 ? (
            <EmptyChart />
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={88}
                  paddingAngle={2}
                  label={({ percent: r }) => `${(r * 100).toFixed(0)}%`}
                >
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(v, _n, p) => [
                    `${v} cas · ${p.payload.animalPercent} % chez ${p.payload.animal}`,
                    p.payload.fullName || p.payload.name,
                  ]}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        <div style={cardStyle}>
          <h2 style={chartTitle}>Top médicaments prescrits</h2>
          {(data?.topMedications?.length ?? 0) === 0 ? (
            <EmptyChart />
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={data.topMedications.slice(0, 8)} layout="vertical" margin={{ left: 8, right: 16 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" />
                <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 10 }} />
                <Tooltip
                  formatter={(v, name) => [
                    v,
                    name === 'cases' ? 'Nombre de cas' : 'Quantité totale',
                  ]}
                />
                <Legend />
                <Bar dataKey="cases" fill="#0ea5e9" name="Cas" radius={[0, 4, 4, 0]} />
                <Bar dataKey="totalQty" fill="#a78bfa" name="Qté totale" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Alertes + imports récents */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20, marginBottom: 24 }}>
        <div style={cardStyle}>
          <h2 style={chartTitle}>⚠️ Alertes pharmacie</h2>
          {(data?.missingMedications?.length ?? 0) === 0 ? (
            <p style={{ color: '#10b981', fontWeight: 600, margin: 0 }}>✅ Stock et référentiel OK</p>
          ) : (
            <div style={{ display: 'grid', gap: 8 }}>
              {data.missingMedications.slice(0, 8).map((m, i) => (
                <div
                  key={i}
                  style={{
                    padding: '10px 12px',
                    borderRadius: 10,
                    background: m.reason === 'absent_catalogue' ? '#fef2f2' : '#fffbeb',
                    border: `1px solid ${m.reason === 'absent_catalogue' ? '#fecaca' : '#fde68a'}`,
                    fontSize: 13,
                  }}
                >
                  <strong>{m.name}</strong>
                  <span style={{ color: '#64748b', marginLeft: 8 }}>
                    {m.reason === 'absent_catalogue'
                      ? 'Absent du catalogue'
                      : `Stock ${m.stockQty} / min ${m.minStock}`}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={cardStyle}>
          <h2 style={chartTitle}>🏥 Derniers réapprovisionnements</h2>
          {(data?.recentImports?.length ?? 0) === 0 ? (
            <p style={{ color: '#94a3b8', margin: 0, fontSize: 14 }}>Aucun réapprovisionnement enregistré.</p>
          ) : (
            <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
              {data.recentImports.map((imp) => (
                <li
                  key={imp.id}
                  style={{
                    padding: '10px 0',
                    borderBottom: '1px solid #f1f5f9',
                    fontSize: 13,
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: 8,
                  }}
                >
                  <span>
                    <strong>{imp.location || imp.pharmacy}</strong> — {imp.itemsCount} article(s)
                  </span>
                  <span style={{ color: '#94a3b8', whiteSpace: 'nowrap' }}>
                    {new Date(imp.createdAt).toLocaleDateString('fr-FR')}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Table référentiel */}
      <div style={{ ...cardStyle, marginBottom: 24 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ ...chartTitle, margin: 0 }}>🔗 Référentiel maladie → traitement</h2>
          <input
            type="search"
            placeholder="Rechercher maladie, médicament…"
            value={tableSearch}
            onChange={(e) => setTableSearch(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: 10, border: '1px solid #e2e8f0', minWidth: 220 }}
          />
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ background: '#f8fafc', textAlign: 'left' }}>
                {['Maladie', 'Animaux', 'Médicament', 'Dosage', 'Fréquence', 'Durée', 'Qté', 'Stock', 'Emplacement'].map((h) => (
                  <th key={h} style={thStyle}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredTreatments.map((row) => (
                <tr key={row.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={tdStyle}>{row.disease}</td>
                  <td style={tdStyle}>{row.animalTypes}</td>
                  <td style={tdStyle}><strong>{row.medication}</strong></td>
                  <td style={tdStyle}>{row.dosage || '—'}</td>
                  <td style={tdStyle}>{row.frequency || '—'}</td>
                  <td style={tdStyle}>{row.duration || '—'}</td>
                  <td style={tdStyle}>{row.quantity} {row.unit}</td>
                  <td style={{ ...tdStyle, color: row.stockQty <= row.quantity ? '#ef4444' : '#10b981', fontWeight: 700 }}>
                    {row.stockQty}
                  </td>
                  <td style={tdStyle}>{row.location || row.pharmacy || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredTreatments.length === 0 && (
            <p style={{ textAlign: 'center', color: '#94a3b8', padding: 24 }}>Aucune ligne correspondante.</p>
          )}
        </div>
      </div>

      {/* Cas cliniques */}
      <div style={{ ...cardStyle, marginBottom: 24 }}>
        <h2 style={chartTitle}>🐾 Derniers cas cliniques avec traitements</h2>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ background: '#f8fafc', textAlign: 'left' }}>
                {['Animal', 'Patient', 'Diagnostic', 'Médicaments', 'Source'].map((h) => (
                  <th key={h} style={thStyle}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(data?.casesWithMeds ?? []).slice(0, 15).map((c) => (
                <tr key={c.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={tdStyle}>{c.animalType}</td>
                  <td style={tdStyle}>{c.petName}</td>
                  <td style={tdStyle}>{c.diagnosis}</td>
                  <td style={tdStyle}>
                    {c.medications?.length
                      ? c.medications.map((m, i) => (
                          <span key={i} style={{ display: 'block', fontSize: 12, color: '#475569' }}>
                            {m.name} · qté {m.quantity}
                          </span>
                        ))
                      : '—'}
                  </td>
                  <td style={tdStyle}><span style={badgeStyle}>{c.source}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

const EmptyChart = ({ text = 'Pas assez de données sur la période.' }) => (
  <p style={{ color: '#94a3b8', textAlign: 'center', padding: '40px 16px', margin: 0 }}>{text}</p>
);

const chartTitle = { margin: '0 0 14px', fontSize: '1.05rem', fontWeight: 700, color: '#0f172a' };
const thStyle = { padding: '10px 12px', fontWeight: 600, color: '#475569', fontSize: 12 };
const tdStyle = { padding: '10px 12px', color: '#334155' };
const badgeStyle = { fontSize: 11, padding: '2px 8px', borderRadius: 12, background: '#e0f2fe', color: '#0369a1' };
const headerBtn = {
  padding: '10px 18px',
  borderRadius: 12,
  border: 'none',
  background: 'rgba(255,255,255,0.95)',
  color: '#0369a1',
  fontWeight: 700,
  cursor: 'pointer',
};
const headerBtnOutline = {
  ...headerBtn,
  background: 'transparent',
  color: 'white',
  border: '2px solid rgba(255,255,255,0.6)',
};
export default VetBiDashboard;
