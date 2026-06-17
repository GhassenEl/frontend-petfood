import React from 'react';
import { Link } from 'react-router-dom';
import { Link2, Users, ExternalLink } from 'lucide-react';
import { ISO_CORE_FEATURES } from '../config/isoSustainabilityCatalog';
import { ROLE_CAPABILITIES } from '../config/roleCapabilities';

const RbacTraceabilityPanel = () => {
  const trace = ISO_CORE_FEATURES.find((f) => f.id === 'traceability');
  const rbac = ISO_CORE_FEATURES.find((f) => f.id === 'rbac');

  return (
    <div className="pcmp-rbac-panel">
      <h2 style={{ margin: '0 0 16px' }}>Traçabilité &amp; gestion des accès (RBAC)</h2>

      <div className="pcmp-rbac-grid">
        <article className="pcmp-rbac-card" id="traceability">
          <h3><Link2 size={18} /> {trace?.label}</h3>
          <p>{trace?.description}</p>
          <ul>
            {trace?.controls.map((c) => <li key={c}>{c}</li>)}
          </ul>
          <Link to="/client-traceability" className="pcmp-iso-link">
            Explorateur blockchain <ExternalLink size={12} />
          </Link>
        </article>

        <article className="pcmp-rbac-card" id="rbac">
          <h3><Users size={18} /> {rbac?.label}</h3>
          <p>{rbac?.description}</p>
          <div className="pcmp-rbac-roles">
            {ROLE_CAPABILITIES.filter((r) => r.auth !== false || r.id === 'visitor').slice(0, 7).map((r) => (
              <span key={r.id} className="pcmp-rbac-role">
                {r.icon} {r.label}
              </span>
            ))}
          </div>
          <Link to="/capabilities" className="pcmp-iso-link">
            Matrice complète <ExternalLink size={12} />
          </Link>
        </article>
      </div>
    </div>
  );
};

export default RbacTraceabilityPanel;
