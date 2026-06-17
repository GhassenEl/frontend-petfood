import React from 'react';
import { Link } from 'react-router-dom';
import { getPlatformComplianceDashboard } from '../utils/platformComplianceEngine';

const PlatformComplianceBadges = ({ compact = false, linkToPage = true }) => {
  const dash = getPlatformComplianceDashboard();
  const highlights = [
    { icon: '🛡️', label: 'ISO 22000' },
    { icon: '🌿', label: 'ISO 14001' },
    { icon: '✅', label: 'ISO 9001' },
    { icon: '🌍', label: 'FSSC 22000' },
    { icon: '♻️', label: 'Éco-responsable' },
  ];

  if (compact) {
    return (
      <div className="pcmp-badges pcmp-badges--compact">
        {highlights.map((b) => (
          <span key={b.label} className="pcmp-badge" title={b.label}>
            {b.icon} {b.label}
          </span>
        ))}
        {linkToPage && (
          <Link to="/compliance" className="pcmp-badge pcmp-badge--link">
            +{dash.verifiedCount} certifs →
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="pcmp-badges">
      <p className="pcmp-badges__lead">
        Plateforme certifiée ISO &amp; engagée environnement — {dash.verifiedCount} certifications mondiales vérifiées.
      </p>
      <div className="pcmp-badges__grid">
        {highlights.map((b) => (
          <span key={b.label} className="pcmp-badge">
            <span className="pcmp-badge__icon">{b.icon}</span>
            {b.label}
          </span>
        ))}
      </div>
      {linkToPage && (
        <Link to="/compliance" className="pcmp-badges__cta">
          Voir toutes les certifications ISO &amp; environnement →
        </Link>
      )}
    </div>
  );
};

export default PlatformComplianceBadges;
