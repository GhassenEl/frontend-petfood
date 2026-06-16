import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Sparkles } from 'lucide-react';
import { formatDT } from '../utils/formatCurrency';
import { getPromoPrice } from '../utils/productDetails';

const SmartWishlistPanel = ({ suggestions = [] }) => (
  <div className="vis-intel-wishlist">
    <p className="vis-intel-summary">
      <Sparkles size={16} aria-hidden /> L&apos;IA suggère des produits selon votre navigation et profil animal.
    </p>
    {!suggestions.length ? (
      <p className="vis-intel-muted">
        Parcourez le catalogue pour activer les suggestions — ou{' '}
        <Link to="/visitor/products">voir les produits</Link>.
      </p>
    ) : (
      <div className="vis-intel-product-grid">
        {suggestions.map((p) => (
          <article key={p.id || p._id} className="vis-intel-product-card vis-intel-wish-card">
            <Heart size={16} className="vis-intel-heart" aria-hidden />
            <strong>{p.name}</strong>
            <span className="vis-intel-score">{p.wishlistScore} pts IA</span>
            <p className="vis-intel-muted">{formatDT(getPromoPrice(p))}</p>
            {(p.wishlistReasons || []).map((r) => (
              <span key={r} className="vis-intel-reason">{r}</span>
            ))}
          </article>
        ))}
      </div>
    )}
    <p className="vis-intel-footer">
      <Link to="/register">Créer un compte</Link> pour enregistrer votre liste de souhaits.
    </p>
  </div>
);

export default SmartWishlistPanel;
