import React, { useEffect, useState } from 'react';
import { QUALITY_LABELS } from '../utils/foodQualityEngine';

/** Aperçu visuel temps réel simulé (couleur croquettes + alertes moisissure). */
const FoodQualityLiveViewport = ({ reading, isLive, lastTickAt }) => {
  const [pulse, setPulse] = useState(false);
  const [clock, setClock] = useState(() => Date.now());

  useEffect(() => {
    if (!isLive || !lastTickAt) return undefined;
    const id = setInterval(() => setClock(Date.now()), 1000);
    return () => clearInterval(id);
  }, [isLive, lastTickAt]);

  useEffect(() => {
    if (!isLive) return undefined;
    setPulse(true);
    const t = setTimeout(() => setPulse(false), 600);
    return () => clearTimeout(t);
  }, [reading?.analyzedAt, isLive]);

  const cur = reading || {};
  const meta = QUALITY_LABELS[cur.quality] || QUALITY_LABELS.good;
  const mold = (cur.moldPixelRatio ?? 0) * 100;
  const r = cur.avgR ?? 140;
  const g = cur.avgG ?? 110;
  const b = cur.avgB ?? 70;

  const secsAgo = lastTickAt
    ? Math.max(0, Math.round((clock - lastTickAt) / 1000))
    : null;

  return (
    <div className={`iot-fq-viewport iot-fq-viewport--${cur.quality || 'good'}${pulse ? ' iot-fq-viewport--pulse' : ''}`}>
      <div className="iot-fq-viewport__cam" style={{ background: `rgb(${r}, ${g}, ${b})` }}>
        <div className="iot-fq-viewport__grain" aria-hidden />
        {mold > 3 && (
          <div
            className="iot-fq-viewport__mold"
            style={{ opacity: Math.min(0.9, mold / 15) }}
            aria-hidden
          />
        )}
        <div className="iot-fq-viewport__overlay">
          {isLive && (
            <span className="iot-fq-live-badge">
              <span className="iot-fq-live-dot" /> LIVE
            </span>
          )}
          <span className="iot-fq-viewport__score">{cur.qualityScore ?? '—'}/100</span>
        </div>
      </div>
      <div className="iot-fq-viewport__meta">
        <strong style={{ color: meta.color }}>{meta.icon} {meta.label}</strong>
        <span>
          {secsAgo != null ? `MAJ il y a ${secsAgo}s` : 'En attente…'}
          {' · '}
          ESP32-CAM · {cur.temperatureC ?? '—'} °C · {cur.humidityPct ?? '—'} % HR
        </span>
      </div>
    </div>
  );
};

export default FoodQualityLiveViewport;
