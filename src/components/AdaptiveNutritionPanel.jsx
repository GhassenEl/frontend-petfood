import React from 'react';
import { Sparkles, TrendingUp, TrendingDown, Minus } from 'lucide-react';

const trendIcon = { gain: TrendingUp, loss: TrendingDown, stable: Minus };
const trendColor = { gain: '#dc2626', loss: '#2563eb', stable: '#64748b' };

const AdaptiveNutritionPanel = ({ data, loading }) => {
  if (loading) {
    return <p className="an-loading">Analyse IA du profil nutritionnel…</p>;
  }

  if (!data?.recommendation) {
    return <p className="an-empty">Sélectionnez un animal pour voir les ajustements.</p>;
  }

  const { recommendation: rec, weightHistory = [] } = data;
  const TrendIcon = trendIcon[rec.weightTrend?.trend] || Minus;
  const color = trendColor[rec.weightTrend?.trend] || '#64748b';

  return (
    <div className="an-adaptive">
      <p className="an-ai-summary">{rec.aiSummary}</p>

      <div className="an-kpi-row">
        <div className="an-kpi">
          <TrendIcon size={20} color={color} aria-hidden />
          <span>Poids</span>
          <strong style={{ color }}>
            {rec.weightTrend?.trend === 'gain' ? '+' : ''}
            {rec.weightTrend?.deltaKg ?? 0} kg
          </strong>
        </div>
        <div className="an-kpi">
          <span>Âge</span>
          <strong>{rec.ageYears != null ? `${rec.ageYears} ans` : '—'}</strong>
        </div>
        <div className="an-kpi">
          <span>Activité</span>
          <strong>{rec.activityLabel || '—'}</strong>
        </div>
        <div className="an-kpi">
          <span>Ration IA</span>
          <strong>{rec.adaptedKcal ?? '—'} kcal/j</strong>
        </div>
      </div>

      {weightHistory.length >= 2 && (
        <div className="an-weight-chart">
          <h4>Évolution du poids</h4>
          <ul>
            {weightHistory.map((h) => (
              <li key={h.date}>
                <span>{new Date(h.date).toLocaleDateString('fr-FR')}</span>
                <strong>{h.weightKg} kg</strong>
              </li>
            ))}
          </ul>
        </div>
      )}

      <ul className="an-adjust-list">
        {(rec.aiAdjustments || []).map((a) => (
          <li key={a.id}>
            <Sparkles size={14} aria-hidden />
            <div>
              <strong>{a.title}</strong>
              <p>{a.text}</p>
            </div>
          </li>
        ))}
      </ul>

      <p className="an-disclaimer">{rec.disclaimer}</p>
    </div>
  );
};

export default AdaptiveNutritionPanel;
