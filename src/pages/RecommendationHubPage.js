import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { loadRecommendationPipeline } from '../services/recommendationPipelineService';
import { fetchHybridRecommendations } from '../services/hybridRecommendationService';
import { getRecommendationHubRoute, normalizeRecommendationRole } from '../config/recommendationRoutes';
import { normalizeRecommendationPack } from '../utils/normalizeRecommendationPack';
import { getVendorPetProfileRecommendations } from '../utils/vendorPetRecommendationEngine';
import './RecommendationHubPage.css';

const RecommendationHubPage = () => {
  const { user } = useAuth();
  const role = normalizeRecommendationRole(user?.role || 'client');
  const hubRoute = getRecommendationHubRoute(role);
  const meta = useMemo(() => {
    const pack = normalizeRecommendationPack({ role }, role);
    return pack?.meta || { title: 'Recommandations IA', subtitle: 'Moteur hybride PetfoodTN' };
  }, [role]);

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setApiError('');
    try {
      let pack = null;
      try {
        const apiRaw = await fetchHybridRecommendations({
          role,
          limit: 12,
        });
        pack = normalizeRecommendationPack(apiRaw, role);
        if (!pack?.recommendations?.length) {
          pack = null;
        }
      } catch (e) {
        setApiError(e?.response?.data?.error || 'API indisponible — fallback local.');
      }

      if (!pack) {
        pack = await loadRecommendationPipeline(role, user?.id || user?._id);
      }

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

  const topRecommendations = useMemo(
    () => [...(data?.recommendations || [])].sort((a, b) => (b.hybridScore || 0) - (a.hybridScore || 0)).slice(0, 3),
    [data?.recommendations],
  );

  const petProfileRecos = useMemo(
    () => (role === 'vendor' ? getVendorPetProfileRecommendations(data?.recommendations || []) : []),
    [role, data?.recommendations],
  );

  const weights = data?.pipeline?.weights || { content: 0.55, collaborative: 0.45 };
  const steps = data?.pipeline?.steps || [];

  if (loading) {
    return <div className="rechub-page rechub-empty">Pipeline de recommandation en cours…</div>;
  }

  if (!data) {
    return (
      <div className="rechub-page rechub-empty">
        <p>Recommandations indisponibles.</p>
        <button type="button" className="rechub-refresh" onClick={load}>Réessayer</button>
      </div>
    );
  }

  return (
    <div className="rechub-page">
      <header className="rechub-hero">
        <h1>{meta.title}</h1>
        <p>{meta.subtitle}</p>
        <p style={{ marginTop: 8, fontSize: 12, opacity: 0.8 }}>
          Poids hybride — contenu {(weights.content * 100).toFixed(0)}% · collaboratif {(weights.collaborative * 100).toFixed(0)}%
          {data.mode === 'demo' && ' · Mode démo'}
          {data.mode === 'hybrid-live' && ' · FastAPI live'}
          {data.mode === 'hybrid-fallback' && ' · Fallback Node'}
          {data.mode === 'hybrid-api' && ' · API hybride'}
        </p>
        {apiError && <p className="rechub-error" style={{ fontSize: 12 }}>{apiError}</p>}
        <button type="button" className="rechub-refresh" onClick={load}>
          Actualiser via API
        </button>
      </header>

      {topRecommendations.length > 0 && (
        <section className="rechub-top">
          <h2>⭐ Top recommandations</h2>
          <div className="rechub-grid">
            {topRecommendations.map((item, i) => (
              <article key={item.id} className="rechub-card rechub-card--top">
                <span className="rechub-rank">#{i + 1}</span>
                <h3>{item.name}</h3>
                <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>
                  Score hybride {((item.hybridScore || 0) * 100).toFixed(0)}%
                </p>
              </article>
            ))}
          </div>
        </section>
      )}

      {petProfileRecos.length > 0 && (
        <section className="rechub-top" style={{ marginTop: 16 }}>
          <h2>🐾 Recommandations selon profil animal</h2>
          {petProfileRecos.map((profile) => (
            <div key={profile.id} style={{ marginBottom: 12 }}>
              <strong style={{ fontSize: 14 }}>{profile.label}</strong>
              <div className="rechub-grid" style={{ marginTop: 8 }}>
                {profile.recommendations.map((r) => (
                  <article key={`${profile.id}-${r.id}`} className="rechub-card">
                    <h3>{r.name}</h3>
                    <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>{r.reason || r.reasons?.[0]}</p>
                  </article>
                ))}
              </div>
            </div>
          ))}
        </section>
      )}

      {steps.length > 0 && (
        <div className="rechub-pipeline">
          {steps.map((step) => (
            <div key={step.id} className={`rechub-step${step.status === 'done' ? ' rechub-step--done' : ''}`}>
              <strong>{step.label}</strong>
              <span>{step.detail || (step.weight != null ? `Poids ${(step.weight * 100).toFixed(0)}%` : step.status)}</span>
            </div>
          ))}
        </div>
      )}

      {data.similarUsers?.length > 0 && (
        <div className="rechub-similar">
          <strong>Utilisateurs similaires :</strong>{' '}
          {data.similarUsers.map((u) => `${u.userId} (${((u.similarity || 0) * 100).toFixed(0)}%)`).join(' · ')}
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
                  Hybride {((item.hybridScore || 0) * 100).toFixed(0)}%
                </span>
                <span className="rechub-badge rechub-badge--content">
                  Contenu {((item.contentScore || 0) * 100).toFixed(0)}%
                </span>
                <span className="rechub-badge rechub-badge--collab">
                  Collab. {((item.collaborativeScore || 0) * 100).toFixed(0)}%
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

      {role === 'admin' && (
        <p style={{ marginTop: 20, fontSize: 12 }}>
          <Link to={hubRoute}>Hub admin complet →</Link>
        </p>
      )}
    </div>
  );
};

export default RecommendationHubPage;
