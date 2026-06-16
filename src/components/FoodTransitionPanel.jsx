import React from 'react';
import { ArrowRightLeft } from 'lucide-react';

const FoodTransitionPanel = ({ plan, loading }) => {
  if (loading) return <p className="an-loading">Génération du programme de transition…</p>;
  if (!plan?.schedule?.length) return <p className="an-empty">Données insuffisantes pour la transition.</p>;

  return (
    <div className="an-transition">
      <p className="an-ai-summary">
        <ArrowRightLeft size={16} aria-hidden /> {plan.aiSummary}
      </p>

      <div className="an-transition-meta">
        <span><strong>{plan.currentFood}</strong> → <strong>{plan.newFood}</strong></span>
        <span>{plan.durationDays} jours · {plan.dailyRationGrams} g / jour</span>
      </div>

      {plan.warnings?.length > 0 && (
        <ul className="an-transition-warnings">
          {plan.warnings.map((w) => (
            <li key={w}>⚠️ {w}</li>
          ))}
        </ul>
      )}

      <div className="an-transition-table-wrap">
        <table className="an-transition-table">
          <thead>
            <tr>
              <th>Jour</th>
              <th>Mix</th>
              <th>Ancien (g)</th>
              <th>Nouveau (g)</th>
              <th>Conseil</th>
            </tr>
          </thead>
          <tbody>
            {plan.schedule.map((row) => (
              <tr key={row.day}>
                <td>J{row.day}</td>
                <td>{row.mixLabel}</td>
                <td>{row.oldGrams}</td>
                <td>{row.newGrams}</td>
                <td className="an-transition-tip">{row.tips}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FoodTransitionPanel;
