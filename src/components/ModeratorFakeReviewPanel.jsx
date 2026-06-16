import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, CheckCircle } from 'lucide-react';

const SEV_CLASS = {
  high: 'modi-sev-high',
  medium: 'modi-sev-medium',
  low: 'modi-sev-low',
};

const ModeratorFakeReviewPanel = ({ items = [], loading }) => {
  if (loading) return <p className="modi-muted">Analyse NLP des avis…</p>;

  if (!items.length) {
    return (
      <div className="modi-empty modi-empty-ok">
        <CheckCircle size={28} aria-hidden />
        <p>Aucun faux avis détecté.</p>
      </div>
    );
  }

  return (
    <div className="modi-panel">
      <p className="modi-summary">
        {items.length} avis suspect(s) identifié(s) — incohérences, spam, formulations génériques.
      </p>
      <ul className="modi-list">
        {items.map(({ review, anomaly }) => (
          <li key={review.id || review._id} className={`modi-item ${SEV_CLASS[anomaly.severity] || ''}`}>
            <AlertTriangle size={18} aria-hidden />
            <div>
              <strong>{review.productName || 'Produit'}</strong>
              <span className="modi-meta"> — {review.author || 'Anonyme'} · {review.rating}★</span>
              <p className="modi-quote">&laquo; {(review.comment || '').slice(0, 160)} &raquo;</p>
              <p className="modi-reason">{anomaly.summary}</p>
              <div className="modi-tags">
                {(anomaly.flags || []).slice(0, 3).map((f) => (
                  <span key={f.reason} className="modi-tag">{f.type}</span>
                ))}
                <span className="modi-score">Score {anomaly.score}</span>
              </div>
            </div>
          </li>
        ))}
      </ul>
      <p className="modi-footer">
        <Link to="/moderator/reports">File signalements →</Link>
        {' · '}
        <Link to="/moderator/reviews">Modérer les avis →</Link>
      </p>
    </div>
  );
};

export default ModeratorFakeReviewPanel;
