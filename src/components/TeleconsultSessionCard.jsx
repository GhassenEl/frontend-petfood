import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, User, PawPrint, Clock } from 'lucide-react';
import TeleconsultMeetPanel from './TeleconsultMeetPanel';
import {
  formatSessionDateTime,
  getSessionId,
  getTeleconsultTiming,
  TELECONSULT_STATUS,
} from '../utils/teleconsultUtils';

const phaseStyle = {
  joinable: { border: '#86efac', bg: '#f0fdf4', badge: '#16a34a' },
  live: { border: '#fca5a5', bg: '#fef2f2', badge: '#dc2626' },
  upcoming: { border: '#c4b5fd', bg: '#faf5ff', badge: '#7c3aed' },
  past: { border: '#e2e8f0', bg: '#f8fafc', badge: '#64748b' },
};

const TeleconsultSessionCard = ({
  session,
  role = 'client',
  onVetStart,
  busyId,
  highlight = false,
}) => {
  const timing = getTeleconsultTiming(session);
  const st = TELECONSULT_STATUS[session.status] || TELECONSULT_STATUS.scheduled;
  const skin = phaseStyle[timing.phase] || phaseStyle.upcoming;
  const id = getSessionId(session);

  const title =
    role === 'vet'
      ? `${session.owner?.name || session.clientName || 'Client'} — ${session.petName || 'Animal'}`
      : `${session.petName ? `${session.petName} — ` : ''}${session.reason || session.title || 'Consultation'}`;

  return (
    <article
      style={{
        padding: 16,
        borderRadius: 14,
        border: `2px solid ${highlight ? skin.badge : skin.border}`,
        background: highlight ? skin.bg : 'white',
        boxShadow: highlight ? `0 0 0 3px ${skin.border}55` : '0 2px 8px rgba(0,0,0,0.04)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, marginBottom: 10 }}>
        <div>
          <strong style={{ color: '#312e81', fontSize: 15 }}>{title}</strong>
          {role === 'client' && session.vetName && (
            <p style={{ margin: '4px 0 0', fontSize: 13, color: '#64748b', display: 'flex', alignItems: 'center', gap: 4 }}>
              <User size={13} /> Dr. {session.vetName}
            </p>
          )}
          {session.animalType && (
            <p style={{ margin: '2px 0 0', fontSize: 12, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 4 }}>
              <PawPrint size={12} /> {session.animalType}
            </p>
          )}
        </div>
        <div style={{ textAlign: 'right' }}>
          <span style={{
            display: 'inline-block',
            padding: '3px 10px',
            borderRadius: 999,
            fontSize: 11,
            fontWeight: 800,
            background: st.bg,
            color: st.color,
          }}
          >
            {st.label}
          </span>
          <p style={{ margin: '6px 0 0', fontSize: 12, color: skin.badge, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'flex-end' }}>
            <Clock size={12} /> {timing.label}
          </p>
        </div>
      </div>

      <p style={{ margin: '0 0 10px', fontSize: 13, color: '#64748b', display: 'flex', alignItems: 'center', gap: 6 }}>
        <Calendar size={14} />
        {formatSessionDateTime(session)}
      </p>

      {session.notes && (
        <p style={{ margin: '0 0 10px', fontSize: 13, color: '#475569', lineHeight: 1.5 }}>
          {session.notes}
        </p>
      )}

      <TeleconsultMeetPanel
        appointment={session}
        compact
        timing={timing}
        onVetStart={role === 'vet' ? () => onVetStart?.(session) : undefined}
        vetStarting={busyId === id}
      />

      {role === 'vet' && id && (
        <Link
          to={`/vet/appointments/${id}`}
          style={{ display: 'inline-block', marginTop: 10, fontSize: 12, fontWeight: 700, color: '#0369a1', textDecoration: 'none' }}
        >
          Ouvrir la fiche consultation →
        </Link>
      )}
    </article>
  );
};

export default TeleconsultSessionCard;
