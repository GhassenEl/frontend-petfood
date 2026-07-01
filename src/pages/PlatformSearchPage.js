import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { runGlobalSearch } from '../utils/globalSearchEngine';
import {
  parsePlatformAdvancedFromParams,
  platformAdvancedToParams,
  countActivePlatformFilters,
} from '../utils/platformAdvancedSearch';
import PlatformAdvancedSearchPanel from '../components/PlatformAdvancedSearchPanel';
import MobileBottomNav, { AUTH_PUBLIC_MOBILE_NAV } from '../components/MobileBottomNav';
import './PlatformSearchPage.css';

const PlatformSearchPage = () => {
  const { user } = useAuth();
  const role = user?.role || 'client';
  const [searchParams, setSearchParams] = useSearchParams();
  const q = searchParams.get('q') || '';
  const [input, setInput] = useState(q);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState({ pages: [], products: [], mode: 'standard' });
  const [advanced, setAdvanced] = useState(() => parsePlatformAdvancedFromParams(searchParams));
  const [showAdvanced, setShowAdvanced] = useState(() => searchParams.get('advanced') === '1');

  useEffect(() => {
    setInput(q);
    setAdvanced(parsePlatformAdvancedFromParams(searchParams));
    setShowAdvanced(searchParams.get('advanced') === '1');
  }, [searchParams, q]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    runGlobalSearch(q, role, advanced).then((data) => {
      if (!cancelled) {
        setResults(data);
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, [q, role, advanced]);

  const syncParams = (nextQ, nextAdvanced, openAdvanced = showAdvanced) => {
    const p = platformAdvancedToParams(nextQ, nextAdvanced, { advanced: openAdvanced });
    setSearchParams(p);
  };

  const submit = (e) => {
    e.preventDefault();
    const trimmed = input.trim();
    syncParams(trimmed, advanced);
  };

  const handleAdvancedChange = (next) => {
    setAdvanced(next);
    syncParams(q, next);
  };

  const backRoute = role === 'admin' ? '/admin/dashboard' : role === 'vet' ? '/vet/dashboard' : role === 'livreur' ? '/livreur/dashboard' : '/client-products';
  const activeFilters = countActivePlatformFilters(advanced);
  const hasQuery = Boolean(q.trim());
  const showResults = hasQuery || activeFilters > 0 || showAdvanced;

  return (
    <div className="platform-search-page">
      <Link to={backRoute} className="platform-search-back">
        <ArrowLeft size={16} /> Retour
      </Link>

      <header className="platform-search-hero">
        <h1><Search size={24} style={{ verticalAlign: 'middle', marginRight: 8 }} />Recherche plateforme</h1>
        <p>Pages, produits et services — rôle : <strong>{role}</strong></p>
        <form className="platform-search-form" onSubmit={submit}>
          <Search size={18} color="#94a3b8" aria-hidden />
          <input
            type="search"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Produits, avis, commandes, pages…"
            aria-label="Recherche"
          />
          <button type="submit">Rechercher</button>
        </form>
      </header>

      <PlatformAdvancedSearchPanel
        open={showAdvanced}
        onToggle={() => {
          const next = !showAdvanced;
          setShowAdvanced(next);
          syncParams(q, advanced, next);
        }}
        advanced={advanced}
        onChange={handleAdvancedChange}
        role={role}
      />

      {loading && <p className="platform-search-muted">Recherche en cours…</p>}

      {!loading && showResults && (
        <>
          {results.mode === 'nlp' && hasQuery && (
            <p className="platform-search-muted platform-search-nlp-hint">
              Mode hybride NLP — résultats enrichis par l’analyse des avis clients.
            </p>
          )}

          {(advanced.scope === 'all' || advanced.scope === 'pages') && (
            <section className="platform-search-section">
              <h2>Pages ({results.pages.length})</h2>
              {results.pages.length === 0 ? (
                <p className="platform-search-muted">{hasQuery ? 'Aucune page correspondante.' : 'Saisissez un terme pour filtrer les pages.'}</p>
              ) : (
                <ul className="platform-search-list">
                  {results.pages.map((item) => (
                    <li key={item.id}>
                      <Link to={item.route} className="platform-search-card">
                        <span>{item.icon}</span>
                        <div>
                          <strong>{item.label}</strong>
                          <span>{item.section}</span>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          )}

          {results.products.length > 0 && (
            <section className="platform-search-section">
              <h2>Produits ({results.products.length})</h2>
              <ul className="platform-search-list">
                {results.products.map((item) => (
                  <li key={item.id}>
                    <Link to={item.route} className="platform-search-card">
                      <span>{item.icon}</span>
                      <div>
                        <strong>
                          {item.label}
                          {item.nlpPowered && <span className="platform-search-nlp-badge">NLP</span>}
                        </strong>
                        <span>{item.meta}</span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {hasQuery && results.pages.length === 0 && results.products.length === 0 && (
            <p className="platform-search-muted" style={{ textAlign: 'center', marginTop: 24 }}>
              Aucun résultat pour « {q} ». Essayez d’élargir les filtres ou activez le moteur NLP.
            </p>
          )}
        </>
      )}

      {!showResults && (
        <p className="platform-search-muted" style={{ textAlign: 'center', marginTop: 32 }}>
          Utilisez la barre de recherche en haut (Ctrl+K) ou ouvrez la recherche avancée ci-dessus.
        </p>
      )}

      <MobileBottomNav items={AUTH_PUBLIC_MOBILE_NAV} />
    </div>
  );
};

export default PlatformSearchPage;
