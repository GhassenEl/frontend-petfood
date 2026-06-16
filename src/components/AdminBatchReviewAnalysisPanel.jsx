import React from 'react';
import { Star, ThumbsUp, ThumbsDown, Lightbulb } from 'lucide-react';

const AdminBatchReviewAnalysisPanel = ({ analysis = [] }) => (
  <div className="mi-panel">
    <p className="mi-summary">Analyse automatique des avis — points forts, faiblesses et améliorations.</p>
    {!analysis.length ? (
      <p className="mi-empty">Pas assez d&apos;avis pour l&apos;analyse.</p>
    ) : (
      <div className="mi-review-grid">
        {analysis.map(({ productId, productName, insight, reviewCount }) => (
          <article key={productId} className="mi-review-card">
            <h4>{productName}</h4>
            <p className="mi-meta">
              <Star size={14} aria-hidden /> {insight.avgRating}/5 · {reviewCount} avis
            </p>
            <p>{insight.summary}</p>
            {(insight.strengths || []).length > 0 && (
              <div>
                <strong><ThumbsUp size={14} aria-hidden /> Points forts</strong>
                <ul>
                  {insight.strengths.map((s) => (
                    <li key={s.id}>{s.label} ({s.pct}%)</li>
                  ))}
                </ul>
              </div>
            )}
            {(insight.weaknesses || []).length > 0 && (
              <div>
                <strong><ThumbsDown size={14} aria-hidden /> Points faibles</strong>
                <ul>
                  {insight.weaknesses.map((w) => (
                    <li key={w.id}>{w.label} ({w.pct}%)</li>
                  ))}
                </ul>
              </div>
            )}
            {(insight.weaknesses || []).length > 0 && (
              <div>
                <strong><Lightbulb size={14} aria-hidden /> Améliorations possibles</strong>
                <ul>
                  {insight.weaknesses.map((w) => (
                    <li key={w.id}>Améliorer : {w.label.toLowerCase()}</li>
                  ))}
                </ul>
              </div>
            )}
          </article>
        ))}
      </div>
    )}
  </div>
);

export default AdminBatchReviewAnalysisPanel;
