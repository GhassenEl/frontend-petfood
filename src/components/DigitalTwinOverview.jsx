import React from 'react';
import PetWellnessScoreRing from './PetWellnessScoreRing';

const DIM_LABELS = {
  nutrition: { label: 'Alimentation', icon: '🥗', color: '#059669' },
  veterinary: { label: 'Vétérinaire', icon: '🩺', color: '#0f766e' },
  activity: { label: 'Activité', icon: '🏃', color: '#6366f1' },
  medical: { label: 'Médical', icon: '📋', color: '#7c3aed' },
};

const DigitalTwinOverview = ({ twin }) => {
  if (!twin) return null;
  const { identity, wellness } = twin;
  const dims = wellness?.dimensions || {};

  return (
    <div className="dtwin-overview">
      <section className="dtwin-hero">
        <div className="dtwin-hero__identity">
          <span className="dtwin-hero__emoji" aria-hidden>{identity.emoji}</span>
          <div>
            <h2>{identity.name}</h2>
            <p className="dtwin-muted">
              {identity.breed} · {identity.type}
              {identity.ageYears != null ? ` · ${identity.ageYears} ans` : ''}
              {identity.weightKg != null ? ` · ${identity.weightKg} kg` : ''}
            </p>
            {identity.passportNumber && (
              <p className="dtwin-passport-id">{identity.passportNumber}</p>
            )}
          </div>
        </div>
        <PetWellnessScoreRing
          score={wellness.overall}
          levelLabel={wellness.levelLabel}
          levelColor={wellness.levelColor}
          size={150}
        />
      </section>

      <p className="dtwin-summary">{wellness.summary}</p>

      <div className="dtwin-dim-grid">
        {Object.entries(DIM_LABELS).map(([key, meta]) => (
          <div key={key} className="dtwin-dim-card">
            <div className="dtwin-dim-card__head">
              <span aria-hidden>{meta.icon}</span>
              <span>{meta.label}</span>
              <strong style={{ color: meta.color }}>{dims[key] ?? 0}</strong>
            </div>
            <div className="dtwin-bar">
              <div
                className="dtwin-bar__fill"
                style={{ width: `${dims[key] ?? 0}%`, background: meta.color }}
              />
            </div>
          </div>
        ))}
      </div>

      {(wellness.factors || []).length > 0 && (
        <section className="dtwin-card">
          <h3>Facteurs du score</h3>
          <ul className="dtwin-factor-list">
            {wellness.factors.map((f) => (
              <li key={`${f.dim}-${f.label}`}>
                <span>{f.label}</span>
                <strong className={f.pts >= 0 ? 'dtwin-pos' : 'dtwin-neg'}>
                  {f.pts >= 0 ? '+' : ''}{f.pts}
                </strong>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
};

export default DigitalTwinOverview;
