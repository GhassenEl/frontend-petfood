import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../utils/api';
import usePlatformRefresh from '../hooks/usePlatformRefresh';
import {
  DEMO_VET_HISTORY,
  getDemoVetClient,
  loadExtraVetClients,
  mergeVetClients,
} from '../utils/vetDemoData';

const animalEmoji = { dog: '🐕', cat: '🐈', bird: '🐦', fish: '🐠', rabbit: '🐰', other: '🐾' };

const clientId = (c) => c?.id || c?._id;

const VetClientDetailPage = () => {
  const { id } = useParams();
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/vet/clients/${id}`);
      if (data?.name) {
        setClient(data);
        return;
      }
    } catch {
      /* fallback démo */
    }
    const fromDemo =
      getDemoVetClient(id) ||
      loadExtraVetClients().find((c) => clientId(c) === id);
    if (fromDemo) {
      setClient(fromDemo);
    } else {
      try {
        const { data: list } = await api.get('/vet/clients');
        const merged = mergeVetClients(list);
        setClient(merged.find((c) => clientId(c) === id) || null);
      } catch {
        setClient(getDemoVetClient(id) || null);
      }
    }
    setLoading(false);
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  usePlatformRefresh(load);

  const recentConsultations = useMemo(() => {
    return (DEMO_VET_HISTORY.consultations || [])
      .filter((c) => c.ownerId === id)
      .slice(0, 5);
  }, [id]);

  if (loading) {
    return <div style={{ padding: 40, textAlign: 'center' }}>Chargement…</div>;
  }

  if (!client) {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <p>Client introuvable.</p>
        <Link to="/vet/clients" style={{ color: '#0ea5e9', fontWeight: 700 }}>← Retour aux clients</Link>
      </div>
    );
  }

  const cid = clientId(client);

  return (
    <div style={{ padding: 24, maxWidth: 960, margin: '0 auto' }}>
      <Link to="/vet/clients" style={{ fontSize: 14, color: '#0ea5e9', fontWeight: 600, textDecoration: 'none' }}>
        ← Clients
      </Link>

      <header
        style={{
          marginTop: 12,
          marginBottom: 24,
          background: 'linear-gradient(135deg, #0c4a6e, #0ea5e9)',
          borderRadius: 20,
          padding: '24px 28px',
          color: 'white',
        }}
      >
        <h1 style={{ margin: '0 0 6px', fontSize: '1.6rem' }}>{client.name}</h1>
        <p style={{ margin: 0, opacity: 0.9, fontSize: 14 }}>{client.email}</p>
        {client.phone && <p style={{ margin: '6px 0 0', opacity: 0.85, fontSize: 14 }}>📞 {client.phone}</p>}
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16, marginBottom: 24 }}>
        <InfoCard title="Coordonnées">
          {client.address && <p style={infoLine}>📍 {client.address}</p>}
          {client.city && <p style={infoLine}>{client.city}</p>}
          {client.since && (
            <p style={infoLine}>
              Client depuis {new Date(client.since).toLocaleDateString('fr-FR')}
            </p>
          )}
        </InfoCard>
        <InfoCard title="Activité">
          <p style={{ margin: 0, fontSize: 28, fontWeight: 800, color: '#0ea5e9' }}>{client.appointmentCount ?? 0}</p>
          <p style={{ margin: '2px 0 12px', fontSize: 12, color: '#64748b' }}>Rendez-vous</p>
          <p style={{ margin: 0, fontSize: 28, fontWeight: 800, color: '#10b981' }}>{client.consultationCount ?? 0}</p>
          <p style={{ margin: '2px 0 0', fontSize: 12, color: '#64748b' }}>Consultations</p>
        </InfoCard>
        {client.notes && (
          <InfoCard title="Notes clinique">
            <p style={{ margin: 0, fontSize: 14, lineHeight: 1.55, color: '#475569' }}>{client.notes}</p>
          </InfoCard>
        )}
      </div>

      <section style={sectionStyle}>
        <h2 style={sectionTitle}>🐾 Animaux ({client.pets?.length || 0})</h2>
        {(client.pets || []).length === 0 ? (
          <p style={{ color: '#94a3b8' }}>Aucun animal enregistré.</p>
        ) : (
          <div style={{ display: 'grid', gap: 12 }}>
            {client.pets.map((pet) => (
              <div
                key={pet.id || pet.name}
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  justifyContent: 'space-between',
                  gap: 12,
                  padding: 16,
                  background: '#f8fafc',
                  borderRadius: 14,
                  border: '1px solid #e2e8f0',
                }}
              >
                <div>
                  <strong style={{ fontSize: 16 }}>
                    {animalEmoji[pet.type] || '🐾'} {pet.name}
                  </strong>
                  <p style={{ margin: '4px 0 0', fontSize: 13, color: '#64748b' }}>
                    {[pet.breed, pet.type, pet.ageYears != null ? `${pet.ageYears} an(s)` : null, pet.weightKg ? `${pet.weightKg} kg` : null, pet.sex === 'M' ? 'Mâle' : pet.sex === 'F' ? 'Femelle' : null]
                      .filter(Boolean)
                      .join(' · ')}
                  </p>
                  {pet.lastVisit && (
                    <p style={{ margin: '4px 0 0', fontSize: 12, color: '#94a3b8' }}>
                      Dernière visite : {new Date(pet.lastVisit).toLocaleDateString('fr-FR')}
                    </p>
                  )}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
                  <Link
                    to={`/vet/history?ownerId=${encodeURIComponent(cid)}&petName=${encodeURIComponent(pet.name)}`}
                    className="btn btn-outline"
                    style={{ fontSize: 12, padding: '6px 12px', textDecoration: 'none' }}
                  >
                    📜 Historique
                  </Link>
                  <Link
                    to={`/vet/medical-dossiers?q=${encodeURIComponent(pet.name)}`}
                    className="btn btn-outline"
                    style={{ fontSize: 12, padding: '6px 12px', textDecoration: 'none' }}
                  >
                    📁 Dossier
                  </Link>
                  <Link
                    to={`/vet/diagnostics?ownerId=${encodeURIComponent(cid)}&petName=${encodeURIComponent(pet.name)}`}
                    className="btn btn-primary"
                    style={{ fontSize: 12, padding: '6px 12px', textDecoration: 'none' }}
                  >
                    🔬 Détection précoce
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {recentConsultations.length > 0 && (
        <section style={{ ...sectionStyle, marginTop: 20 }}>
          <h2 style={sectionTitle}>🩺 Consultations récentes</h2>
          {recentConsultations.map((c) => (
            <div key={c.id} style={{ padding: '12px 0', borderBottom: '1px solid #f1f5f9', fontSize: 14 }}>
              <strong>{c.diagnosis}</strong>
              <span style={{ marginLeft: 8, color: '#94a3b8', fontSize: 12 }}>
                {c.petName} · {new Date(c.updatedAt).toLocaleDateString('fr-FR')}
              </span>
              {c.symptoms && (
                <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: 13 }}>{c.symptoms}</p>
              )}
            </div>
          ))}
        </section>
      )}

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 24 }}>
        <Link to={`/vet/history?ownerId=${encodeURIComponent(cid)}`} className="btn btn-primary" style={{ textDecoration: 'none' }}>
          📜 Historique complet
        </Link>
        <Link to="/vet/calendar" className="btn btn-outline" style={{ textDecoration: 'none' }}>
          📅 Agenda
        </Link>
        <Link to="/vet/contact-requests" className="btn btn-outline" style={{ textDecoration: 'none' }}>
          📩 Demandes contact
        </Link>
      </div>
    </div>
  );
};

const InfoCard = ({ title, children }) => (
  <div style={{ background: 'white', borderRadius: 16, padding: 18, boxShadow: '0 2px 12px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9' }}>
    <h3 style={{ margin: '0 0 10px', fontSize: 13, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{title}</h3>
    {children}
  </div>
);

const infoLine = { margin: '0 0 6px', fontSize: 14, color: '#334155' };
const sectionStyle = { background: 'white', borderRadius: 16, padding: 20, boxShadow: '0 2px 12px rgba(0,0,0,0.05)' };
const sectionTitle = { margin: '0 0 14px', fontSize: '1rem', fontWeight: 700 };

export default VetClientDetailPage;
