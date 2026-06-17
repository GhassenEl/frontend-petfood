import React from 'react';
import { Link2, Truck, Leaf } from 'lucide-react';
import { CARBON_DELIVERY_STATS } from '../config/isoSustainabilityCatalog';

const CarbonDeliveryPanel = () => {
  const s = CARBON_DELIVERY_STATS;
  const maxCo2 = Math.max(...s.byZone.map((z) => z.co2Kg));

  return (
    <div id="carbon" className="pcmp-carbon-panel">
      <h3 style={{ margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
        <Leaf size={20} color="#0369a1" />
        Empreinte carbone des livraisons
      </h3>
      <p style={{ margin: '0 0 16px', fontSize: 13, color: '#64748b' }}>
        Période : {s.period} — {s.totalDeliveries.toLocaleString('fr-FR')} livraisons
      </p>

      <div className="pcmp-carbon-kpis">
        <div className="pcmp-sustain-kpi">
          <strong>{s.totalCo2Kg.toLocaleString('fr-FR')} kg</strong>
          <span>CO₂ émis</span>
        </div>
        <div className="pcmp-sustain-kpi">
          <strong>{s.savedCo2Kg} kg</strong>
          <span>CO₂ économisés (routes éco)</span>
        </div>
        <div className="pcmp-sustain-kpi">
          <strong>{s.avgPerDelivery} kg</strong>
          <span>Par livraison</span>
        </div>
        <div className="pcmp-sustain-kpi">
          <strong>{s.ecoRoutesPct}%</strong>
          <span>Tournées optimisées IA</span>
        </div>
      </div>

      <div style={{ marginTop: 16 }}>
        <p style={{ margin: '0 0 10px', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
          <Truck size={14} /> Répartition par zone
        </p>
        {s.byZone.map((z) => (
          <div key={z.zone} className="pcmp-carbon-row">
            <span className="pcmp-carbon-row__label">{z.zone}</span>
            <div className="pcmp-carbon-row__bar">
              <div style={{ width: `${(z.co2Kg / maxCo2) * 100}%` }} />
            </div>
            <span className="pcmp-carbon-row__val">{z.co2Kg} kg</span>
            <span className="pcmp-carbon-row__saved">−{z.saved} kg</span>
          </div>
        ))}
      </div>

      <p style={{ margin: '14px 0 0', fontSize: 12, color: '#94a3b8' }}>
        <Link2 size={10} style={{ verticalAlign: 'middle' }} />
        {' '}Optimisation via hub livreur — regroupement colis et itinéraires bas carbone
      </p>
    </div>
  );
};

export default CarbonDeliveryPanel;
