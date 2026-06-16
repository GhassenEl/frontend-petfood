import React from 'react';
import { Sparkles, Gift } from 'lucide-react';

const typeIcon = {
  discount: '🏷️',
  points: '✨',
  product: '🎁',
  voucher: '💳',
  perk: '🚚',
};

const SmartLoyaltyRewardsPanel = ({ smartRewards, points = 0 }) => {
  const rewards = smartRewards?.rewards || [];

  return (
    <div className="comm-loyalty">
      <section className="comm-card comm-loyalty__hero">
        <Gift size={28} aria-hidden />
        <div>
          <h3 style={{ margin: '0 0 4px' }}>Programme de fidélité intelligent</h3>
          <p className="comm-muted">{smartRewards?.aiSummary}</p>
        </div>
        <div className="comm-loyalty__pts">{points} pts</div>
      </section>

      {!rewards.length ? (
        <p className="comm-empty">Aucune récompense disponible pour le moment.</p>
      ) : (
        <div className="comm-rewards-grid">
          {rewards.map((r) => (
            <article key={r.id} className={`comm-card comm-reward${r.auto ? ' comm-reward--auto' : ''}`}>
              <div className="comm-reward__icon" aria-hidden>{typeIcon[r.type] || '🎁'}</div>
              <div className="comm-reward__body">
                <h4>{r.title}</h4>
                <p className="comm-muted">{r.description}</p>
                <div className="comm-reward__meta">
                  {r.auto ? (
                    <span className="comm-badge comm-badge--ai">
                      <Sparkles size={12} style={{ verticalAlign: 'middle' }} /> IA — automatique
                    </span>
                  ) : (
                    <span className="comm-badge">{r.pointsCost} pts</span>
                  )}
                  <span className="comm-reward__reason">{r.reason}</span>
                </div>
              </div>
              {!r.auto && (
                <button type="button" className="comm-btn comm-btn--secondary" disabled={points < (r.pointsCost || 0)}>
                  Échanger
                </button>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

export default SmartLoyaltyRewardsPanel;
