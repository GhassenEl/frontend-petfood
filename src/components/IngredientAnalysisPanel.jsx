import React, { useState } from 'react';
import { FlaskConical, AlertTriangle, CheckCircle } from 'lucide-react';

const QUALITY = {
  excellent: { color: '#059669', label: 'Excellente' },
  good: { color: '#2563eb', label: 'Bonne' },
  medium: { color: '#d97706', label: 'Moyenne' },
  low: { color: '#dc2626', label: 'Faible' },
};

const IngredientAnalysisPanel = ({ analyses = [], loading }) => {
  const [idx, setIdx] = useState(0);

  if (loading) return <p className="an-loading">Analyse des ingrédients en cours…</p>;
  if (!analyses.length) return <p className="an-empty">Aucun produit à analyser.</p>;

  const analysis = analyses[idx] || analyses[0];
  const meta = QUALITY[analysis.qualityLevel] || QUALITY.medium;

  return (
    <div className="an-ingredients">
      {analyses.length > 1 && (
        <label className="an-product-picker">
          Produit
          <select value={idx} onChange={(e) => setIdx(Number(e.target.value))}>
            {analyses.map((a, i) => (
              <option key={a.productId || i} value={i}>{a.productName}</option>
            ))}
          </select>
        </label>
      )}

      <p className="an-ai-summary">
        <FlaskConical size={16} aria-hidden /> {analysis.summary}
      </p>

      <div className="an-quality-badge" style={{ borderColor: meta.color, color: meta.color }}>
        Qualité globale : <strong>{meta.label}</strong> ({analysis.qualityScore}/100)
      </div>

      <p className="an-protein-src">Source protéique principale : <strong>{analysis.proteinSource}</strong></p>

      {analysis.beneficial.length > 0 && (
        <div className="an-ing-block an-ing-beneficial">
          <h4><CheckCircle size={16} /> Ingrédients bénéfiques</h4>
          <ul>
            {analysis.beneficial.map((b) => (
              <li key={b.label}><strong>{b.label}</strong> — {b.benefit}</li>
            ))}
          </ul>
        </div>
      )}

      {analysis.allergens.length > 0 && (
        <div className="an-ing-block an-ing-allergen">
          <h4><AlertTriangle size={16} /> Allergènes potentiels</h4>
          <ul>
            {analysis.allergens.map((a) => (
              <li key={a.term}>{a.message}</li>
            ))}
          </ul>
        </div>
      )}

      {analysis.controversial.length > 0 && (
        <div className="an-ing-block an-ing-controversial">
          <h4><AlertTriangle size={16} /> Additifs / points d&apos;attention</h4>
          <ul>
            {analysis.controversial.map((c) => (
              <li key={c.label}><strong>{c.label}</strong> — {c.risk}</li>
            ))}
          </ul>
        </div>
      )}

      {analysis.ingredients.length > 0 && (
        <details className="an-ing-list">
          <summary>Liste complète ({analysis.ingredients.length} ingrédients)</summary>
          <p>{analysis.ingredients.join(', ')}</p>
        </details>
      )}
    </div>
  );
};

export default IngredientAnalysisPanel;
