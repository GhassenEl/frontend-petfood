import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Brain, Stethoscope, Building2, Pill, AlertTriangle, Calendar, Package, Syringe, Activity,
} from 'lucide-react';
import useVetMlAgents from '../hooks/useVetMlAgents';
import useVetClinicalMlAgent from '../hooks/useVetClinicalMlAgent';

const TABS = [
  { id: 'clinical', label: 'Anomalies & maladie', icon: Activity },
  { id: 'vet', label: 'Vétérinaire', icon: Stethoscope },
  { id: 'clinic', label: 'Clinique', icon: Building2 },
  { id: 'pharmacy', label: 'Pharmacie', icon: Pill },
];

const VetMlAgentPage = () => {
  const [tab, setTab] = useState('vet');
  const { vet, clinic, pharmacy, loading, pythonPowered, groqPowered, reload } = useVetMlAgents();
  const { pack: clinicalPack, loading: clinicalLoading } = useVetClinicalMlAgent();
  const pack =
    tab === 'clinical' ? clinicalPack : tab === 'clinic' ? clinic : tab === 'pharmacy' ? pharmacy : vet;
  const isLoading = tab === 'clinical' ? clinicalLoading : loading;

  return (
    <div style={{ padding: 24, maxWidth: 1100, margin: '0 auto' }}>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          marginBottom: 24,
          padding: '28px 24px',
          borderRadius: 20,
          background: 'linear-gradient(135deg, #0c4a6e 0%, #0369a1 50%, #0e7490 100%)',
          color: 'white',
        }}
      >
        <h1 style={{ margin: '0 0 8px', fontSize: 28, fontWeight: 800 }}>
          <Brain size={28} style={{ verticalAlign: 'middle', marginRight: 8 }} />
          Hub Agents IA — Santé animale
        </h1>
        <p style={{ margin: 0, opacity: 0.9, maxWidth: 640 }}>
          Quatre agents : anomalies & maladie (urgent/non urgent), patients & nutrition, clinique, pharmacie.
        </p>
        <div style={{ marginTop: 14, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {pythonPowered && <Badge label="XGBoost" />}
          {groqPowered && <Badge label="Groq" bg="#ecfdf5" color="#059669" />}
          <button type="button" onClick={reload} style={btnLight}>
            Actualiser
          </button>
        </div>
      </motion.div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            style={{
              ...tabBtn,
              background: tab === id ? '#0e7490' : '#f0f9ff',
              color: tab === id ? '#fff' : '#0c4a6e',
              borderColor: tab === id ? '#0e7490' : '#bae6fd',
            }}
          >
            <Icon size={16} /> {label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <p style={{ color: '#94a3b8' }}>Analyse en cours…</p>
      ) : !pack ? (
        <p style={{ color: '#dc2626' }}>Agent indisponible. Vérifiez le backend et le service ML (port 8000).</p>
      ) : (
        <>
          {pack.summary && (
            <div style={card}>
              <h3 style={h3}>Synthèse IA — {pack.agent?.replace(/_/g, ' ') || tab}</h3>
              <p style={{ margin: 0, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{pack.summary}</p>
              {pack.tip && <p style={{ margin: '12px 0 0', fontSize: 13, color: '#0e7490' }}>{pack.tip}</p>}
            </div>
          )}

          {pack.actionHints?.length > 0 && (
            <div style={card}>
              <h3 style={h3}>Actions recommandées</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                {pack.actionHints.map((h) => (
                  <Link key={h.type} to={h.link} style={chipLink}>
                    {h.label}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {tab === 'clinical' && (
            <>
              {pack.stats && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 12, marginBottom: 16 }}>
                  <Kpi label="Analyses récentes" value={pack.stats.recentAnalyses ?? 0} />
                  <Kpi label="Urgents (7 j)" value={pack.stats.urgentLast7Days ?? 0} />
                  <Kpi label="Suspicion maladie (30 j)" value={pack.stats.diseaseSuspectedLast30Days ?? 0} />
                </div>
              )}
              {pack.recentAnalyses?.length > 0 && (
                <div style={card}>
                  <h3 style={h3}>Dernières analyses patients</h3>
                  <ul style={ul}>
                    {pack.recentAnalyses.map((a) => (
                      <li key={a.id}>
                        <strong>{a.petName}</strong>
                        <span
                          style={{
                            marginLeft: 8,
                            fontSize: 11,
                            fontWeight: 700,
                            color: a.urgencyClass === 'urgent' ? '#dc2626' : '#0369a1',
                          }}
                        >
                          {a.urgencyClass === 'urgent' ? 'URGENT' : 'NON URGENT'}
                        </span>
                        {a.diseaseSuspected && <span style={{ marginLeft: 6, fontSize: 11 }}>🦠</span>}
                        <span style={{ color: '#64748b', fontSize: 12 }}>
                          {' '}
                          — {new Date(a.createdAt).toLocaleDateString('fr-FR')}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <Link to="/vet/diagnostics" style={{ ...chipLink, display: 'inline-block' }}>
                Lancer une nouvelle analyse symptômes →
              </Link>
            </>
          )}

          {tab === 'vet' && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 16 }}>
                <Kpi label="Patients senior" value={pack.seniorPetCount ?? 0} />
                <Kpi label="Espèces" value={Object.keys(pack.speciesBreakdown || {}).length} />
              </div>
              {pack.seniorPetSamples?.length > 0 && (
                <div style={card}>
                  <h3 style={h3}>Échantillon patients senior</h3>
                  <ul style={ul}>
                    {pack.seniorPetSamples.map((p) => (
                      <li key={p.id}>
                        <strong>{p.name}</strong> ({p.type})
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {(pack.nutritionDemand || []).length > 0 && (
                <div style={card}>
                  <h3 style={h3}>
                    <Package size={18} /> Tendances nutrition
                  </h3>
                  <ul style={ul}>
                    {pack.nutritionDemand.slice(0, 8).map((p) => (
                      <li key={p.productId}>{p.productName}</li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}

          {tab === 'clinic' && (
            <>
              {pack.clinic && (
                <div style={card}>
                  <h3 style={h3}>
                    <Building2 size={18} /> {pack.clinic.clinicName || 'Cabinet'}
                  </h3>
                  <p style={muted}>
                    {pack.clinic.region || '—'} · {pack.clinicStats?.activePatients ?? 0} patients actifs
                  </p>
                </div>
              )}
              {pack.clinicStats && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 12, marginBottom: 16 }}>
                  <Kpi label="RDV aujourd'hui" value={pack.clinicStats.todayAppointments ?? 0} />
                  <Kpi label="Dossiers" value={pack.clinicStats.dossiersCount ?? 0} />
                  <Kpi label="Vaccins à prévoir" value={pack.clinicStats.vaccinesDueSoon ?? 0} />
                  <Kpi label="Entrées signées" value={pack.clinicStats.signedEntriesCount ?? 0} />
                </div>
              )}
              {pack.upcomingAppointments?.length > 0 && (
                <div style={card}>
                  <h3 style={h3}>
                    <Calendar size={18} /> Prochains RDV
                  </h3>
                  <ul style={ul}>
                    {pack.upcomingAppointments.map((a) => (
                      <li key={a.id}>
                        <Link to={a.link || `/vet/appointments/${a.id}`}>
                          {a.petName} — {a.dateLabel || a.date}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {pack.clinicalAlerts?.length > 0 && (
                <div style={card}>
                  <h3 style={h3}>
                    <AlertTriangle size={18} /> Alertes cliniques
                  </h3>
                  <ul style={ul}>
                    {pack.clinicalAlerts.map((a, i) => (
                      <li key={i} style={{ color: a.severity === 'high' ? '#dc2626' : '#334155' }}>
                        {a.message}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}

          {tab === 'pharmacy' && (
            <>
              {pack.stockKpis && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 12, marginBottom: 16 }}>
                  <Kpi label="Références" value={pack.stockKpis.totalSkus} />
                  <Kpi label="Stock bas" value={pack.stockKpis.lowStock} />
                  <Kpi label="Ruptures" value={pack.stockKpis.outOfStock} />
                  <Kpi label="Ordonnances 30j" value={pack.recentPrescriptionsCount ?? 0} />
                </div>
              )}
              {pack.lowStockAlerts?.length > 0 && (
                <div style={card}>
                  <h3 style={h3}>
                    <Syringe size={18} /> Alertes stock
                  </h3>
                  <ul style={ul}>
                    {pack.lowStockAlerts.map((m) => (
                      <li key={m.id}>
                        <strong>{m.name}</strong> — {m.stockQty} / min {m.minStock} {m.unit || ''}
                      </li>
                    ))}
                  </ul>
                  <Link to="/vet/pharmacy" style={{ ...chipLink, marginTop: 10, display: 'inline-block' }}>
                    Ouvrir pharmacie
                  </Link>
                </div>
              )}
              {pack.topPrescribedMedications?.length > 0 && (
                <div style={card}>
                  <h3 style={h3}>
                    <Pill size={18} /> Médicaments les plus prescrits (30 j)
                  </h3>
                  <ul style={ul}>
                    {pack.topPrescribedMedications.map((m) => (
                      <li key={m.name}>
                        {m.name} <span style={{ color: '#64748b' }}>({m.count}×)</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};

const Badge = ({ label, bg = '#cffafe', color = '#0e7490' }) => (
  <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 999, background: bg, color }}>
    {label}
  </span>
);

const Kpi = ({ label, value }) => (
  <div style={{ background: '#f0f9ff', borderRadius: 12, padding: 14, border: '1px solid #bae6fd' }}>
    <div style={{ fontSize: 12, color: '#64748b' }}>{label}</div>
    <div style={{ fontSize: 22, fontWeight: 800, color: '#0c4a6e' }}>{value}</div>
  </div>
);

const card = {
  background: '#fff',
  borderRadius: 16,
  padding: 20,
  marginBottom: 16,
  border: '1px solid #e2e8f0',
  boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
};

const h3 = { margin: '0 0 12px', fontSize: 16, fontWeight: 700, color: '#0f172a' };
const muted = { margin: 0, fontSize: 14, color: '#64748b' };
const ul = { margin: 0, paddingLeft: 20, lineHeight: 1.8, color: '#334155' };
const chipLink = {
  display: 'inline-block',
  padding: '8px 14px',
  borderRadius: 999,
  background: '#e0f2fe',
  color: '#0369a1',
  fontSize: 13,
  fontWeight: 600,
  textDecoration: 'none',
};
const btnLight = {
  padding: '8px 14px',
  borderRadius: 8,
  border: '1px solid rgba(255,255,255,0.4)',
  background: 'rgba(255,255,255,0.15)',
  color: '#fff',
  cursor: 'pointer',
  fontWeight: 600,
};
const tabBtn = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  padding: '10px 16px',
  borderRadius: 999,
  border: '1px solid',
  cursor: 'pointer',
  fontWeight: 700,
  fontSize: 14,
};

export default VetMlAgentPage;
