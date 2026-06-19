import React, { useEffect, useState } from 'react';

/** Aperçu live fontaine connectée — niveau réservoir, consommation, flux. */
const WaterLiveViewport = ({ water, isLive, lastTickAt }) => {
  const [clock, setClock] = useState(() => Date.now());
  const [wave, setWave] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setClock(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!isLive) return undefined;
    const id = setInterval(() => setWave((w) => (w + 1) % 360), 120);
    return () => clearInterval(id);
  }, [isLive]);

  const monitor = water?.monitor || {};
  const capacity = monitor.reservoirCapacityMl || 1500;
  const level = monitor.reservoirMl ?? Math.round((water?.percentOfTarget || 70) / 100 * capacity);
  const fillPct = Math.min(100, Math.max(8, Math.round((level / capacity) * 100)));
  const temp = monitor.waterTempC ?? 19;
  const todayMl = water?.todayMl ?? 0;
  const targetMl = water?.targetMl ?? 550;
  const pumpActive = monitor.pumpActive || isLive;
  const online = monitor.online !== false;

  const secsAgo = lastTickAt
    ? Math.max(0, Math.round((clock - lastTickAt) / 1000))
    : null;

  return (
    <div className={`iot-water-viewport${online ? '' : ' iot-water-viewport--offline'}`}>
      <div className="iot-water-viewport__bowl">
        <div
          className={`iot-water-viewport__water${pumpActive ? ' iot-water-viewport__water--flow' : ''}`}
          style={{
            height: `${fillPct}%`,
            transform: pumpActive ? `translateY(${Math.sin(wave * 0.08) * 2}px)` : undefined,
          }}
        />
        <div className="iot-water-viewport__surface" aria-hidden />
        {isLive && (
          <span className="iot-fq-live-badge iot-water-viewport__live">
            <span className="iot-fq-live-dot" /> LIVE
          </span>
        )}
        <span className="iot-water-viewport__level">{fillPct}%</span>
      </div>
      <div className="iot-water-viewport__meta">
        <strong>💧 {monitor.name || 'Fontaine connectée'}</strong>
        <span>
          {secsAgo != null ? `MAJ il y a ${secsAgo}s` : 'En attente…'}
          {' · '}
          Réservoir {level}/{capacity} ml
          {' · '}
          {temp} °C
        </span>
        <span className="iot-water-viewport__stats">
          Aujourd&apos;hui : <strong>{todayMl} ml</strong> / {targetMl} ml objectif
          {pumpActive ? ' · Flux actif' : ''}
        </span>
      </div>
    </div>
  );
};

export default WaterLiveViewport;
