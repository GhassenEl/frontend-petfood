import React from 'react';
import { Pill } from 'lucide-react';

const TherapeuticNutritionPanel = ({ data, loading }) => {
  if (loading) return <p className="an-loading">Analyse thérapeutique en cours…</p>;
  if (!data) return <p className="an-empty">Données thérapeutiques indisponibles.</p>;

  return (
    <div className="an-therapeutic">
      <p className="an-ai-summary">
        <Pill size={16} aria-hidden /> {data.aiSummary}
      </p>
      <p className="an-disclaimer">{data.vetNote}</p>

      {data.pathologies?.length > 0 && (
        <div className="an-therapeutic-pathos">
          Pathologies : {data.pathologies.join(', ')}
        </div>
      )}

      {data.plans?.map((plan) => (
        <article key={plan.pathology} className="an-therapeutic-plan">
          <h4>{plan.pathology}</h4>
          <p><strong>Régime :</strong> {plan.diet}</p>
          <p><strong>Objectif kcal :</strong> {plan.kcalTarget}</p>
          <p><strong>Aliments recommandés :</strong> {plan.foods?.join(', ')}</p>
          <p><strong>À éviter :</strong> {plan.avoid?.join(', ')}</p>
          <p><strong>Suivi :</strong> {plan.monitoring?.join(', ')}</p>
        </article>
      ))}

      {data.recommendedProducts?.length > 0 && (
        <div className="an-therapeutic-products">
          <h4>Produits adaptés (prescription vétérinaire)</h4>
          <ul>
            {data.recommendedProducts.map(({ product, matchScore, matchedPlans }) => (
              <li key={product.id || product._id}>
                <strong>{product.name}</strong>
                <span>Score {matchScore} — {matchedPlans.join(', ')}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default TherapeuticNutritionPanel;
