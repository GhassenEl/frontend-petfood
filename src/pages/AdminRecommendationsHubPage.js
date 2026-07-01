import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import RecommendationPipelinePanel from '../components/RecommendationPipelinePanel';
import {
  fetchAdminClientRecommendations,
  fetchSalesTrafficExplanation,
  searchProductsByReviews,
} from '../services/hybridRecommendationService';
import './RecommendationHubPage.css';

const AdminRecommendationsHubPage = () => {
  const [clients, setClients] = useState([]);
  const [selectedClientId, setSelectedClientId] = useState('');
  const [clientPack, setClientPack] = useState(null);
  const [salesExplain, setSalesExplain] = useState(null);
  const [searchQ, setSearchQ] = useState('');
  const [searchMinRating, setSearchMinRating] = useState('3.5');
  const [searchResults, setSearchResults] = useState(null);
  const [loading, setLoading] = useState(true);

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
      const pack = await fetchSalesTrafficExplanation();
      setSalesExplain(pack);
    } catch {
      setSalesExplain(null);
    }
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await Promise.all([loadClients(), loadSales()]);
      setLoading(false);
    })();
  }, [loadClients, loadSales]);

  useEffect(() => {
    if (!selectedClientId) return;
    (async () => {
      try {
        const pack = await fetchAdminClientRecommendations(selectedClientId);
        setClientPack(pack);
      } catch {
        setClientPack(null);
      }
    })();
  }, [selectedClientId]);

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

  if (loading) {
    return <div className="rechub-page rechub-empty">Chargement moteur de recommandation…</div>;
  }

  return (
    <div className="rechub-page">
      <header className="rechub-hero" style={{ background: 'linear-gradient(135deg, #312e81, #7c3aed)' }}>
        <h1>🎯 Recommandé pour vous — Admin</h1>
        <p>Moteur hybride (contenu + collaboratif + NLP avis) · Profils clients · Interprétation CA</p>
        <Link to="/vendor/recommendations" style={{ color: '#c4b5fd', fontSize: 13 }}>
          Hub vendeur →
        </Link>
      </header>

      <RecommendationPipelinePanel role="admin" limit={6} hubLink="/admin/recommendations" />

      <section style={{ marginTop: 24 }}>
        <h2>📈 Interprétation IA — trafic & CA</h2>
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
          <p style={{ color: '#64748b' }}>Lancez FastAPI (`npm run dev:ml`) pour l&apos;interprétation CA.</p>
        )}
      </section>

      <section style={{ marginTop: 28 }}>
        <h2>👤 Recommandations par profil client</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
          <select
            value={selectedClientId}
            onChange={(e) => setSelectedClientId(e.target.value)}
            style={{ padding: 8, borderRadius: 8, minWidth: 220 }}
          >
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
                Score {(item.hybridScore * 100).toFixed(0)}% · {item.recommendedReason}
              </p>
            </article>
          ))}
        </div>
        {clientPack?.similarClients?.length > 0 && (
          <p style={{ fontSize: 12, marginTop: 8, color: '#64748b' }}>
            Clients similaires : {clientPack.similarClients.map((s) => `${s.userId} (${(s.similarity * 100).toFixed(0)}%)`).join(', ')}
          </p>
        )}
      </section>

      <section style={{ marginTop: 28 }}>
        <h2>🔍 Recherche & filtrage (avis NLP)</h2>
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
          <button type="button" onClick={runSearch} style={{ padding: '8px 16px', borderRadius: 8, background: '#7c3aed', color: '#fff', border: 'none' }}>
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
    </div>
  );
};

export default AdminRecommendationsHubPage;
