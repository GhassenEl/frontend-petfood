import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Video, MessageCircle, RefreshCw, Calendar } from 'lucide-react';
import { getAppointments } from '../services/vetService';
import { buildDemoPetHealthReminders } from '../utils/petHealthReminders';
import TeleconsultMeetPanel from '../components/TeleconsultMeetPanel';
import { isOnlineVisit } from '../constants/visitModes';
import api from '../utils/api';

const card = {
  background: 'white',
  borderRadius: 16,
  padding: 20,
  border: '1px solid #e5e7eb',
  boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
  marginBottom: 16,
};

const ClientTeleconsultPage = () => {
  const [sessions, setSessions] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const appts = await getAppointments();
      const online = (appts || []).filter((a) => isOnlineVisit(a));
      setSessions(online);
    } catch {
      const demo = buildDemoPetHealthReminders()
        .filter((r) => r.online)
        .map((r) => ({
          id: r.id,
          petName: r.petName,
          reason: r.title,
          date: r.dueDate,
          status: 'confirmed',
          visitMode: 'online',
          type: 'veterinary_teleconsultation',
          meetingLink: r.meetingLink,
        }));
      setSessions(demo);
    }

    try {
      const { data } = await api.get('/messages/conversations');
      const vetThreads = (data || []).filter(
        (c) => c.role === 'vet' || c.partnerRole === 'vet' || c.type === 'vet',
      );
      setMessages(vetThreads.slice(0, 5));
    } catch {
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const upcoming = useMemo(
    () => sessions.filter((s) => !['cancelled', 'completed'].includes(s.status)),
    [sessions],
  );

  const openChat = () => {
    window.dispatchEvent(new CustomEvent('petfood:open-chat'));
  };

  return (
    <div style={{ padding: 24, maxWidth: 900, margin: '0 auto' }}>
      <div style={{
        background: 'linear-gradient(135deg, #f5f3ff, #ede9fe)',
        borderRadius: 16,
        padding: '20px 24px',
        marginBottom: 24,
        border: '1px solid #ddd6fe',
      }}>
        <h1 style={{ margin: '0 0 8px', fontSize: '1.75rem', fontWeight: 800, color: '#5b21b6' }}>
          <Video size={28} style={{ verticalAlign: 'middle', marginRight: 8 }} />
          Téléconsultation vétérinaire
        </h1>
        <p style={{ margin: 0, color: '#6b7280', fontSize: '0.95rem' }}>
          Échangez avec votre vétérinaire par visioconférence Google Meet ou messagerie sécurisée.
          {' '}
          <button
            type="button"
            onClick={load}
            disabled={loading}
            style={{
              border: 'none',
              background: 'none',
              color: '#7c3aed',
              fontWeight: 700,
              cursor: 'pointer',
              padding: 0,
            }}
          >
            <RefreshCw size={14} style={{ verticalAlign: 'middle' }} /> Actualiser
          </button>
        </p>
      </div>

      {error && (
        <p style={{ color: '#b91c1c', marginBottom: 16 }}>{error}</p>
      )}

      <section style={card}>
        <h2 style={{ margin: '0 0 12px', fontSize: '1.1rem', fontWeight: 800 }}>📹 Séances visio planifiées</h2>
        {loading ? (
          <p style={{ color: '#94a3b8' }}>Chargement…</p>
        ) : upcoming.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 24, color: '#94a3b8' }}>
            <p>Aucune téléconsultation planifiée.</p>
            <Link to="/veterinary" style={{ color: '#7c3aed', fontWeight: 700 }}>
              Réserver un créneau en ligne →
            </Link>
          </div>
        ) : (
          <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 16 }}>
            {upcoming.map((s) => (
              <li
                key={s.id || s._id}
                style={{
                  padding: 16,
                  borderRadius: 14,
                  border: '1px solid #e9d5ff',
                  background: '#faf5ff',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
                  <strong style={{ color: '#5b21b6' }}>
                    {s.petName ? `${s.petName} — ` : ''}{s.reason || 'Consultation'}
                  </strong>
                  <span style={{ fontSize: 13, color: '#64748b', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Calendar size={14} />
                    {s.date ? new Date(s.date).toLocaleString('fr-FR') : 'Date à confirmer'}
                  </span>
                </div>
                <TeleconsultMeetPanel appointment={s} compact />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section style={card}>
        <h2 style={{ margin: '0 0 12px', fontSize: '1.1rem', fontWeight: 800 }}>💬 Messagerie vétérinaire</h2>
        <p style={{ margin: '0 0 14px', fontSize: 14, color: '#64748b' }}>
          Posez vos questions entre deux consultations. L&apos;assistant santé peut aussi vous orienter.
        </p>
        {messages.length > 0 ? (
          <ul style={{ margin: '0 0 14px', padding: 0, listStyle: 'none' }}>
            {messages.map((m) => (
              <li key={m.id || m._id} style={{ padding: '8px 0', borderBottom: '1px solid #f1f5f9', fontSize: 14 }}>
                🩺 {m.partnerName || m.vetName || 'Vétérinaire'} — {m.lastMessage?.slice?.(0, 60) || 'Conversation'}
              </li>
            ))}
          </ul>
        ) : (
          <p style={{ fontSize: 13, color: '#94a3b8', marginBottom: 14 }}>Aucune conversation récente.</p>
        )}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          <button
            type="button"
            onClick={openChat}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '12px 18px',
              background: '#7c3aed',
              color: 'white',
              border: 'none',
              borderRadius: 12,
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            <MessageCircle size={18} /> Ouvrir l&apos;assistant / chat
          </button>
          <Link
            to="/veterinary"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '12px 18px',
              background: 'white',
              color: '#7c3aed',
              border: '1px solid #c4b5fd',
              borderRadius: 12,
              fontWeight: 700,
              textDecoration: 'none',
            }}
          >
            Prendre rendez-vous
          </Link>
          <Link
            to="/medical-dossier"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '12px 18px',
              background: 'white',
              color: '#059669',
              border: '1px solid #bbf7d0',
              borderRadius: 12,
              fontWeight: 700,
              textDecoration: 'none',
            }}
          >
            📁 Carnet de santé
          </Link>
        </div>
      </section>
    </div>
  );
};

export default ClientTeleconsultPage;
