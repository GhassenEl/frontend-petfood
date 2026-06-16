import React from 'react';

const RADIUS = 54;
const CIRC = 2 * Math.PI * RADIUS;

const PetWellnessScoreRing = ({ score = 0, label = 'Bien-être', levelLabel, levelColor = '#0f766e', size = 140 }) => {
  const pct = Math.min(100, Math.max(0, score)) / 100;
  const offset = CIRC * (1 - pct);
  const scale = size / 140;

  return (
    <div className="dtwin-score-ring" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox="0 0 120 120" aria-hidden>
        <circle cx="60" cy="60" r={RADIUS} fill="none" stroke="#e2e8f0" strokeWidth="10" />
        <circle
          cx="60"
          cy="60"
          r={RADIUS}
          fill="none"
          stroke={levelColor}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={CIRC}
          strokeDashoffset={offset}
          transform="rotate(-90 60 60)"
          style={{ transition: 'stroke-dashoffset 0.6s ease' }}
        />
      </svg>
      <div className="dtwin-score-ring__center" style={{ transform: `scale(${scale})` }}>
        <span className="dtwin-score-ring__num" style={{ color: levelColor }}>{score}</span>
        <span className="dtwin-score-ring__of">/100</span>
        <span className="dtwin-score-ring__label">{label}</span>
        {levelLabel && (
          <span className="dtwin-score-ring__level" style={{ color: levelColor }}>{levelLabel}</span>
        )}
      </div>
    </div>
  );
};

export default PetWellnessScoreRing;
