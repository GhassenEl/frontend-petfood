import React, { useMemo, useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { Cpu, ArrowRight, AlertTriangle, CheckCircle } from 'lucide-react';
import {
  simulateNutritionTwinChange,
  NUTRITION_TWIN_SCENARIOS,
} from '../utils/nutritionTwinSimulator';

const DeltaBadge = ({ value, unit = '', invert = false }) => {
  const n = Number(value);
  if (!n) return <span className="dtwin-delta dtwin-delta--neutral">—</span>;
  const positive = invert ? n < 0 : n > 0;
  const cls = positive ? 'dtwin-delta--pos' : n < 0 ? 'dtwin-delta--neg' : 'dtwin-delta--neutral';
  return (
    <span className={`dtwin-delta ${cls}`}>
      {n > 0 ? '+' : ''}{n}{unit}
    </span>
  );
};

const DigitalNutritionTwinPanel = ({ twin, pet, products = [] }) => {
  const [scenarioId, setScenarioId] = useState('light');
  const [productIdx, setProductIdx] = useState(-1);
  const [weeks, setWeeks] = useState(12);

  const selectedProduct = productIdx >= 0 ? products[productIdx] : null;

  const simulation = useMemo(
    () =>
      twin && pet
        ? simulateNutritionTwinChange({
            pet,
            twin,
            scenarioId,
            product: selectedProduct,
            weeks,
          })
        : null,
    [twin, pet, scenarioId, selectedProduct, weeks],
  );

  if (!twin) return <p className="dtwin-loading">Jumeau nutritionnel indisponible.</p>;

  const chartData = (simulation?.weightTimeline || []).map((p) => ({
    label: p.label,
    actuel: simulation.baseline.weightKg,
    simule: p.weightKg,
  }));

  return (
    <div className="dtwin-panel dtwin-nutrition-twin">
      <p className="dtwin-twin-intro">
        <Cpu size={18} aria-hidden />
        Simulez l&apos;impact d&apos;un changement alimentaire sur le poids, les calories,
        l&apos;équilibre nutritionnel et les risques de santé — sans modifier le régime réel.
      </p>

      <section className="dtwin-card dtwin-sim-controls">
        <h3>Scénario de changement</h3>
        <div className="dtwin-sim-row">
          <label>
            Nouvelle alimentation
            <select value={scenarioId} onChange={(e) => setScenarioId(e.target.value)}>
              {NUTRITION_TWIN_SCENARIOS.map((s) => (
                <option key={s.id} value={s.id}>{s.label}</option>
              ))}
            </select>
          </label>
          {products.length > 0 && (
            <label>
              Produit (optionnel)
              <select
                value={productIdx}
                onChange={(e) => setProductIdx(Number(e.target.value))}
              >
                <option value={-1}>— Scénario générique —</option>
                {products.slice(0, 8).map((p, i) => (
                  <option key={p.id || p._id || i} value={i}>{p.name}</option>
                ))}
              </select>
            </label>
          )}
          <label>
            Horizon
            <select value={weeks} onChange={(e) => setWeeks(Number(e.target.value))}>
              <option value={8}>8 semaines</option>
              <option value={12}>12 semaines</option>
              <option value={16}>16 semaines</option>
            </select>
          </label>
        </div>
      </section>

      {simulation && (
        <>
          <p className="dtwin-sim-summary">{simulation.aiSummary}</p>

          <div className="dtwin-compare-grid">
            <article className="dtwin-card dtwin-compare-col">
              <h4>État actuel</h4>
              <ul className="dtwin-compare-metrics">
                <li><span>Poids</span><strong>{simulation.baseline.weightKg} kg</strong></li>
                <li><span>kcal / jour</span><strong>{simulation.baseline.dailyKcal}</strong></li>
                <li><span>Grammes / jour</span><strong>{simulation.baseline.dailyGrams} g</strong></li>
                <li><span>Équilibre nutritionnel</span><strong>{simulation.baseline.nutritionBalance}/100</strong></li>
                <li><span>Score risque</span><strong>{simulation.baseline.riskScore}/100</strong></li>
              </ul>
            </article>

            <div className="dtwin-compare-arrow" aria-hidden>
              <ArrowRight size={24} />
            </div>

            <article className="dtwin-card dtwin-compare-col dtwin-compare-col--sim">
              <h4>Après simulation</h4>
              <ul className="dtwin-compare-metrics">
                <li>
                  <span>Poids ({weeks} sem.)</span>
                  <strong>{simulation.simulated.weightKg} kg</strong>
                  <DeltaBadge value={simulation.deltas.weightKg} unit=" kg" invert />
                </li>
                <li>
                  <span>kcal / jour</span>
                  <strong>{simulation.simulated.dailyKcal}</strong>
                  <DeltaBadge value={simulation.deltas.kcal} unit=" kcal" />
                </li>
                <li>
                  <span>Grammes / jour</span>
                  <strong>{simulation.simulated.dailyGrams} g</strong>
                </li>
                <li>
                  <span>Équilibre nutritionnel</span>
                  <strong>{simulation.simulated.nutritionBalance}/100</strong>
                  <DeltaBadge value={simulation.deltas.nutritionBalance} />
                </li>
                <li>
                  <span>Score risque</span>
                  <strong>{simulation.simulated.riskScore}/100</strong>
                  <DeltaBadge value={simulation.deltas.riskScore} invert />
                </li>
              </ul>
            </article>
          </div>

          {chartData.length > 1 && (
            <section className="dtwin-card">
              <h3>Projection pondérale</h3>
              <p className="dtwin-muted">
                Tendance estimée : {simulation.deltas.kgPerWeek > 0 ? '+' : ''}
                {simulation.deltas.kgPerWeek} kg / semaine
              </p>
              <div style={{ height: 240 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} domain={['auto', 'auto']} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="actuel" name="Poids actuel" stroke="#94a3b8" strokeDasharray="4 4" dot={false} />
                    <Line type="monotone" dataKey="simule" name="Projection" stroke="#0f766e" strokeWidth={2} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </section>
          )}

          <section className="dtwin-card">
            <h3>Impact sur les risques de santé</h3>
            <div className={`dtwin-health-impact dtwin-health-impact--${simulation.risks.healthImpact}`}>
              {simulation.risks.healthImpact === 'positive' && <CheckCircle size={18} />}
              {simulation.risks.healthImpact === 'negative' && <AlertTriangle size={18} />}
              {simulation.risks.healthImpact === 'positive'
                ? 'Risques nutritionnels réduits'
                : simulation.risks.healthImpact === 'negative'
                  ? 'Nouveaux risques détectés'
                  : 'Profil de risque stable'}
            </div>
            {simulation.risks.resolved.length > 0 && (
              <div className="dtwin-risk-block dtwin-risk-block--ok">
                <h4>Risques atténués</h4>
                <ul>
                  {simulation.risks.resolved.map((r) => (
                    <li key={r.id}>{r.title}</li>
                  ))}
                </ul>
              </div>
            )}
            {simulation.risks.added.length > 0 && (
              <div className="dtwin-risk-block dtwin-risk-block--warn">
                <h4>Nouveaux risques</h4>
                <ul>
                  {simulation.risks.added.map((r) => (
                    <li key={r.id}>{r.title} — {r.message}</li>
                  ))}
                </ul>
              </div>
            )}
            {simulation.risks.simulated.length > 0 && (
              <ul className="dtwin-rec-list">
                {simulation.risks.simulated.map((r) => (
                  <li key={r.id}>{r.icon} {r.title}</li>
                ))}
              </ul>
            )}
          </section>

          <p className="dtwin-disclaimer">
            Simulation indicative basée sur le profil animal et les apports caloriques.
            Validation vétérinaire obligatoire avant tout changement alimentaire réel.
          </p>
        </>
      )}
    </div>
  );
};

export default DigitalNutritionTwinPanel;
