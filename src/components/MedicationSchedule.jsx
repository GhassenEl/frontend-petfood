import React from 'react';
import { buildMedicationSchedule } from '../utils/medications';

const MedicationSchedule = ({ medications }) => {
  const meds = Array.isArray(medications) ? medications : [];
  if (!meds.length) return null;

  return (
    <div style={{ marginTop: 12 }}>
      <p style={{ margin: '0 0 8px', fontSize: 13, fontWeight: 700, color: '#374151' }}>
        📅 Plan de prise
      </p>
      {meds.map((med, i) => {
        const schedule = buildMedicationSchedule(med);
        return (
          <div
            key={i}
            style={{
              padding: 12,
              borderRadius: 10,
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              marginBottom: 8,
            }}
          >
            <strong style={{ fontSize: 14 }}>{med.name}</strong>
            <span style={{ fontSize: 12, color: '#64748b', marginLeft: 8 }}>
              {med.dosage} · {med.duration}
            </span>
            {schedule.slots ? (
              <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
                {['matin', 'midi', 'soir'].map((slot) => (
                  <span
                    key={slot}
                    style={{
                      padding: '4px 10px',
                      borderRadius: 8,
                      fontSize: 12,
                      fontWeight: 600,
                      background: schedule.slots[slot] ? '#059669' : '#e5e7eb',
                      color: schedule.slots[slot] ? 'white' : '#9ca3af',
                      textTransform: 'capitalize',
                    }}
                  >
                    {slot}
                  </span>
                ))}
              </div>
            ) : (
              <p style={{ margin: '6px 0 0', fontSize: 12, color: '#047857' }}>{schedule.label}</p>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default MedicationSchedule;
