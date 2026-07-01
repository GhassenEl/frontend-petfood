import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import './RecommendedForYouButton.css';

const HUB_BY_ROLE = {
  client: '/client-recommendations',
  vet: '/vet/recommendations',
  veterinarian: '/vet/recommendations',
  admin: '/admin/recommendations',
  livreur: '/livreur/recommendations',
  moderator: '/moderator/recommendations',
  vendor: '/vendor/recommendations',
};

const ALLOWED_ROLES = ['client', 'vet', 'veterinarian', 'admin', 'livreur', 'moderator', 'vendor'];

const RecommendedForYouButton = ({ bottomOffset = 88, align = 'right' }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const role = user?.role || 'client';
  const to = HUB_BY_ROLE[role];

  if (!to || !ALLOWED_ROLES.includes(role)) {
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
