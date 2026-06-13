import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, RefreshCw } from 'lucide-react';
import {
  getFavorites,
  getFrequentProducts,
  removeFavorite,
  addFavorite,
} from '../services/favoriteService';
import { getEffectiveDiscount, getPromoPrice } from '../utils/productDetails';
import { productId, dedupeProducts, withProductIds } from '../utils/productId';
import { DEMO_FAVORITES, withDemoFallback } from '../utils/clientDemoData';

const cardStyle = {
  background: 'white',
  borderRadius: 16,
  padding: 16,
  border: '1px solid #f1f5f9',
  boxShadow: '0 4px 16px rgba(0,0,0,0.05)',
};

const ClientFavoritesPage = () => {
  const [favorites, setFavorites] = useState([]);
  const [frequent, setFrequent] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [fav, freq] = await Promise.all([getFavorites(), getFrequentProducts(8)]);
      setFavorites(withDemoFallback(dedupeProducts((Array.isArray(fav) ? fav : []).map(withProductIds)), DEMO_FAVORITES));
      setFrequent(dedupeProducts((Array.isArray(freq) ? freq : []).map(withProductIds)));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const toggleCart = (product) => {
    const price = getPromoPrice(product);
    window.dispatchEvent(
      new CustomEvent('addToCart', {
        detail: { ...product, _id: product.id || product._id, price, originalPrice: product.price },
      })
    );
  };

  const handleRemove = async (product) => {
    const id = product.id || product._id;
    await removeFavorite(id);
    setFavorites((prev) => prev.filter((p) => (p.id || p._id) !== id));
  };

  const handleAddFrequentToWishlist = async (product) => {
    const id = product.id || product._id;
    await addFavorite(id);
    await load();
  };

  if (loading) {
    return <div style={{ padding: 48, textAlign: 'center' }}>Chargement…</div>;
  }

  return (
    <div style={{ padding: 24, maxWidth: 1000, margin: '0 auto' }}>
      <div style={{ ...cardStyle, marginBottom: 24, background: 'linear-gradient(135deg, #fef2f2, #fff7ed)' }}>
        <h1 style={{ margin: '0 0 8px', fontSize: 28, fontWeight: 800 }}>❤️ Mes favoris</h1>
        <p style={{ margin: 0, color: '#6b7280' }}>
          Liste de souhaits et produits que vous achetez le plus souvent.
        </p>
      </div>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 14 }}>Liste de souhaits ({favorites.length})</h2>
        {favorites.length === 0 ? (
          <div style={{ ...cardStyle, textAlign: 'center', color: '#94a3b8', padding: 32 }}>
            <Heart size={40} style={{ opacity: 0.3, marginBottom: 12 }} />
            <p>Aucun favori. Ajoutez des produits depuis le catalogue avec le cœur.</p>
            <Link to="/client-products" style={{ color: '#e67e22', fontWeight: 700 }}>Voir les produits →</Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 14 }}>
            {favorites.map((p) => {
              const id = p.id || p._id;
              const discount = getEffectiveDiscount(p);
              const price = getPromoPrice(p).toFixed(2);
              return (
                <article key={`wish-${id}`} style={{ ...cardStyle, display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
                  <img
                    src={p.imageUrl || p.image}
                    alt={p.name}
                    style={{ width: 72, height: 72, borderRadius: 12, objectFit: 'cover', background: '#f3f4f6' }}
                  />
                  <div style={{ flex: 1, minWidth: 180 }}>
                    <strong>{p.name}</strong>
                    <div style={{ color: '#059669', fontWeight: 800, marginTop: 4 }}>
                      {price} DT
                      {discount > 0 && <span style={{ color: '#9ca3af', textDecoration: 'line-through', marginLeft: 8, fontWeight: 400 }}>{p.price} DT</span>}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button type="button" onClick={() => toggleCart(p)} style={btnPrimary}>
                      <ShoppingCart size={16} /> Panier
                    </button>
                    <button type="button" onClick={() => handleRemove(p)} style={btnGhost}>
                      Retirer
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <section>
        <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
          <RefreshCw size={20} /> Achetés fréquemment
        </h2>
        {frequent.length === 0 ? (
          <div style={{ ...cardStyle, color: '#94a3b8' }}>
            Passez votre première commande pour voir vos produits habituels ici.
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 14, gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
            {frequent.map((p) => {
              const id = p.id || p._id;
              const inWishlist = favorites.some((f) => (f.id || f._id) === id);
              return (
                <article key={`freq-${id}`} style={cardStyle}>
                  <strong>{p.name}</strong>
                  <p style={{ fontSize: 13, color: '#6b7280', margin: '6px 0' }}>
                    {p.purchaseCount} commande(s) · {p.totalQuantity} unité(s)
                  </p>
                  <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                    <button type="button" onClick={() => toggleCart(p)} style={btnPrimary}>
                      Recommander
                    </button>
                    {!inWishlist && (
                      <button type="button" onClick={() => handleAddFrequentToWishlist(p)} style={btnGhost}>
                        ♥ Favori
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

const btnPrimary = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  padding: '10px 14px',
  background: 'linear-gradient(135deg, #e67e22, #d35400)',
  color: 'white',
  border: 'none',
  borderRadius: 10,
  fontWeight: 700,
  cursor: 'pointer',
  fontSize: 13,
};

const btnGhost = {
  padding: '10px 14px',
  background: '#f3f4f6',
  border: 'none',
  borderRadius: 10,
  fontWeight: 600,
  cursor: 'pointer',
  fontSize: 13,
};

export default ClientFavoritesPage;
