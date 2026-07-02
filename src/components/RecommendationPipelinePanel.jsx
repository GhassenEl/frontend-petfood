import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, Target } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import {
  loadRecommendationPipeline,
  enrichRecommendationsWithCatalog,
} from '../services/recommendationPipelineService';
import { getRecommendationHubRoute } from '../config/recommendationRoutes';
import { ROLE_PIPELINE_META } from '../utils/recommendationDemoData';
import './RecommendationPipelinePanel.css';

const RecommendationPipelinePanel = ({
  role: roleProp,
  limit = 6,
  compact = false,
  catalog = null,
  hubLink,
  onSelectItem,
  className = '',
  hideWhenEmpty = false,
}) => {
  const { user } = useAuth();
  const role = roleProp || user?.role || 'client';
  const normalizedRole = role === 'veterinarian' ? 'vet' : role;
  const meta = ROLE_PIPELINE_META[normalizedRole] || ROLE_PIPELINE_META.client;
  const fullHubLink = hubLink || getRecommendationHubRoute(normalizedRole);

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const pack = await loadRecommendationPipeline(role, user?.id || user?._id);
      let recs = pack?.recommendations || [];
      if (catalog?.length && normalizedRole === 'client') {
        recs = enrichRecommendationsWithCatalog(recs, catalog);
      }
      setData({ ...pack, recommendations: recs.slice(0, limit) });
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [role, user?.id, user?._id, catalog, limit, normalizedRole]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <div className={`recpipe-panel recpipe-panel--loading ${className}`}>
        <p>Analyse du pipeline hybride…</p>
      </div>
    );
  }

  if (!data?.recommendations?.length) {
    return hideWhenEmpty ? null : (
      <div className={`recpipe-panel recpipe-panel--empty ${className}`}>
        <p>Aucune recommandation — consultez le hub IA pour enrichir votre profil.</p>
        <Link to={fullHubLink} className="recpipe-hub-link">Ouvrir le hub →</Link>
      </div>
    );
  }

  const { recommendations, pipeline, similarUsers, mode } = data;

  return (
    <motion.section
      className={`recpipe-panel${compact ? ' recpipe-panel--compact' : ''} ${className}`}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="recpipe-header">
        <div>
          <h2 className="recpipe-title">
            <Target size={compact ? 18 : 20} />
            {compact ? meta.title : `🎯 ${meta.title}`}
          </h2>
          {!compact && (
            <p className="recpipe-subtitle">{meta.subtitle}</p>
          )}
          <p className="recpipe-weights">
            Contenu {(pipeline.weights.content * 100).toFixed(0)}%
            · Collab. {(pipeline.weights.collaborative * 100).toFixed(0)}%
            {mode === 'hybrid' && ' · Historique actif'}
            {mode === 'demo' && ' · Démo'}
          </p>
        </div>
        <Link to={fullHubLink} className="recpipe-hub-link">
          {compact ? 'Hub IA →' : 'Pipeline complet →'}
        </Link>
      </div>

      {!compact && (
        <div className="recpipe-steps">
          {pipeline.steps.map((step) => (
            <span
              key={step.id}
              className={`recpipe-step${step.status === 'done' ? ' recpipe-step--done' : ''}`}
            >
              {step.label}
            </span>
          ))}
        </div>
      )}

      {similarUsers?.length > 0 && !compact && (
        <p className="recpipe-similar">
          <Sparkles size={14} />
          {similarUsers.length} profil(s) similaire(s) — co-sélections prises en compte
        </p>
      )}

      <div className="recpipe-grid">
        {recommendations.map((item) => (
          <article
            key={item.id || item._id || item.name}
            className="recpipe-card"
            role={onSelectItem ? 'button' : undefined}
            tabIndex={onSelectItem ? 0 : undefined}
            onClick={() => onSelectItem?.(item)}
            onKeyDown={(e) => {
              if (onSelectItem && (e.key === 'Enter' || e.key === ' ')) {
                e.preventDefault();
                onSelectItem(item);
              }
            }}
          >
            <div className="recpipe-card-top">
              <h3>{item.name}</h3>
              <span className="recpipe-score recpipe-score--hybrid">
                {(item.hybridScore * 100).toFixed(0)}%
              </span>
            </div>
            <p className="recpipe-meta">
              {item.category}
              {item.animalType ? ` · ${item.animalType}` : ''}
              {item.price != null ? ` · ${Number(item.price).toFixed(2)} TND` : ''}
            </p>
            <div className="recpipe-badges">
              <span className="recpipe-score recpipe-score--content">
                C {(item.contentScore * 100).toFixed(0)}%
              </span>
              <span className="recpipe-score recpipe-score--collab">
                S {(item.collaborativeScore * 100).toFixed(0)}%
              </span>
            </div>
            {item.recommendedReason && (
              <p className="recpipe-reason">{item.recommendedReason}</p>
            )}
          </article>
        ))}
      </div>
    </motion.section>
  );
};

export default RecommendationPipelinePanel;
