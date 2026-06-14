import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ShoppingBag, Tag, Eye } from 'lucide-react';
import VisitorLayout from '../layouts/VisitorLayout';
import ProductDetailModal from '../components/ProductDetailModal';
import { fetchVisitorProducts, trackVisitorBrowse } from '../services/visitorService';
import { formatDT } from '../utils/formatCurrency';
import {
  matchProductSearch,
  CATEGORY_FILTERS,
  ANIMAL_TYPE_FILTERS,
  matchCategoryFilter,
} from '../utils/productCatalog';
import { getEffectiveDiscount, getPromoPrice, isOnPromotion } from '../utils/productDetails';
import { resolveNaturalProductImage } from '../utils/productImages';
import './VisitorPages.css';

const VisitorProductsPage = () => {
  const [searchParams] = useSearchParams();
  const [tab, setTab] = useState(searchParams.get('tab') === 'promos' ? 'promos' : 'catalog');
  const [products, setProducts] = useState([]);
  const [demo, setDemo] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [animalFilter, setAnimalFilter] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, demo: isDemo } = await fetchVisitorProducts();
    setProducts(data);
    setDemo(isDemo);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const t = searchParams.get('tab');
    if (t === 'promos') setTab('promos');
    const cat = searchParams.get('category');
    if (cat && CATEGORY_FILTERS.some((f) => f.id === cat)) setCategoryFilter(cat);
  }, [searchParams]);

  const filtered = useMemo(() => {
    let list = products.filter(
      (p) => matchProductSearch(p, searchTerm) && matchCategoryFilter(p, categoryFilter),
    );
    if (animalFilter !== 'all') {
      list = list.filter((p) => (p.animalType || 'other') === animalFilter);
    }
    if (tab === 'promos') list = list.filter(isOnPromotion);
    return list;
  }, [products, searchTerm, categoryFilter, animalFilter, tab]);

  const promosCount = products.filter(isOnPromotion).length;

  const getImage = (p) => resolveNaturalProductImage(p);

  return (
    <VisitorLayout>
      <div className="vis-page">
        <header className="vis-hero">
          <h1><ShoppingBag size={26} /> Catalogue produits</h1>
          <p>
            Parcourez, recherchez et filtrez les produits PetfoodTN — sans compte.
            {demo && <span className="vis-badge vis-badge--demo" style={{ marginLeft: 8 }}>Mode démo</span>}
          </p>
        </header>

        <div className="vis-tabs">
          <button
            type="button"
            className={`vis-tab${tab === 'catalog' ? ' vis-tab--active' : ''}`}
            onClick={() => setTab('catalog')}
          >
            Tous les produits ({products.length})
          </button>
          <button
            type="button"
            className={`vis-tab${tab === 'promos' ? ' vis-tab--active' : ''}`}
            onClick={() => setTab('promos')}
          >
            <Tag size={14} /> Promotions ({promosCount})
          </button>
        </div>

        <div className="vis-search-row">
          <input
            type="search"
            placeholder="Rechercher un produit…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            aria-label="Rechercher"
          />
          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} aria-label="Catégorie">
            {CATEGORY_FILTERS.map((f) => (
              <option key={f.id} value={f.id}>{f.label}</option>
            ))}
          </select>
          <select value={animalFilter} onChange={(e) => setAnimalFilter(e.target.value)} aria-label="Animal">
            {ANIMAL_TYPE_FILTERS.map((f) => (
              <option key={f.id} value={f.id}>{f.label}</option>
            ))}
          </select>
        </div>

        {loading ? (
          <p className="vis-empty">Chargement du catalogue…</p>
        ) : filtered.length === 0 ? (
          <p className="vis-empty">Aucun produit ne correspond à votre recherche.</p>
        ) : (
          <div className="vis-grid">
            {filtered.map((p) => {
              const discount = getEffectiveDiscount(p);
              const promoPrice = getPromoPrice(p);
              return (
                <article
                  key={p.id || p._id}
                  className="vis-product-card"
                  onClick={() => { trackVisitorBrowse(p.id || p._id); setSelectedProduct(p); }}
                  onKeyDown={(e) => e.key === 'Enter' && (trackVisitorBrowse(p.id || p._id), setSelectedProduct(p))}
                  role="button"
                  tabIndex={0}
                >
                  <img src={getImage(p)} alt={p.name} loading="lazy" />
                  <div className="vis-product-card__body">
                    {discount > 0 && <span className="vis-badge vis-badge--promo">-{discount}%</span>}
                    <p className="vis-product-card__name">{p.name}</p>
                    <p>
                      <span className={`vis-product-card__price${discount > 0 ? ' vis-product-card__price--promo' : ''}`}>
                        {formatDT(promoPrice)}
                      </span>
                      {discount > 0 && (
                        <span className="vis-product-card__old">{formatDT(p.price)}</span>
                      )}
                    </p>
                    <button type="button" className="vis-btn vis-btn--ghost vis-btn--sm" style={{ marginTop: 8 }}>
                      <Eye size={14} /> Détails
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        <div className="vis-cta-banner">
          <span>Connectez-vous pour ajouter au panier et commander.</span>
          <div style={{ display: 'flex', gap: 8 }}>
            <Link to="/register" className="vis-btn vis-btn--primary">Créer un compte</Link>
            <Link to="/login" className="vis-btn vis-btn--ghost">Se connecter</Link>
          </div>
        </div>
      </div>

      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={() => window.location.href = '/login'}
        getPrice={(p) => formatDT(getPromoPrice(p))}
        getImage={getImage}
      />
    </VisitorLayout>
  );
};

export default VisitorProductsPage;
