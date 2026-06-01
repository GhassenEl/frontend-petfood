import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import MedicationFormFields from '../components/MedicationFormFields';
import {
  emptyMedicationRow,
  parseMedications,
  serializeMedications,
  formatMedicationLine,
  validateMedications,
} from '../utils/medications';

const VetPrescriptionsPage = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    petName: '',
    ownerId: '',
    medications: [emptyMedicationRow()],
    instructions: '',
  });
  const [clients, setClients] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [rxRes, clientsRes] = await Promise.all([
        api.get('/vet/prescriptions'),
        api.get('/vet/clients'),
      ]);
      setPrescriptions(rxRes.data || []);
      setClients(clientsRes.data || []);
    } catch (error) {
      console.error('Prescriptions error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    const meds = serializeMedications(form.medications);
    const errors = validateMedications(meds);
    if (errors.length) {
      window.alert(errors.join('\n'));
      return;
    }
    if (!form.petName || !form.ownerId || !meds.length) {
      window.alert('Renseignez au moins un médicament avec un nom.');
      return;
    }
    try {
      const pet = clients.find((c) => (c.id || c._id) === form.ownerId)?.pets?.find(
        (p) => p.name === form.petName
      );
      const { data } = await api.post('/vet/prescriptions', {
        ownerId: form.ownerId,
        petName: form.petName,
        medications: meds,
        instructions: form.instructions,
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      });
      if (data.stock?.warnings?.length) {
        window.alert(`Ordonnance créée.\nStock : ${data.stock.warnings.map((w) => w.message).join('; ')}`);
      }
      setForm({
        petName: '',
        ownerId: '',
        medications: [emptyMedicationRow()],
        instructions: '',
      });
      fetchData();
    } catch {
      window.alert('Erreur création ordonnance');
    }
  };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Chargement...</div>;

  return (
    <div style={{ padding: '24px', maxWidth: '1000px', margin: '0 auto' }}>
      <h1>💊 Ordonnances</h1>

      <form
        onSubmit={handleCreate}
        style={{
          background: 'white',
          padding: '20px',
          borderRadius: '14px',
          marginBottom: '24px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
        }}
      >
        <h2 style={{ marginTop: 0, fontSize: '1.1rem' }}>Nouvelle ordonnance</h2>
        <div style={{ display: 'grid', gap: '12px', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', marginBottom: 16 }}>
          <select
            value={form.ownerId}
            onChange={(e) => setForm((f) => ({ ...f, ownerId: e.target.value }))}
            required
            style={{ padding: '10px', borderRadius: '8px' }}
          >
            <option value="">Client</option>
            {clients.map((c) => (
              <option key={c.id || c._id} value={c.id || c._id}>
                {c.name}
              </option>
            ))}
          </select>
          <input
            placeholder="Nom de l'animal"
            value={form.petName}
            onChange={(e) => setForm((f) => ({ ...f, petName: e.target.value }))}
            required
            style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
          />
        </div>

        <MedicationFormFields
          medications={form.medications}
          onChange={(medications) => setForm((f) => ({ ...f, medications }))}
          petWeightKg={
            clients
              .find((c) => (c.id || c._id) === form.ownerId)
              ?.pets?.find((p) => p.name === form.petName)?.weight
          }
          animalType={
            clients
              .find((c) => (c.id || c._id) === form.ownerId)
              ?.pets?.find((p) => p.name === form.petName)?.type
          }
        />

        <label style={{ display: 'block', marginTop: 16, fontWeight: 600 }}>
          Instructions générales
          <textarea
            value={form.instructions}
            onChange={(e) => setForm((f) => ({ ...f, instructions: e.target.value }))}
            rows={2}
            style={{ width: '100%', marginTop: 6, padding: '10px', borderRadius: '8px', border: '1px solid #ddd', boxSizing: 'border-box' }}
          />
        </label>

        <button type="submit" className="btn btn-primary" style={{ marginTop: '12px' }}>
          Créer l&apos;ordonnance
        </button>
      </form>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {prescriptions.length === 0 ? (
          <p style={{ color: '#888' }}>Aucune ordonnance.</p>
        ) : (
          prescriptions.map((rx) => {
            const meds = parseMedications(rx.medications);
            return (
              <div
                key={rx.id || rx._id}
                style={{ background: 'white', padding: '16px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
              >
                <strong>{rx.petName}</strong> — {rx.owner?.name || 'Client'}
                <ul style={{ margin: '8px 0', paddingLeft: 18, fontSize: '0.9rem', color: '#555' }}>
                  {meds.map((m, i) => (
                    <li key={i}>{formatMedicationLine(m)}</li>
                  ))}
                </ul>
                {rx.instructions && <p style={{ fontSize: '0.85rem', color: '#777' }}>{rx.instructions}</p>}
                <span style={{ fontSize: '0.75rem', color: '#0ea5e9' }}>
                  {rx.status} · {new Date(rx.createdAt).toLocaleDateString('fr-FR')}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default VetPrescriptionsPage;
