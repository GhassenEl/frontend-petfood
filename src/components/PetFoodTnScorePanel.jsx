import React from 'react';
import { Award } from 'lucide-react';

const GRADE_COLORS = { A: '#059669', B: '#2563eb', C: '#d97706', D: '#ea580c', E: '#dc2626' };

const PetFoodTnScorePanel = ({ scores = [], loading }) => {
  if (loading) return <p className="an-loading">Calcul des scores PetFoodTN…</p>;
  if (!scores.length) return <p className="an-empty">Aucun produit scoré pour cet animal.</p>;

  return (
    <div className="an-pftn">
      <p className="an-ai-summary">
        <Award size={16} aria-hidden />
        Score nutritionnel PetFoodTN — protéines, lipides, vitamines, minéraux et digestibilité.
      </p>

      <ul className="an-pftn-list">
        {scores.map((s) => (
          <li key={s.productId} className="an-pftn-item">
            <div className="an-pftn-head">
              <div>
                <strong>{s.productName}</strong>
                <span className="an-pftn-summary">{s.summary}</span>
              </div>
              <div className="an-pftn-grade" style={{ background: GRADE_COLORS[s.grade] || '#64748b' }}>
                {s.grade}
                <small>{s.overall}/100</small>
              </div>
            </div>
            <div className="an-pftn-breakdown">
              {Object.entries(s.breakdown).map(([key, b]) => (
                <div key={key} className="an-pftn-metric">
                  <span>{b.label}</span>
                  <div className="an-score-bar">
                    <div className="an-score-fill" style={{ width: `${b.score}%` }} />
                  </div>
                  <strong>{b.score}</strong>
                  <small>{b.value}</small>
                </div>
              ))}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PetFoodTnScorePanel;
