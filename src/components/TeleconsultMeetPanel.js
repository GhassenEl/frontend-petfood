import React, { useEffect, useState } from 'react';
import { Video, Mic, ExternalLink, Copy, Check } from 'lucide-react';
import { isOnlineVisit } from '../constants/visitModes';
import { copyMeetingLink, getTeleconsultTiming } from '../utils/teleconsultUtils';

const TeleconsultMeetPanel = ({
  appointment,
  compact = false,
  timing: timingProp,
  onVetStart,
  vetStarting = false,
}) => {
  const online = isOnlineVisit(appointment);
  const [copied, setCopied] = useState(false);
  const [timing, setTiming] = useState(timingProp || getTeleconsultTiming(appointment));

  useEffect(() => {
    if (timingProp) {
      setTiming(timingProp);
      return undefined;
    }
    const tick = () => setTiming(getTeleconsultTiming(appointment));
    tick();
    const id = window.setInterval(tick, 30000);
    return () => window.clearInterval(id);
  }, [appointment, timingProp]);

  if (!online && !appointment?.meetingLink) return null;

  const link = appointment?.meetingLink;
  const confirmed = appointment?.status === 'confirmed' || appointment?.status === 'scheduled';
  const petLabel = appointment?.petName ? ` pour ${appointment.petName}` : '';
  const canJoin = timing?.canJoin && !!link;
  const isLive = timing?.phase === 'live' || timing?.phase === 'joinable';

  const openMeet = () => {
    if (!link) return;
    window.open(link, '_blank', 'noopener,noreferrer');
  };

  const handleCopy = async () => {
    const ok = await copyMeetingLink(link);
    if (ok) {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!link) {
    return (
      <div style={{
        marginTop: compact ? 8 : 12,
        padding: compact ? '10px 12px' : '14px 16px',
        background: '#f5f3ff',
        border: '1px solid #ddd6fe',
        borderRadius: 12,
        fontSize: 13,
        color: '#5b21b6',
      }}
      >
        📹 Téléconsultation{petLabel} — le lien Google Meet sera disponible après confirmation du vétérinaire.
        {timing?.label && (
          <span style={{ display: 'block', marginTop: 6, fontSize: 12, color: '#7c3aed', fontWeight: 700 }}>
            {timing.label}
          </span>
        )}
      </div>
    );
  }

  return (
    <div style={{
      marginTop: compact ? 8 : 12,
      padding: compact ? '12px 14px' : '16px 18px',
      background: isLive
        ? 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)'
        : 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)',
      border: `1px solid ${isLive ? '#86efac' : '#c4b5fd'}`,
      borderRadius: 14,
    }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
        <div style={{ fontWeight: 800, color: isLive ? '#047857' : '#5b21b6', fontSize: compact ? 13 : 14 }}>
          📹 {isLive ? 'Salle ouverte' : 'Téléconsultation Google Meet'}{petLabel}
        </div>
        {timing?.label && (
          <span style={{
            fontSize: 11,
            fontWeight: 800,
            padding: '3px 8px',
            borderRadius: 999,
            background: isLive ? '#bbf7d0' : '#e9d5ff',
            color: isLive ? '#166534' : '#6b21a8',
          }}
          >
            {timing.label}
          </span>
        )}
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 10, fontSize: 12, color: '#6d28d9' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><Video size={14} /> Caméra</span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><Mic size={14} /> Micro</span>
      </div>

      <p style={{ margin: '0 0 12px', fontSize: 12, color: '#6b7280', lineHeight: 1.5 }}>
        {canJoin
          ? 'Vous pouvez rejoindre la salle. Autorisez caméra et micro dans votre navigateur.'
          : 'La salle s\'ouvre 15 minutes avant l\'heure du rendez-vous.'}
      </p>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {onVetStart ? (
          <button
            type="button"
            onClick={onVetStart}
            disabled={vetStarting}
            style={primaryBtnStyle(canJoin || !!link)}
          >
            <Video size={18} />
            {vetStarting ? 'Ouverture…' : 'Démarrer / Rejoindre Meet'}
            <ExternalLink size={14} />
          </button>
        ) : (
          <button
            type="button"
            onClick={openMeet}
            disabled={!canJoin && !confirmed}
            style={primaryBtnStyle(canJoin)}
          >
            <Video size={18} />
            Rejoindre la téléconsultation
            <ExternalLink size={14} />
          </button>
        )}

        <button
          type="button"
          onClick={handleCopy}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '10px 14px',
            background: 'white',
            color: '#5b21b6',
            border: '1px solid #c4b5fd',
            borderRadius: 12,
            fontWeight: 700,
            fontSize: 13,
            cursor: 'pointer',
          }}
        >
          {copied ? <Check size={16} /> : <Copy size={16} />}
          {copied ? 'Copié' : 'Copier le lien'}
        </button>
      </div>

      {!confirmed && (
        <p style={{ margin: '10px 0 0', fontSize: 11, color: '#9ca3af' }}>
          RDV en attente de confirmation — le lien est réservé à votre créneau.
        </p>
      )}
    </div>
  );
};

const primaryBtnStyle = (active) => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8,
  padding: '12px 18px',
  background: active ? '#7c3aed' : '#a78bfa',
  color: 'white',
  border: 'none',
  borderRadius: 12,
  fontWeight: 700,
  fontSize: 13,
  cursor: active ? 'pointer' : 'not-allowed',
  opacity: active ? 1 : 0.85,
  boxShadow: active ? '0 4px 14px rgba(124,58,237,0.35)' : 'none',
});

export default TeleconsultMeetPanel;
