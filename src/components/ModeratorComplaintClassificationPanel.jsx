import React from 'react';
import { Link } from 'react-router-dom';

const CONF_CLASS = {
  high: 'modi-conf-high',
  medium: 'modi-conf-medium',
  low: 'modi-conf-low',
  guess: 'modi-conf-guess',
};

const ModeratorComplaintClassificationPanel = ({ items = [], breakdown = {}, loading }) => {
  if (loading) return <p className="modi-muted">Classification des réclamations…</p>;

  return (
    <div className="modi-panel">
      <p className="modi-summary">
        L&apos;IA catégorise automatiquement les plaintes : livraison, paiement, produit, service vétérinaire.
      </p>

      <div className="modi-cat-grid">
        {Object.entries(breakdown).map(([cat, count]) => (
          <div key={cat} className="modi-cat-card">
            <strong>{count}</strong>
            <span>{cat}</span>
          </div>
        ))}
      </div>

      <ul className="modi-list">
        {items.map(({ complaint, classification }) => (
          <li
            key={complaint._id || complaint.id}
            className={`modi-item ${CONF_CLASS[classification.confidence] || ''}`}
          >
            <span className="modi-cat-icon" aria-hidden>{classification.categoryIcon}</span>
            <div>
              <strong>{complaint.subject || 'Sans objet'}</strong>
              <p className="modi-quote">{(complaint.message || '').slice(0, 140)}</p>
              <div className="modi-tags">
                <span className="modi-tag modi-tag--cat">{classification.categoryLabel}</span>
                <span className="modi-tag">Confiance {classification.confidence}</span>
                {complaint.status === 'ai_proposed' && (
                  <span className="modi-tag modi-tag--ai">Proposition IA</span>
                )}
              </div>
              <p className="modi-reason">{classification.aiSummary}</p>
            </div>
          </li>
        ))}
      </ul>

      <p className="modi-footer">
        <Link to="/moderator/complaints">Traiter les réclamations →</Link>
      </p>
    </div>
  );
};

export default ModeratorComplaintClassificationPanel;
