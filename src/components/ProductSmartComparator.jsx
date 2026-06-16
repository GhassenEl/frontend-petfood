import React, { useState } from 'react';
import { GitCompare } from 'lucide-react';
import { runSmartCompare } from '../services/smartCommerceService';
import { formatDT } from '../utils/formatCurrency';

const ProductSmartComparator = ({ products = [] }) => {
  const [selectedIds, setSelectedIds] = useState([]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const toggle = (id) => {
    const sid = String(id);
    setSelectedIds((prev) => {
      if (prev.includes(sid)) return prev.filter((x) => x !== sid);
      if (prev.length >= 4) return prev;
      return [...prev, sid];
    });
  };

  const runCompare = async () => {
    if (selectedIds.length < 2) {
      setError('Sélectionnez au moins 2 produits à comparer.');
      return;
    }
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const data = await runSmartCompare(selectedIds);
      setResult(data);
    } catch (e) {
      setError(e.message || 'Comparaison impossible');
    } finally {
      setLoading(false);
    }
  };

  const list = (products || []).slice(0, 24);

  return (
    <div className="sc-compare-wrap">
      <p className="sc-muted sc-compare-intro">
        Comparez composition, valeur nutritionnelle, prix et avis clients (jusqu&apos;à 4 produits).
      </p>

      {error && <p className="sc-error">{error}</p>}

      <div className="sc-compare-pick">
        {list.map((p) => {
          const id = String(p.id || p._id);
          const checked = selectedIds.includes(id);
          return (
            <label key={id} className={`sc-compare-option ${checked ? 'is-selected' : ''}`}>
              <input
                type="checkbox"
                checked={checked}
                onChange={() => toggle(id)}
              />
              <span>{p.name}</span>
              <small>{formatDT(p.price)}</small>
            </label>
          );
        })}
      </div>

      <button
        type="button"
        className="sc-primary-btn"
        onClick={runCompare}
        disabled={loading || selectedIds.length < 2}
      >
        <GitCompare size={16} aria-hidden />
        {loading ? 'Analyse…' : 'Comparer intelligemment'}
      </button>

      {result?.products?.length >= 2 && (
        <div className="sc-compare-result">
          <p className="sc-ai-summary">{result.summary}</p>
          <div className="sc-table-scroll">
            <table className="sc-compare-table">
              <thead>
                <tr>
                  <th>Critère</th>
                  {result.products.map((p) => (
                    <th key={p.id}>{p.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Prix promo</td>
                  {result.products.map((p) => (
                    <td key={p.id}>{formatDT(p.promoPrice)}</td>
                  ))}
                </tr>
                <tr>
                  <td>Composition</td>
                  {result.products.map((p) => (
                    <td key={p.id}>
                      <small>{p.composition?.slice(0, 120) || '—'}…</small>
                    </td>
                  ))}
                </tr>
                <tr>
                  <td>Protéines %</td>
                  {result.products.map((p) => (
                    <td key={p.id}>{p.nutrition?.proteinPercent ?? '—'}</td>
                  ))}
                </tr>
                <tr>
                  <td>Lipides %</td>
                  {result.products.map((p) => (
                    <td key={p.id}>{p.nutrition?.fatPercent ?? '—'}</td>
                  ))}
                </tr>
                <tr>
                  <td>Fibres %</td>
                  {result.products.map((p) => (
                    <td key={p.id}>{p.nutrition?.fiberPercent ?? '—'}</td>
                  ))}
                </tr>
                <tr>
                  <td>kcal / 100 g</td>
                  {result.products.map((p) => (
                    <td key={p.id}>{p.nutrition?.kcalPer100g ?? '—'}</td>
                  ))}
                </tr>
                <tr>
                  <td>Note avis</td>
                  {result.products.map((p) => (
                    <td key={p.id}>
                      {p.ratingAvg != null ? `${p.ratingAvg}/5 (${p.ratingCount})` : '—'}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td>Indice qualité</td>
                  {result.products.map((p) => (
                    <td key={p.id}>{p.qualityScore}/100</td>
                  ))}
                </tr>
                <tr>
                  <td>Synthèse avis IA</td>
                  {result.products.map((p) => (
                    <td key={p.id}>
                      <small>{p.reviewSummary}</small>
                      {p.reviewStrengths?.length > 0 && (
                        <div className="sc-tags">
                          {p.reviewStrengths.slice(0, 2).map((s) => (
                            <span key={s} className="sc-tag sc-tag-good">{s}</span>
                          ))}
                        </div>
                      )}
                      {p.reviewWeaknesses?.length > 0 && (
                        <div className="sc-tags">
                          {p.reviewWeaknesses.slice(0, 2).map((w) => (
                            <span key={w} className="sc-tag sc-tag-warn">{w}</span>
                          ))}
                        </div>
                      )}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductSmartComparator;
