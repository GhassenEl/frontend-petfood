import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';

const animalEmoji = { dog: '🐕', cat: '🐈', bird: '🐦', fish: '🐠', rabbit: '🐰', other: '🐾' };

const clientId = (c) => c?.id || c?._id;

const VetClientsPage = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const { data } = await api.get('/vet/clients');
      setClients(data || []);
    } catch (error) {
      console.error('Clients error:', error);
    } finally {
      setLoading(false);
    }
  };

  const filtered = clients.filter(
    (c) =>
      c.name?.toLowerCase().includes(search.toLowerCase()) ||
      c.email?.toLowerCase().includes(search.toLowerCase()) ||
      (c.pets || []).some((p) => p.name?.toLowerCase().includes(search.toLowerCase()))
  );

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Chargement...</div>;

  return (
    <div style={{ padding: '24px', maxWidth: '1100px', margin: '0 auto' }}>
      <h1 style={{ margin: '0 0 8px' }}>👥 Clients & animaux</h1>
      <p style={{ color: '#64748b', marginTop: 0, marginBottom: 20 }}>
        Accédez rapidement au dossier, à l&apos;historique clinique ou à l&apos;agenda pour chaque patient.
      </p>

      <input
        type="search"
        placeholder="Rechercher client, email ou animal…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          width: '100%',
          maxWidth: '420px',
          padding: '12px 16px',
          borderRadius: '12px',
          border: '2px solid #e5e7eb',
          marginBottom: '20px',
          fontSize: '15px',
        }}
      />

      {filtered.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '48px 24px',
            background: '#f8fafc',
            borderRadius: 16,
            color: '#94a3b8',
          }}
        >
          <p style={{ margin: 0, fontSize: '1.1rem' }}>
            {search ? `Aucun client pour « ${search} »` : 'Aucun client enregistré.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '16px', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
          {filtered.map((client) => {
            const id = clientId(client);
            const firstPet = client.pets?.[0];
            const historyLink = firstPet
              ? `/vet/history?ownerId=${encodeURIComponent(id)}&petName=${encodeURIComponent(firstPet.name)}`
              : `/vet/history?ownerId=${encodeURIComponent(id)}`;

            return (
              <article
                key={id}
                style={{
                  background: 'white',
                  borderRadius: '16px',
                  padding: '20px',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
                  border: '1px solid #f1f5f9',
                }}
              >
                <h3 style={{ margin: '0 0 4px', fontSize: '1.05rem' }}>{client.name}</h3>
                <p style={{ margin: '0 0 8px', fontSize: '0.85rem', color: '#64748b' }}>{client.email}</p>
                {client.phone && (
                  <p style={{ margin: '0 0 12px', fontSize: '0.85rem', color: '#94a3b8' }}>📞 {client.phone}</p>
                )}

                <div style={{ marginBottom: 12 }}>
                  <strong style={{ fontSize: '0.85rem', color: '#374151' }}>Animaux</strong>
                  {(client.pets || []).length === 0 ? (
                    <p style={{ fontSize: '0.85rem', color: '#cbd5e1', margin: '6px 0 0' }}>Aucun animal</p>
                  ) : (
                    <ul style={{ margin: '8px 0 0', paddingLeft: 0, listStyle: 'none' }}>
                      {client.pets.map((pet) => (
                        <li key={pet.id || pet.name} style={{ fontSize: '0.9rem', marginBottom: 6 }}>
                          {animalEmoji[pet.type] || '🐾'} {pet.name}
                          {pet.breed ? ` · ${pet.breed}` : ''}
                          <Link
                            to={`/vet/history?ownerId=${encodeURIComponent(id)}&petName=${encodeURIComponent(pet.name)}`}
                            style={{ marginLeft: 8, fontSize: '0.75rem', color: '#0ea5e9', fontWeight: 700 }}
                          >
                            Timeline
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <p style={{ margin: '0 0 14px', fontSize: '0.8rem', color: '#0ea5e9', fontWeight: 600 }}>
                  {client.appointmentCount || 0} RDV · {client.consultationCount || 0} consultations
                </p>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  <Link
                    to={historyLink}
                    className="btn btn-outline"
                    style={{ fontSize: 12, padding: '6px 12px', textDecoration: 'none' }}
                  >
                    📜 Historique
                  </Link>
                  <Link
                    to={`/vet/medical-dossiers?q=${encodeURIComponent(client.name || '')}`}
                    className="btn btn-outline"
                    style={{ fontSize: 12, padding: '6px 12px', textDecoration: 'none' }}
                  >
                    📁 Dossier
                  </Link>
                  <Link
                    to="/vet/calendar"
                    className="btn btn-outline"
                    style={{ fontSize: 12, padding: '6px 12px', textDecoration: 'none' }}
                  >
                    📅 Agenda
                  </Link>
                  <Link
                    to="/vet/diagnostics"
                    className="btn btn-primary"
                    style={{ fontSize: 12, padding: '6px 12px', textDecoration: 'none' }}
                  >
                    🔬 Diagnostic IA
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default VetClientsPage;
