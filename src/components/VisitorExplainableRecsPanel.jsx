import React, { useMemo, useState } from 'react';
import { Sparkles } from 'lucide-react';
import { buildPetNutritionRecommendation } from '../utils/petNutritionRecommender';
import { explainProductList } from '../utils/recommendationExplainer';
import ProductExplanationPanel from './ProductExplanationPanel';

const DEFAULT_PET = {
  name: 'Mon animal',
  type: 'cat',
  breed: '',
  weight: '4',
  ageYears: '3',
  activityLevel: 'moyen',
  goal: 'maintien',
  isNeutered: true,
};

const VisitorExplainableRecsPanel = ({ products = [], loading }) => {
  const [pet, setPet] = useState(DEFAULT_PET);

  const explained = useMemo(() => {
    const recommendation = buildPetNutritionRecommendation({
      ...pet,
      weight: pet.weight,
    });
    const top = (products || []).slice(0, 6);
    return explainProductList(top, pet, recommendation);
  }, [products, pet]);

  return (
    <div className="vis-intel-explain">
      <p className="vis-intel-summary">
        <Sparkles size={16} aria-hidden />
        L&apos;IA explique automatiquement pourquoi chaque produit est recommandé pour votre animal.
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
          Âge (ans)
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
        <label>
          Stérilisé
          <select
            value={pet.isNeutered ? 'yes' : 'no'}
            onChange={(e) => setPet((p) => ({ ...p, isNeutered: e.target.value === 'yes' }))}
          >
            <option value="yes">Oui</option>
            <option value="no">Non</option>
          </select>
        </label>
      </div>

      <div className="xai-panel-wrap">
        <ProductExplanationPanel items={explained} loading={loading} />
      </div>
    </div>
  );
};

export default VisitorExplainableRecsPanel;
