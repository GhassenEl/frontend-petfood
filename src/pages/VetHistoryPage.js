import React, { useEffect, useState } from 'react';
import api from '../utils/api';

const typeIcon = {
  appointment: '📅',
  consultation: '🩺',
  prescription: '💊',
  dossier: '📁',
  vaccine: '💉',
};

const VetHistoryPage = () => {
  const [timeline, setTimeline] = useState([]);
  const [legacy, setLegacy] = useState({ appointments: [], consultations: [], prescriptions: [], records: [], dossierEntries: [] });
  const [loading, setLoading] = useState(true);
  const [petName, setPetName] = useState('');
  const [ownerId, setOwnerId] = useState('');
  const [view, setView] = useState('timeline');

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const params = {};
      if (petName) params.petName = petName;
      if (ownerId) params.ownerId = ownerId;
      const [histRes, tlRes] = await Promise.all([
        api.get('/vet/history', { params }),
        petName && ownerId
          ? api.get('/vet/clinical/timeline', { params: { petName, ownerId } })
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
    fetchHistory();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchHistory();
  };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Chargement...</div>;

  return (
    <div style={{ padding: '24px', maxWidth: '1000px', margin: '0 auto' }}>
      <h1>📜 Historique & timeline clinique</h1>

      <form onSubmit={handleSearch} style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <input
          placeholder="Nom animal"
          value={petName}
          onChange={(e) => setPetName(e.target.value)}
          style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ddd', flex: 1, minWidth: '140px' }}
        />
        <input
          placeholder="ID client (optionnel)"
          value={ownerId}
          onChange={(e) => setOwnerId(e.target.value)}
          style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ddd', flex: 1, minWidth: '140px' }}
        />
        <button type="submit" className="btn btn-outline">Filtrer</button>
      </form>

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
          <p style={{ color: '#888' }}>Timeline vide — filtrez par animal + ID client.</p>
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
                  <div key={item.id} style={{ background: 'white', padding: 14, borderRadius: 10, marginBottom: 8, boxShadow: '0 1px 6px rgba(0,0,0,0.04)' }}>
                    <strong>{item.petName || item.dossier?.petName || '—'}</strong>
                    <span style={{ marginLeft: 8, fontSize: '0.85rem', color: '#666' }}>
                      {item[section.dateField] ? new Date(item[section.dateField]).toLocaleDateString('fr-FR') : ''}
                    </span>
                    <p style={{ margin: '4px 0 0', fontSize: '0.85rem' }}>{item.title || item.diagnosis || item.status || '—'}</p>
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
});

export default VetHistoryPage;
