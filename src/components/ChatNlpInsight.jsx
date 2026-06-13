import React from 'react';
import { AlertTriangle, Brain, Sparkles } from 'lucide-react';
import { EMOTION_STYLE } from '../constants/ownerEmotions';

const ChatNlpInsight = ({ nlp, compact = false }) => {
  if (!nlp) return null;

  const style = EMOTION_STYLE[nlp.emotion] || EMOTION_STYLE.neutral;
  const keywords = [
    ...(nlp.keywords?.positive || []).map((w) => ({ w, tone: 'pos' })),
    ...(nlp.keywords?.negative || []).map((w) => ({ w, tone: 'neg' })),
  ].slice(0, 5);

  return (
    <div
      style={{
        marginTop: compact ? 6 : 8,
        padding: compact ? '6px 8px' : '8px 10px',
        borderRadius: 10,
        background: '#f8fafc',
        border: '1px solid #e2e8f0',
        fontSize: 11,
        lineHeight: 1.45,
      }}
    >
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 6, marginBottom: keywords.length || nlp.anomaly?.detected ? 6 : 0 }}>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            padding: '2px 8px',
            borderRadius: 999,
            background: style.bg,
            color: style.color,
            fontWeight: 700,
          }}
        >
          {nlp.emotionEmoji} {nlp.emotionLabel}
        </span>
        {nlp.modelLabel && (
          <span style={{ color: '#64748b', display: 'inline-flex', alignItems: 'center', gap: 3 }}>
            <Brain size={11} /> {nlp.modelLabel}
          </span>
        )}
        {nlp.sentiment && (
          <span style={{ color: '#94a3b8' }}>
            sentiment {nlp.sentiment}
          </span>
        )}
      </div>

      {keywords.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: nlp.anomaly?.detected ? 6 : 0 }}>
          <Sparkles size={11} color="#7c3aed" style={{ marginTop: 2 }} />
          {keywords.map(({ w, tone }) => (
            <span
              key={`${tone}-${w}`}
              style={{
                padding: '1px 6px',
                borderRadius: 6,
                background: tone === 'pos' ? '#dcfce7' : '#fee2e2',
                color: tone === 'pos' ? '#166534' : '#991b1b',
                fontWeight: 600,
              }}
            >
              {tone === 'pos' ? '+' : '-'}{w}
            </span>
          ))}
        </div>
      )}

      {nlp.anomaly?.detected && (
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 5,
            color: nlp.anomaly.severity === 'high' ? '#b91c1c' : '#92400e',
            fontWeight: 600,
          }}
        >
          <AlertTriangle size={12} style={{ flexShrink: 0, marginTop: 1 }} />
          <span>{nlp.anomaly.label || 'Anomalie détectée'}</span>
        </div>
      )}
    </div>
  );
};

export default ChatNlpInsight;
