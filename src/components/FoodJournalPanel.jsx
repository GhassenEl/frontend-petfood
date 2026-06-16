import React from 'react';
import { BookOpen, Sparkles } from 'lucide-react';

const FoodJournalPanel = ({ journal, loading }) => {
  if (loading) return <p className="an-loading">Chargement du journal alimentaire…</p>;
  if (!journal) return <p className="an-empty">Journal indisponible.</p>;

  const { entries, stats, advice, weightTrend, reactionLabels } = journal;

  return (
    <div className="an-journal">
      <p className="an-ai-summary">
        <BookOpen size={16} aria-hidden /> {journal.aiSummary}
      </p>

      <div className="an-kpi-row">
        <div className="an-kpi">
          <span>Repas</span>
          <strong>{stats.entriesCount}</strong>
        </div>
        <div className="an-kpi">
          <span>Moy. / jour</span>
          <strong>{stats.avgDailyGrams ?? '—'} g</strong>
        </div>
        <div className="an-kpi">
          <span>Adhérence</span>
          <strong>{stats.adherencePct != null ? `${stats.adherencePct} %` : '—'}</strong>
        </div>
        <div className="an-kpi">
          <span>Poids</span>
          <strong>{weightTrend?.trend || '—'}</strong>
        </div>
      </div>

      <ul className="an-journal-entries">
        {entries.map((e, i) => {
          const rx = reactionLabels[e.reaction] || { icon: '•', label: e.reaction };
          return (
            <li key={`${e.date}-${e.meal}-${i}`}>
              <span className="an-journal-date">
                {new Date(e.date).toLocaleDateString('fr-FR')} · {e.meal}
              </span>
              <strong>{e.product}</strong>
              <span>{e.grams} g</span>
              <span className="an-journal-reaction">{rx.icon} {rx.label}</span>
            </li>
          );
        })}
      </ul>

      <div className="an-journal-advice">
        <h4><Sparkles size={16} /> Conseils IA personnalisés</h4>
        <ul className="an-adjust-list">
          {advice.map((a) => (
            <li key={a.id}>
              <Sparkles size={14} aria-hidden />
              <div>
                <strong>{a.title}</strong>
                <p>{a.text}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default FoodJournalPanel;
