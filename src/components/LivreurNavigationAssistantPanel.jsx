import React from 'react';
import { Navigation, ExternalLink } from 'lucide-react';

const LivreurNavigationAssistantPanel = ({ navigation, loading }) => {
  if (loading) return <p className="livih-muted">Calcul itinéraires…</p>;
  const n = navigation || {};

  return (
    <div className="livih-panel">
      <p className="livih-summary">
        <Navigation size={16} aria-hidden />
        Proposition d&apos;itinéraires alternatifs en cas d&apos;embouteillage ou route bloquée.
      </p>
      <p className="livih-ai-text">{n.aiSummary}</p>
      <div className="livih-route-grid">
        {(n.routes || []).map((r) => (
          <div key={r.id} className={`livih-route-card${r.recommended ? ' livih-route-card--rec' : ''}`}>
            <h4>{r.label}{r.recommended && ' ★'}</h4>
            <p>{r.km} km · {r.minutes} min · Éco {r.ecoScore}/100</p>
            {r.tolls && <span className="livih-tag">Péage</span>}
            {r.reason && <p className="livih-muted-inline">{r.reason}</p>}
            <a href={r.mapsUrl} target="_blank" rel="noopener noreferrer" className="livih-link">
              <ExternalLink size={14} /> Ouvrir Maps
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LivreurNavigationAssistantPanel;
