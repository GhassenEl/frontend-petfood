import React from 'react';
import { Pill, Stethoscope } from 'lucide-react';
import MedicationSchedule from './MedicationSchedule';
import { parseMedications } from '../utils/prescriptionHelpers';

const cardStyle = {
  background: '#fafafa',
  border: '1px solid #e5e7eb',
  borderRadius: 14,
  padding: 16,
};

const ClientPrescriptionCard = ({ prescription: rx, showSchedule = true }) => {
  if (!rx) return null;
  const meds = parseMedications(rx.medications);
  const vetName = rx.vet?.name || rx.vetName;
  const animalLabel = rx.petName
    ? `${rx.petName}${rx.animalType ? ` (${rx.animalType})` : ''}`
    : null;

  return (
    <article style={cardStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 10 }}>
        <div>
          <div style={{ fontWeight: 900, color: '#111827', fontSize: 15 }}>
            💊 Ordonnance — {new Date(rx.createdAt).toLocaleDateString('fr-FR')}
          </div>
          {animalLabel && (
            <div style={{ fontSize: 13, color: '#374151', marginTop: 4, fontWeight: 600 }}>
              🐾 {animalLabel}
            </div>
          )}
        </div>
        {rx.status && (
          <span
            style={{
              fontSize: 12,
              fontWeight: 700,
              padding: '4px 10px',
              borderRadius: 999,
              background: rx.status === 'active' ? '#dcfce7' : '#f3f4f6',
              color: rx.status === 'active' ? '#166534' : '#6b7280',
              alignSelf: 'flex-start',
            }}
          >
            {rx.status === 'active' ? 'Active' : rx.status}
          </span>
        )}
      </div>

      {vetName && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontSize: 13,
            color: '#0369a1',
            marginBottom: 12,
            padding: '8px 12px',
            background: '#f0f9ff',
            borderRadius: 10,
          }}
        >
          <Stethoscope size={16} />
          <span>
            Prescrit par <strong>Dr. {vetName}</strong>
            {rx.vet?.email ? ` · ${rx.vet.email}` : ''}
          </span>
        </div>
      )}

      {rx.consultation?.diagnosis && (
        <p style={{ margin: '0 0 10px', fontSize: 13, color: '#4b5563' }}>
          <strong>Contexte :</strong> {rx.consultation.diagnosis}
        </p>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {meds.map((med, idx) => (
          <div key={idx} style={{ fontSize: 13, color: '#374151', display: 'flex', gap: 8, alignItems: 'flex-start' }}>
            <Pill size={14} style={{ flexShrink: 0, marginTop: 2, color: '#8b5cf6' }} />
            <span>
              <strong>{med.name || 'Médicament'}</strong>
              {med.dosage ? ` — ${med.dosage}` : ''}
              {med.frequency ? ` (${med.frequency})` : ''}
              {med.duration ? ` · ${med.duration}` : ''}
            </span>
          </div>
        ))}
      </div>

      {rx.instructions && (
        <p style={{ margin: '12px 0 0', fontSize: 13, color: '#4b5563', whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>
          <strong>Instructions :</strong> {rx.instructions}
        </p>
      )}

      {showSchedule && meds.length > 0 && <MedicationSchedule medications={meds} />}

      {rx.validUntil && (
        <p style={{ margin: '10px 0 0', fontSize: 12, color: '#9ca3af' }}>
          Valide jusqu&apos;au {new Date(rx.validUntil).toLocaleDateString('fr-FR')}
        </p>
      )}
    </article>
  );
};

export default ClientPrescriptionCard;
