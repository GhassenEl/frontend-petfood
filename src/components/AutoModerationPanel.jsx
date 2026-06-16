import React, { useState } from 'react';
import { MessageSquareOff, Eye, EyeOff, Ban } from 'lucide-react';

const ACTION_ICON = {
  reject: Ban,
  hide: EyeOff,
  flag: MessageSquareOff,
  allow: Eye,
};

const ACTION_LABEL = {
  reject: 'Rejeter',
  hide: 'Masquer',
  flag: 'Signaler',
  allow: 'Autoriser',
};

const AutoModerationPanel = ({ queue = [], loading }) => {
  const [filter, setFilter] = useState('all');

  if (loading) {
    return <p className="ais-loading">Filtrage NLP des contenus…</p>;
  }

  const filtered =
    filter === 'all'
      ? queue
      : queue.filter((item) => item.action === filter);

  if (!queue.length) {
    return (
      <div className="ais-empty ais-empty-ok">
        <Eye size={32} aria-hidden />
        <p>Aucun contenu en attente de modération.</p>
      </div>
    );
  }

  return (
    <div className="ais-mod">
      <div className="ais-mod-filters">
        {['all', 'reject', 'hide', 'flag'].map((f) => (
          <button
            key={f}
            type="button"
            className={`ais-filter-btn ${filter === f ? 'is-active' : ''}`}
            onClick={() => setFilter(f)}
          >
            {f === 'all' ? 'Tous' : ACTION_LABEL[f] || f}
          </button>
        ))}
      </div>

      <ul className="ais-mod-list">
        {filtered.map((item) => {
          const Icon = ACTION_ICON[item.action] || Eye;
          return (
            <li key={item.id} className={`ais-mod-item ais-mod-${item.action}`}>
              <div className="ais-mod-head">
                <Icon size={18} aria-hidden />
                <strong>{ACTION_LABEL[item.action] || item.action}</strong>
                <span className="ais-mod-score">Score {item.score}</span>
              </div>
              <p className="ais-mod-text">&laquo; {item.text?.slice(0, 200)}… &raquo;</p>
              <p className="ais-mod-summary">{item.summary}</p>
              {item.categories?.length > 0 && (
                <div className="ais-tags">
                  {item.categories.map((c) => (
                    <span key={c} className="ais-tag">{c}</span>
                  ))}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default AutoModerationPanel;
