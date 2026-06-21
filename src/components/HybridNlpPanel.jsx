import React, { useState } from 'react';
import { runHybridAnalysis } from '../services/hybridNlpService';

const DECISION_LABELS = {
  allow: { label: 'Autorisé', color: '#059669', bg: '#d1fae5' },
  flag: { label: 'Signalé', color: '#d97706', bg: '#fef3c7' },
  review: { label: 'Revue requise', color: '#2563eb', bg: '#dbeafe' },
  block: { label: 'Bloqué', color: '#dc2626', bg: '#fee2e2' },
};

const SENTIMENT_LABELS = {
  positive: { label: 'Positif', color: '#059669' },
  negative: { label: 'Négatif', color: '#dc2626' },
  neutral: { label: 'Neutre', color: '#64748b' },
};

const HybridNlpPanel = () => {
  const [text, setText] = useState('');
  const [rating, setRating] = useState('');
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);

  const analyze = async () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setBusy(true);
    try {
      const ctx = rating ? { rating: Number(rating) } : {};
      const res = await runHybridAnalysis(trimmed, ctx);
      setResult(res);
    } finally {
      setBusy(false);
    }
  };

  const decisionStyle = result ? DECISION_LABELS[result.decision] || DECISION_LABELS.allow : null;
  const sentStyle = result ? SENTIMENT_LABELS[result.sentiment?.label] || SENTIMENT_LABELS.neutral : null;

  return (
    <div className="cia-panel">
      <h2 className="cia-panel__title">Filtrage hybride NLP + Deep Learning</h2>
      <p className="cia-panel__desc">
        Fusion lexique français, règles de modération, détection d&apos;anomalies et modèle BERT multilingue (API ML).
      </p>

      <textarea
        className="cia-textarea"
        rows={4}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Collez un avis, commentaire ou message à analyser…"
      />

      <div className="cia-row">
        <label className="cia-inline-label">
          Note (optionnel)
          <select
            className="cia-select"
            value={rating}
            onChange={(e) => setRating(e.target.value)}
          >
            <option value="">—</option>
            {[1, 2, 3, 4, 5].map((n) => (
              <option key={n} value={n}>{n} ★</option>
            ))}
          </select>
        </label>
        <button type="button" className="cia-btn cia-btn--primary" onClick={analyze} disabled={busy || !text.trim()}>
          {busy ? 'Analyse…' : 'Analyser'}
        </button>
      </div>

      {result && (
        <div className="cia-results">
          <div className="cia-stats-grid">
            <div className="cia-stat" style={{ borderColor: decisionStyle.color }}>
              <span>Décision</span>
              <strong style={{ color: decisionStyle.color }}>{decisionStyle.label}</strong>
            </div>
            <div className="cia-stat" style={{ borderColor: sentStyle.color }}>
              <span>Sentiment</span>
              <strong style={{ color: sentStyle.color }}>{sentStyle.label}</strong>
            </div>
            <div className="cia-stat">
              <span>Score hybride</span>
              <strong>{result.hybridScore}</strong>
            </div>
            <div className="cia-stat">
              <span>Source</span>
              <strong>{result.source}</strong>
            </div>
          </div>

          <section className="cia-section">
            <h3>Analyse des mots</h3>
            <p className="cia-muted">
              {result.words.tokenCount} tokens · {result.words.uniqueWords} mots uniques
            </p>
            {result.words.positiveHits?.length > 0 && (
              <p><strong>Positifs :</strong> {result.words.positiveHits.join(', ')}</p>
            )}
            {result.words.negativeHits?.length > 0 && (
              <p><strong>Négatifs :</strong> {result.words.negativeHits.join(', ')}</p>
            )}
            <div className="cia-word-cloud">
              {result.words.topWords.map(({ word, count }) => (
                <span key={word} className="cia-word-tag" style={{ fontSize: `${12 + count * 2}px` }}>
                  {word} ({count})
                </span>
              ))}
            </div>
          </section>

          <section className="cia-section">
            <h3>Sentiment hybride</h3>
            <p>Confiance : {(result.sentiment.confidence * 100).toFixed(0)}%</p>
            {result.sentiment.deepLearning && (
              <p className="cia-muted">
                DL — {result.sentiment.deepLearning.model} · {result.sentiment.deepLearning.raw}
              </p>
            )}
          </section>

          <section className="cia-section">
            <h3>Détection d&apos;anomalies</h3>
            <p>{result.anomalies.summary}</p>
            {result.anomalies.flags?.length > 0 && (
              <ul className="cia-flag-list">
                {result.anomalies.flags.map((f, i) => (
                  <li key={`${f.type}-${i}`}>
                    <span className="cia-flag-type">{f.type}</span> {f.reason}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      )}
    </div>
  );
};

export default HybridNlpPanel;
