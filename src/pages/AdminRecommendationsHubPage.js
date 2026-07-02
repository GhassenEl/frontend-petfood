import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { RefreshCw, Target } from 'lucide-react';
import api from '../utils/api';
import RecommendationPipelinePanel from '../components/RecommendationPipelinePanel';
import {
  fetchAdminClientRecommendations,
  fetchHybridRecommendations,
  fetchSalesTrafficExplanation,
  searchProductsByReviews,
} from '../services/hybridRecommendationService';
import { normalizeRecommendationPack } from '../utils/normalizeRecommendationPack';
import './RecommendationHubPage.css';

const PROFILE_TABS = [
  { id: 'admin', label: 'Plateforme (admin)' },
  { id: 'client', label: 'Par client' },
  { id: 'sales', label: 'CA & trafic' },
  { id: 'search', label: 'Recherche NLP' },
];

const AdminRecommendationsHubPage = () => {
  const [tab, setTab] = useState('admin');
  const [adminPack, setAdminPack] = useState(null);
  const [clients, setClients] = useState([]);
  const [selectedClientId, setSelectedClientId] = useState('');
  const [clientPack, setClientPack] = useState(null);
  const [salesExplain, setSalesExplain] = useState(null);
  const [searchQ, setSearchQ] = useState('');
  const [searchMinRating, setSearchMinRating] = useState('3.5');
  const [searchResults, setSearchResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadAdminHybrid = useCallback(async () => {
    try {
      const raw = await fetchHybridRecommendations({ role: 'admin', limit: 12 });
      setAdminPack(normalizeRecommendationPack(raw, 'admin'));
    } catch (e) {
      setAdminPack(null);
      setError(e?.response?.data?.error || 'Impossible de charger les recommandations admin.');
    }
  }, []);

  const loadClients = useCallback(async () => {
    try {
      const { data } = await api.get('/users', { params: { role: 'client', limit: 50 } });
      const list = Array.isArray(data) ? data : data?.users || [];
      setClients(list);
      if (list.length && !selectedClientId) {
        setSelectedClientId(String(list[0].id || list[0]._id));
      }
    } catch {
      setClients([]);
    }
  }, [selectedClientId]);

  const loadSales = useCallback(async () => {
    try {
      setSalesExplain(await fetchSalesTrafficExplanation());
    } catch {
      setSalesExplain(null);
    }
  }, []);

  const refreshAll = useCallback(async () => {
    setLoading(true);
    setError('');
    await Promise.all([loadAdminHybrid(), loadClients(), loadSales()]);
    setLoading(false);
  }, [loadAdminHybrid, loadClients, loadSales]);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  useEffect(() => {
    if (!selectedClientId || tab !== 'client') return;
    (async () => {
      try {
        const raw = await fetchAdminClientRecommendations(selectedClientId, 12);
        setClientPack(normalizeRecommendationPack(raw, 'client'));
      } catch {
        setClientPack(null);
      }
    })();
  }, [selectedClientId, tab]);

  const runSearch = async () => {
    try {
      const res = await searchProductsByReviews({
        query: searchQ,
        minRating: Number(searchMinRating) || undefined,
        limit: 12,
      });
      setSearchResults(res);
    } catch {
      setSearchResults({ products: [], count: 0 });
    }
  };

  const adminRecs = adminPack?.recommendations || [];
  const apiSource = adminPack?.pythonPowered ? 'FastAPI' : adminPack?.source === 'node' ? 'Node fallback' : 'API';

  const statusBadge = useMemo(() => {
    if (!adminPack) return null;
    if (adminPack.pythonPowered) return { label: 'ML live', cls: 'ok' };
    if (adminPack.mode === 'hybrid-fallback') return { label: 'Fallback Node', cls: 'warn' };
    return { label: adminPack.mode || 'API', cls: 'neutral' };
  }, [adminPack]);

  if (loading && !adminPack) {
    return <div className="rechub-page rechub-empty">Chargement moteur de recommandation…</div>;
  }

  return (
    <div className="rechub-page">
      <header className="rechub-hero" style={{ background: 'linear-gradient(135deg, #312e81, #7c3aed)' }}>
        <h1>🎯 Recommandé pour vous — Admin</h1>
        <p>Moteur hybride via <code>GET /api/recommendations/*</code> — contenu, collaboratif et NLP avis</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 10, alignItems: 'center' }}>
          {statusBadge && (
            <span className={`rechub-api-badge rechub-api-badge--${statusBadge.cls}`}>{statusBadge.label}</span>
          )}
          <span style={{ fontSize: 12, opacity: 0.85 }}>Source : {apiSource}</span>
          <button type="button" className="rechub-refresh" onClick={refreshAll}>
            <RefreshCw size={14} style={{ verticalAlign: 'middle' }} /> Actualiser API
          </button>
        </div>
      </header>

      {error && <p className="rechub-error">{error}</p>}

      <div className="rechub-tabs" role="tablist">
        {PROFILE_TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            className={`rechub-tab${tab === t.id ? ' rechub-tab--active' : ''}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'admin' && (
        <>
          <RecommendationPipelinePanel role="admin" limit={6} hubLink="/admin/recommendations" hideWhenEmpty />
          <section style={{ marginTop: 20 }}>
            <h2><Target size={18} style={{ verticalAlign: 'middle' }} /> Recommandations plateforme (rôle admin)</h2>
            {adminRecs.length === 0 ? (
              <p className="rechub-empty">Aucune recommandation — vérifiez le catalogue produits.</p>
            ) : (
              <div className="rechub-grid">
                {adminRecs.map((item) => (
                  <article key={item.id} className="rechub-card">
                    <h3>{item.name}</h3>
                    <p style={{ fontSize: 12, color: '#64748b' }}>
                      Score {(item.hybridScore * 100).toFixed(0)}% · {item.recommendedReason || item.reasons?.[0]}
                    </p>
                    <div className="rechub-scores">
                      <span className="rechub-badge rechub-badge--content">C {(item.contentScore * 100).toFixed(0)}%</span>
                      <span className="rechub-badge rechub-badge--collab">S {(item.collaborativeScore * 100).toFixed(0)}%</span>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </>
      )}

      {tab === 'client' && (
        <section>
          <h2>👤 Recommandations par profil client</h2>
          <p style={{ color: '#64748b', fontSize: 14 }}>
            API : <code>GET /api/recommendations/admin/client/:userId</code>
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
            <select
              value={selectedClientId}
              onChange={(e) => setSelectedClientId(e.target.value)}
              style={{ padding: 8, borderRadius: 8, minWidth: 220 }}
            >
              {clients.length === 0 && <option value="">Aucun client</option>}
              {clients.map((c) => (
                <option key={c.id || c._id} value={c.id || c._id}>
                  {c.name || c.email}
                </option>
              ))}
            </select>
          </div>
          {clientPack?.interpretation && (
            <p style={{ color: '#64748b', fontSize: 14 }}>{clientPack.interpretation}</p>
          )}
          <div className="rechub-grid" style={{ marginTop: 12 }}>
            {(clientPack?.recommendations || []).map((item) => (
              <article key={item.id} className="rechub-card">
                <h3>{item.name}</h3>
                <p style={{ fontSize: 12, color: '#64748b' }}>
                  Score {(item.hybridScore * 100).toFixed(0)}% · {item.recommendedReason || item.reasons?.[0]}
                </p>
              </article>
            ))}
          </div>
          {clientPack?.similarUsers?.length > 0 && (
            <p style={{ fontSize: 12, marginTop: 8, color: '#64748b' }}>
              Clients similaires : {clientPack.similarUsers.map((s) => `${s.userId} (${(s.similarity * 100).toFixed(0)}%)`).join(', ')}
            </p>
          )}
        </section>
      )}

      {tab === 'sales' && (
        <section>
          <h2>📈 Interprétation IA — trafic & CA</h2>
          <p style={{ color: '#64748b', fontSize: 13 }}>API : <code>GET /api/recommendations/admin/explain-sales</code></p>
          {salesExplain?.aiSummary ? (
            <div style={{ background: '#f5f3ff', borderRadius: 12, padding: 16, lineHeight: 1.6 }}>
              {salesExplain.aiSummary.split('\n\n').map((p) => (
                <p key={p.slice(0, 24)} style={{ margin: '0 0 10px' }}>{p}</p>
              ))}
              {salesExplain.pythonPowered && (
                <span style={{ fontSize: 11, color: '#7c3aed' }}>✓ FastAPI NLP + analyse ventes</span>
              )}
              {salesExplain.highlights?.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
                  {salesExplain.highlights.map((h) => (
                    <span key={h.label} style={{ background: '#fff', padding: '6px 10px', borderRadius: 8, fontSize: 12 }}>
                      <strong>{h.label}:</strong> {h.value}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <p style={{ color: '#64748b' }}>Données CA indisponibles — lancez FastAPI (<code>npm run dev:ml</code>) pour l&apos;interprétation avancée.</p>
          )}
        </section>
      )}

      {tab === 'search' && (
        <section>
          <h2>🔍 Recherche & filtrage (avis NLP)</h2>
          <p style={{ color: '#64748b', fontSize: 13 }}>API : <code>GET /api/recommendations/search</code></p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
            <input
              placeholder="Rechercher produit…"
              value={searchQ}
              onChange={(e) => setSearchQ(e.target.value)}
              style={{ padding: 8, borderRadius: 8, flex: 1, minWidth: 180 }}
            />
            <input
              type="number"
              step="0.5"
              min="1"
              max="5"
              value={searchMinRating}
              onChange={(e) => setSearchMinRating(e.target.value)}
              style={{ padding: 8, borderRadius: 8, width: 90 }}
              title="Note minimale"
            />
            <button type="button" onClick={runSearch} className="rechub-search-btn">
              Filtrer
            </button>
          </div>
          <div className="rechub-grid">
            {(searchResults?.products || []).slice(0, 8).map((p) => (
              <article key={p.id || p._id} className="rechub-card">
                <h3>{p.name}</h3>
                <p style={{ fontSize: 12, color: '#64748b' }}>
                  NLP boost {((p._nlpBoost || 0) * 100).toFixed(0)}%
                  {p._reviewStats?.avg ? ` · ${p._reviewStats.avg}/5 (${p._reviewStats.count} avis)` : ''}
                </p>
              </article>
            ))}
          </div>
        </section>
      )}

      <p style={{ marginTop: 24, fontSize: 12, color: '#94a3b8' }}>
        Hubs par profil :{' '}
        <Link to="/client-recommendations">Client</Link>
        {' · '}
        <Link to="/vet/recommendations">Vétérinaire</Link>
        {' · '}
        <Link to="/vendor/recommendations">Vendeur</Link>
        {' · '}
        <Link to="/livreur/recommendations">Livreur</Link>
        {' · '}
        <Link to="/moderator/recommendations">Modérateur</Link>
      </p>
    </div>
  );
};

export default AdminRecommendationsHubPage;
