import React from 'react';
import { SlidersHorizontal, RotateCcw } from 'lucide-react';
import {
  DEFAULT_REVIEW_ADVANCED,
  countActiveReviewFilters,
  resetReviewAdvanced,
} from '../utils/reviewAdvancedSearch';
import './AdvancedSearchPanel.css';

const SENTIMENTS = [
  { id: 'all', label: 'Tous' },
  { id: 'positive', label: '👍 Positif' },
  { id: 'neutral', label: '😐 Neutre' },
  { id: 'negative', label: '👎 Négatif' },
];

const SORTS = [
  { id: 'date-desc', label: 'Plus récents' },
  { id: 'date-asc', label: 'Plus anciens' },
  { id: 'rating-desc', label: 'Meilleures notes' },
  { id: 'rating-asc', label: 'Notes les plus basses' },
];

/**
 * Panneau recherche avancée — avis client.
 */
const ReviewAdvancedSearchPanel = ({
  open,
  onToggle,
  advanced,
  onChange,
  products = [],
  search = '',
  filter = 'all',
  emotionFilter = 'all',
  productIdFn = (p) => p?.id || p?._id,
}) => {
  const activeCount = countActiveReviewFilters(advanced, { search, filter, emotionFilter });

  const set = (key, value) => onChange({ ...advanced, [key]: value });

  const reset = () => onChange(resetReviewAdvanced());

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
            <label htmlFor="adv-product">Produit</label>
            <select id="adv-product" value={advanced.productId} onChange={(e) => set('productId', e.target.value)}>
              <option value="all">Tous les produits</option>
              {products.map((p) => (
                <option key={productIdFn(p)} value={productIdFn(p)}>{p.name}</option>
              ))}
            </select>
          </div>

          <div className="advanced-search-panel__field">
            <label htmlFor="adv-sentiment">Sentiment NLP</label>
            <select id="adv-sentiment" value={advanced.sentiment} onChange={(e) => set('sentiment', e.target.value)}>
              {SENTIMENTS.map((s) => (
                <option key={s.id} value={s.id}>{s.label}</option>
              ))}
            </select>
          </div>

          <div className="advanced-search-panel__field">
            <label htmlFor="adv-sort">Tri</label>
            <select id="adv-sort" value={advanced.sortBy} onChange={(e) => set('sortBy', e.target.value)}>
              {SORTS.map((s) => (
                <option key={s.id} value={s.id}>{s.label}</option>
              ))}
            </select>
          </div>

          <div className="advanced-search-panel__field">
            <label>Note min / max</label>
            <div className="advanced-search-panel__range">
              <input
                type="number"
                min={1}
                max={5}
                value={advanced.minRating}
                onChange={(e) => set('minRating', Math.min(5, Math.max(1, Number(e.target.value) || 1)))}
                aria-label="Note minimum"
              />
              <span>—</span>
              <input
                type="number"
                min={1}
                max={5}
                value={advanced.maxRating}
                onChange={(e) => set('maxRating', Math.min(5, Math.max(1, Number(e.target.value) || 5)))}
                aria-label="Note maximum"
              />
              <span>★</span>
            </div>
          </div>

          <div className="advanced-search-panel__field">
            <label htmlFor="adv-from">Date du</label>
            <input id="adv-from" type="date" value={advanced.dateFrom} onChange={(e) => set('dateFrom', e.target.value)} />
          </div>

          <div className="advanced-search-panel__field">
            <label htmlFor="adv-to">Date au</label>
            <input id="adv-to" type="date" value={advanced.dateTo} onChange={(e) => set('dateTo', e.target.value)} />
          </div>

          <label className="advanced-search-panel__check">
            <input type="checkbox" checked={advanced.withCommentOnly} onChange={(e) => set('withCommentOnly', e.target.checked)} />
            Avec commentaire uniquement
          </label>

          <label className="advanced-search-panel__check">
            <input type="checkbox" checked={advanced.aiOnly} onChange={(e) => set('aiOnly', e.target.checked)} />
            Suggestions IA uniquement
          </label>

          <div className="advanced-search-panel__actions">
            <button type="button" className="advanced-search-panel__btn" onClick={reset}>
              <RotateCcw size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />
              Réinitialiser
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export { DEFAULT_REVIEW_ADVANCED };
export default ReviewAdvancedSearchPanel;
