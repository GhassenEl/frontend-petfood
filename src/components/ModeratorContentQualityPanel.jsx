import React from 'react';
import { Link } from 'react-router-dom';
import { FileCheck } from 'lucide-react';

const GRADE_CLASS = {
  A: 'modi-grade-a',
  B: 'modi-grade-b',
  C: 'modi-grade-c',
  D: 'modi-grade-d',
};

const ModeratorContentQualityPanel = ({ items = [], loading }) => {
  if (loading) return <p className="modi-muted">Analyse qualité en temps réel…</p>;

  const needsReview = items.filter(({ quality }) => quality.needsReview);

  return (
    <div className="modi-panel">
      <p className="modi-summary">
        <FileCheck size={16} aria-hidden />
        Analyse temps réel — {items.length} contenus scannés, {needsReview.length} à réviser.
      </p>

      <ul className="modi-list">
        {items.slice(0, 20).map(({ item, quality }) => (
          <li
            key={quality.id}
            className={`modi-item ${quality.needsReview ? 'modi-sev-medium' : 'modi-sev-low'}`}
          >
            <span className={`modi-grade ${GRADE_CLASS[quality.grade] || ''}`}>{quality.grade}</span>
            <div>
              <strong>{quality.name}</strong>
              <span className="modi-meta"> — Score {quality.score}/100</span>
              <p className="modi-reason">{quality.summary}</p>
              {(quality.flags || []).length > 0 && (
                <div className="modi-tags">
                  {quality.flags.map((f) => (
                    <span key={f.issue} className="modi-tag">{f.issue}</span>
                  ))}
                </div>
              )}
            </div>
          </li>
        ))}
      </ul>

      <p className="modi-footer">
        <Link to="/moderator/content">Modération contenu →</Link>
      </p>
    </div>
  );
};

export default ModeratorContentQualityPanel;
