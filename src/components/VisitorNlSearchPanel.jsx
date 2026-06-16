import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { searchProductsNaturalLanguage } from '../utils/naturalLanguageProductSearch';
import { formatDT } from '../utils/formatCurrency';
import { getPromoPrice } from '../utils/productDetails';

const VisitorNlSearchPanel = ({ products = [] }) => {
  const [query, setQuery] = useState(
    'Je cherche des croquettes sans céréales pour un chat stérilisé.',
  );
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);

  const run = () => {
    setBusy(true);
    setResult(searchProductsNaturalLanguage(products, query, 10));
    setBusy(false);
  };

  const examples = [
    'Je cherche des croquettes sans céréales pour un chat stérilisé.',
    'Croquettes chien senior hypoallergéniques',
    'Pâtée chaton sans céréales',
  ];

  return (
    <div className="vis-intel-search">
      <label>
        <span>Recherche en langage naturel</span>
        <textarea
          rows={3}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </label>
      <div className="vis-intel-search-actions">
        <button type="button" onClick={run} disabled={busy}>
          <Search size={16} aria-hidden /> {busy ? 'Recherche…' : 'Rechercher'}
        </button>
        {examples.map((ex) => (
          <button key={ex} type="button" className="vis-intel-chip" onClick={() => setQuery(ex)}>
            {ex.length > 45 ? `${ex.slice(0, 45)}…` : ex}
          </button>
        ))}
      </div>
      {result && (
        <>
          <p className="vis-intel-summary">{result.summary}</p>
          {result.intent?.explanation?.length > 0 && (
            <p className="vis-intel-muted">Interprétation : {result.intent.explanation.join(' · ')}</p>
          )}
          <div className="vis-intel-product-grid">
            {result.results.map(({ product, score, matches }) => (
              <article key={product.id || product._id} className="vis-intel-product-card">
                <strong>{product.name}</strong>
                <span className="vis-intel-score">{score} pts</span>
                <p className="vis-intel-muted">{formatDT(getPromoPrice(product))}</p>
                {matches?.length > 0 && (
                  <p className="vis-intel-match">{matches.join(' · ')}</p>
                )}
              </article>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default VisitorNlSearchPanel;
