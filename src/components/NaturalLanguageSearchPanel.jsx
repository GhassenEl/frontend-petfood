import React, { useState } from 'react';
import { Search, Sparkles } from 'lucide-react';
import { explainProductRecommendation } from '../utils/recommendationExplainer';

const NaturalLanguageSearchPanel = ({ products = [], onSearch, loading }) => {
  const [query, setQuery] = useState(
    'Je cherche des croquettes pour un chien senior souffrant d\'allergies.',
  );
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);

  const run = async () => {
    setBusy(true);
    try {
      const data = onSearch ? await onSearch(query) : null;
      setResult(data);
    } finally {
      setBusy(false);
    }
  };

  const examples = [
    'Croquettes chat stérilisé light',
    'Pâtée sans céréales pour chaton',
    'Friandises dentaires chien',
  ];

  return (
    <div className="xai-nl-search">
      <label className="xai-nl-label">
        Recherche en langage naturel
        <textarea
          rows={3}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ex. : Je cherche des croquettes pour un chien senior souffrant d'allergies."
        />
      </label>
      <div className="xai-nl-actions">
        <button type="button" className="xai-primary-btn" onClick={run} disabled={busy || loading}>
          <Search size={16} aria-hidden />
          {busy ? 'Recherche…' : 'Rechercher'}
        </button>
        <div className="xai-examples">
          {examples.map((ex) => (
            <button key={ex} type="button" className="xai-example-btn" onClick={() => setQuery(ex)}>
              {ex}
            </button>
          ))}
        </div>
      </div>

      {result?.intent && (
        <div className="xai-intent">
          <Sparkles size={16} aria-hidden />
          <span>{result.summary}</span>
          {result.intent.explanation?.length > 0 && (
            <div className="xai-tags">
              {result.intent.explanation.map((e) => (
                <span key={e} className="xai-tag">{e}</span>
              ))}
            </div>
          )}
        </div>
      )}

      {result?.results?.length > 0 && (
        <ul className="xai-nl-results">
          {result.results.map(({ product, score, matches }) => {
            const expl = explainProductRecommendation(product, {
              type: result.intent.animalType,
            }, { lifeStage: result.intent.lifeStage, allergies: result.intent.allergies ? ['allergie'] : [] });
            return (
              <li key={product.id || product._id}>
                <div className="xai-nl-head">
                  <strong>{product.name}</strong>
                  <span className="xai-nl-score">{score} pts</span>
                </div>
                <p className="xai-nl-matches">Correspondances : {matches.join(', ') || '—'}</p>
                {expl?.reasons?.slice(0, 2).map((r) => (
                  <span key={r.code} className="xai-tag">{r.icon} {r.label}</span>
                ))}
              </li>
            );
          })}
        </ul>
      )}

      {result && !result.results?.length && (
        <p className="xai-empty">Aucun produit trouvé — élargissez la requête.</p>
      )}
    </div>
  );
};

export default NaturalLanguageSearchPanel;
