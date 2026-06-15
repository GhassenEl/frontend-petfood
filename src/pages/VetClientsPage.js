import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import {
  DEMO_VET_CLIENTS,
  mergeVetClients,
  saveExtraVetClient,
} from '../utils/vetDemoData';
import usePlatformRefresh from '../hooks/usePlatformRefresh';

const animalEmoji = { dog: '🐕', cat: '🐈', bird: '🐦', fish: '🐠', rabbit: '🐰', other: '🐾' };

const clientId = (c) => c?.id || c?._id;

const emptyForm = {
  name: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  petName: '',
  petType: 'dog',
  petBreed: '',
};

const VetClientsPage = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const fetchClients = async () => {
    try {
      const { data } = await api.get('/vet/clients');
      setClients(mergeVetClients(data));
    } catch (error) {
      console.error('Clients error:', error);
      setClients(mergeVetClients([]));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  usePlatformRefresh(fetchClients);

  const handleAddClient = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) {
      window.alert('Nom et e-mail obligatoires.');
      return;
    }
    setSubmitting(true);
    const payload = {
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim() || undefined,
      address: form.address.trim() || undefined,
      city: form.city.trim() || undefined,
      pets: form.petName.trim()
        ? [{
            id: `pet-${Date.now()}`,
            name: form.petName.trim(),
            type: form.petType,
            breed: form.petBreed.trim() || undefined,
          }]
        : [],
    };
    try {
      const { data } = await api.post('/vet/clients', payload);
      setClients((prev) => [data, ...prev]);
      setShowForm(false);
      setForm(emptyForm);
    } catch {
      const newClient = {
        id: `demo-client-${Date.now()}`,
        _id: `demo-client-${Date.now()}`,
        ...payload,
        since: new Date().toISOString().slice(0, 10),
        appointmentCount: 0,
        consultationCount: 0,
        notes: 'Client ajouté localement (mode démonstration).',
      };
      saveExtraVetClient(newClient);
      setClients((prev) => [newClient, ...prev]);
      setShowForm(false);
      setForm(emptyForm);
    } finally {
      setSubmitting(false);
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
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12, marginBottom: 20 }}>
        <div>
          <h1 style={{ margin: '0 0 8px' }}>👥 Clients & animaux</h1>
          <p style={{ color: '#64748b', margin: 0 }}>
            {clients.length} client(s) — fiche détaillée, historique et dossiers.
          </p>
        </div>
        <button type="button" className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Annuler' : '+ Ajouter client'}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleAddClient}
          style={{
            background: 'white',
            borderRadius: 16,
            padding: 20,
            marginBottom: 20,
            boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
            border: '1px solid #e2e8f0',
          }}
        >
          <h2 style={{ margin: '0 0 14px', fontSize: '1rem' }}>Nouveau client</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
            <label style={labelStyle}>
              Nom *
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} style={inputStyle} />
            </label>
            <label style={labelStyle}>
              E-mail *
              <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} style={inputStyle} />
            </label>
            <label style={labelStyle}>
              Téléphone
              <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} style={inputStyle} />
            </label>
            <label style={labelStyle}>
              Adresse
              <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} style={inputStyle} />
            </label>
            <label style={labelStyle}>
              Ville
              <input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} style={inputStyle} />
            </label>
            <label style={labelStyle}>
              Animal
              <input placeholder="Nom du 1er animal" value={form.petName} onChange={(e) => setForm({ ...form, petName: e.target.value })} style={inputStyle} />
            </label>
            <label style={labelStyle}>
              Espèce
              <select value={form.petType} onChange={(e) => setForm({ ...form, petType: e.target.value })} style={inputStyle}>
                <option value="dog">Chien</option>
                <option value="cat">Chat</option>
                <option value="bird">Oiseau</option>
                <option value="other">Autre</option>
              </select>
            </label>
            <label style={labelStyle}>
              Race
              <input value={form.petBreed} onChange={(e) => setForm({ ...form, petBreed: e.target.value })} style={inputStyle} />
            </label>
          </div>
          <button type="submit" className="btn btn-primary" disabled={submitting} style={{ marginTop: 14 }}>
            {submitting ? 'Enregistrement…' : 'Enregistrer le client'}
          </button>
        </form>
      )}

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
        <div style={{ textAlign: 'center', padding: '48px 24px', background: '#f8fafc', borderRadius: 16, color: '#94a3b8' }}>
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
                <Link to={`/vet/clients/${id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <h3 style={{ margin: '0 0 4px', fontSize: '1.05rem' }}>{client.name}</h3>
                </Link>
                <p style={{ margin: '0 0 8px', fontSize: '0.85rem', color: '#64748b' }}>{client.email}</p>
                {client.phone && (
                  <p style={{ margin: '0 0 4px', fontSize: '0.85rem', color: '#94a3b8' }}>📞 {client.phone}</p>
                )}
                {client.city && (
                  <p style={{ margin: '0 0 12px', fontSize: '0.8rem', color: '#94a3b8' }}>📍 {client.city}</p>
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
                    to={`/vet/clients/${id}`}
                    className="btn btn-primary"
                    style={{ fontSize: 12, padding: '6px 12px', textDecoration: 'none' }}
                  >
                    👤 Détails
                  </Link>
                  <Link to={historyLink} className="btn btn-outline" style={{ fontSize: 12, padding: '6px 12px', textDecoration: 'none' }}>
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
                    to="/vet/diagnostics"
                    className="btn btn-outline"
                    style={{ fontSize: 12, padding: '6px 12px', textDecoration: 'none' }}
                  >
                    🔬 Détection précoce
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

const labelStyle = { display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13, fontWeight: 600 };
const inputStyle = { padding: '10px 12px', borderRadius: 10, border: '1px solid #e2e8f0', marginTop: 4 };

export default VetClientsPage;
