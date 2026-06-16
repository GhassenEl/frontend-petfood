import React from 'react';
import { Target, Megaphone } from 'lucide-react';

const AdminMarketingCampaignsPanel = ({ marketing }) => {
  const campaigns = marketing?.campaigns || [];

  return (
    <div className="mi-panel">
      <p className="mi-summary">
        <Megaphone size={16} aria-hidden /> {marketing?.summary || 'Campagnes suggérées par l\'IA.'}
      </p>
      <div className="mi-campaign-grid">
        {campaigns.map((c) => (
          <article key={c.id} className={`mi-campaign mi-campaign--${c.priority}`}>
            <Target size={18} aria-hidden />
            <h4>{c.title}</h4>
            <p><strong>Cible :</strong> {c.target}</p>
            <p><strong>Canal :</strong> {c.channel}</p>
            <p><strong>Offre :</strong> {c.offer}</p>
            <p className="mi-lift">Impact estimé : {c.expectedLift}</p>
            <p className="mi-reasons">{c.reason}</p>
          </article>
        ))}
      </div>
    </div>
  );
};

export default AdminMarketingCampaignsPanel;
