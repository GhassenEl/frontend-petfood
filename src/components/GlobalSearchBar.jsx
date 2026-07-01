import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { runGlobalSearch, searchPages } from '../utils/globalSearchEngine';
import './GlobalSearchBar.css';

const GlobalSearchBar = ({ compact = false, className = '' }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const role = user?.role || 'client';
  const wrapRef = useRef(null);
  const inputRef = useRef(null);

  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState({ pages: [], products: [] });
  const [activeIdx, setActiveIdx] = useState(0);

  const flatResults = useMemo(
    () => [...results.pages, ...results.products],
    [results],
  );

  const runSearch = useCallback(async (q) => {
    const trimmed = q.trim();
    if (!trimmed) {
      setResults({ pages: [], products: [] });
      return;
    }
    setLoading(true);
    try {
      const data = await runGlobalSearch(trimmed, role);
      setResults(data);
      setActiveIdx(0);
    } finally {
      setLoading(false);
    }
  }, [role]);

  useEffect(() => {
    const t = setTimeout(() => {
      if (open) runSearch(query);
    }, 200);
    return () => clearTimeout(t);
  }, [query, open, runSearch]);

  useEffect(() => {
    const onDocClick = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const goTo = (item) => {
    if (!item?.route) return;
    setOpen(false);
    setQuery('');
    navigate(item.route);
  };

  const submitSearch = () => {
    const q = query.trim();
    if (!q) return;
    if (flatResults[activeIdx]) {
      goTo(flatResults[activeIdx]);
      return;
    }
    const pages = searchPages(q, role);
    if (pages[0]) goTo(pages[0]);
    else navigate(`/search?q=${encodeURIComponent(q)}`);
  };

  const onKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIdx((i) => Math.min(i + 1, flatResults.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      submitSearch();
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  if (!user) return null;

  return (
    <div ref={wrapRef} className={`global-search${compact ? ' global-search--compact' : ''} ${className}`.trim()}>
      <div className="global-search__wrap">
        <Search size={16} color="#94a3b8" aria-hidden />
        <input
          ref={inputRef}
          type="search"
          className="global-search__input"
          placeholder={compact ? 'Rechercher…' : 'Rechercher pages, produits…'}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          aria-label="Recherche globale plateforme"
          aria-expanded={open}
          aria-autocomplete="list"
          autoComplete="off"
        />
        {!compact && <span className="global-search__kbd">Ctrl+K</span>}
      </div>

      {open && query.trim() && (
        <div className="global-search__dropdown" role="listbox">
          {loading && <div className="global-search__empty">Recherche…</div>}
          {!loading && flatResults.length === 0 && (
            <div className="global-search__empty">Aucun résultat — Entrée pour voir tout</div>
          )}
          {!loading && results.pages.length > 0 && (
            <>
              <div className="global-search__group-title">Pages</div>
              {results.pages.map((item, idx) => (
                <button
                  key={item.id}
                  type="button"
                  role="option"
                  aria-selected={activeIdx === idx}
                  className={`global-search__item${activeIdx === idx ? ' global-search__item--active' : ''}`}
                  onMouseEnter={() => setActiveIdx(idx)}
                  onClick={() => goTo(item)}
                >
                  <span className="global-search__item-icon">{item.icon}</span>
                  <span className="global-search__item-body">
                    <strong>{item.label}</strong>
                    <span>{item.section}</span>
                  </span>
                </button>
              ))}
            </>
          )}
          {!loading && results.products.length > 0 && (
            <>
              <div className="global-search__group-title">Produits</div>
              {results.products.map((item, pIdx) => {
                const idx = results.pages.length + pIdx;
                return (
                  <button
                    key={item.id}
                    type="button"
                    role="option"
                    aria-selected={activeIdx === idx}
                    className={`global-search__item${activeIdx === idx ? ' global-search__item--active' : ''}`}
                    onMouseEnter={() => setActiveIdx(idx)}
                    onClick={() => goTo(item)}
                  >
                    <span className="global-search__item-icon">{item.icon}</span>
                    <span className="global-search__item-body">
                      <strong>{item.label}</strong>
                      <span>{item.meta || 'Produit'}</span>
                    </span>
                  </button>
                );
              })}
            </>
          )}
          {!loading && query.trim() && (
            <div className="global-search__footer">
              <button type="button" className="global-search__item" style={{ justifyContent: 'center' }} onClick={submitSearch}>
                Voir tous les résultats pour « {query.trim()} »
              </button>
              <button
                type="button"
                className="global-search__advanced-link"
                onClick={() => {
                  setOpen(false);
                  navigate(`/search?advanced=1&q=${encodeURIComponent(query.trim())}`);
                }}
              >
                Recherche avancée
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GlobalSearchBar;
