import React, { useEffect, useState } from 'react';
import { Brain, MessageSquare, TrendingDown, TrendingUp } from 'lucide-react';
import { fetchMyCommentSentiments, fetchAdminCommentSentiments } from '../services/mlService';
import { EMOTION_STYLE } from '../constants/ownerEmotions';

const SENTIMENT_STYLE = {
  positive: { bg: '#dcfce7', color: '#166534', label: 'Positif' },
  negative: { bg: '#fee2e2', color: '#991b1b', label: 'Négatif' },
  neutral: { bg: '#f3f4f6', color: '#4b5563', label: 'Neutre' },
};

const SOURCE_LABELS = {
  product: '🛍️ Produit',
  service: '🛎️ Service',
  complaint: '⚠️ Réclamation',
};

const CommentSentimentPanel = ({ variant = 'client' }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    const fetcher = variant === 'admin' ? fetchAdminCommentSentiments : fetchMyCommentSentiments;
    fetcher()
      .then(setData)
      .catch((err) => setError(err?.response?.data?.error || 'Analyse indisponible'))
      .finally(() => setLoading(false));
  }, [variant]);

  if (loading) {
    return <p style={{ color: '#64748b', textAlign: 'center', padding: 20 }}>Analyse des sentiments en cours…</p>;
  }
  if (error) {
    return <p style={{ color: '#b91c1c', padding: 16 }}>{error}</p>;
  }
  if (!data) return null;

  const { sentimentCounts = {}, moodLabel, positiveRate, negativeRate, keywordsCloud, recent = [], alerts = [] } = data;

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 10, marginBottom: 18 }}>
        <div className="cc-stat">
          <strong style={{ color: '#1e3a8a' }}>{data.total || 0}</strong>
          <span>Commentaires</span>
        </div>
        <div className="cc-stat">
          <strong style={{ color: '#16a34a' }}>{Math.round((positiveRate || 0) * 100)} %</strong>
          <span>Positifs</span>
        </div>
        <div className="cc-stat">
          <strong style={{ color: '#dc2626' }}>{Math.round((negativeRate || 0) * 100)} %</strong>
          <span>Négatifs</span>
        </div>
        <div className="cc-stat">
          <strong style={{ color: '#7c3aed' }}>{moodLabel || '—'}</strong>
          <span>Tonalité globale</span>
        </div>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 18 }}>
        {['positive', 'neutral', 'negative'].map((key) => {
          const style = SENTIMENT_STYLE[key];
          const count = sentimentCounts[key] || 0;
          return (
            <span
              key={key}
              style={{
                padding: '6px 12px',
                borderRadius: 999,
                background: style.bg,
                color: style.color,
                fontWeight: 700,
                fontSize: 13,
              }}
            >
              {key === 'positive' && <TrendingUp size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />}
              {key === 'negative' && <TrendingDown size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />}
              {style.label} : {count}
            </span>
          );
        })}
      </div>

      {(keywordsCloud?.positive?.length > 0 || keywordsCloud?.negative?.length > 0) && (
        <div style={{ marginBottom: 18, padding: 14, background: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0' }}>
          <strong style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <Brain size={16} color="#7c3aed" /> Mots clés détectés dans les commentaires
          </strong>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {(keywordsCloud.positive || []).map(({ word, count }) => (
              <span key={`p-${word}`} style={{ padding: '2px 8px', borderRadius: 6, background: '#dcfce7', color: '#166534', fontSize: 12, fontWeight: 600 }}>
                +{word} ({count})
              </span>
            ))}
            {(keywordsCloud.negative || []).map(({ word, count }) => (
              <span key={`n-${word}`} style={{ padding: '2px 8px', borderRadius: 6, background: '#fee2e2', color: '#991b1b', fontSize: 12, fontWeight: 600 }}>
                -{word} ({count})
              </span>
            ))}
          </div>
        </div>
      )}

      {alerts.length > 0 && variant === 'admin' && (
        <div style={{ marginBottom: 18, padding: 14, background: '#fef2f2', borderRadius: 12, border: '1px solid #fecaca' }}>
          <strong style={{ color: '#991b1b' }}>⚠️ Commentaires à surveiller ({alerts.length})</strong>
          {alerts.slice(0, 4).map((row) => (
            <p key={row.id} style={{ margin: '8px 0 0', fontSize: 13, color: '#7f1d1d' }}>
              {row.emotionEmoji} {row.sourceLabel} — « {row.text?.slice(0, 80)}… »
            </p>
          ))}
        </div>
      )}

      <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: 10 }}>
        <MessageSquare size={18} style={{ verticalAlign: 'middle', marginRight: 6 }} />
        Analyse par commentaire
      </h3>

      {recent.length === 0 ? (
        <p style={{ color: '#94a3b8' }}>Aucun commentaire analysé pour le moment.</p>
      ) : (
        <div className="cc-list">
          {recent.map((row) => {
            const sentStyle = SENTIMENT_STYLE[row.sentiment] || SENTIMENT_STYLE.neutral;
            const emStyle = EMOTION_STYLE[row.emotion] || EMOTION_STYLE.neutral;
            return (
              <article key={`${row.source}-${row.id}`} className="cc-card review">
                <div className="cc-meta" style={{ flexWrap: 'wrap', gap: 8 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#475569' }}>
                    {SOURCE_LABELS[row.source] || row.source} · {row.sourceLabel}
                  </span>
                  <span style={{ padding: '2px 8px', borderRadius: 999, background: sentStyle.bg, color: sentStyle.color, fontSize: 11, fontWeight: 700 }}>
                    {sentStyle.label}
                  </span>
                  <span style={{ padding: '2px 8px', borderRadius: 999, background: emStyle.bg, color: emStyle.color, fontSize: 11, fontWeight: 700 }}>
                    {row.emotionEmoji} {row.emotionLabel}
                  </span>
                  {row.rating && <span style={{ fontSize: 12, color: '#f59e0b', fontWeight: 700 }}>{row.rating}/5 ★</span>}
                  {row.modelLabel && (
                    <span style={{ fontSize: 11, color: '#94a3b8' }}>NLP : {row.modelLabel}</span>
                  )}
                </div>
                {row.text && <p className="cc-message" style={{ marginTop: 8 }}>{row.text}</p>}
                {row.insight && (
                  <p style={{ margin: '6px 0 0', fontSize: 11, color: '#64748b' }}>{row.insight}</p>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CommentSentimentPanel;
