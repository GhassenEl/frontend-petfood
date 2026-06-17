import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Brain, ChevronRight } from 'lucide-react';
import runExpertNutritionQuery from '../utils/expertNutritionEngine';
import EthicalDisclaimer from './EthicalDisclaimer';

const SUGGESTED = [
  'Quel aliment est recommandé pour un chat de 8 ans souffrant d\'obésité ?',
  'Régime pour un chien de 3 ans avec sensibilité digestive',
  'Chat senior 12 ans — insuffisance rénale légère',
];

const ExpertSystemPanel = () => {
  const [query, setQuery] = useState(SUGGESTED[0]);
  const [result, setResult] = useState(() => runExpertNutritionQuery(SUGGESTED[0]));

  const run = () => setResult(runExpertNutritionQuery(query));

  return (
    <section className="shub-panel">
      <header className="shub-panel__head">
        <Brain size={20} color="#7c3aed" />
        <div>
          <h3>Système expert nutrition</h3>
          <p>Moteur de règles — espèce, âge, pathologies → régime adapté automatiquement.</p>
        </div>
      </header>

      <EthicalDisclaimer variant="ai" compact />

      <div className="shub-expert-suggestions">
        {SUGGESTED.map((s) => (
          <button key={s} type="button" className="shub-chip" onClick={() => { setQuery(s); setResult(runExpertNutritionQuery(s)); }}>
            {s}
          </button>
        ))}
      </div>

      <div className="shub-expert-form">
        <textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          rows={3}
          placeholder="Ex. : Quel aliment pour un chat obèse de 8 ans ?"
          aria-label="Question système expert"
        />
        <button type="button" className="shub-btn shub-btn--primary" onClick={run}>
          Analyser
        </button>
      </div>

      {result?.ok && (
        <div className="shub-expert-result">
          <p className="shub-expert-summary">{result.summary}</p>

          {result.firedRules?.length > 0 && (
            <ul className="shub-rule-list">
              {result.firedRules.map((r) => (
                <li key={r.id}>
                  <strong>{r.label}</strong>
                  <span>{r.confidence}% indicateur</span>
                </li>
              ))}
            </ul>
          )}

          {result.dietPlan && (
            <div className="shub-diet-plan">
              <strong>Plan proposé</strong>
              <p>{result.dietPlan.dailyKcalTarget} kcal/jour · {result.dietPlan.mealsPerDay} repas</p>
              <p>{result.dietPlan.portionNote}</p>
              <small>{result.dietPlan.vetNote}</small>
            </div>
          )}

          {result.recommendations?.length > 0 && (
            <ul className="shub-product-recs">
              {result.recommendations.map((p) => (
                <li key={p.id}>
                  <div>
                    <strong>{p.name}</strong>
                    <span>{p.brand} · {p.price} TND · {p.kcalPer100g} kcal/100g</span>
                  </div>
                  <Link to="/client-products">Voir <ChevronRight size={14} /></Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </section>
  );
};

export default ExpertSystemPanel;
