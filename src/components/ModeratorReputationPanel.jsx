import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const TREND_ICON = {
  positive: TrendingUp,
  negative: TrendingDown,
  stable: Minus,
};

const ModeratorReputationPanel = ({ reputation, watchlist = [], loading }) => {
  if (loading) return <p className="modi-muted">Analyse des sentiments…</p>;
  if (!reputation) return <p className="modi-muted">Données indisponibles.</p>;

  const TrendIcon = TREND_ICON[reputation.trend] || Minus;

  return (
    <div className="modi-panel">
      <div className="modi-rep-hero">
        <div className="modi-rep-score">
          <strong>{reputation.satisfactionScore}</strong>
          <span>/100 satisfaction</span>
        </div>
        <div className="modi-rep-trend">
          <TrendIcon size={20} aria-hidden />
          <span>
            {reputation.trend === 'positive'
              ? 'Tendance positive'
              : reputation.trend === 'negative'
                ? 'Tension détectée'
                : 'Stable'}
          </span>
        </div>
        {reputation.avgRating != null && (
          <p className="modi-meta">Note moyenne : {reputation.avgRating}★ · {reputation.reviewCount} avis</p>
        )}
      </div>

      <p className="modi-summary">{reputation.summary}</p>

      <div className="modi-sentiment-bars">
        {[
          { key: 'positive', label: 'Positif', color: '#059669' },
          { key: 'negative', label: 'Négatif', color: '#dc2626' },
          { key: 'neutral', label: 'Neutre', color: '#64748b' },
        ].map(({ key, label, color }) => (
          <div key={key} className="modi-bar-row">
            <span>{label}</span>
            <div className="modi-bar-track">
              <div
                className="modi-bar-fill"
                style={{
                  width: `${reputation.sentiments[`${key}Pct`] || 0}%`,
                  background: color,
                }}
              />
            </div>
            <span>{reputation.sentiments[key] || 0}</span>
          </div>
        ))}
      </div>

      {(reputation.topThemes || []).length > 0 && (
        <div className="modi-themes">
          <h4>Thèmes récurrents</h4>
          <div className="modi-tags">
            {reputation.topThemes.map((t) => (
              <span key={t.key} className="modi-tag">{t.label} ({t.count})</span>
            ))}
          </div>
        </div>
      )}

      {watchlist.length > 0 && (
        <>
          <h4>Profils à surveiller</h4>
          <ul className="modi-watchlist">
            {watchlist.map((u) => (
              <li key={u.userId}>
                <strong>{u.name}</strong>
                <span>Réputation {u.reputation} — {u.level}</span>
                {u.suspiciousReviews > 0 && (
                  <span className="modi-warn">{u.suspiciousReviews} avis suspect(s)</span>
                )}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
};

export default ModeratorReputationPanel;
