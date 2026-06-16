import React, { useMemo, useState } from 'react';
import { Calendar } from 'lucide-react';
import { predictFutureNutritionNeeds } from '../utils/futureNutritionPredictor';

const DEFAULT_PET = {
  type: 'cat',
  weight: '4',
  ageYears: '2',
  isNeutered: true,
};

const VisitorFutureNutritionPanel = ({ loading }) => {
  const [pet, setPet] = useState(DEFAULT_PET);

  const timeline = useMemo(
    () => predictFutureNutritionNeeds(pet, [3, 6, 12]),
    [pet],
  );

  if (loading) return <p className="vis-intel-muted">Calcul des besoins futurs…</p>;

  return (
    <div className="vis-intel-future">
      <p className="vis-intel-summary">
        <Calendar size={16} aria-hidden />
        Prédiction des besoins alimentaires à 3, 6 et 12 mois selon l&apos;âge et le profil de l&apos;animal.
      </p>

      <div className="vis-intel-pet-form">
        <label>
          Espèce
          <select
            value={pet.type}
            onChange={(e) => setPet((p) => ({ ...p, type: e.target.value }))}
          >
            <option value="cat">Chat</option>
            <option value="dog">Chien</option>
          </select>
        </label>
        <label>
          Âge actuel (ans)
          <input
            type="number"
            min="0"
            max="20"
            value={pet.ageYears}
            onChange={(e) => setPet((p) => ({ ...p, ageYears: e.target.value }))}
          />
        </label>
        <label>
          Poids (kg)
          <input
            type="number"
            min="0.5"
            step="0.1"
            value={pet.weight}
            onChange={(e) => setPet((p) => ({ ...p, weight: e.target.value }))}
          />
        </label>
      </div>

      <div className="vis-intel-timeline">
        {timeline.map((t) => (
          <article key={t.months} className={`vis-intel-timeline-card${t.stageTransition ? ' vis-intel-timeline-card--transition' : ''}`}>
            <header>
              <strong>+{t.months} mois</strong>
              <span>{t.futureAge} ans · {t.lifeStageLabel}</span>
            </header>
            <p className="vis-intel-timeline-kcal">
              ~{t.dailyKcal} kcal/j · {t.dailyGrams} g
            </p>
            <p className="vis-intel-timeline-formula">{t.recommendedFormula}</p>
            <p className="vis-intel-timeline-summary">{t.aiSummary}</p>
            <ul>
              {t.predictions.map((pred) => (
                <li key={pred.label}>
                  <span aria-hidden>{pred.icon}</span>
                  <div>
                    <strong>{pred.label}</strong>
                    <p>{pred.detail}</p>
                  </div>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </div>
  );
};

export default VisitorFutureNutritionPanel;
