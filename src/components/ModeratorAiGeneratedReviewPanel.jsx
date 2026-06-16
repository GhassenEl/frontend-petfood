import React from 'react';
import { Link } from 'react-router-dom';
import { Bot, AlertTriangle } from 'lucide-react';

const ModeratorAiGeneratedReviewPanel = ({ items = [], loading }) => {
  if (loading) return <p className="modi-muted">Scan des avis générés par IA…</p>;

  if (!items.length) {
    return (
      <div className="modi-empty modi-empty-ok">
        <p>Aucun avis généré artificiellement détecté.</p>
      </div>
    );
  }

  return (
    <div className="modi-panel">
      <p className="modi-summary">
        <Bot size={16} aria-hidden />
        {items.length} avis suspect(s) de génération IA (ChatGPT, bots, formulations génériques).
      </p>
      <ul className="modi-list">
        {items.map(({ review, anomaly, aiScore }) => (
          <li key={review.id || review._id} className="modi-item modi-sev-high">
            <AlertTriangle size={18} aria-hidden />
            <div>
              <strong>{review.productName || review.productId?.name || 'Produit'}</strong>
              <span className="modi-meta"> — {review.author || review.user?.name || 'Anonyme'}</span>
              <p className="modi-quote">&laquo; {(review.comment || '').slice(0, 200)} &raquo;</p>
              <div className="modi-tags">
                <span className="modi-tag modi-tag--ai">IA généré · score {aiScore}</span>
                {(anomaly.flags || [])
                  .filter((f) => f.type === 'ai_generated')
                  .map((f) => (
                    <span key={f.reason} className="modi-tag">{f.reason}</span>
                  ))}
              </div>
            </div>
          </li>
        ))}
      </ul>
      <p className="modi-footer">
        <Link to="/moderator/reviews">Modérer les avis →</Link>
      </p>
    </div>
  );
};

export default ModeratorAiGeneratedReviewPanel;
