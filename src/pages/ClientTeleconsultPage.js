import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Video, MessageCircle, RefreshCw, Calendar, Clock, CheckCircle2 } from 'lucide-react';
import { getAppointments } from '../services/vetService';
import { buildDemoPetHealthReminders } from '../utils/petHealthReminders';
import TeleconsultSessionCard from '../components/TeleconsultSessionCard';
import {
  countJoinableSessions,
  enrichDemoTeleconsult,
  filterOnlineSessions,
  getNextSession,
  getTeleconsultTiming,
  splitTeleconsultSessions,
  TELECONSULT_PREP_CHECKLIST,
} from '../utils/teleconsultUtils';
import usePlatformRefresh from '../hooks/usePlatformRefresh';
import api from '../utils/api';

const card = {
  background: 'white',
  borderRadius: 16,
  padding: 20,
  border: '1px solid #e5e7eb',
  boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
  marginBottom: 16,
};

const loadDemoSessions = () =>
  buildDemoPetHealthReminders()
    .filter((r) => r.online)
    .map((r) =>
      enrichDemoTeleconsult({
        id: r.id,
        petName: r.petName,
        reason: r.title,
        date: r.dueDate,
        status: 'confirmed',
        visitMode: 'online',
        type: 'veterinary_teleconsultation',
        meetingLink: r.meetingLink,
        vetName: 'Salma Khelifi',
      }),
    );

const ClientTeleconsultPage = () => {
  const [sessions, setSessions] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('upcoming');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const appts = await getAppointments();
      const online = filterOnlineSessions(appts).map(enrichDemoTeleconsult);
      setSessions(online.length ? online : loadDemoSessions());
    } catch {
      setSessions(loadDemoSessions());
    }

    try {
      const { data } = await api.get('/messages/conversations');
      const vetThreads = (data || []).filter(
        (c) => c.role === 'vet' || c.partnerRole === 'vet' || c.type === 'vet',
      );
      setMessages(vetThreads.length ? vetThreads.slice(0, 5) : [
        { id: 'demo-vet-msg-1', partnerName: 'Dr. Salma Khelifi', lastMessage: 'Rappel vaccin Max dans 3 semaines', unread: true },
        { id: 'demo-vet-msg-2', partnerName: 'Clinique VetPlus', lastMessage: 'Ordonnance Luna disponible dans votre dossier', unread: false },
      ]);
    } catch {
      setMessages([
        { id: 'demo-vet-msg-1', partnerName: 'Dr. Salma Khelifi', lastMessage: 'Rappel vaccin Max dans 3 semaines', unread: true },
        { id: 'demo-vet-msg-2', partnerName: 'Clinique VetPlus', lastMessage: 'Ordonnance Luna disponible dans votre dossier', unread: false },
      ]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);
  usePlatformRefresh(load);

  const { upcoming, past } = useMemo(() => splitTeleconsultSessions(sessions), [sessions]);
  const nextSession = useMemo(() => getNextSession(sessions), [sessions]);
  const joinableCount = useMemo(() => countJoinableSessions(sessions), [sessions]);
  const list = tab === 'upcoming' ? upcoming : past;

  const openChat = () => {
    window.dispatchEvent(new CustomEvent('petfood:open-chat'));
  };

  return (
    <div style={{ padding: 24, maxWidth: 920, margin: '0 auto' }}>
      <div style={{
        background: 'linear-gradient(135deg, #f5f3ff, #ede9fe)',
        borderRadius: 16,
        padding: '20px 24px',
        marginBottom: 20,
        border: '1px solid #ddd6fe',
      }}
      >
        <h1 style={{ margin: '0 0 8px', fontSize: '1.75rem', fontWeight: 800, color: '#5b21b6' }}>
          <Video size={28} style={{ verticalAlign: 'middle', marginRight: 8 }} />
          Téléconsultation vétérinaire
        </h1>
        <p style={{ margin: 0, color: '#6b7280', fontSize: '0.95rem' }}>
          Visioconférence Google Meet sécurisée avec votre vétérinaire — caméra, micro et messagerie.
          {' '}
          <button
            type="button"
            onClick={load}
            disabled={loading}
            style={{ border: 'none', background: 'none', color: '#7c3aed', fontWeight: 700, cursor: 'pointer', padding: 0 }}
          >
            <RefreshCw size={14} style={{ verticalAlign: 'middle' }} /> Actualiser
          </button>
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10, marginBottom: 20 }}>
        <Kpi label="À venir" value={upcoming.length} color="#7c3aed" />
        <Kpi label="Salle ouverte" value={joinableCount} color="#16a34a" highlight={joinableCount > 0} />
        <Kpi label="Historique" value={past.length} color="#64748b" />
      </div>

      {nextSession && (
        <section style={{ ...card, background: 'linear-gradient(135deg,#faf5ff,#f5f3ff)', borderColor: '#c4b5fd' }}>
          <h2 style={{ margin: '0 0 8px', fontSize: '1rem', fontWeight: 800, color: '#5b21b6', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Clock size={18} /> Prochaine séance
          </h2>
          <TeleconsultSessionCard session={nextSession} role="client" highlight />
        </section>
      )}

      <section style={card}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
          {[
            { id: 'upcoming', label: `À venir (${upcoming.length})` },
            { id: 'past', label: `Historique (${past.length})` },
          ].map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              style={{
                padding: '8px 14px',
                borderRadius: 999,
                border: 'none',
                fontWeight: 700,
                fontSize: 13,
                cursor: 'pointer',
                background: tab === t.id ? '#7c3aed' : '#f1f5f9',
                color: tab === t.id ? 'white' : '#475569',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {loading ? (
          <p style={{ color: '#94a3b8' }}>Chargement…</p>
        ) : list.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 24, color: '#94a3b8' }}>
            <p>{tab === 'upcoming' ? 'Aucune téléconsultation planifiée.' : 'Aucun historique visio.'}</p>
            {tab === 'upcoming' && (
              <Link to="/veterinary" style={{ color: '#7c3aed', fontWeight: 700 }}>
                Réserver un créneau en ligne →
              </Link>
            )}
          </div>
        ) : (
          <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 14 }}>
            {list.map((s) => (
              <li key={s.id || s._id}>
                <TeleconsultSessionCard session={s} role="client" />
              </li>
            ))}
          </ul>
        )}
      </section>

      {tab === 'upcoming' && (
        <section style={card}>
          <h2 style={{ margin: '0 0 12px', fontSize: '1.05rem', fontWeight: 800 }}>✅ Avant la visio</h2>
          <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'grid', gap: 8 }}>
            {TELECONSULT_PREP_CHECKLIST.map((tip) => (
              <li key={tip} style={{ display: 'flex', gap: 8, fontSize: 14, color: '#475569', alignItems: 'flex-start' }}>
                <CheckCircle2 size={16} color="#16a34a" style={{ flexShrink: 0, marginTop: 2 }} />
                {tip}
              </li>
            ))}
          </ul>
        </section>
      )}

      <section style={card}>
        <h2 style={{ margin: '0 0 12px', fontSize: '1.1rem', fontWeight: 800 }}>💬 Messagerie vétérinaire</h2>
        <p style={{ margin: '0 0 14px', fontSize: 14, color: '#64748b' }}>
          Questions entre deux consultations — l&apos;assistant santé peut vous orienter avant le RDV.
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
          <ActionBtn onClick={openChat} primary icon={<MessageCircle size={18} />}>
            Ouvrir l&apos;assistant / chat
          </ActionBtn>
          <ActionLink to="/veterinary" icon={<Calendar size={16} />}>Prendre rendez-vous</ActionLink>
          <ActionLink to="/client-vet-intelligence" icon={<Video size={16} />}>Pré-consultation IA</ActionLink>
          <ActionLink to="/medical-dossier" color="#059669" border="#bbf7d0">📁 Carnet de santé</ActionLink>
        </div>
      </section>
    </div>
  );
};

const Kpi = ({ label, value, color, highlight }) => (
  <div style={{
    padding: 14,
    borderRadius: 12,
    background: highlight ? '#f0fdf4' : 'white',
    border: `1px solid ${highlight ? '#86efac' : '#e2e8f0'}`,
    textAlign: 'center',
  }}
  >
    <div style={{ fontSize: 22, fontWeight: 800, color }}>{value}</div>
    <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>{label}</div>
  </div>
);

const ActionBtn = ({ children, onClick, primary, icon }) => (
  <button
    type="button"
    onClick={onClick}
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 8,
      padding: '12px 18px',
      background: primary ? '#7c3aed' : 'white',
      color: primary ? 'white' : '#7c3aed',
      border: primary ? 'none' : '1px solid #c4b5fd',
      borderRadius: 12,
      fontWeight: 700,
      cursor: 'pointer',
    }}
  >
    {icon}
    {children}
  </button>
);

const ActionLink = ({ to, children, icon, color = '#7c3aed', border = '#c4b5fd' }) => (
  <Link
    to={to}
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 8,
      padding: '12px 18px',
      background: 'white',
      color,
      border: `1px solid ${border}`,
      borderRadius: 12,
      fontWeight: 700,
      textDecoration: 'none',
    }}
  >
    {icon}
    {children}
  </Link>
);

export default ClientTeleconsultPage;
