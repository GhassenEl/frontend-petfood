import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

const DigitalTwinNutritionPanel = ({ twin }) => {
  const { feeding, nutritionRecommendation, weightHistory } = twin || {};
  const chartData = (weightHistory || []).map((w) => ({
    date: new Date(w.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }),
    poids: w.weightKg,
  }));

  return (
    <div className="dtwin-panel">
      <section className="dtwin-card dtwin-nutrition-kpi">
        <div>
          <span className="dtwin-kpi-label">Régime actuel</span>
          <strong>{feeding?.currentDiet || '—'}</strong>
        </div>
        <div>
          <span className="dtwin-kpi-label">kcal / jour</span>
          <strong>{feeding?.dailyKcal ?? nutritionRecommendation?.calories?.dailyKcal ?? '—'}</strong>
        </div>
        <div>
          <span className="dtwin-kpi-label">Grammes / jour</span>
          <strong>{feeding?.gramsPerDay ?? '—'} g</strong>
        </div>
        <div>
          <span className="dtwin-kpi-label">Repas / jour</span>
          <strong>{feeding?.mealCount ?? '—'}</strong>
        </div>
        <div>
          <span className="dtwin-kpi-label">Adhérence régime</span>
          <strong>{Math.round((feeding?.adherence ?? 0) * 100)} %</strong>
        </div>
      </section>

      {chartData.length > 1 && (
        <section className="dtwin-card">
          <h3>Évolution du poids</h3>
          <div style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} domain={['auto', 'auto']} />
                <Tooltip />
                <Line type="monotone" dataKey="poids" stroke="#0f766e" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>
      )}

      <section className="dtwin-card">
        <h3>Historique alimentaire récent</h3>
        {!feeding?.history?.length ? (
          <p className="dtwin-muted">Pas d&apos;entrées récentes.</p>
        ) : (
          <ul className="dtwin-feed-history">
            {feeding.history.map((h, i) => (
              <li key={i}>
                <time>{new Date(h.date).toLocaleDateString('fr-FR')}</time>
                <span>{h.meal} — {h.product}</span>
                <strong>{h.grams} g · {h.kcal} kcal</strong>
              </li>
            ))}
          </ul>
        )}
      </section>

      {nutritionRecommendation?.recommendations?.length > 0 && (
        <section className="dtwin-card">
          <h3>Recommandations nutritionnelles IA</h3>
          <ul className="dtwin-rec-list">
            {nutritionRecommendation.recommendations.slice(0, 4).map((r, i) => (
              <li key={i}>{typeof r === 'string' ? r : r.text || r.label}</li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
};

export default DigitalTwinNutritionPanel;
