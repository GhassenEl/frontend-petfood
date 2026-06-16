import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

const typeIcon = {
  nutrition: '🥗',
  health: '⚠️',
  activity: '🏃',
  veterinary: '🩺',
};

const DigitalTwinAiPanel = ({ twin }) => {
  const recs = twin?.aiRecommendations || [];

  return (
    <div className="dtwin-panel">
      <section className="dtwin-card dtwin-ai-intro">
        <Sparkles size={22} aria-hidden />
        <div>
          <h3>Recommandations IA personnalisées</h3>
          <p className="dtwin-muted">
            Synthèse croisée alimentation, activité, dossier médical et risques détectés.
          </p>
        </div>
      </section>

      {!recs.length ? (
        <p className="dtwin-muted">Aucune recommandation pour le moment.</p>
      ) : (
        <div className="dtwin-ai-grid">
          {recs.map((r) => (
            <article
              key={r.id}
              className={`dtwin-card dtwin-ai-card dtwin-ai-card--${r.priority || 'medium'}`}
            >
              <span className="dtwin-ai-icon" aria-hidden>{typeIcon[r.type] || '✨'}</span>
              <h4>{r.title}</h4>
              <p>{r.detail}</p>
              {r.priority === 'high' && (
                <span className="dtwin-badge dtwin-badge--urgent">Prioritaire</span>
              )}
            </article>
          ))}
        </div>
      )}

      <div className="dtwin-ai-links">
        <Link to="/pet-adaptive-nutrition">Nutrition IA adaptative →</Link>
        <Link to="/client-explainable-ai">Explainable AI →</Link>
        <Link to="/veterinary">Prendre RDV vétérinaire →</Link>
      </div>
    </div>
  );
};

export default DigitalTwinAiPanel;
