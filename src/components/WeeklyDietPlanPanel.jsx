import React from 'react';
import { CalendarDays } from 'lucide-react';

const WeeklyDietPlanPanel = ({ plan, loading }) => {
  if (loading) {
    return <p className="an-loading">Génération du plan hebdomadaire…</p>;
  }

  if (!plan?.days?.length) {
    return <p className="an-empty">{plan?.summary || 'Plan indisponible — complétez le poids.'}</p>;
  }

  return (
    <div className="an-weekly">
      <p className="an-plan-summary">{plan.summary}</p>
      <p className="an-plan-meta">
        <CalendarDays size={16} aria-hidden />
        {' '}
        Semaine du {new Date(plan.weekStart).toLocaleDateString('fr-FR')}
        {' · '}
        ~{plan.avgGramsPerDay} g {plan.foodLabel}/j
      </p>

      <div className="an-days-grid">
        {plan.days.map((day) => (
          <article key={day.date} className="an-day-card">
            <h4>{day.dayName}</h4>
            <p className="an-day-totals">{day.totalKcal} kcal · {day.totalGrams} g</p>
            <ul className="an-meals">
              {day.meals.map((m) => (
                <li key={m.label}>
                  <span>{m.label}</span>
                  <strong>{m.grams} g</strong>
                  <small>{m.kcal} kcal</small>
                </li>
              ))}
            </ul>
            {day.treat && <p className="an-treat">🦴 {day.treat}</p>}
            {day.notes?.map((n) => (
              <p key={n} className="an-day-note">{n}</p>
            ))}
          </article>
        ))}
      </div>
    </div>
  );
};

export default WeeklyDietPlanPanel;
