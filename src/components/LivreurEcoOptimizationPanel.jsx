import React from 'react';
import { Leaf } from 'lucide-react';

const LivreurEcoOptimizationPanel = ({ eco, loading }) => {
  if (loading) return <p className="livih-muted">Calcul empreinte…</p>;
  const e = eco || {};

  return (
    <div className="livih-panel">
      <p className="livih-summary">
        <Leaf size={16} aria-hidden />
        Tournées minimisant consommation de carburant et émissions de CO₂.
      </p>
      <div className="livih-eco-compare">
        <div className="livih-eco-col">
          <h4>Tournée actuelle</h4>
          <p>{e.current?.km} km</p>
          <p>{e.current?.fuelLiters} L carburant</p>
          <p><strong>{e.current?.co2Kg} kg CO₂</strong></p>
        </div>
        <div className="livih-eco-arrow">→</div>
        <div className="livih-eco-col livih-eco-col--green">
          <h4>Optimisée éco</h4>
          <p>{e.ecoOptimized?.km} km</p>
          <p>{e.ecoOptimized?.fuelLiters} L carburant</p>
          <p><strong>{e.ecoOptimized?.co2Kg} kg CO₂</strong></p>
          <span className="livih-badge livih-badge--green">-{e.ecoOptimized?.savedCo2Kg} kg CO₂</span>
        </div>
      </div>
      <p className="livih-ai-text">{e.aiSummary}</p>
      <h4>Conseils IA</h4>
      <ul className="livih-list livih-list--compact">
        {(e.tips || []).map((t, i) => (
          <li key={i}>🌱 {t}</li>
        ))}
      </ul>
    </div>
  );
};

export default LivreurEcoOptimizationPanel;
