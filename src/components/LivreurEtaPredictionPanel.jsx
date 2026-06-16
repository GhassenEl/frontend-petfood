import React, { useState } from 'react';
import { Clock, CloudRain, Car } from 'lucide-react';
import { predictDeliveryEta } from '../utils/livreurIntelligenceEngine';

const LivreurEtaPredictionPanel = ({ eta, stops, loading }) => {
  const [traffic, setTraffic] = useState(eta?.traffic || 'moderate');
  const [weather, setWeather] = useState(eta?.weather || 'clear');
  const [live, setLive] = useState(eta);

  const recalc = () => {
    setLive(predictDeliveryEta({ stops, traffic, weather, stopCount: stops?.length || 3 }));
  };

  if (loading) return <p className="livih-muted">Estimation ETA…</p>;

  const e = live || eta || {};

  return (
    <div className="livih-panel">
      <p className="livih-summary">
        <Clock size={16} aria-hidden />
        Estimation dynamique de l&apos;heure d&apos;arrivée selon trafic, météo et nombre de livraisons.
      </p>
      <div className="livih-filters">
        <label>
          <Car size={14} /> Trafic
          <select value={traffic} onChange={(ev) => setTraffic(ev.target.value)}>
            <option value="light">Fluide</option>
            <option value="moderate">Modéré</option>
            <option value="heavy">Dense</option>
            <option value="blocked">Bloqué</option>
          </select>
        </label>
        <label>
          <CloudRain size={14} /> Météo
          <select value={weather} onChange={(ev) => setWeather(ev.target.value)}>
            <option value="clear">Dégagé</option>
            <option value="rain">Pluie</option>
            <option value="heat">Chaleur</option>
            <option value="wind">Vent</option>
          </select>
        </label>
        <button type="button" className="livih-btn" onClick={recalc}>Recalculer ETA</button>
      </div>
      <div className="livih-stat-hero">
        <strong>{e.totalMinutes ?? '—'} min</strong>
        <span>ETA totale tournée (+{e.bufferMinutes ?? 0} min marge)</span>
      </div>
      <p className="livih-ai-text">{e.aiSummary}</p>
      <ul className="livih-list">
        {(e.perStop || []).map((s, i) => (
          <li key={s.orderId || i} className="livih-card">
            <strong>Arrêt {i + 1}</strong>
            <span>{s.etaMinutes} min · fenêtre {s.window}</span>
            {s.address && <p>{s.address}</p>}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default LivreurEtaPredictionPanel;
