import React from 'react';
import { Flame, Utensils, Scale } from 'lucide-react';

const DailyRationPanel = ({ data, loading }) => {
  if (loading) return <p className="an-loading">Calcul de la ration journalière…</p>;

  const ration = data?.intelligentProgram?.dailyRation;
  const rec = data?.recommendation;

  if (!ration?.kcalPerDay) {
    return (
      <p className="an-empty">
        Complétez le poids de l&apos;animal pour obtenir la ration exacte (kcal et grammes).
      </p>
    );
  }

  return (
    <div className="an-ration">
      <p className="an-ration-lead">
        Quantité calculée pour éviter le surpoids, la sous-alimentation et les carences nutritionnelles.
      </p>

      <div className="an-ration-hero">
        <div className="an-ration-main">
          <Flame size={28} color="#ea580c" />
          <div>
            <strong>{ration.kcalPerDay}</strong>
            <span>kcal / jour</span>
          </div>
        </div>
        <div className="an-ration-main">
          <Utensils size={28} color="#0ea5e9" />
          <div>
            <strong>{ration.gramsPerDay} g</strong>
            <span>{ration.foodLabel} / jour</span>
          </div>
        </div>
        <div className="an-ration-main">
          <Scale size={28} color="#059669" />
          <div>
            <strong>{ration.gramsPerMeal} g × {ration.mealsPerDay}</strong>
            <span>repas / jour</span>
          </div>
        </div>
      </div>

      <div className="an-ration-goal">
        Objectif : <strong>{ration.goal}</strong>
        {rec?.weightStatus && rec.weightStatus !== 'unknown' && (
          <> · État pondéral : <strong>{rec.weightStatus}</strong></>
        )}
      </div>

      {ration.prevents?.length > 0 && (
        <div className="an-ration-prevents">
          <h4>Ce calcul aide à éviter</h4>
          <ul>
            {ration.prevents.map((p) => (
              <li key={p}>✓ {p}</li>
            ))}
          </ul>
        </div>
      )}

      {rec?.mealPlan?.split && (
        <div className="an-ration-split">
          <h4>Répartition recommandée</h4>
          <ul>
            {Object.entries(rec.mealPlan.split).map(([k, v]) => (
              <li key={k}>{k} : {v} %</li>
            ))}
          </ul>
          {rec.mealPlan.notes && <p>{rec.mealPlan.notes}</p>}
        </div>
      )}
    </div>
  );
};

export default DailyRationPanel;
