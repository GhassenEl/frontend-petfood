import React from 'react';

const DigitalTwinActivityPanel = ({ twin }) => {
  const { activity } = twin || {};
  const weeklyHours = Math.floor((activity?.weeklyMinutes ?? 0) / 60);
  const weeklyRem = (activity?.weeklyMinutes ?? 0) % 60;

  return (
    <div className="dtwin-panel">
      <section className="dtwin-card dtwin-activity-kpi">
        <div className="dtwin-activity-stat">
          <span className="dtwin-kpi-label">Cette semaine</span>
          <strong>{weeklyHours}h{weeklyRem > 0 ? `${weeklyRem}min` : ''}</strong>
        </div>
        <div className="dtwin-activity-stat">
          <span className="dtwin-kpi-label">Objectif quotidien</span>
          <strong>{activity?.dailyGoalMin ?? 30} min</strong>
        </div>
        <div className="dtwin-activity-stat">
          <span className="dtwin-kpi-label">Jours objectif atteint</span>
          <strong>{Math.round((activity?.dailyGoalMetPct ?? 0) * 100)} %</strong>
        </div>
        <div className="dtwin-activity-stat">
          <span className="dtwin-kpi-label">Source</span>
          <strong>{activity?.source || 'Manuel'}</strong>
        </div>
      </section>

      <div className="dtwin-bar dtwin-bar--lg">
        <div
          className="dtwin-bar__fill"
          style={{
            width: `${Math.min(100, (activity?.dailyGoalMetPct ?? 0) * 100)}%`,
            background: '#6366f1',
          }}
        />
      </div>

      <section className="dtwin-card">
        <h3>Sessions récentes</h3>
        {!activity?.sessions?.length ? (
          <p className="dtwin-muted">Aucune session enregistrée.</p>
        ) : (
          <ul className="dtwin-activity-list">
            {activity.sessions.map((s, i) => (
              <li key={i}>
                <div>
                  <strong>{s.type}</strong>
                  <span className="dtwin-muted">
                    {new Date(s.date).toLocaleDateString('fr-FR')} · {s.intensity}
                  </span>
                </div>
                <span className="dtwin-activity-min">{s.minutes} min</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};

export default DigitalTwinActivityPanel;
