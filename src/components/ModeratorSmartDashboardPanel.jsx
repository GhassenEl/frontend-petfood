import React from 'react';
import { Link } from 'react-router-dom';
import { Activity, AlertTriangle } from 'lucide-react';

const TYPE_LABEL = {
  fake_review: 'Faux avis',
  content: 'Contenu',
  activity: 'Activité suspecte',
  complaint: 'Réclamation',
  report: 'Signalement',
};

const SEV_CLASS = {
  high: 'modi-sev-high',
  critical: 'modi-sev-high',
  medium: 'modi-sev-medium',
  low: 'modi-sev-low',
};

const ModeratorSmartDashboardPanel = ({ stats = {}, liveFeed = [], loading }) => {
  if (loading) return <p className="modi-muted">Actualisation temps réel…</p>;

  const kpis = [
    { label: 'Faux avis détectés', value: stats.fakeReviewCount, icon: '🚨' },
    { label: 'Avis générés IA', value: stats.aiGeneratedCount, icon: '🤖' },
    { label: 'Contenus à réviser', value: stats.contentQualityIssues, icon: '📋' },
    { label: 'Contenus à modérer', value: stats.moderationPending, icon: '🔎' },
    { label: 'Incidents actifs', value: stats.incidentCount, icon: '⚠️' },
    { label: 'Avis négatifs', value: stats.negativeReviews, icon: '⭐' },
    { label: 'Signalements ouverts', value: stats.reportsOpen, icon: '📑' },
    { label: 'Satisfaction', value: `${stats.satisfactionScore ?? '—'}%`, icon: '📊' },
  ];

  return (
    <div className="modi-panel">
      <div className="modi-dash-header">
        <Activity size={20} aria-hidden />
        <span>Tableau de bord intelligent — temps réel</span>
      </div>

      <div className="modi-kpi-grid">
        {kpis.map((k) => (
          <div key={k.label} className="modi-kpi">
            <span>{k.icon} {k.label}</span>
            <strong>{k.value ?? 0}</strong>
          </div>
        ))}
      </div>

      <h4>Fil d&apos;incidents</h4>
      {!liveFeed.length ? (
        <p className="modi-muted">Aucun incident en cours.</p>
      ) : (
        <ul className="modi-feed">
          {liveFeed.map((item) => (
            <li key={item.id} className={`modi-feed-item ${SEV_CLASS[item.severity] || ''}`}>
              <span className="modi-feed-icon" aria-hidden>{item.icon}</span>
              <div>
                <div className="modi-feed-head">
                  <strong>{item.title}</strong>
                  <span className="modi-feed-type">{TYPE_LABEL[item.type] || item.type}</span>
                </div>
                <p>{item.detail}</p>
                {item.score != null && <span className="modi-score">Priorité {item.score}</span>}
              </div>
              <AlertTriangle size={16} aria-hidden className="modi-feed-alert" />
            </li>
          ))}
        </ul>
      )}

      <p className="modi-footer">
        <Link to="/moderator/fraud">Centre anti-fraude →</Link>
        {' · '}
        <Link to="/moderator/content">Modération contenu →</Link>
      </p>
    </div>
  );
};

export default ModeratorSmartDashboardPanel;
