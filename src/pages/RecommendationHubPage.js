import React, { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { loadRecommendationPipeline } from '../services/recommendationPipelineService';
import { ROLE_PIPELINE_META } from '../utils/recommendationDemoData';
import './RecommendationHubPage.css';

const RecommendationHubPage = () => {
  const { user } = useAuth();
  const role = user?.role || 'client';
  const meta = ROLE_PIPELINE_META[role === 'veterinarian' ? 'vet' : role] || ROLE_PIPELINE_META.client;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const pack = await loadRecommendationPipeline(role, user?.id || user?._id);
      setData(pack);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [role, user?.id, user?._id]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return <div className="rechub-page rechub-empty">Pipeline de recommandation en cours…</div>;
  }

  if (!data) {
    return <div className="rechub-page rechub-empty">Recommandations indisponibles.</div>;
  }

  return (
    <div className="rechub-page">
      <header className="rechub-hero">
        <h1>{meta.title}</h1>
        <p>{meta.subtitle}</p>
        <p style={{ marginTop: 8, fontSize: 12, opacity: 0.8 }}>
          Poids hybride — contenu {(data.pipeline.weights.content * 100).toFixed(0)}% · collaboratif {(data.pipeline.weights.collaborative * 100).toFixed(0)}%
          {data.mode === 'demo' && ' · Mode démo'}
        </p>
        <button type="button" className="rechub-refresh" onClick={load}>
          Actualiser le pipeline
        </button>
      </header>

      <div className="rechub-pipeline">
        {data.pipeline.steps.map((step) => (
          <div key={step.id} className={`rechub-step${step.status === 'done' ? ' rechub-step--done' : ''}`}>
            <strong>{step.label}</strong>
            <span>{step.detail || (step.weight != null ? `Poids ${(step.weight * 100).toFixed(0)}%` : step.status)}</span>
          </div>
        ))}
      </div>

      {data.similarUsers?.length > 0 && (
        <div className="rechub-similar">
          <strong>Utilisateurs similaires :</strong>{' '}
          {data.similarUsers.map((u) => `${u.userId} (${(u.similarity * 100).toFixed(0)}%)`).join(' · ')}
        </div>
      )}

      {data.recommendations.length === 0 ? (
        <p className="rechub-empty">Aucune recommandation — enrichissez votre historique.</p>
      ) : (
        <div className="rechub-grid">
          {data.recommendations.map((item) => (
            <article key={item.id} className="rechub-card">
              <h3>{item.name}</h3>
              <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>
                {item.category}{item.animalType ? ` · ${item.animalType}` : ''}
                {item.price != null ? ` · ${item.price} TND` : ''}
              </p>
              <div className="rechub-scores">
                <span className="rechub-badge rechub-badge--hybrid">
                  Hybride {(item.hybridScore * 100).toFixed(0)}%
                </span>
                <span className="rechub-badge rechub-badge--content">
                  Contenu {(item.contentScore * 100).toFixed(0)}%
                </span>
                <span className="rechub-badge rechub-badge--collab">
                  Collab. {(item.collaborativeScore * 100).toFixed(0)}%
                </span>
              </div>
              {item.reasons?.length > 0 && (
                <ul className="rechub-reasons">
                  {item.reasons.map((r) => (
                    <li key={r}>{r}</li>
                  ))}
                </ul>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecommendationHubPage;
