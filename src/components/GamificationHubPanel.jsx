import React from 'react';
import { Link } from 'react-router-dom';
import { Trophy } from 'lucide-react';
import { DEMO_GAMIFICATION_PROFILE, tierProgress } from '../utils/gamificationHubEngine';

const GamificationHubPanel = () => {
  const { points, badges, recentRewards, streakDays } = DEMO_GAMIFICATION_PROFILE;
  const progress = tierProgress(points);

  return (
    <section className="shub-panel">
      <header className="shub-panel__head">
        <Trophy size={20} color="#f59e0b" />
        <div>
          <h3>Gamification &amp; fidélité</h3>
          <p>Points, badges clients actifs et récompenses après achats.</p>
        </div>
      </header>

      <div className="shub-gami-kpis">
        <div className="shub-gami-kpi">
          <strong>{points}</strong>
          <span>Points</span>
        </div>
        <div className="shub-gami-kpi">
          <strong>{progress.tier}</strong>
          <span>Niveau</span>
        </div>
        <div className="shub-gami-kpi">
          <strong>{streakDays}j</strong>
          <span>Série</span>
        </div>
        <div className="shub-gami-kpi">
          <strong>{badges.filter((b) => b.unlocked).length}/{badges.length}</strong>
          <span>Badges</span>
        </div>
      </div>

      {progress.next && (
        <div className="shub-gami-progress">
          <div className="shub-gami-progress__bar" style={{ width: `${Math.min(progress.pct, 100)}%` }} />
          <small>{points} / {progress.next} pts → prochain niveau</small>
        </div>
      )}

      <div className="shub-badge-grid">
        {badges.map((b) => (
          <div key={b.id} className={`shub-badge-card${b.unlocked ? ' is-unlocked' : ''}`}>
            <span className="shub-badge-card__icon" aria-hidden>{b.icon}</span>
            <strong>{b.label}</strong>
            <p>{b.desc}</p>
            {!b.unlocked && b.target && (
              <small>{b.progress}/{b.target}</small>
            )}
            {b.unlocked && b.earnedAt && <small>✓ {b.earnedAt}</small>}
          </div>
        ))}
      </div>

      <h4 className="shub-subtitle">Récompenses récentes</h4>
      <ul className="shub-reward-list">
        {recentRewards.map((r) => (
          <li key={r.id}>
            <strong>{r.title}</strong>
            <span>{r.date}{r.points ? ` · +${r.points} pts` : ''}</span>
          </li>
        ))}
      </ul>

      <Link to="/client-loyalty" className="shub-link-btn">Programme fidélité complet →</Link>
    </section>
  );
};

export default GamificationHubPanel;
