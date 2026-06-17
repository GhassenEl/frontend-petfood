import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Lock, CheckCircle2, ExternalLink } from 'lucide-react';
import { ISO_CORE_FEATURES } from '../config/isoSustainabilityCatalog';

const IsoCompliancePanel = () => {
  const iso27001 = ISO_CORE_FEATURES.find((f) => f.id === 'iso-27001');
  const iso9001 = ISO_CORE_FEATURES.find((f) => f.id === 'iso-9001');

  return (
    <div id="iso-27001" className="pcmp-iso-panel">
      <h2 style={{ margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
        <Shield size={22} color="#0369a1" />
        Normes ISO — sécurité &amp; qualité
      </h2>

      <div className="pcmp-iso-grid">
        {[iso27001, iso9001].filter(Boolean).map((iso) => (
          <article key={iso.id} className="pcmp-iso-card" id={iso.id}>
            <div className="pcmp-iso-card__head">
              <div>
                <strong>{iso.code}</strong>
                <p>{iso.label}</p>
              </div>
              <span className="pcmp-iso-badge">
                <CheckCircle2 size={12} /> {iso.status}
              </span>
            </div>
            <p className="pcmp-iso-card__desc">{iso.description}</p>
            <ul className="pcmp-iso-controls">
              {iso.controls.map((c) => (
                <li key={c}><Lock size={10} /> {c}</li>
              ))}
            </ul>
            <Link to={iso.route} className="pcmp-iso-link">
              Voir les contrôles <ExternalLink size={12} />
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
};

export default IsoCompliancePanel;
