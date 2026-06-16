import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

const ComplementaryProductsPanel = ({ items = [], loading }) => {
  if (loading) {
    return <p className="sc-loading">Analyse de vos achats en cours…</p>;
  }

  if (!items.length) {
    return (
      <div className="sc-empty">
        <p>Aucune suggestion pour le moment. Passez une commande pour débloquer des recommandations complémentaires.</p>
        <Link to="/client-products" className="sc-link-btn">
          Parcourir la boutique
        </Link>
      </div>
    );
  }

  return (
    <div className="sc-product-grid">
      {items.map((p) => {
        const id = p.id || p._id;
        return (
          <article key={id} className="sc-product-card">
            <div className="sc-product-card-head">
              <Sparkles size={16} aria-hidden />
              <span className="sc-badge">{p.complementReason || 'Complément'}</span>
            </div>
            <h3>{p.name}</h3>
            <p className="sc-muted">
              Score complémentarité : {p.complementScore ?? '—'}
              {p.animalType ? ` · ${p.animalType}` : ''}
            </p>
            <p className="sc-price">
              {Number(p.price || 0).toFixed(2)} DT
              {Number(p.discount) > 0 && (
                <span className="sc-promo"> −{p.discount}%</span>
              )}
            </p>
            <Link to="/client-products" className="sc-card-action">
              Voir en boutique →
            </Link>
          </article>
        );
      })}
    </div>
  );
};

export default ComplementaryProductsPanel;
