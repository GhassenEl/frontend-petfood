import React from 'react';
import { Brain, Sparkles } from 'lucide-react';

const IntelligentNutritionProgramPanel = ({ data, loading }) => {
  if (loading) return <p className="an-loading">Génération du programme alimentaire IA…</p>;
  if (!data?.intelligentProgram) return <p className="an-empty">Sélectionnez un animal.</p>;

  const prog = data.intelligentProgram;

  return (
    <div className="an-program">
      <p className="an-ai-summary">
        <Brain size={16} aria-hidden /> {prog.aiProgramSummary}
      </p>

      <div className="an-factor-grid">
        {prog.factors.map((f) => (
          <div key={f.id} className="an-factor-card">
            <span className="an-factor-icon">{f.icon}</span>
            <div>
              <span className="an-factor-label">{f.label}</span>
              <strong>{f.value}</strong>
            </div>
          </div>
        ))}
      </div>

      {prog.mealPlan && (
        <div className="an-meal-plan">
          <h4>Programme alimentaire généré</h4>
          <ul>
            <li><strong>{prog.mealPlan.kcalPerDay ?? prog.dailyRation?.kcalPerDay} kcal</strong> / jour</li>
            <li><strong>{prog.mealPlan.gramsPerDay ?? prog.dailyRation?.gramsPerDay} g</strong> {prog.mealPlan.foodLabel || 'aliment'}</li>
            <li><strong>{prog.mealPlan.mealsPerDay ?? prog.dailyRation?.mealsPerDay} repas</strong> — {prog.mealPlan.gramsPerMeal} g / repas</li>
            {prog.mealPlan.notes && <li>{prog.mealPlan.notes}</li>}
          </ul>
        </div>
      )}

      <ul className="an-rec-list">
        {(prog.recommendations || []).slice(0, 6).map((r) => (
          <li key={r.id}>
            <Sparkles size={14} aria-hidden />
            <div>
              <strong>{r.title}</strong>
              <p>{r.text}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default IntelligentNutritionProgramPanel;
