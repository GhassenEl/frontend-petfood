import React from 'react';
import { Link } from 'react-router-dom';
import { Leaf, ExternalLink } from 'lucide-react';
import { SUSTAINABILITY_FEATURES } from '../config/isoSustainabilityCatalog';
import CarbonDeliveryPanel from './CarbonDeliveryPanel';

const FoodWasteSustainabilityPanel = () => (
  <div id="waste" className="pcmp-sustain-panel">
    <h2 style={{ margin: '0 0 8px', display: 'flex', alignItems: 'center', gap: 8, fontSize: 1.25 }}>
      <Leaf size={22} color="#059669" />
      Environnement &amp; développement durable
    </h2>
    <p style={{ margin: '0 0 20px', fontSize: 14, color: '#64748b' }}>
      IA anti-gaspillage, péremption, logistique verte et emballages responsables.
    </p>

    <div className="pcmp-sustain-grid">
      {SUSTAINABILITY_FEATURES.map((f) => {
        const href = f.anchor ? `${f.route}#${f.anchor}` : f.route;
        return (
          <article key={f.id} id={f.id} className="pcmp-sustain-card">
            <span className="pcmp-sustain-card__icon">{f.icon}</span>
            <div>
              <strong>{f.label}</strong>
              <p>{f.description}</p>
              <div className="pcmp-sustain-card__foot">
                <span className="pcmp-iso-badge">{f.metric}</span>
                <Link to={href} className="pcmp-iso-link">
                  Accéder <ExternalLink size={11} />
                </Link>
              </div>
            </div>
          </article>
        );
      })}
    </div>

    <div style={{ marginTop: 24 }} id="packaging">
      <CarbonDeliveryPanel />
    </div>
  </div>
);

export default FoodWasteSustainabilityPanel;
