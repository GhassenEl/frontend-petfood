import React, { useState } from 'react';
import { FileText } from 'lucide-react';

const AdminProductDescriptionsPanel = ({ descriptions = [] }) => {
  const [idx, setIdx] = useState(0);
  const current = descriptions[idx];

  if (!current) {
    return <p className="mi-empty">Aucun produit à traiter.</p>;
  }

  return (
    <div className="mi-panel">
      <p className="mi-summary">
        <FileText size={16} aria-hidden /> Fiches produits générées automatiquement (SEO + bullet points).
      </p>
      <select value={idx} onChange={(e) => setIdx(Number(e.target.value))} className="mi-select">
        {descriptions.map((d, i) => (
          <option key={d.productId} value={i}>{d.title?.slice(0, 50)}</option>
        ))}
      </select>
      <article className="mi-desc-card">
        <h3>{current.title}</h3>
        <p className="mi-meta-desc">Meta : {current.metaDescription}</p>
        <p><strong>Description courte</strong></p>
        <p>{current.shortDescription}</p>
        <p><strong>Description longue</strong></p>
        <p style={{ whiteSpace: 'pre-wrap' }}>{current.longDescription}</p>
        <ul>
          {(current.bulletPoints || []).map((b) => (
            <li key={b}>{b}</li>
          ))}
        </ul>
        <p className="mi-keywords">Mots-clés : {current.seoKeywords}</p>
      </article>
    </div>
  );
};

export default AdminProductDescriptionsPanel;
