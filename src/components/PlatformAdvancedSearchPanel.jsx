import React from 'react';
import { SlidersHorizontal, RotateCcw } from 'lucide-react';
import { CATEGORY_FILTERS, ANIMAL_TYPE_FILTERS } from '../utils/productCatalog';
import {
  DEFAULT_PLATFORM_ADVANCED,
  PLATFORM_SCOPES,
  PLATFORM_SORTS,
  countActivePlatformFilters,
} from '../utils/platformAdvancedSearch';
import './AdvancedSearchPanel.css';

const PlatformAdvancedSearchPanel = ({ open, onToggle, advanced, onChange, role = 'client' }) => {
  const activeCount = countActivePlatformFilters(advanced);
  const set = (key, value) => onChange({ ...advanced, [key]: value });
  const reset = () => onChange({ ...DEFAULT_PLATFORM_ADVANCED });

  const scopes = role === 'client'
    ? PLATFORM_SCOPES
    : PLATFORM_SCOPES.filter((s) => s.id !== 'nlp' && s.id !== 'products');

  return (
    <div className="advanced-search-panel">
      <button type="button" className="advanced-search-panel__toggle" onClick={onToggle} aria-expanded={open}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <SlidersHorizontal size={16} aria-hidden />
          Recherche avancée
        </span>
        {activeCount > 0 && <span className="advanced-search-panel__badge">{activeCount} filtre(s)</span>}
      </button>

      {open && (
        <div className="advanced-search-panel__body">
          <div className="advanced-search-panel__field">
            <label htmlFor="plat-scope">Périmètre</label>
            <select id="plat-scope" value={advanced.scope} onChange={(e) => set('scope', e.target.value)}>
              {scopes.map((s) => (
                <option key={s.id} value={s.id}>{s.label}</option>
              ))}
            </select>
          </div>

          {role === 'client' && (
            <>
              <div className="advanced-search-panel__field">
                <label htmlFor="plat-cat">Catégorie produit</label>
                <select id="plat-cat" value={advanced.category} onChange={(e) => set('category', e.target.value)}>
                  {CATEGORY_FILTERS.map((c) => (
                    <option key={c.id} value={c.id}>{c.label}</option>
                  ))}
                </select>
              </div>

              <div className="advanced-search-panel__field">
                <label htmlFor="plat-animal">Espèce</label>
                <select id="plat-animal" value={advanced.animalType} onChange={(e) => set('animalType', e.target.value)}>
                  {ANIMAL_TYPE_FILTERS.map((a) => (
                    <option key={a.id} value={a.id}>{a.label}</option>
                  ))}
                </select>
              </div>

              <div className="advanced-search-panel__field">
                <label htmlFor="plat-rating">Note min. avis (NLP)</label>
                <input
                  id="plat-rating"
                  type="number"
                  min={1}
                  max={5}
                  step={0.5}
                  placeholder="ex. 3.5"
                  value={advanced.minRating}
                  onChange={(e) => set('minRating', e.target.value)}
                />
              </div>
            </>
          )}

          <div className="advanced-search-panel__field">
            <label htmlFor="plat-sort">Tri produits</label>
            <select id="plat-sort" value={advanced.sortBy} onChange={(e) => set('sortBy', e.target.value)}>
              {PLATFORM_SORTS.map((s) => (
                <option key={s.id} value={s.id}>{s.label}</option>
              ))}
            </select>
          </div>

          {role === 'client' && (
            <label className="advanced-search-panel__check">
              <input
                type="checkbox"
                checked={advanced.useNlp}
                onChange={(e) => set('useNlp', e.target.checked)}
              />
              Moteur hybride NLP (avis clients)
            </label>
          )}

          <div className="advanced-search-panel__actions">
            <button type="button" className="advanced-search-panel__btn" onClick={reset}>
              <RotateCcw size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />
              Réinitialiser filtres
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlatformAdvancedSearchPanel;
