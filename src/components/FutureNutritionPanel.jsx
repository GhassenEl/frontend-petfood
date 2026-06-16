import React from 'react';
import { Calendar, ShoppingCart } from 'lucide-react';

const FutureNutritionPanel = ({ timeline = [], loading }) => {
  if (loading) return <p className="an-loading">Prédiction des besoins futurs…</p>;
  if (!timeline.length) return <p className="an-empty">Prédictions indisponibles.</p>;

  return (
    <div className="an-future">
      <p className="an-ai-summary">
        <Calendar size={16} aria-hidden />
        Anticipation des besoins nutritionnels, achats et changements de régime (3, 6, 12 mois).
      </p>

      <div className="an-future-timeline">
        {timeline.map((t) => (
          <article
            key={t.months}
            className={`an-future-card${t.stageTransition ? ' an-future-card--transition' : ''}`}
          >
            <header>
              <strong>+{t.months} mois</strong>
              <span>{t.futureAge} ans · {t.lifeStageLabel}</span>
            </header>
            <p className="an-future-kcal">~{t.dailyKcal ?? '—'} kcal/j · {t.dailyGrams ?? '—'} g</p>
            <p>{t.recommendedFormula}</p>
            <p className="an-future-summary">{t.aiSummary}</p>

            <h5>Besoins nutritionnels</h5>
            <ul>
              {t.predictions.map((pred) => (
                <li key={pred.label}>
                  <span>{pred.icon}</span>
                  <div>
                    <strong>{pred.label}</strong>
                    <p>{pred.detail}</p>
                  </div>
                </li>
              ))}
            </ul>

            {t.purchasePredictions?.length > 0 && (
              <>
                <h5><ShoppingCart size={14} /> Achats & régime</h5>
                <ul>
                  {t.purchasePredictions.map((pred) => (
                    <li key={pred.label}>
                      <span>{pred.icon}</span>
                      <div>
                        <strong>{pred.label}</strong>
                        <p>{pred.detail}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </article>
        ))}
      </div>
    </div>
  );
};

export default FutureNutritionPanel;
