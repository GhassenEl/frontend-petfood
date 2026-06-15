import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import VetMedicationRecommender from '../components/VetMedicationRecommender';
import MedicationFormFields from '../components/MedicationFormFields';
import {
  emptyMedicationRow,
  serializeMedications,
  validateMedications,
} from '../utils/medications';
import { DEMO_VET_BI } from '../utils/vetDemoData';
import usePlatformRefresh from '../hooks/usePlatformRefresh';

const VetMedicationRecommendPage = () => {
  const [clients, setClients] = useState([]);
  const [ownerId, setOwnerId] = useState('');
  const [petName, setPetName] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [medications, setMedications] = useState([emptyMedicationRow()]);
  const [instructions, setInstructions] = useState('');
  const [saving, setSaving] = useState(false);

  const loadClients = useCallback(async () => {
    try {
      const { data } = await api.get('/vet/clients');
      setClients(data || []);
    } catch {
      setClients([]);
    }
  }, []);

  useEffect(() => {
    loadClients();
  }, [loadClients]);

  usePlatformRefresh(loadClients);

  const selectedClient = clients.find((c) => (c.id || c._id) === ownerId);
  const selectedPet = selectedClient?.pets?.find((p) => p.name === petName);

  const petContext = useMemo(() => ({
    petName,
    name: petName,
    animalType: selectedPet?.type || selectedPet?.animalType,
    weightKg: selectedPet?.weight ?? selectedPet?.weightKg,
    breed: selectedPet?.breed,
    ageYears: selectedPet?.ageYears,
  }), [petName, selectedPet]);

  const applyToPrescription = (rows) => {
    setMedications(rows.length ? rows : [emptyMedicationRow()]);
  };

  const quickDiagnosis = (d) => {
    setDiagnosis(d);
  };

  const createPrescription = async () => {
    const meds = serializeMedications(medications);
    const errors = validateMedications(meds);
    if (errors.length) {
      window.alert(errors.join('\n'));
      return;
    }
    if (!petName || !ownerId || !meds.length) {
      window.alert('Sélectionnez client, animal et médicaments.');
      return;
    }
    setSaving(true);
    try {
      const { data } = await api.post('/vet/prescriptions', {
        ownerId,
        petName,
        medications: meds,
        instructions: [instructions, diagnosis ? `Diagnostic : ${diagnosis}` : ''].filter(Boolean).join('\n'),
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      });
      let msg = 'Ordonnance créée.';
      if (data.stock?.warnings?.length) {
        msg += `\nStock : ${data.stock.warnings.map((w) => w.message).join('; ')}`;
      }
      window.alert(msg);
      setMedications([emptyMedicationRow()]);
      setInstructions('');
    } catch {
      window.alert('Erreur création ordonnance');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ padding: 24, maxWidth: 1100, margin: '0 auto' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', marginBottom: 8 }}>
        <h1 style={{ margin: 0 }}>💊 Recommandation médicaments</h1>
        <Link to="/vet/pharmacy" style={{ color: '#0ea5e9', fontSize: 14 }}>Pharmacie →</Link>
        <Link to="/vet/prescriptions" style={{ color: '#0ea5e9', fontSize: 14 }}>Ordonnances →</Link>
        <Link to="/vet/diagnostics" style={{ color: '#0ea5e9', fontSize: 14 }}>Détection précoce →</Link>
      </div>
      <p style={{ color: '#64748b', marginBottom: 24, lineHeight: 1.6 }}>
        Moteur de recommandation basé sur le diagnostic, les symptômes, l&apos;espèce et le poids —
        croisé avec le stock pharmacie et les protocoles BI ({DEMO_VET_BI.diseaseTreatments?.length || 0} protocoles).
      </p>

      <div style={{
        display: 'grid',
        gap: 20,
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        marginBottom: 24,
      }}
      >
        <div style={{ background: 'white', borderRadius: 14, padding: 18, border: '1px solid #e5e7eb' }}>
          <h2 style={{ margin: '0 0 12px', fontSize: 16 }}>Patient</h2>
          <div style={{ display: 'grid', gap: 10 }}>
            <select
              value={ownerId}
              onChange={(e) => { setOwnerId(e.target.value); setPetName(''); }}
              style={{ padding: 10, borderRadius: 8 }}
            >
              <option value="">Client</option>
              {clients.map((c) => (
                <option key={c.id || c._id} value={c.id || c._id}>{c.name}</option>
              ))}
            </select>
            <select
              value={petName}
              onChange={(e) => setPetName(e.target.value)}
              disabled={!ownerId}
              style={{ padding: 10, borderRadius: 8 }}
            >
              <option value="">Animal</option>
              {(selectedClient?.pets || []).map((p) => (
                <option key={p.name} value={p.name}>
                  {p.name} ({p.type || p.animalType || '?'}{p.weight ? ` · ${p.weight} kg` : ''})
                </option>
              ))}
            </select>
          </div>

          <p style={{ margin: '16px 0 8px', fontSize: 12, fontWeight: 700, color: '#64748b' }}>
            Diagnostics rapides
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {['Dermatite allergique', 'Arthrose', 'Parasites externes', 'Infection cutanée', 'Otite'].map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => quickDiagnosis(d)}
                style={{
                  padding: '6px 10px', borderRadius: 999, border: '1px solid #e5e7eb',
                  background: diagnosis === d ? '#ede9fe' : '#f8fafc', fontSize: 11, fontWeight: 600, cursor: 'pointer',
                }}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        <VetMedicationRecommender
          petContext={petContext}
          diagnosis={diagnosis}
          symptoms={symptoms}
          onApply={applyToPrescription}
          showInputs
        />
      </div>

      <div style={{ background: 'white', borderRadius: 14, padding: 20, border: '1px solid #e5e7eb' }}>
        <h2 style={{ margin: '0 0 16px', fontSize: 16 }}>Ordonnance (brouillon)</h2>
        <MedicationFormFields
          medications={medications}
          onChange={setMedications}
          petWeightKg={petContext.weightKg}
          animalType={petContext.animalType}
          diagnosis={diagnosis}
        />
        <label style={{ display: 'block', marginTop: 16, fontWeight: 600, fontSize: 13 }}>
          Instructions
          <textarea
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            rows={2}
            style={{ width: '100%', marginTop: 6, padding: 10, borderRadius: 8, border: '1px solid #e5e7eb', boxSizing: 'border-box' }}
          />
        </label>
        <button
          type="button"
          disabled={saving}
          onClick={createPrescription}
          className="btn btn-primary"
          style={{ marginTop: 14 }}
        >
          {saving ? 'Création…' : 'Créer l\'ordonnance'}
        </button>
      </div>
    </div>
  );
};

export default VetMedicationRecommendPage;
