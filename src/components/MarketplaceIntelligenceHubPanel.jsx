import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, TrendingDown, RefreshCw } from 'lucide-react';
import DEMO_MARKETPLACE_INTEL from '../utils/marketplaceIntelligenceEngine';

const MarketplaceIntelligenceHubPanel = () => {
  const { priceComparisons, alternatives, personalizedPromos } = DEMO_MARKETPLACE_INTEL;

  return (
    <section className="shub-panel">
      <header className="shub-panel__head">
        <ShoppingBag size={20} color="#059669" />
        <div>
          <h3>Marketplace intelligente</h3>
          <p>Comparaison automatique des prix, alternatives et promotions personnalisées.</p>
        </div>
      </header>

      <h4 className="shub-subtitle">Comparaison de prix</h4>
      <ul className="shub-price-list">
        {priceComparisons.map((c) => (
          <li key={c.id} className={c.bestDeal ? 'is-best' : ''}>
            <div>
              <strong>{c.product}</strong>
              <span>PetfoodTN {c.ourPrice} TND · marché ~{c.marketAvg} TND</span>
            </div>
            {c.bestDeal ? (
              <span className="shub-savings"><TrendingDown size={14} /> −{c.savings} TND</span>
            ) : (
              <span className="shub-savings shub-savings--up">+{Math.abs(c.savings)} TND vs marché</span>
            )}
          </li>
        ))}
      </ul>

      <h4 className="shub-subtitle">Produits alternatifs</h4>
      <ul className="shub-alt-list">
        {alternatives.map((a) => (
          <li key={a.id}>
            <RefreshCw size={14} aria-hidden />
            <div>
              <strong>{a.from} → {a.to}</strong>
              <p>{a.reason}</p>
              <small>{a.priceDelta >= 0 ? '+' : ''}{a.priceDelta} TND</small>
            </div>
            <Link to={a.link}>Voir</Link>
          </li>
        ))}
      </ul>

      <h4 className="shub-subtitle">Promotions personnalisées</h4>
      <div className="shub-promo-grid">
        {personalizedPromos.map((p) => (
          <article key={p.id} className="shub-promo-card">
            <strong>{p.title}</strong>
            {p.code && <code>{p.code}</code>}
            <p>{p.reason}</p>
            <small>Expire dans {p.expiresInDays} j</small>
          </article>
        ))}
      </div>

      <Link to="/client-smart-commerce" className="shub-link-btn">E-commerce IA complet →</Link>
    </section>
  );
};

export default MarketplaceIntelligenceHubPanel;
