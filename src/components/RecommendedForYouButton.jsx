import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getRecommendationHubRoute, RECOMMENDATION_ALLOWED_ROLES } from '../config/recommendationRoutes';
import './RecommendedForYouButton.css';

const RecommendedForYouButton = ({ bottomOffset = 88, align = 'right' }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const role = user?.role || 'client';
  const to = getRecommendationHubRoute(role);

  if (!to || !RECOMMENDATION_ALLOWED_ROLES.includes(role)) {
    return null;
  }

  const className = [
    'recommended-for-you-btn',
    align === 'left' ? 'recommended-for-you-btn--left' : '',
    role === 'admin' ? 'recommended-for-you-btn--admin' : '',
    role === 'vet' || role === 'veterinarian' ? 'recommended-for-you-btn--vet' : '',
    role === 'livreur' ? 'recommended-for-you-btn--livreur' : '',
    role === 'moderator' ? 'recommended-for-you-btn--moderator' : '',
    role === 'vendor' ? 'recommended-for-you-btn--vendor' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type="button"
      className={className}
      style={{ bottom: bottomOffset }}
      onClick={() => navigate(to)}
      title="Recommandé pour vous — moteur hybride IA"
    >
      <Sparkles size={18} />
      <span className="label-long">Recommandé pour vous</span>
      <span className="label-short">Pour vous</span>
    </button>
  );
};

export default RecommendedForYouButton;
