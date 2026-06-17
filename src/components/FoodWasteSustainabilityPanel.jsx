import React, { useMemo } from 'react';
import { Leaf, Recycle, Truck, Package } from 'lucide-react';

const FoodWasteSustainabilityPanel = () => {
  const stats = useMemo(() => ({
    wasteReducedKg: 1240,
    wasteReductionPct: 23,
    expiryAlertsPrevented: 89,
    co2SavedKg: 420,
    ecoPackagingPct: 78,
    carbonPerDelivery: 0.82,
  }), []);

  return (
    <div id="waste" className="pcmp-sustain-panel">
      <h3 style={{ margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: 8, fontSize: 17 }}>
        <Leaf size={20} color="#059669" />
        Développement durable &amp; réduction gaspillage
      </h3>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10, marginBottom: 16 }}>
        <div className="pcmp-sustain-kpi">
          <Recycle size={18} color="#059669" />
          <strong>{stats.wasteReducedKg} kg</strong>
          <span>Gaspillage évité (IA)</span>
        </div>
        <div className="pcmp-sustain-kpi">
          <strong>−{stats.wasteReductionPct}%</strong>
          <span>vs. année précédente</span>
        </div>
        <div className="pcmp-sustain-kpi">
          <strong>{stats.expiryAlertsPrevented}</strong>
          <span>Alertes péremption traitées</span>
        </div>
        <div className="pcmp-sustain-kpi" id="carbon">
          <Truck size={18} color="#0369a1" />
          <strong>{stats.co2SavedKg} kg CO₂</strong>
          <span>Économisés (routes éco)</span>
        </div>
      </div>

      <ul style={{ margin: 0, padding: '0 0 0 18px', fontSize: 13, color: '#475569', lineHeight: 1.8 }}>
        <li>
          <strong>IA anti-gaspillage</strong> — prédiction demande, redistribution lots proches péremption, don associations
        </li>
        <li>
          <strong>Surveillance péremption</strong> — ESP32-CAM PetFoodIoT, alertes client et vétérinaire
        </li>
        <li>
          <strong>Livraison bas carbone</strong> — regroupement colis, {stats.carbonPerDelivery} kg CO₂ / livraison moyenne
        </li>
        <li>
          <Package size={12} style={{ verticalAlign: 'middle' }} />
          {' '}
          <strong>Emballages écologiques</strong> — {stats.ecoPackagingPct}% matériaux recyclables / compostables
        </li>
      </ul>
    </div>
  );
};

export default FoodWasteSustainabilityPanel;
