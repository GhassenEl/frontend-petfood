import React, { useEffect, useState } from 'react';
import api from '../utils/api';

const animalEmoji = { dog: '🐕', cat: '🐈', bird: '🐦', fish: '🐠' };

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
      c.email?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Chargement...</div>;

  return (
    <div style={{ padding: '24px', maxWidth: '1000px', margin: '0 auto' }}>
      <h1>👥 Clients & animaux</h1>
      <input
        type="search"
        placeholder="Rechercher un client..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ width: '100%', maxWidth: '400px', padding: '10px 14px', borderRadius: '10px', border: '1px solid #ddd', marginBottom: '20px' }}
      />

      <div style={{ display: 'grid', gap: '16px', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
        {filtered.map((client) => (
          <div key={client.id} style={{ background: 'white', borderRadius: '14px', padding: '18px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
            <h3 style={{ margin: '0 0 4px' }}>{client.name}</h3>
            <p style={{ margin: '0 0 12px', fontSize: '0.85rem', color: '#666' }}>{client.email}</p>
            {client.phone && <p style={{ fontSize: '0.85rem', color: '#888' }}>📞 {client.phone}</p>}
            <div style={{ marginTop: '12px' }}>
              <strong style={{ fontSize: '0.9rem' }}>Animaux :</strong>
              {(client.pets || []).length === 0 ? (
                <p style={{ fontSize: '0.85rem', color: '#aaa' }}>Aucun animal enregistré</p>
              ) : (
                <ul style={{ margin: '8px 0 0', paddingLeft: '0', listStyle: 'none' }}>
                  {client.pets.map((pet) => (
                    <li key={pet.id || pet.name} style={{ fontSize: '0.9rem', marginBottom: '4px' }}>
                      {animalEmoji[pet.type] || '🐾'} {pet.name} ({pet.type}{pet.breed ? `, ${pet.breed}` : ''})
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <p style={{ marginTop: '12px', fontSize: '0.8rem', color: '#0ea5e9' }}>
              {client.appointmentCount || 0} RDV · {client.consultationCount || 0} consultations
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VetClientsPage;
