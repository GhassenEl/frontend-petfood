import React, { useMemo } from 'react';

const COMPLEMENTS = [
  { id: 'omega', label: 'Oméga-3', icon: '🐟', color: '#0ea5e9' },
  { id: 'vitamins', label: 'Vitamines', icon: '💊', color: '#8b5cf6' },
  { id: 'probio', label: 'Probiotiques', icon: '🌿', color: '#059669' },
];

/** Génère des positions pseudo-aléatoires stables pour les croquettes visibles. */
function buildKibbleDots(seed, count = 28) {
  const dots = [];
  let s = seed;
  for (let i = 0; i < count; i += 1) {
    s = (s * 9301 + 49297) % 233280;
    const x = 18 + (s % 6400) / 100;
    const y = 35 + ((s * 7) % 4500) / 100;
    const size = 5 + (s % 4);
    dots.push({ id: i, x, y, size, rot: s % 360 });
  }
  return dots;
}

/**
 * Scène live ESP32-CAM — bac croquettes + compléments alimentaires.
 * Niveau de remplissage et teinte pilotés par la lecture capteur.
 */
const PetFoodLiveScene = ({ reading, isLive }) => {
  const cur = reading || {};
  const stock = Math.min(100, Math.max(8, cur.stockLevelPct ?? 65));
  const r = cur.avgR ?? 165;
  const g = cur.avgG ?? 120;
  const b = cur.avgB ?? 75;
  const mold = (cur.moldPixelRatio ?? 0) * 100;

  const kibbleDots = useMemo(
    () => buildKibbleDots(Math.round(stock * 100 + r + g)),
    [stock, r, g],
  );

  const fillHeight = `${stock}%`;
  const kibbleTone = `rgb(${r}, ${g}, ${b})`;
  const kibbleDark = `rgb(${Math.max(0, r - 35)}, ${Math.max(0, g - 25)}, ${Math.max(0, b - 15)})`;

  return (
    <div className={`iot-petfood-scene${isLive ? ' iot-petfood-scene--live' : ''}`}>
      <div
        className="iot-petfood-scene__bg"
        style={{ backgroundImage: 'url(/images/iot/bowl-kibble.jpg)' }}
        aria-hidden
      />

      <div className="iot-petfood-scene__layout">
        <div className="iot-petfood-scene__bowl-wrap">
          <div className="iot-petfood-scene__bowl-rim" aria-hidden />
          <div className="iot-petfood-scene__bowl-inner">
            <div
              className="iot-petfood-scene__kibble-mass"
              style={{
                height: fillHeight,
                background: `linear-gradient(180deg, ${kibbleTone} 0%, ${kibbleDark} 100%)`,
              }}
            >
              <div className="iot-petfood-scene__kibble-grain" aria-hidden />
              {kibbleDots.map((dot) => (
                <span
                  key={dot.id}
                  className="iot-petfood-scene__kibble-dot"
                  style={{
                    left: `${dot.x}%`,
                    bottom: `${Math.min(stock - 5, dot.y * (stock / 100))}%`,
                    width: dot.size,
                    height: dot.size * 0.72,
                    transform: `rotate(${dot.rot}deg)`,
                  }}
                  aria-hidden
                />
              ))}
            </div>
            {mold > 3 && (
              <div
                className="iot-petfood-scene__mold"
                style={{ opacity: Math.min(0.85, mold / 14) }}
                aria-hidden
              />
            )}
          </div>
          <span className="iot-petfood-scene__bowl-label">🥣 Croquettes</span>
        </div>

        <div className="iot-petfood-scene__complements">
          <p className="iot-petfood-scene__complements-title">Compléments</p>
          {COMPLEMENTS.map((item, idx) => (
            <div
              key={item.id}
              className="iot-petfood-scene__complement"
              style={{
                borderColor: item.color,
                animationDelay: `${idx * 0.4}s`,
              }}
            >
              <span className="iot-petfood-scene__complement-icon">{item.icon}</span>
              <span className="iot-petfood-scene__complement-label">{item.label}</span>
              <span className="iot-petfood-scene__complement-stock">OK</span>
            </div>
          ))}
        </div>
      </div>

      <div className="iot-petfood-scene__tags">
        <span className="iot-petfood-scene__tag">Croquettes {stock} %</span>
        <span className="iot-petfood-scene__tag">3 compléments</span>
      </div>
    </div>
  );
};

export default PetFoodLiveScene;
