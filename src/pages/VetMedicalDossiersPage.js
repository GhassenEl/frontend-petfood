import React, { useCallback, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { FileDown } from 'lucide-react';
import api from '../utils/api';
import { exportMedicalDossierPdf } from '../utils/medicalDossierPdf';
import {
  DEMO_VET_MEDICAL_DOSSIERS,
  mergeVetClients,
  withDemoFallback,
} from '../utils/vetDemoData';
import usePlatformRefresh from '../hooks/usePlatformRefresh';

const animalEmoji = { dog: '🐕', cat: '🐈', bird: '🐦', fish: '🐠', other: '🐾' };

const VetMedicalDossiersPage = () => {
  const [searchParams] = useSearchParams();
  const [dossiers, setDossiers] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(() => searchParams.get('q') || '');
  const [creating, setCreating] = useState(false);
  const [exportingId, setExportingId] = useState(null);
  const [form, setForm] = useState({ ownerId: '', petId: '', petName: '' });

  const load = useCallback(async () => {
    try {
      const [dRes, cRes] = await Promise.all([
        api.get('/vet/medical-dossiers'),
        api.get('/vet/clients'),
      ]);
      setDossiers(withDemoFallback(dRes.data, DEMO_VET_MEDICAL_DOSSIERS));
      setClients(mergeVetClients(cRes.data));
    } catch {
      setDossiers(DEMO_VET_MEDICAL_DOSSIERS);
      setClients(mergeVetClients([]));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  usePlatformRefresh(load);

  const handleExportPdf = async (dossierId, e) => {
    e.preventDefault();
    e.stopPropagation();
    setExportingId(dossierId);
    try {
      const { data } = await api.get(`/vet/medical-dossiers/${dossierId}`);
      exportMedicalDossierPdf(data);
    } catch {
      window.alert('Export PDF impossible.');
    } finally {
      setExportingId(null);
    }
  };

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
            <button
              type="button"
              onClick={(e) => handleExportPdf(d.id || d._id, e)}
              disabled={exportingId === (d.id || d._id)}
              style={{
                marginTop: 12,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 12px',
                borderRadius: 10,
                border: '1px solid #e5e7eb',
                background: '#f8fafc',
                fontWeight: 700,
                fontSize: 12,
                cursor: 'pointer',
              }}
            >
              <FileDown size={14} />
              {exportingId === (d.id || d._id) ? 'PDF…' : 'Exporter PDF'}
            </button>
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
