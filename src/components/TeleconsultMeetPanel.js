import React from 'react';
import { Video, Mic, ExternalLink } from 'lucide-react';
import { isOnlineVisit } from '../constants/visitModes';

const TeleconsultMeetPanel = ({ appointment, compact = false }) => {
  const online = isOnlineVisit(appointment);
  if (!online && !appointment?.meetingLink) return null;

  const link = appointment?.meetingLink;
  const confirmed = appointment?.status === 'confirmed';
  const petLabel = appointment?.petName ? ` pour ${appointment.petName}` : '';

  const openMeet = () => {
    if (!link) return;
    window.open(link, '_blank', 'noopener,noreferrer');
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
      }}>
        📹 Téléconsultation{petLabel} — le lien Google Meet (caméra + micro) sera disponible après confirmation du vétérinaire.
      </div>
    );
  }

  return (
    <div style={{
      marginTop: compact ? 8 : 12,
      padding: compact ? '12px 14px' : '16px 18px',
      background: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)',
      border: '1px solid #c4b5fd',
      borderRadius: 14,
    }}>
      <div style={{ fontWeight: 800, color: '#5b21b6', marginBottom: 8, fontSize: compact ? 13 : 14 }}>
        📹 Téléconsultation Google Meet{petLabel}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12, fontSize: 12, color: '#6d28d9' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><Video size={14} /> Caméra activée</span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><Mic size={14} /> Micro activé</span>
      </div>
      <p style={{ margin: '0 0 12px', fontSize: 12, color: '#6b7280', lineHeight: 1.5 }}>
        Rejoignez la salle à l&apos;heure du RDV. Autorisez caméra et micro dans votre navigateur (Chrome recommandé).
      </p>
      <button
        type="button"
        onClick={openMeet}
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
          fontSize: 13,
          cursor: 'pointer',
          boxShadow: '0 4px 14px rgba(124,58,237,0.35)',
        }}
      >
        <Video size={18} />
        Rejoindre la téléconsultation
        <ExternalLink size={14} />
      </button>
      {!confirmed && (
        <p style={{ margin: '10px 0 0', fontSize: 11, color: '#9ca3af' }}>
          RDV encore en attente de confirmation — vous pouvez tester le lien avant l&apos;heure prévue.
        </p>
      )}
    </div>
  );
};

export default TeleconsultMeetPanel;
