import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../utils/api';
import {
  postVetClinicalAnalyze,
  fetchVetClinicalPatientContext,
  postVetClinicalApplyDossier,
  postVetClinicalApplyPrescription,
} from '../services/mlService';
import {
  DEMO_PATIENT_CONTEXT,
  mergeVetClients,
} from '../utils/vetDemoData';
import { buildClinicalAnalysisResult } from '../utils/vetClinicalIntelligenceEngine';
import usePlatformRefresh from '../hooks/usePlatformRefresh';

const DEMO_SCENARIOS = [
  {
    id: 'dog-urgent',
    label: '🐕 Chien — urgence',
    petName: 'Max',
    animalType: 'dog',
    symptoms: 'Vomissements répétés, fièvre 39.8 °C, refuse de manger, léthargie depuis 24 h',
    vitals: { temperature: '39.8', weight: '28', heartRate: '120' },
  },
  {
    id: 'cat-derma',
    label: '🐈 Chat — dermatite',
    petName: 'Mimi',
    animalType: 'cat',
    symptoms: 'Grattage excessif, rougeurs zone ventrale, perte de poils localisée',
    vitals: { temperature: '38.5', weight: '4.2', heartRate: '' },
  },
  {
    id: 'dog-lame',
    label: '🐕 Chien — boiterie',
    petName: 'Rex',
    animalType: 'dog',
    symptoms: 'Boiterie patte arrière droite, raideur au lever, gêne à la marche',
    vitals: { temperature: '38.9', weight: '22', heartRate: '95' },
  },
];

const animalEmoji = { dog: '🐕', cat: '🐈', bird: '🐦', fish: '🐠', other: '🐾' };

const severityStyle = {
  low: { bg: '#ecfdf5', border: '#6ee7b7', color: '#047857' },
  medium: { bg: '#fffbeb', border: '#fcd34d', color: '#b45309' },
  high: { bg: '#fef2f2', border: '#fca5a5', color: '#b91c1c' },
};

const urgencyClassStyle = {
  urgent: { label: '🚨 URGENT — maladie probable', bg: '#ef4444', color: '#fff' },
  non_urgent: { label: '✓ Non urgent — suivi standard', bg: '#0ea5e9', color: '#fff' },
};

const urgencyLabel = {
  routine: { text: 'Suivi de routine', color: '#0ea5e9' },
  soon: { text: 'Consultation prochaine', color: '#f59e0b' },
  urgent: { text: 'Urgence possible', color: '#ef4444' },
};

const riskLevelStyle = {
  low: { bg: '#ecfdf5', border: '#6ee7b7', bar: '#22c55e' },
  medium: { bg: '#fffbeb', border: '#fcd34d', bar: '#f59e0b' },
  high: { bg: '#fff7ed', border: '#fdba74', bar: '#ea580c' },
  critical: { bg: '#fef2f2', border: '#fca5a5', bar: '#dc2626' },
};

const RiskGauge = ({ early }) => {
  if (!early) return null;
  const st = riskLevelStyle[early.riskLevel] || riskLevelStyle.medium;
  return (
    <div
      style={{
        ...cardStyle,
        background: st.bg,
        border: `2px solid ${st.border}`,
        marginBottom: 16,
      }}
    >
      <h2 style={{ margin: '0 0 8px', fontSize: '1.15rem' }}>🩺 Détection précoce des maladies</h2>
      <p style={{ margin: '0 0 12px', color: '#475569', fontSize: 14 }}>
        Analyse des symptômes renseignés — niveau de risque selon le référentiel clinique ({early.model}).
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center' }}>
        <div style={{ flex: '1 1 200px' }}>
          <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>Niveau de risque</p>
          <p style={{ margin: '4px 0', fontSize: 26, fontWeight: 800, color: early.riskColor || st.bar }}>
            {early.riskLabel}
          </p>
          <p style={{ margin: 0, fontSize: 13, fontWeight: 600 }}>{early.recommendedAction}</p>
        </div>
        <div style={{ flex: '1 1 180px' }}>
          <p style={{ margin: '0 0 6px', fontSize: 12, color: '#64748b' }}>
            Score risque : <strong>{early.riskScore}/100</strong>
          </p>
          <div style={{ height: 12, background: '#fff', borderRadius: 6, overflow: 'hidden' }}>
            <div
              style={{
                width: `${early.riskScore}%`,
                height: '100%',
                background: st.bar,
                borderRadius: 6,
              }}
            />
          </div>
          <p style={{ margin: '8px 0 0', fontSize: 12, color: '#64748b' }}>
            Probabilité pathologie : {Math.round((early.diseaseProbability || 0) * 100)} % · Score urgence :{' '}
            {Math.round((early.urgencyScore || 0) * 100)} %
          </p>
        </div>
      </div>
      {early.summary && (
        <p style={{ margin: '14px 0 0', fontSize: 14, lineHeight: 1.55, color: '#334155' }}>{early.summary}</p>
      )}
    </div>
  );
};

const cardStyle = {
  background: 'white',
  borderRadius: '14px',
  padding: '20px',
  boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
  marginBottom: '16px',
};

const timelineIcon = {
  appointment: '📅',
  consultation: '🩺',
  prescription: '💊',
  dossier: '📁',
  vaccine: '💉',
};

const VetPetDiagnosticsPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [clients, setClients] = useState([]);
  const [loadingClients, setLoadingClients] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [patientCtx, setPatientCtx] = useState(null);
  const [ctxLoading, setCtxLoading] = useState(false);

  const [ownerId, setOwnerId] = useState(() => searchParams.get('ownerId') || '');
  const [petId, setPetId] = useState('');
  const [petName, setPetName] = useState(() => searchParams.get('petName') || '');
  const [animalType, setAnimalType] = useState('dog');
  const [symptoms, setSymptoms] = useState('');
  const [vitals, setVitals] = useState({ temperature: '', weight: '', heartRate: '' });

  const loadClients = useCallback(async () => {
    try {
      const { data } = await api.get('/vet/clients');
      setClients(mergeVetClients(data));
    } catch {
      setClients(mergeVetClients([]));
    } finally {
      setLoadingClients(false);
    }
  }, []);

  useEffect(() => {
    loadClients();
  }, [loadClients]);

  usePlatformRefresh(loadClients);

  useEffect(() => {
    const oid = searchParams.get('ownerId');
    const pname = searchParams.get('petName');
    if (oid && clients.length) {
      setOwnerId(oid);
      if (pname) {
        setPetName(pname);
        const client = clients.find((c) => (c.id || c._id) === oid);
        const pet = client?.pets?.find((p) => p.name === pname);
        if (pet) {
          setPetId(pet.id || '');
          setAnimalType(pet.type || 'dog');
        }
        loadPatientContext(oid, pname, pet?.id);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clients, searchParams]);

  const selectedClient = useMemo(
    () => clients.find((c) => (c.id || c._id) === ownerId),
    [clients, ownerId]
  );

  const petsForClient = selectedClient?.pets || [];

  const loadPatientContext = async (oid, pname, pid) => {
    if (!oid || !pname) {
      setPatientCtx(null);
      return;
    }
    setCtxLoading(true);
    try {
      const ctx = await fetchVetClinicalPatientContext({
        ownerId: oid,
        petName: pname,
        petId: pid || undefined,
      });
      setPatientCtx(ctx);
    } catch {
      if (oid && pname) setPatientCtx(DEMO_PATIENT_CONTEXT);
      else setPatientCtx(null);
    } finally {
      setCtxLoading(false);
    }
  };

  const handleClientChange = (id) => {
    setOwnerId(id);
    setPetId('');
    setPetName('');
    setPatientCtx(null);
    const client = clients.find((c) => (c.id || c._id) === id);
    const firstPet = client?.pets?.[0];
    if (firstPet) {
      setPetId(firstPet.id || '');
      setPetName(firstPet.name || '');
      setAnimalType(firstPet.type || 'dog');
      loadPatientContext(id, firstPet.name, firstPet.id);
    }
  };

  const handlePetChange = (id) => {
    setPetId(id);
    const pet = petsForClient.find((p) => p.id === id);
    if (pet) {
      setPetName(pet.name);
      setAnimalType(pet.type || 'dog');
      loadPatientContext(ownerId, pet.name, pet.id);
    }
  };

  const applyScenario = (scenario) => {
    setSymptoms(scenario.symptoms);
    setPetName(scenario.petName);
    setAnimalType(scenario.animalType);
    setVitals({
      temperature: scenario.vitals.temperature || '',
      weight: scenario.vitals.weight || '',
      heartRate: scenario.vitals.heartRate || '',
    });
    setError('');
    setResult(null);
  };

  const runScenario = async (scenario) => {
    applyScenario(scenario);
    setAnalyzing(true);
    setResult(null);
    try {
      const data = await postVetClinicalAnalyze({
        petName: scenario.petName,
        animalType: scenario.animalType,
        symptoms: scenario.symptoms,
        vitals: {
          temperature: scenario.vitals.temperature ? Number(scenario.vitals.temperature) : undefined,
          weight: scenario.vitals.weight ? Number(scenario.vitals.weight) : undefined,
          heartRate: scenario.vitals.heartRate ? Number(scenario.vitals.heartRate) : undefined,
        },
      });
      setResult(data);
    } catch {
      setResult(buildClinicalAnalysisResult({
        petName: scenario.petName,
        animalType: scenario.animalType,
        symptoms: scenario.symptoms,
        vitals: scenario.vitals,
      }));
    } finally {
      setAnalyzing(false);
    }
  };

  const runAnalysis = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);
    if (!symptoms.trim()) {
      setError('Décrivez les symptômes ou anomalies observées.');
      return;
    }
    if (!ownerId && !petName.trim()) {
      setError('Sélectionnez un animal patient.');
      return;
    }

    setAnalyzing(true);
    try {
      const data = await postVetClinicalAnalyze({
        ownerId: ownerId || undefined,
        petId: petId || undefined,
        petName: petName.trim(),
        animalType,
        symptoms: symptoms.trim(),
        vitals: {
          temperature: vitals.temperature ? Number(vitals.temperature) : undefined,
          weight: vitals.weight ? Number(vitals.weight) : undefined,
          heartRate: vitals.heartRate ? Number(vitals.heartRate) : undefined,
        },
      });
      setResult(data);
      if (ownerId && petName) {
        loadPatientContext(ownerId, petName, petId);
      }
    } catch {
      setResult(buildClinicalAnalysisResult({
        petName: petName.trim(),
        animalType,
        symptoms: symptoms.trim(),
        vitals: {
          temperature: vitals.temperature ? Number(vitals.temperature) : undefined,
          weight: vitals.weight ? Number(vitals.weight) : undefined,
          heartRate: vitals.heartRate ? Number(vitals.heartRate) : undefined,
        },
      }));
      if (ownerId && petName && !patientCtx) {
        setPatientCtx(DEMO_PATIENT_CONTEXT);
      }
    } finally {
      setAnalyzing(false);
    }
  };

  const applyPrescription = async () => {
    if (!result?.analysisId) {
      window.alert('Relancez une analyse avant de créer l\'ordonnance.');
      return;
    }
    if (String(result.analysisId || '').startsWith('demo-analysis')) {
      window.alert('Ordonnance simulée (mode démonstration).');
      navigate('/vet/prescriptions');
      return;
    }
    try {
      await postVetClinicalApplyPrescription(result.analysisId);
      window.alert('Ordonnance créée à partir de l\'analyse clinique.');
      navigate('/vet/prescriptions');
    } catch (err) {
      window.alert(err.response?.data?.error || 'Erreur création ordonnance.');
    }
  };

  const applyDossier = async () => {
    if (!result?.analysisId) return;
    if (String(result.analysisId || '').startsWith('demo-analysis')) {
      window.alert('Consultation simulée (mode démonstration).');
      navigate('/vet/medical-dossiers');
      return;
    }
    try {
      const { dossier } = await postVetClinicalApplyDossier(result.analysisId);
      window.alert('Consultation enregistrée dans le dossier médical.');
      navigate(`/vet/medical-dossiers/${dossier.id || dossier._id}`);
    } catch (err) {
      window.alert(err.response?.data?.error || 'Erreur archivage dossier.');
    }
  };

  if (loadingClients) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Chargement...</div>;
  }

  const profile = result?.profile?.pet;
  const urgency = result?.urgency ? urgencyLabel[result.urgency] : null;
  const classStyle = result?.urgencyClass ? urgencyClassStyle[result.urgencyClass] : null;
  const timeline = result?.timeline || patientCtx?.timeline || [];
  const pastAnalyses = patientCtx?.pastAnalyses || [];

  return (
    <div style={{ padding: '24px', maxWidth: '1150px', margin: '0 auto' }}>
      <header style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ margin: '0 0 8px' }}>🔬 Détection précoce des maladies</h1>
            <p style={{ margin: 0, color: '#64748b', maxWidth: '720px' }}>
              Analyse des symptômes, niveau de risque, alertes précoces, diagnostic assisté,
              ordonnance et suivi avec dossier médical.
            </p>
          </div>
          <Link to="/vet/dashboard" style={{ fontSize: 14, color: '#0369a1', fontWeight: 600, textDecoration: 'none' }}>
            ← Tableau de bord
          </Link>
        </div>
      </header>

      <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
        <form onSubmit={runAnalysis} style={cardStyle}>
          <h2 style={{ marginTop: 0, fontSize: '1.1rem' }}>Patient & signes cliniques</h2>

          <div
            style={{
              display: 'grid',
              gap: '12px',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              marginBottom: '16px',
            }}
          >
            <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.9rem' }}>
              Client
              <select
                value={ownerId}
                onChange={(e) => handleClientChange(e.target.value)}
                style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
              >
                <option value="">— Choisir —</option>
                {clients.map((c) => (
                  <option key={c.id || c._id} value={c.id || c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>

            <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.9rem' }}>
              Animal
              {petsForClient.length > 0 ? (
                <select
                  value={petId}
                  onChange={(e) => handlePetChange(e.target.value)}
                  style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
                >
                  {petsForClient.map((p) => (
                    <option key={p.id || p.name} value={p.id || p.name}>
                      {animalEmoji[p.type] || '🐾'} {p.name}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  placeholder="Nom de l'animal"
                  value={petName}
                  onChange={(e) => setPetName(e.target.value)}
                  style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
                />
              )}
            </label>

            <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.9rem' }}>
              Espèce
              <select
                value={animalType}
                onChange={(e) => setAnimalType(e.target.value)}
                style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
              >
                <option value="dog">Chien</option>
                <option value="cat">Chat</option>
                <option value="bird">Oiseau</option>
                <option value="fish">Poisson</option>
                <option value="other">Autre</option>
              </select>
            </label>
          </div>

          <label style={{ display: 'block', marginBottom: '12px', fontWeight: 600 }}>
            Symptômes / anomalies observées *
            <textarea
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              rows={4}
              placeholder="Ex. : vomissements, fièvre, boiterie, perte d'appétit…"
              style={{
                width: '100%',
                marginTop: '8px',
                padding: '12px',
                borderRadius: '10px',
                border: '1px solid #ddd',
                boxSizing: 'border-box',
                fontFamily: 'inherit',
              }}
            />
          </label>

          <div style={{ marginBottom: 16 }}>
            <p style={{ margin: '0 0 8px', fontSize: '0.85rem', fontWeight: 700, color: '#475569' }}>
              Scénarios de test (détection maladie)
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {DEMO_SCENARIOS.map((scenario) => (
                <button
                  key={scenario.id}
                  type="button"
                  onClick={() => runScenario(scenario)}
                  disabled={analyzing}
                  style={{
                    padding: '8px 12px',
                    borderRadius: 10,
                    border: '1px solid #bfdbfe',
                    background: '#eff6ff',
                    color: '#1d4ed8',
                    fontWeight: 700,
                    fontSize: 12,
                    cursor: analyzing ? 'wait' : 'pointer',
                  }}
                >
                  {scenario.label}
                </button>
              ))}
            </div>
          </div>

          <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0 0 8px' }}>Signes vitaux (optionnel)</p>
          <div
            style={{
              display: 'grid',
              gap: '10px',
              gridTemplateColumns: 'repeat(3, 1fr)',
              marginBottom: '16px',
            }}
          >
            <input
              type="number"
              step="0.1"
              placeholder="Temp. °C"
              value={vitals.temperature}
              onChange={(e) => setVitals((v) => ({ ...v, temperature: e.target.value }))}
              style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
            />
            <input
              type="number"
              step="0.1"
              placeholder="Poids kg"
              value={vitals.weight}
              onChange={(e) => setVitals((v) => ({ ...v, weight: e.target.value }))}
              style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
            />
            <input
              type="number"
              placeholder="FC / min"
              value={vitals.heartRate}
              onChange={(e) => setVitals((v) => ({ ...v, heartRate: e.target.value }))}
              style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
            />
          </div>

          {error && <p style={{ color: '#b91c1c', fontSize: '0.9rem' }}>{error}</p>}

          <button type="submit" className="btn btn-primary" disabled={analyzing}>
            {analyzing ? 'Analyse en cours…' : '🔍 Analyser symptômes & risque'}
          </button>
        </form>

        <aside style={cardStyle}>
          <h3 style={{ marginTop: 0, fontSize: '1rem' }}>📁 Dossier & historique</h3>
          {ctxLoading && <p style={{ color: '#94a3b8', fontSize: 14 }}>Chargement…</p>}
          {!ownerId && <p style={{ color: '#94a3b8', fontSize: 14 }}>Sélectionnez un patient.</p>}
          {patientCtx?.dossier && (
            <p style={{ fontSize: 14 }}>
              Dossier <strong>{patientCtx.dossier.dossierNumber}</strong>
              {patientCtx.dossier.allergies && (
                <span style={{ display: 'block', color: '#b45309', marginTop: 6 }}>
                  ⚠️ {patientCtx.dossier.allergies}
                </span>
              )}
            </p>
          )}
          {pastAnalyses.length > 0 && (
            <>
              <p style={{ fontSize: 12, color: '#64748b', margin: '12px 0 6px' }}>Analyses précédentes</p>
              <ul style={{ margin: 0, padding: 0, listStyle: 'none', fontSize: 13 }}>
                {pastAnalyses.map((a) => (
                  <li
                    key={a.id}
                    style={{
                      padding: '8px 0',
                      borderBottom: '1px solid #f1f5f9',
                    }}
                  >
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        padding: '2px 6px',
                        borderRadius: 4,
                        background: a.urgencyClass === 'urgent' ? '#fecaca' : '#e0f2fe',
                        color: a.urgencyClass === 'urgent' ? '#b91c1c' : '#0369a1',
                        marginRight: 6,
                      }}
                    >
                      {a.urgencyClass === 'urgent' ? 'URGENT' : 'NON URGENT'}
                    </span>
                    {new Date(a.createdAt).toLocaleDateString('fr-FR')} — {a.summary}
                  </li>
                ))}
              </ul>
            </>
          )}
          {timeline.length > 0 && (
            <>
              <p style={{ fontSize: 12, color: '#64748b', margin: '14px 0 6px' }}>Timeline consultations</p>
              <ul style={{ margin: 0, padding: 0, listStyle: 'none', fontSize: 13, maxHeight: 220, overflowY: 'auto' }}>
                {timeline.slice(0, 12).map((ev) => (
                  <li key={ev.id} style={{ padding: '6px 0', borderBottom: '1px solid #f8fafc' }}>
                    {timelineIcon[ev.type] || '•'}{' '}
                    {ev.date ? new Date(ev.date).toLocaleDateString('fr-FR') : '—'} — {ev.label}
                  </li>
                ))}
              </ul>
            </>
          )}
          {ownerId && petName && patientCtx?.dossier?.id && (
            <Link
              to={`/vet/medical-dossiers/${patientCtx.dossier.id}`}
              style={{ display: 'inline-block', marginTop: 12, fontSize: 13, color: '#0369a1' }}
            >
              Ouvrir le dossier complet →
            </Link>
          )}
        </aside>
      </div>

      {result && (
        <div>
          <RiskGauge early={result.earlyDetection} />

          {result.earlyDetection?.symptomAnalysis?.length > 0 && (
            <section style={cardStyle}>
              <h3 style={{ marginTop: 0 }}>📋 Analyse des symptômes</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                <thead>
                  <tr style={{ textAlign: 'left', borderBottom: '2px solid #f1f5f9' }}>
                    <th style={{ padding: 8 }}>Symptôme / signal</th>
                    <th style={{ padding: 8 }}>Gravité</th>
                    <th style={{ padding: 8 }}>Source</th>
                  </tr>
                </thead>
                <tbody>
                  {result.earlyDetection.symptomAnalysis.map((s, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #f8fafc' }}>
                      <td style={{ padding: 8 }}>{s.symptom}</td>
                      <td style={{ padding: 8 }}>{s.severity}</td>
                      <td style={{ padding: 8, color: '#64748b' }}>{s.source === 'ml_signal' ? 'Analyse' : 'Saisie'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          )}

          {(result.earlyDetection?.earlyWarnings?.length > 0) && (
            <section style={cardStyle}>
              <h3 style={{ marginTop: 0 }}>⚡ Alertes précoces</h3>
              <ul style={{ margin: 0, paddingLeft: 18 }}>
                {result.earlyDetection.earlyWarnings.map((w, i) => (
                  <li key={i} style={{ marginBottom: 8, color: w.priority === 'critical' ? '#b91c1c' : '#334155' }}>
                    {w.message}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {(result.earlyDetection?.screeningRecommendations?.length > 0) && (
            <section style={{ ...cardStyle, marginBottom: 16 }}>
              <h3 style={{ marginTop: 0 }}>🧪 Examens suggérés</h3>
              <ul style={{ margin: 0, paddingLeft: 18 }}>
                {result.earlyDetection.screeningRecommendations.map((t, i) => (
                  <li key={i} style={{ marginBottom: 6 }}>
                    <strong>{t.test}</strong> — {t.reason}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {profile && (
            <div style={{ ...cardStyle, background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center' }}>
                <span style={{ fontSize: '2rem' }}>{animalEmoji[profile.type] || '🐾'}</span>
                <div style={{ flex: 1 }}>
                  <h2 style={{ margin: '0 0 4px' }}>{profile.name}</h2>
                  <p style={{ margin: 0, color: '#475569', fontSize: '0.9rem' }}>
                    {profile.type}
                    {profile.breed ? ` · ${profile.breed}` : ''}
                    {profile.ageYears != null ? ` · ${profile.ageYears} an(s)` : ''}
                    {profile.weightKg != null ? ` · ${profile.weightKg} kg` : ''}
                  </p>
                  {result.diseaseSuspected && (
                    <p style={{ margin: '6px 0 0', fontSize: '0.85rem', color: '#7c2d12', fontWeight: 600 }}>
                      🦠 Suspicion de maladie — confirmation clinique requise
                    </p>
                  )}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
                  {classStyle && (
                    <span
                      style={{
                        padding: '8px 14px',
                        borderRadius: '8px',
                        background: classStyle.bg,
                        color: classStyle.color,
                        fontSize: '0.8rem',
                        fontWeight: 700,
                      }}
                    >
                      {classStyle.label}
                    </span>
                  )}
                  {urgency && (
                    <span
                      style={{
                        padding: '6px 12px',
                        borderRadius: '999px',
                        background: urgency.color,
                        color: 'white',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                      }}
                    >
                      {urgency.text}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          <div style={{ display: 'grid', gap: '16px', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
            <section style={cardStyle}>
              <h3 style={{ marginTop: 0 }}>⚠️ Anomalies détectées</h3>
              {(result.anomalies || []).length === 0 ? (
                <p style={{ color: '#94a3b8' }}>Aucune anomalie signalée.</p>
              ) : (
                <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                  {result.anomalies.map((a, i) => {
                    const s = severityStyle[a.severity] || severityStyle.low;
                    return (
                      <li
                        key={i}
                        style={{
                          padding: '12px',
                          marginBottom: '8px',
                          borderRadius: '10px',
                          background: s.bg,
                          border: `1px solid ${s.border}`,
                          color: s.color,
                        }}
                      >
                        <strong>{a.label}</strong>
                        {a.likelyDisease && (
                          <span style={{ marginLeft: 8, fontSize: 11, fontWeight: 700 }}>— maladie possible</span>
                        )}
                        <p style={{ margin: '4px 0 0', fontSize: '0.88rem', color: '#334155' }}>{a.description}</p>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>

            <section style={cardStyle}>
              <h3 style={{ marginTop: 0 }}>🩺 Diagnostic assisté</h3>
              <ul style={{ margin: 0, paddingLeft: '18px' }}>
                {(result.diagnosticHypotheses || []).map((h, i) => (
                  <li key={i} style={{ marginBottom: '10px' }}>
                    <strong>{h.condition}</strong>
                    <span style={{ fontSize: '0.8rem', color: '#64748b', marginLeft: '8px' }}>
                      ({h.confidence})
                    </span>
                    <p style={{ margin: '4px 0 0', fontSize: '0.88rem', color: '#475569' }}>{h.rationale}</p>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          <section style={cardStyle}>
            <h3 style={{ marginTop: 0 }}>💊 Médicaments suggérés</h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ textAlign: 'left', borderBottom: '2px solid #e2e8f0' }}>
                    <th style={{ padding: '8px' }}>Médicament</th>
                    <th style={{ padding: '8px' }}>Posologie</th>
                    <th style={{ padding: '8px' }}>Fréquence</th>
                    <th style={{ padding: '8px' }}>Durée</th>
                  </tr>
                </thead>
                <tbody>
                  {(result.recommendedMedications || []).map((m, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '10px 8px' }}>
                        <strong>{m.name}</strong>
                        {m.notes && <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{m.notes}</div>}
                      </td>
                      <td style={{ padding: '10px 8px' }}>{m.dosage || '—'}</td>
                      <td style={{ padding: '10px 8px' }}>{m.frequency || '—'}</td>
                      <td style={{ padding: '10px 8px' }}>{m.duration || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {result.healthFollowUp && (
            <section style={{ ...cardStyle, background: '#f8fafc' }}>
              <h3 style={{ marginTop: 0 }}>📈 Suivi santé</h3>
              <p style={{ margin: '0 0 8px' }}>
                Prochain contrôle suggéré : <strong>{result.healthFollowUp.nextVisitDays ?? result.followUpDays ?? 7} jours</strong>
              </p>
              {result.healthFollowUp.monitoring?.length > 0 && (
                <p style={{ margin: '0 0 6px', fontSize: 14 }}>
                  Surveillance : {result.healthFollowUp.monitoring.join(', ')}
                </p>
              )}
              {result.healthFollowUp.warningSigns?.length > 0 && (
                <p style={{ margin: 0, fontSize: 14, color: '#b91c1c' }}>
                  Signes d&apos;alerte : {result.healthFollowUp.warningSigns.join(', ')}
                </p>
              )}
            </section>
          )}

          <div style={{ display: 'grid', gap: '16px', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
            <section style={cardStyle}>
              <h3 style={{ marginTop: 0 }}>💉 Vaccins recommandés</h3>
              {(result.recommendedVaccines || []).length === 0 ? (
                <p style={{ color: '#94a3b8' }}>Aucun rappel identifié.</p>
              ) : (
                <ul style={{ margin: 0, paddingLeft: '18px' }}>
                  {result.recommendedVaccines.map((v, i) => (
                    <li key={i} style={{ marginBottom: '8px' }}>
                      <strong>{v.name}</strong>
                      {v.schedule && <span> — {v.schedule}</span>}
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section style={cardStyle}>
              <h3 style={{ marginTop: 0 }}>🍽️ Régime alimentaire</h3>
              {result.dietPlan ? (
                <>
                  <p style={{ fontWeight: 600, marginTop: 0 }}>{result.dietPlan.summary}</p>
                  {result.dietPlan.recommendedFoods?.length > 0 && (
                    <p style={{ fontSize: '0.9rem' }}>✅ {result.dietPlan.recommendedFoods.join(', ')}</p>
                  )}
                </>
              ) : (
                <p style={{ color: '#94a3b8' }}>—</p>
              )}
            </section>
          </div>

          {result.clinicalNotes && (
            <section style={cardStyle}>
              <h3 style={{ marginTop: 0 }}>📋 Notes cliniques</h3>
              <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{result.clinicalNotes}</p>
            </section>
          )}

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
            <button type="button" className="btn btn-primary" onClick={applyPrescription}>
              📋 Créer ordonnance
            </button>
            <button type="button" className="btn btn-outline" onClick={applyDossier}>
              📁 Archiver au dossier médical
            </button>
            <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8', flex: '1 1 200px' }}>
              {result.disclaimer}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default VetPetDiagnosticsPage;
