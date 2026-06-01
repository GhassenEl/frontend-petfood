import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../utils/api';

const animalEmoji = { dog: '🐕', cat: '🐈', bird: '🐦', fish: '🐠', other: '🐾' };

const VetMedicalDossiersPage = () => {
  const [searchParams] = useSearchParams();
  const [dossiers, setDossiers] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(() => searchParams.get('q') || '');
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ ownerId: '', petId: '', petName: '' });

  useEffect(() => {
    Promise.all([api.get('/vet/medical-dossiers'), api.get('/vet/clients')])
      .then(([dRes, cRes]) => {
        setDossiers(dRes.data || []);
        setClients(cRes.data || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const selectedClient = clients.find((c) => (c.id || c._id) === form.ownerId);
  const pets = selectedClient?.pets || [];

  const filtered = dossiers.filter(
    (d) =>
      d.petName?.toLowerCase().includes(search.toLowerCase()) ||
      d.dossierNumber?.toLowerCase().includes(search.toLowerCase()) ||
      d.owner?.name?.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = async (e) => {
    e.preventDefault();
    const pet = pets.find((p) => p.id === form.petId);
    if (!form.ownerId || (!form.petId && !form.petName)) {
      window.alert('Sélectionnez un client et un animal.');
      return;
    }
    setCreating(true);
    try {
      const { data } = await api.post('/vet/medical-dossiers', {
        ownerId: form.ownerId,
        petId: form.petId || undefined,
        petName: pet?.name || form.petName,
      });
      setDossiers((prev) => [data, ...prev]);
      setForm({ ownerId: '', petId: '', petName: '' });
    } catch {
      window.alert('Erreur création dossier (existe peut-être déjà).');
    } finally {
      setCreating(false);
    }
  };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Chargement...</div>;

  return (
    <div style={{ padding: '24px', maxWidth: '1100px', margin: '0 auto' }}>
      <h1>📁 Dossiers médicaux numériques</h1>
      <p style={{ color: '#64748b', marginTop: 0 }}>
        Un dossier par patient avec entrées signées électroniquement par le vétérinaire.
      </p>

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
        <h2 style={{ marginTop: 0, fontSize: '1.05rem' }}>Ouvrir un dossier patient</h2>
        <div
          style={{
            display: 'grid',
            gap: '12px',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          }}
        >
          <select
            value={form.ownerId}
            onChange={(e) => setForm({ ownerId: e.target.value, petId: '', petName: '' })}
            style={{ padding: '10px', borderRadius: '8px' }}
          >
            <option value="">Client</option>
            {clients.map((c) => (
              <option key={c.id || c._id} value={c.id || c._id}>
                {c.name}
              </option>
            ))}
          </select>
          {pets.length > 0 ? (
            <select
              value={form.petId}
              onChange={(e) => setForm((f) => ({ ...f, petId: e.target.value }))}
              style={{ padding: '10px', borderRadius: '8px' }}
            >
              <option value="">Animal</option>
              {pets.map((p) => (
                <option key={p.id || p.name} value={p.id || p.name}>
                  {animalEmoji[p.type] || '🐾'} {p.name}
                </option>
              ))}
            </select>
          ) : (
            <input
              placeholder="Nom de l'animal"
              value={form.petName}
              onChange={(e) => setForm((f) => ({ ...f, petName: e.target.value }))}
              style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
            />
          )}
        </div>
        <button type="submit" className="btn btn-primary" style={{ marginTop: '12px' }} disabled={creating}>
          {creating ? 'Création…' : '+ Créer / ouvrir dossier'}
        </button>
      </form>

      <input
        type="search"
        placeholder="Rechercher par n° dossier, animal, client…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          width: '100%',
          maxWidth: '420px',
          padding: '10px 14px',
          borderRadius: '10px',
          border: '1px solid #ddd',
          marginBottom: '20px',
        }}
      />

      <div style={{ display: 'grid', gap: '14px', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
        {filtered.map((d) => (
          <Link
            key={d.id || d._id}
            to={`/vet/medical-dossiers/${d.id || d._id}`}
            style={{
              textDecoration: 'none',
              color: 'inherit',
              background: 'white',
              borderRadius: '14px',
              padding: '18px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
              border: '1px solid #f1f5f9',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '1.5rem' }}>{animalEmoji[d.animalType] || '🐾'}</span>
              <span
                style={{
                  fontSize: '0.75rem',
                  padding: '4px 10px',
                  borderRadius: '999px',
                  background: d.status === 'active' ? '#dcfce7' : '#f1f5f9',
                  color: d.status === 'active' ? '#166534' : '#64748b',
                }}
              >
                {d.status === 'active' ? 'Actif' : d.status}
              </span>
            </div>
            <h3 style={{ margin: '8px 0 4px' }}>{d.petName}</h3>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>
              N° {d.dossierNumber}
            </p>
            <p style={{ margin: '6px 0 0', fontSize: '0.85rem', color: '#475569' }}>
              {d.owner?.name || '—'}
            </p>
            <p style={{ margin: '10px 0 0', fontSize: '0.8rem', color: '#0ea5e9' }}>
              {d.entryCount || 0} entrée(s) · {d.signedCount || 0} signée(s)
            </p>
          </Link>
        ))}
      </div>

      {filtered.length === 0 && (
        <p style={{ color: '#94a3b8', textAlign: 'center', marginTop: '32px' }}>
          Aucun dossier. Créez-en un pour un patient ci-dessus.
        </p>
      )}
    </div>
  );
};

export default VetMedicalDossiersPage;
