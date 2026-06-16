import React from 'react';

const levelColors = {
  expert: '#7c3aed',
  trusted: '#059669',
  actif: '#2563eb',
  nouveau: '#64748b',
};

const UserReputationPanel = ({ myReputation, leaderboard = [] }) => {
  const mine = myReputation || {};
  const color = levelColors[mine.level] || levelColors.nouveau;

  return (
    <div className="comm-reputation">
      <section className="comm-card comm-reputation__hero">
        <div className="comm-reputation__score" style={{ borderColor: color }}>
          <span className="comm-reputation__num" style={{ color }}>{mine.score ?? 0}</span>
          <span className="comm-reputation__label">/ 100</span>
        </div>
        <div>
          <h3 style={{ margin: '0 0 6px' }}>{mine.levelLabel || 'Membre'}</h3>
          <p className="comm-muted">{mine.summary}</p>
          {mine.stats && (
            <div className="comm-stats-row">
              <span>{mine.stats.posts} publications</span>
              <span>{mine.stats.reviews} avis</span>
              <span>{mine.stats.likesReceived} likes</span>
            </div>
          )}
        </div>
      </section>

      {(mine.factors || []).length > 0 && (
        <section className="comm-card">
          <h3 className="comm-section-title">Facteurs de réputation</h3>
          <ul className="comm-factor-list">
            {mine.factors.map((f) => (
              <li key={f.label}>
                <span>{f.label}</span>
                <strong>+{f.pts}</strong>
              </li>
            ))}
          </ul>
        </section>
      )}

      {leaderboard.length > 0 && (
        <section className="comm-card">
          <h3 className="comm-section-title">Classement communauté</h3>
          <ol className="comm-leaderboard">
            {leaderboard.map((m, i) => (
              <li key={m.id} className={m.id === 'u-me' ? 'comm-leaderboard__me' : ''}>
                <span className="comm-rank">{i + 1}</span>
                <span className="comm-leaderboard__avatar" aria-hidden>{m.avatar}</span>
                <span className="comm-leaderboard__name">{m.name}</span>
                <strong className="comm-leaderboard__pts">{m.reputation?.score ?? 0}</strong>
              </li>
            ))}
          </ol>
        </section>
      )}
    </div>
  );
};

export default UserReputationPanel;
