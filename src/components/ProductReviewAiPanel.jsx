import React, { useEffect, useState } from 'react';
import { Sparkles, ThumbsUp, ThumbsDown, Star } from 'lucide-react';
import { getProductReviews } from '../services/reviewService';
import { analyzeProductReviews } from '../utils/reviewInsightAnalyzer';

const EMOTION_LABELS = {
  happy: '😊 Très positif',
  satisfied: '🙂 Satisfait',
  neutral: '😐 Neutre',
  disappointed: '😞 Déçu',
  frustrated: '😠 Frustré',
};

const ProductReviewAiPanel = ({ productId, productName }) => {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!productId) {
      setLoading(false);
      return undefined;
    }

    let cancelled = false;
    setLoading(true);

    getProductReviews(productId)
      .then((reviews) => {
        if (cancelled) return;
        setInsights(analyzeProductReviews(reviews));
      })
      .catch(() => {
        if (!cancelled) setInsights(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [productId]);

  if (loading) {
    return (
      <p style={{ margin: '16px 0 0', fontSize: 13, color: '#94a3b8' }}>
        Analyse des avis clients…
      </p>
    );
  }

  if (!insights) {
    return (
      <div style={wrapStyle}>
        <p style={titleStyle}><Sparkles size={16} color="#7c3aed" /> Analyse IA des avis</p>
        <p style={{ margin: 0, fontSize: 13, color: '#64748b' }}>
          Pas assez d&apos;avis pour {productName || 'ce produit'}. Soyez le premier à donner votre retour !
        </p>
      </div>
    );
  }

  return (
    <div style={wrapStyle}>
      <p style={titleStyle}>
        <Sparkles size={16} color="#7c3aed" /> Analyse IA des avis
        <span style={metaStyle}>
          <Star size={12} fill="#f59e0b" color="#f59e0b" />
          {insights.avgRating}/5 · {insights.count} avis
        </span>
      </p>

      <p style={{ margin: '0 0 12px', fontSize: 14, color: '#374151', lineHeight: 1.55 }}>
        {insights.summary}
      </p>

      <p style={{ margin: '0 0 8px', fontSize: 12, color: '#64748b' }}>
        Tonalité dominante : {EMOTION_LABELS[insights.topEmotion] || insights.topEmotion}
      </p>

      <div style={gridStyle}>
        {insights.strengths.length > 0 && (
          <div>
            <p style={sectionTitle}><ThumbsUp size={14} color="#16a34a" /> Points forts</p>
            <ul style={listStyle}>
              {insights.strengths.map((s) => (
                <li key={s.id} style={chipStyle('#ecfdf5', '#166534')}>
                  {s.label}
                  {s.pct > 0 && <span style={{ opacity: 0.75 }}> · {s.pct}%</span>}
                </li>
              ))}
            </ul>
          </div>
        )}

        {insights.weaknesses.length > 0 && (
          <div>
            <p style={sectionTitle}><ThumbsDown size={14} color="#dc2626" /> Points faibles</p>
            <ul style={listStyle}>
              {insights.weaknesses.map((w) => (
                <li key={w.id} style={chipStyle('#fef2f2', '#991b1b')}>
                  {w.label}
                  {w.pct > 0 && <span style={{ opacity: 0.75 }}> · {w.pct}%</span>}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

const wrapStyle = {
  marginTop: 16,
  padding: 16,
  background: '#faf5ff',
  borderRadius: 14,
  border: '1px solid #e9d5ff',
};

const titleStyle = {
  margin: '0 0 10px',
  fontWeight: 800,
  fontSize: 14,
  color: '#5b21b6',
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  flexWrap: 'wrap',
};

const metaStyle = {
  marginLeft: 'auto',
  fontSize: 12,
  fontWeight: 700,
  color: '#92400e',
  display: 'inline-flex',
  alignItems: 'center',
  gap: 4,
};

const gridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
  gap: 12,
};

const sectionTitle = {
  margin: '0 0 6px',
  fontSize: 13,
  fontWeight: 700,
  color: '#374151',
  display: 'flex',
  alignItems: 'center',
  gap: 6,
};

const listStyle = {
  margin: 0,
  padding: 0,
  listStyle: 'none',
  display: 'flex',
  flexDirection: 'column',
  gap: 6,
};

const chipStyle = (bg, color) => ({
  padding: '6px 10px',
  borderRadius: 8,
  background: bg,
  color,
  fontSize: 12,
  fontWeight: 600,
});

export default ProductReviewAiPanel;
