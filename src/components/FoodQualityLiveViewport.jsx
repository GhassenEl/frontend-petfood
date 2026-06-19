import React, { useEffect, useState } from 'react';

import { QUALITY_LABELS } from '../utils/foodQualityEngine';

import Esp32CamStreamPlayer from './Esp32CamStreamPlayer';



/** Vue caméra ESP32-CAM — vidéo MP4/MJPEG + capteurs temps réel. */

const FoodQualityLiveViewport = ({ reading, device, stream, isLive, lastTickAt }) => {

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



  const secsAgo = lastTickAt

    ? Math.max(0, Math.round((clock - lastTickAt) / 1000))

    : null;



  return (

    <div className={`iot-fq-viewport iot-fq-viewport--food iot-fq-viewport--${cur.quality || 'good'}${pulse ? ' iot-fq-viewport--pulse' : ''}`}>

      <p className="iot-live-feed__title">🍽️ Nourriture LIVE</p>

      <Esp32CamStreamPlayer

        device={device}

        stream={stream}

        reading={cur}

        isLive={isLive}

        lastTickAt={lastTickAt}

        refreshMs={5000}

        overlay={mold > 3 ? (

          <div

            className="iot-fq-viewport__mold iot-fq-viewport__mold--overlay"

            style={{ opacity: Math.min(0.9, mold / 15) }}

            aria-hidden

          />

        ) : null}

      />

      <div className="iot-fq-viewport__meta">

        <strong style={{ color: meta.color }}>{meta.icon} {meta.label}</strong>

        <span>

          Stock {cur.stockLevelPct ?? '—'} % · Croquettes + compléments

          {' · '}

          {secsAgo != null ? `MAJ il y a ${secsAgo}s` : 'En attente…'}

          {' · '}

          {cur.temperatureC ?? '—'} °C · {cur.humidityPct ?? '—'} % HR

        </span>

      </div>

    </div>

  );

};



export default FoodQualityLiveViewport;

