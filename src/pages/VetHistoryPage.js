import React, { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../utils/api';

const typeIcon = {
  appointment: '📅',
  consultation: '🩺',
  prescription: '💊',
  dossier: '📁',
  vaccine: '💉',
};

const VetHistoryPage = () => {
  const [searchParams] = useSearchParams();
  const [timeline, setTimeline] = useState([]);
  const [legacy, setLegacy] = useState({
    appointments: [],
    consultations: [],
    prescriptions: [],
    records: [],
    dossierEntries: [],
  });
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [petName, setPetName] = useState(() => searchParams.get('petName') || '');
  const [ownerId, setOwnerId] = useState(() => searchParams.get('ownerId') || '');
  const [view, setView] = useState('timeline');

  useEffect(() => {
    api.get('/vet/clients').then(({ data }) => setClients(data || [])).catch(() => setClients([]));
  }, []);

  const fetchHistory = async (opts = {}) => {
    setLoading(true);
    const pet = opts.petName ?? petName;
    const owner = opts.ownerId ?? ownerId;
    try {
      const params = {};
      if (pet) params.petName = pet;
      if (owner) params.ownerId = owner;
      const [histRes, tlRes] = await Promise.all([
        api.get('/vet/history', { params }),
        pet && owner
          ? api.get('/vet/clinical/timeline', { params: { petName: pet, ownerId: owner } })
          : Promise.resolve({ data: [] }),
      ]);
      setLegacy(histRes.data);
      setTimeline(tlRes.data || []);
    } catch (error) {
      console.error('History error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const pet = searchParams.get('petName') || '';
    const owner = searchParams.get('ownerId') || '';
    if (pet) setPetName(pet);
    if (owner) setOwnerId(owner);
    fetchHistory({ petName: pet, ownerId: owner });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const selectedClient = useMemo(
    () => clients.find((c) => (c.id || c._id) === ownerId),
    [clients, ownerId]
  );

  const petOptions = useMemo(() => {
    if (!selectedClient?.pets?.length) return [];
    return selectedClient.pets.map((p) => p.name).filter(Boolean);
  }, [selectedClient]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchHistory();
  };

  const handleClientChange = (id) => {
    setOwnerId(id);
    const client = clients.find((c) => (c.id || c._id) === id);
    const firstPet = client?.pets?.[0]?.name || '';
    setPetName(firstPet);
  };

  if (loading && timeline.length === 0 && !legacy.appointments?.length) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Chargement...</div>;
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1000px', margin: '0 auto' }}>
      <h1 style={{ margin: '0 0 8px' }}>📜 Historique & timeline clinique</h1>
      <p style={{ color: '#64748b', marginTop: 0, marginBottom: 20 }}>
        Consultez le parcours de soins par client et par animal.
      </p>

      <form
        onSubmit={handleSearch}
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 10,
          marginBottom: 16,
          alignItems: 'end',
        }}
      >
        <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13, fontWeight: 600 }}>
          Client
          <select
            value={ownerId}
            onChange={(e) => handleClientChange(e.target.value)}
            style={{ padding: '10px 12px', borderRadius: 10, border: '2px solid #e5e7eb' }}
          >
            <option value="">— Tous les clients —</option>
            {clients.map((c) => (
              <option key={c.id || c._id} value={c.id || c._id}>
                {c.name} ({c.email})
              </option>
            ))}
          </select>
        </label>

        <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13, fontWeight: 600 }}>
          Animal
          {petOptions.length > 0 ? (
            <select
              value={petName}
              onChange={(e) => setPetName(e.target.value)}
              style={{ padding: '10px 12px', borderRadius: 10, border: '2px solid #e5e7eb' }}
            >
              <option value="">— Choisir —</option>
              {petOptions.map((name) => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
          ) : (
            <input
              placeholder="Nom de l'animal"
              value={petName}
              onChange={(e) => setPetName(e.target.value)}
              style={{ padding: '10px 12px', borderRadius: 10, border: '2px solid #e5e7eb' }}
            />
          )}
        </label>

        <button type="submit" className="btn btn-primary" style={{ height: 42 }}>
          Filtrer
        </button>
      </form>

      {ownerId && petName && (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
          <Link
            to={`/vet/medical-dossiers?q=${encodeURIComponent(petName)}`}
            className="btn btn-outline"
            style={{ fontSize: 13, textDecoration: 'none' }}
          >
            📁 Voir dossier médical
          </Link>
          <Link to="/vet/calendar" className="btn btn-outline" style={{ fontSize: 13, textDecoration: 'none' }}>
            📅 Agenda
          </Link>
        </div>
      )}

      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        <button type="button" onClick={() => setView('timeline')} style={tabStyle(view === 'timeline')}>
          Timeline
        </button>
        <button type="button" onClick={() => setView('lists')} style={tabStyle(view === 'lists')}>
          Listes
        </button>
      </div>

      {view === 'timeline' ? (
        timeline.length === 0 ? (
          <div style={{ padding: 32, textAlign: 'center', background: '#f8fafc', borderRadius: 14, color: '#94a3b8' }}>
            <p style={{ margin: 0 }}>
              {ownerId && petName
                ? 'Aucun événement dans la timeline pour cet animal.'
                : 'Sélectionnez un client et un animal pour afficher la timeline clinique.'}
            </p>
          </div>
        ) : (
          <div style={{ position: 'relative', paddingLeft: 24 }}>
            {timeline.map((ev) => (
              <div key={ev.id} style={{ marginBottom: 16, paddingLeft: 20, borderLeft: '3px solid #0ea5e9' }}>
                <span style={{ fontSize: 18 }}>{typeIcon[ev.type] || '•'}</span>
                <strong style={{ marginLeft: 8 }}>{ev.label}</strong>
                <p style={{ margin: '4px 0 0', fontSize: 13, color: '#64748b' }}>
                  {new Date(ev.date).toLocaleString('fr-FR')}
                  {ev.signed ? ' · Signé' : ''}
                </p>
                {ev.detail && <p style={{ margin: '4px 0 0', fontSize: 13 }}>{String(ev.detail).slice(0, 120)}</p>}
              </div>
            ))}
          </div>
        )
      ) : (
        <>
          {[
            { key: 'dossierEntries', label: 'Dossier médical', items: legacy.dossierEntries || [], dateField: 'visitDate' },
            { key: 'consultations', label: 'Consultations', items: legacy.consultations, dateField: 'updatedAt' },
            { key: 'prescriptions', label: 'Ordonnances', items: legacy.prescriptions, dateField: 'createdAt' },
            { key: 'appointments', label: 'RDV', items: legacy.appointments, dateField: 'date' },
          ].map((section) => (
            <div key={section.key} style={{ marginBottom: 28 }}>
              <h2 style={{ fontSize: '1.1rem' }}>{section.label} ({section.items.length})</h2>
              {section.items.length === 0 ? (
                <p style={{ color: '#888' }}>Aucun élément.</p>
              ) : (
                section.items.slice(0, 15).map((item) => (
                  <div
                    key={item.id}
                    style={{
                      background: 'white',
                      padding: 14,
                      borderRadius: 10,
                      marginBottom: 8,
                      boxShadow: '0 1px 6px rgba(0,0,0,0.04)',
                    }}
                  >
                    <strong>{item.petName || item.dossier?.petName || '—'}</strong>
                    <span style={{ marginLeft: 8, fontSize: '0.85rem', color: '#666' }}>
                      {item[section.dateField]
                        ? new Date(item[section.dateField]).toLocaleDateString('fr-FR')
                        : ''}
                    </span>
                    <p style={{ margin: '4px 0 0', fontSize: '0.85rem' }}>
                      {item.title || item.diagnosis || item.status || '—'}
                    </p>
                  </div>
                ))
              )}
            </div>
          ))}
        </>
      )}
    </div>
  );
};

const tabStyle = (active) => ({
  padding: '6px 14px',
  borderRadius: '20px',
  border: active ? '2px solid #0ea5e9' : '1px solid #ddd',
  background: active ? '#e0f2fe' : 'white',
  cursor: 'pointer',
  fontWeight: 600,
});

export default VetHistoryPage;
