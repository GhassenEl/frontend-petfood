import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

const animalEmoji = { dog: '🐕', cat: '🐈', bird: '🐦', fish: '🐠', other: '🐾' };

const severityStyle = {
  low: { bg: '#ecfdf5', border: '#6ee7b7', color: '#047857' },
  medium: { bg: '#fffbeb', border: '#fcd34d', color: '#b45309' },
  high: { bg: '#fef2f2', border: '#fca5a5', color: '#b91c1c' },
};

const urgencyLabel = {
  routine: { text: 'Suivi de routine', color: '#0ea5e9' },
  soon: { text: 'Consultation prochaine', color: '#f59e0b' },
  urgent: { text: 'Urgence possible', color: '#ef4444' },
};

const cardStyle = {
  background: 'white',
  borderRadius: '14px',
  padding: '20px',
  boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
  marginBottom: '16px',
};

const VetPetDiagnosticsPage = () => {
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [loadingClients, setLoadingClients] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const [ownerId, setOwnerId] = useState('');
  const [petId, setPetId] = useState('');
  const [petName, setPetName] = useState('');
  const [animalType, setAnimalType] = useState('dog');
  const [symptoms, setSymptoms] = useState('');
  const [vitals, setVitals] = useState({ temperature: '', weight: '', heartRate: '' });

  useEffect(() => {
    api
      .get('/vet/clients')
      .then(({ data }) => setClients(data || []))
      .catch(() => setError('Impossible de charger les clients'))
      .finally(() => setLoadingClients(false));
  }, []);

  const selectedClient = useMemo(
    () => clients.find((c) => (c.id || c._id) === ownerId),
    [clients, ownerId]
  );

  const petsForClient = selectedClient?.pets || [];

  const handleClientChange = (id) => {
    setOwnerId(id);
    setPetId('');
    setPetName('');
    const client = clients.find((c) => (c.id || c._id) === id);
    const firstPet = client?.pets?.[0];
    if (firstPet) {
      setPetId(firstPet.id || '');
      setPetName(firstPet.name || '');
      setAnimalType(firstPet.type || 'dog');
    }
  };

  const handlePetChange = (id) => {
    setPetId(id);
    const pet = petsForClient.find((p) => p.id === id);
    if (pet) {
      setPetName(pet.name);
      setAnimalType(pet.type || 'dog');
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
      const { data } = await api.post('/vet/ai/analyze-pet', {
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
    } catch (err) {
      setError(err.response?.data?.error || 'Analyse indisponible. Réessayez.');
    } finally {
      setAnalyzing(false);
    }
  };

  const applyPrescription = async () => {
    if (!result || !ownerId || !petName) {
      window.alert('Sélectionnez un client et un animal avant de créer l\'ordonnance.');
      return;
    }
    const meds = (result.recommendedMedications || []).map((m) => ({
      name: m.name,
      dosage: m.dosage || '',
      frequency: m.frequency || '',
      duration: m.duration || '',
    }));
    if (!meds.length) {
      window.alert('Aucun médicament suggéré à prescrire.');
      return;
    }

    const diet = result.dietPlan;
    const instructions = [
      result.clinicalNotes,
      diet?.summary ? `Régime : ${diet.summary}` : null,
      diet?.recommendedFoods?.length ? `Aliments recommandés : ${diet.recommendedFoods.join(', ')}` : null,
      diet?.foodsToAvoid?.length ? `À éviter : ${diet.foodsToAvoid.join(', ')}` : null,
      (result.recommendedVaccines || []).length
        ? `Vaccins : ${result.recommendedVaccines.map((v) => v.name).join(', ')}`
        : null,
    ]
      .filter(Boolean)
      .join('\n');

    try {
      await api.post('/vet/prescriptions', {
        ownerId,
        petName,
        medications: meds,
        instructions,
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      });
      window.alert('Ordonnance créée à partir des recommandations IA.');
      navigate('/vet/prescriptions');
    } catch {
      window.alert('Erreur lors de la création de l\'ordonnance.');
    }
  };

  if (loadingClients) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Chargement...</div>;
  }

  const profile = result?.profile?.pet;
  const urgency = result?.urgency ? urgencyLabel[result.urgency] : null;

  return (
    <div style={{ padding: '24px', maxWidth: '1100px', margin: '0 auto' }}>
      <header style={{ marginBottom: '24px' }}>
        <h1 style={{ margin: '0 0 8px' }}>🔬 Assistant diagnostic IA</h1>
        <p style={{ margin: 0, color: '#64748b', maxWidth: '720px' }}>
          Détection d&apos;anomalies, hypothèses diagnostiques et recommandations personnalisées
          (médicaments, vaccins, régime) selon le profil de l&apos;animal.
        </p>
      </header>

      <form onSubmit={runAnalysis} style={cardStyle}>
        <h2 style={{ marginTop: 0, fontSize: '1.1rem' }}>Patient & signes cliniques</h2>

        <div
          style={{
            display: 'grid',
            gap: '12px',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
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
            placeholder="Ex. : vomissements depuis 2 jours, perte d'appétit, grattements intensifs..."
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

        <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0 0 8px' }}>Signes vitaux (optionnel)</p>
        <div
          style={{
            display: 'grid',
            gap: '10px',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
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

        {error && (
          <p style={{ color: '#b91c1c', fontSize: '0.9rem', margin: '0 0 12px' }}>{error}</p>
        )}

        <button type="submit" className="btn btn-primary" disabled={analyzing}>
          {analyzing ? 'Analyse en cours…' : '🔍 Analyser avec l\'IA'}
        </button>
      </form>

      {result && (
        <div>
          {profile && (
            <div style={{ ...cardStyle, background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center' }}>
                <span style={{ fontSize: '2rem' }}>{animalEmoji[profile.type] || '🐾'}</span>
                <div>
                  <h2 style={{ margin: '0 0 4px' }}>{profile.name}</h2>
                  <p style={{ margin: 0, color: '#475569', fontSize: '0.9rem' }}>
                    {profile.type}
                    {profile.breed ? ` · ${profile.breed}` : ''}
                    {profile.ageYears != null ? ` · ${profile.ageYears} an(s)` : ''}
                    {profile.weightKg != null ? ` · ${profile.weightKg} kg` : ''}
                  </p>
                  {profile.allergies && (
                    <p style={{ margin: '6px 0 0', fontSize: '0.85rem', color: '#b45309' }}>
                      ⚠️ Allergies : {profile.allergies}
                    </p>
                  )}
                  {profile.chronicConditions && (
                    <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: '#7c3aed' }}>
                      Antécédents : {profile.chronicConditions}
                    </p>
                  )}
                </div>
                {urgency && (
                  <span
                    style={{
                      marginLeft: 'auto',
                      padding: '6px 14px',
                      borderRadius: '999px',
                      background: urgency.color,
                      color: 'white',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                    }}
                  >
                    {urgency.text}
                  </span>
                )}
              </div>
              {result.aiPowered === false && (
                <p style={{ margin: '12px 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                  Mode règles locales (IA cloud indisponible).
                </p>
              )}
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
                        <p style={{ margin: '4px 0 0', fontSize: '0.88rem', color: '#334155' }}>{a.description}</p>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>

            <section style={cardStyle}>
              <h3 style={{ marginTop: 0 }}>🩺 Hypothèses diagnostiques</h3>
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
                        {m.notes && (
                          <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{m.notes}</div>
                        )}
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

          <div style={{ display: 'grid', gap: '16px', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
            <section style={cardStyle}>
              <h3 style={{ marginTop: 0 }}>💉 Vaccins recommandés</h3>
              {(result.recommendedVaccines || []).length === 0 ? (
                <p style={{ color: '#94a3b8' }}>Aucun rappel vaccinal identifié.</p>
              ) : (
                <ul style={{ margin: 0, paddingLeft: '18px' }}>
                  {result.recommendedVaccines.map((v, i) => (
                    <li key={i} style={{ marginBottom: '8px' }}>
                      <strong>{v.name}</strong>
                      {v.schedule && <span> — {v.schedule}</span>}
                      {v.reason && (
                        <p style={{ margin: '2px 0 0', fontSize: '0.85rem', color: '#64748b' }}>{v.reason}</p>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section style={cardStyle}>
              <h3 style={{ marginTop: 0 }}>🍽️ Régime alimentaire personnalisé</h3>
              {result.dietPlan ? (
                <>
                  <p style={{ fontWeight: 600, marginTop: 0 }}>{result.dietPlan.summary}</p>
                  {result.dietPlan.mealsPerDay && (
                    <p style={{ fontSize: '0.9rem' }}>Repas / jour : {result.dietPlan.mealsPerDay}</p>
                  )}
                  {result.dietPlan.recommendedFoods?.length > 0 && (
                    <p style={{ fontSize: '0.9rem' }}>
                      ✅ Recommandé : {result.dietPlan.recommendedFoods.join(', ')}
                    </p>
                  )}
                  {result.dietPlan.foodsToAvoid?.length > 0 && (
                    <p style={{ fontSize: '0.9rem', color: '#b45309' }}>
                      ⛔ À éviter : {result.dietPlan.foodsToAvoid.join(', ')}
                    </p>
                  )}
                  {result.dietPlan.supplements?.length > 0 && (
                    <p style={{ fontSize: '0.9rem' }}>
                      Suppléments : {result.dietPlan.supplements.join(', ')}
                    </p>
                  )}
                </>
              ) : (
                <p style={{ color: '#94a3b8' }}>Pas de recommandation alimentaire.</p>
              )}
            </section>
          </div>

          {result.clinicalNotes && (
            <section style={{ ...cardStyle, background: '#f8fafc' }}>
              <h3 style={{ marginTop: 0 }}>📋 Notes cliniques</h3>
              <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{result.clinicalNotes}</p>
              {result.followUpDays && (
                <p style={{ margin: '12px 0 0', fontSize: '0.85rem', color: '#0ea5e9' }}>
                  Contrôle suggéré dans {result.followUpDays} jour(s).
                </p>
              )}
            </section>
          )}

          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '12px',
              alignItems: 'center',
              marginTop: '8px',
            }}
          >
            <button type="button" className="btn btn-primary" onClick={applyPrescription}>
              📋 Créer ordonnance depuis l&apos;analyse
            </button>
            <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8', flex: '1 1 200px' }}>
              {result.disclaimer ||
                'Suggestion IA — ne remplace pas l\'examen clinique ni votre jugement professionnel.'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default VetPetDiagnosticsPage;
