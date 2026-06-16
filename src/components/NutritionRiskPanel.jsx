import React from 'react';
import { AlertTriangle, ShieldCheck } from 'lucide-react';

const SEV = {
  high: { color: '#dc2626', bg: '#fef2f2', label: 'Élevé' },
  medium: { color: '#d97706', bg: '#fffbeb', label: 'Modéré' },
  low: { color: '#64748b', bg: '#f8fafc', label: 'Faible' },
};

const TYPE_LABELS = {
  obesity: 'Surpoids',
  undernutrition: 'Sous-alimentation',
  deficiency: 'Carence',
  excess: 'Excès',
  incompatibility: 'Incompatibilité',
};

const NutritionRiskPanel = ({ data, loading }) => {
  if (loading) return <p className="an-loading">Analyse des risques nutritionnels…</p>;
  if (!data?.intelligentProgram?.riskAnalysis) return <p className="an-empty">Aucune analyse disponible.</p>;

  const { riskAnalysis } = data.intelligentProgram;
  const { risks, riskScore, riskLevel, summary } = riskAnalysis;

  return (
    <div className="an-risks">
      <div className="an-risk-header">
        <div className="an-risk-score">
          <ShieldCheck size={24} color={riskLevel === 'low' ? '#059669' : riskLevel === 'medium' ? '#d97706' : '#dc2626'} />
          <div>
            <strong>{riskScore}/100</strong>
            <span>Score sécurité nutritionnelle</span>
          </div>
        </div>
        <p className="an-risk-summary">{summary}</p>
      </div>

      {risks.length === 0 ? (
        <div className="an-risk-ok">✅ Profil nutritionnel équilibré — aucune alerte majeure.</div>
      ) : (
        <ul className="an-risk-list">
          {risks.map((r) => {
            const meta = SEV[r.severity] || SEV.low;
            return (
              <li key={r.id} className="an-risk-item" style={{ background: meta.bg, borderLeftColor: meta.color }}>
                <span className="an-risk-icon">{r.icon}</span>
                <div>
                  <p className="an-risk-meta" style={{ color: meta.color }}>
                    {TYPE_LABELS[r.type] || r.type} · {meta.label}
                  </p>
                  <strong>{r.title}</strong>
                  <p>{r.message}</p>
                  {r.action && (
                    <p className="an-risk-action">
                      <AlertTriangle size={12} /> {r.action}
                    </p>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default NutritionRiskPanel;
