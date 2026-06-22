import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Video, RefreshCw, Clock, Users } from 'lucide-react';
import api from '../utils/api';
import TeleconsultSessionCard from '../components/TeleconsultSessionCard';
import {
  countJoinableSessions,
  enrichDemoTeleconsult,
  filterOnlineSessions,
  getNextSession,
  getSessionId,
  splitTeleconsultSessions,
  TELECONSULT_PREP_CHECKLIST,
} from '../utils/teleconsultUtils';
import { DEMO_VET_APPOINTMENTS } from '../utils/vetDemoData';
import usePlatformRefresh from '../hooks/usePlatformRefresh';
import './ModeratorPages.css';

const demoTeleconsultSessions = () =>
  filterOnlineSessions(DEMO_VET_APPOINTMENTS).map((a) =>
    enrichDemoTeleconsult({
      ...a,
      clientName: a.owner?.name,
      meetingLink: a.status === 'confirmed' ? 'https://meet.google.com/lookup/petfoodtn-vet-demo' : undefined,
    }),
  );

const VetTeleconsultPage = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('upcoming');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/vet/appointments');
      const list = filterOnlineSessions(data).map(enrichDemoTeleconsult);
      setSessions(list.length ? list : demoTeleconsultSessions());
    } catch (err) {
      setSessions(demoTeleconsultSessions());
      setError(err.response?.data?.error || '');
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

  const startCall = async (session) => {
    const id = getSessionId(session);
    setBusyId(id);
    setError('');
    try {
      const { data: updated } = await api.post(`/vet/appointments/${id}/teleconsult/start`);
      setSessions((prev) => prev.map((s) => (getSessionId(s) === updated.id ? { ...s, ...updated } : s)));
      const link = updated.meetingLink || session.meetingLink;
      if (link) {
        window.open(link, '_blank', 'noopener,noreferrer');
      } else {
        setError('Lien Google Meet indisponible — réessayez dans un instant.');
      }
    } catch (err) {
      const link = session.meetingLink;
      if (link) {
        window.open(link, '_blank', 'noopener,noreferrer');
      } else {
        setError(err.response?.data?.error || err.message || 'Échec du démarrage de la visio');
      }
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="mod-page">
      <header className="mod-hero">
        <h1><Video size={24} /> Téléconsultations</h1>
        <p>
          Consultations vidéo Google Meet avec vos clients — démarrage de salle, suivi des créneaux et fiches consultation.
          {' '}
          <button type="button" className="mod-btn mod-btn--ghost mod-btn--sm" onClick={load} disabled={loading}>
            <RefreshCw size={14} /> Actualiser
          </button>
        </p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10, marginBottom: 20 }}>
        <Stat label="À venir" value={upcoming.length} icon={<Users size={18} />} color="#6366f1" />
        <Stat label="Salles ouvertes" value={joinableCount} icon={<Video size={18} />} color="#16a34a" highlight={joinableCount > 0} />
        <Stat label="Historique" value={past.length} icon={<Clock size={18} />} color="#64748b" />
      </div>

      {error ? (
        <div className="mod-card" style={{ borderColor: '#fecaca', background: '#fef2f2', color: '#b91c1c', marginBottom: 16 }}>
          {error}
        </div>
      ) : null}

      {nextSession && (
        <div className="mod-card" style={{ marginBottom: 16, borderColor: '#c4b5fd', background: '#faf5ff' }}>
          <h2 style={{ margin: '0 0 12px', fontSize: '1rem', fontWeight: 800, color: '#5b21b6' }}>
            Prochaine téléconsultation
          </h2>
          <TeleconsultSessionCard
            session={nextSession}
            role="vet"
            highlight
            onVetStart={startCall}
            busyId={busyId}
          />
        </div>
      )}

      <div className="mod-card">
        <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
          {[
            { id: 'upcoming', label: `À venir (${upcoming.length})` },
            { id: 'past', label: `Historique (${past.length})` },
          ].map((t) => (
            <button
              key={t.id}
              type="button"
              className={`mod-btn mod-btn--sm ${tab === t.id ? 'mod-btn--primary' : 'mod-btn--ghost'}`}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="mod-empty">Chargement…</p>
        ) : list.length === 0 ? (
          <p className="mod-empty">
            {tab === 'upcoming'
              ? 'Aucune téléconsultation planifiée. Les clients réservent un créneau « En ligne » depuis l\'espace vétérinaire.'
              : 'Aucune séance passée enregistrée.'}
          </p>
        ) : (
          <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 14 }}>
            {list.map((s) => (
              <li key={getSessionId(s)}>
                <TeleconsultSessionCard
                  session={s}
                  role="vet"
                  onVetStart={startCall}
                  busyId={busyId}
                />
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mod-card" style={{ marginTop: 16 }}>
        <h2 style={{ margin: '0 0 12px', fontSize: '1rem', fontWeight: 800 }}>Conseils pendant la visio</h2>
        <ul style={{ margin: 0, paddingLeft: 18, color: '#475569', lineHeight: 1.7, fontSize: 14 }}>
          {TELECONSULT_PREP_CHECKLIST.slice(0, 4).map((tip) => (
            <li key={tip}>{tip}</li>
          ))}
          <li>Demandez au client de montrer l&apos;animal sous plusieurs angles si nécessaire</li>
          <li>Complétez la fiche consultation après la séance pour le dossier médical</li>
        </ul>
      </div>
    </div>
  );
};

const Stat = ({ label, value, icon, color, highlight }) => (
  <div style={{
    padding: 14,
    borderRadius: 12,
    background: highlight ? '#f0fdf4' : 'white',
    border: `1px solid ${highlight ? '#86efac' : '#e2e8f0'}`,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  }}
  >
    <span style={{ color }}>{icon}</span>
    <div>
      <div style={{ fontSize: 20, fontWeight: 800, color }}>{value}</div>
      <div style={{ fontSize: 11, color: '#64748b' }}>{label}</div>
    </div>
  </div>
);

export default VetTeleconsultPage;
