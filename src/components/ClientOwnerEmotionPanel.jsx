import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ArrowRight } from 'lucide-react';
import useOwnerEmotionDashboard from '../hooks/useOwnerEmotionDashboard';
import { emotionMeta } from '../constants/ownerEmotions';

const ClientOwnerEmotionPanel = ({ compact = false }) => {
  const { data, loading } = useOwnerEmotionDashboard();

  if (loading) return <p style={{ color: '#94a3b8', fontSize: 14 }}>Analyse de vos ressentis…</p>;
  if (!data) return null;

  const topService = (data.serviceBreakdown || []).find((s) => s.count > 0);

  return (
    <div
      style={{
        background: 'linear-gradient(135deg, #fff1f2, #fce7f3)',
        borderRadius: 16,
        padding: compact ? 14 : 20,
        marginBottom: compact ? 16 : 24,
        border: '1px solid #fbcfe8',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 8 }}>
        <Heart size={22} color="#db2777" />
        <strong style={{ flex: 1 }}>Ressenti propriétaire</strong>
        <Link to="/client-emotions" style={{ fontSize: 12, fontWeight: 700, color: '#be185d', textDecoration: 'none' }}>
          Analyse complète <ArrowRight size={12} />
        </Link>
      </div>
      <p style={{ margin: '0 0 6px', fontSize: 14 }}>
        Humeur globale : <strong>{data.globalMoodLabel}</strong>
        {data.totalFeedbacks > 0 && ` · ${data.totalFeedbacks} avis`}
      </p>
      {topService && (
        <p style={{ margin: 0, fontSize: 13, color: '#9d174d' }}>
          {topService.icon} {topService.label} — {emotionMeta(topService.dominantEmotion).emoji}{' '}
          {emotionMeta(topService.dominantEmotion).label}
        </p>
      )}
      {data.needsAttention?.length > 0 && (
        <p style={{ margin: '8px 0 0', fontSize: 12, color: '#b45309' }}>
          {data.needsAttention.length} service(s) à améliorer selon vos retours
        </p>
      )}
    </div>
  );
};

export default ClientOwnerEmotionPanel;
