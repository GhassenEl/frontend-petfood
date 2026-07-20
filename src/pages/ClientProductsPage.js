import React, { useState, useEffect } from 'react';
import usePlatformRefresh from '../hooks/usePlatformRefresh';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Flame, Sparkles, ShoppingCart, Search, Eye, Store, Package } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import RecommendationPipelinePanel from '../components/RecommendationPipelinePanel';
import {
  loadRecommendationPipeline,
  enrichRecommendationsWithCatalog,
} from '../services/recommendationPipelineService';
import {
  getProducts,
  getProductRecommendations,
  getNearbyProducts,
} from '../services/productService';
import { getProfile } from '../services/userService';
import { getFavoriteIds, addFavorite, removeFavorite, getFrequentProducts } from '../services/favoriteService';
import ProductDetailModal from '../components/ProductDetailModal';
import VerifiedPriceBadge from '../components/VerifiedPriceBadge';
import RseEcoBadge from '../components/RseEcoBadge';
import {
  matchProductSearch,
  CATEGORY_FILTERS,
  ANIMAL_TYPE_FILTERS,
  matchCategoryFilter,
} from '../utils/productCatalog';
import { getEffectiveDiscount, getPromoPrice, isOnPromotion } from '../utils/productDetails';
import { productId, dedupeProducts, withProductIds } from '../utils/productId';
import { resolveNaturalProductImage, sanitizeProductImageUrl } from '../utils/productImages';
import ProductPacksPanel from '../components/ProductPacksPanel';
import ProductStarRating from '../components/ProductStarRating';
import { DEMO_NEAREST_STORE } from '../utils/clientDemoData';

const VENDOR_BY_CATEGORY = {
  accessoires: { vendorId: 'v-1', vendorName: 'Animalerie Tunis — Démo' },
  niches: { vendorId: 'v-1', vendorName: 'Animalerie Tunis — Démo' },
  hygiene: { vendorId: 'v-1', vendorName: 'Animalerie Tunis — Démo' },
  litiere: { vendorId: 'v-1', vendorName: 'Animalerie Tunis — Démo' },
  toilettage: { vendorId: 'v-1', vendorName: 'Animalerie Tunis — Démo' },
  transport: { vendorId: 'v-2', vendorName: 'Pets & Co Sfax' },
  sante: { vendorId: 'v-1', vendorName: 'Clinique PetfoodTN — Démo' },
  iot: { vendorId: 'v-2', vendorName: 'Pets & Co Sfax' },
  personnalise: { vendorId: 'v-1', vendorName: 'Animalerie Tunis — Démo' },
  packs: { vendorId: 'v-1', vendorName: 'Animalerie Tunis — Démo' },
  aquarium: { vendorId: 'v-2', vendorName: 'Pets & Co Sfax' },
  jouets: { vendorId: 'v-2', vendorName: 'Pets & Co Sfax' },
  vetements: { vendorId: 'v-1', vendorName: 'Animalerie Tunis — Démo' },
  friandises: { vendorId: 'v-2', vendorName: 'Pets & Co Sfax' },
  animaux: { vendorId: 'v-1', vendorName: 'Animalerie Tunis — Démo' },
};

const DEFAULT_VENDOR = { vendorId: 'v-1', vendorName: 'Animalerie Tunis — Démo' };

const resolveVendor = (product) => {
  if (product?.vendorName) {
    return { vendorId: product.vendorId || 'v-1', vendorName: product.vendorName };
  }
  const cat = String(product?.category || '').toLowerCase();
  return VENDOR_BY_CATEGORY[cat] || DEFAULT_VENDOR;
};

const PET_LABELS = {
  dog: 'chien',
  cat: 'chat',
  bird: 'oiseau',
  fish: 'poisson',
  rabbit: 'lapin',
  hamster: 'hamster',
  reptile: 'reptile',
  other: 'animal',
};

const ClientProductsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [recommendations, setRecommendations] = useState([]);
  const [nearby, setNearby] = useState([]);
  const [searchTerm, setSearchTerm] = useState(() => searchParams.get('q') || '');
  const [animalFilter, setAnimalFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [promoOnly, setPromoOnly] = useState(false);
  const [profile, setProfile] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [products, setProducts] = useState([]);
  const [soldes, setSoldes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [favoriteIds, setFavoriteIds] = useState(new Set());
  const [frequent, setFrequent] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const cat = searchParams.get('category');
    const q = searchParams.get('q');
    if (q) setSearchTerm(q);
    if (cat && CATEGORY_FILTERS.some((f) => f.id === cat)) {
      setCategoryFilter(cat);
    }
  }, [searchParams]);

  const fetchData = async () => {
    setLoading(true);
    setError('');

    try {
      const list = dedupeProducts((await getProducts()).map(normalizeProduct));
      setProducts(list);
      setSoldes(list.filter(isOnPromotion));
    } catch (err) {
      console.error('Products error:', err);
      setError('Erreur chargement produits principaux');
    }

    try {
      setProfile(await getProfile());
    } catch (err) {
      console.error('Profile error:', err);
    }

    try {
      const apiRecs = dedupeProducts(((await getProductRecommendations()) || []).map(normalizeProduct));
      let merged = apiRecs;
      try {
        const pack = await loadRecommendationPipeline('client', user?.id || user?._id);
        const pipelineRecs = enrichRecommendationsWithCatalog(pack.recommendations || [], list)
          .map(normalizeProduct)
          .filter((p) => Number(p?.stock || 0) > 0);
        merged = dedupeProducts([...pipelineRecs, ...apiRecs]);
      } catch (pipeErr) {
        console.warn('Pipeline recommendations:', pipeErr);
      }
      setRecommendations(merged);
    } catch (err) {
      console.error('Recommendations error:', err);
    }

    try {
      setNearby(dedupeProducts(((await getNearbyProducts()) || []).map(normalizeProduct)));
    } catch (err) {
      console.error('Nearby error:', err);
    }

    try {
      const ids = await getFavoriteIds();
      setFavoriteIds(new Set(ids));
    } catch {
      setFavoriteIds(new Set());
    }

    try {
      setFrequent(dedupeProducts(((await getFrequentProducts(6)) || []).map(normalizeProduct)));
    } catch {
      setFrequent([]);
    }

    setLoading(false);
  };

  usePlatformRefresh(fetchData);

  const normalizeProduct = (p) => {
    if (!p) return p;

    const stockRaw = p.stock ?? p.quantity ?? p.availableStock ?? p.available ?? 0;
    const priceRaw = p.price ?? p.unitPrice ?? p.unit_price ?? 0;
    const vendor = resolveVendor(p);
    const imageRaw = p.imageUrl ?? p.image ?? p.icon;
    const base = {
      ...p,
      ...vendor,
      stock: Number(stockRaw || 0),
      price: Number(priceRaw || 0),
      rating_avg: Number(p.rating_avg ?? p.ratingAvg ?? p.rating ?? 0),
      rating_count: Number(p.rating_count ?? p.ratingCount ?? p.reviewCount ?? 0),
      imageUrl: sanitizeProductImageUrl(imageRaw, p) || resolveNaturalProductImage({ ...p, imageUrl: imageRaw }),
    };
    return withProductIds({ ...base, discount: getEffectiveDiscount(base) });
  };

  const filteredProducts = products.filter((p) => {
    const matchSearch = matchProductSearch(p, searchTerm);
    const matchAnimal = animalFilter === 'all' || p.animalType === animalFilter;
    const matchCategory = matchCategoryFilter(p, categoryFilter);
    const matchPromo = !promoOnly || isOnPromotion(p);
    return matchSearch && matchAnimal && matchCategory && matchPromo;
  });

  const profilePetType = profile?.petType;

  const ANIMAL_FILTERS = ANIMAL_TYPE_FILTERS;

  const inStock = (p) => Number(p?.stock || 0) > 0;
  const inStockFilteredProducts = filteredProducts.filter(inStock);
  const inStockSoldes = soldes.filter(inStock);
  const inStockRecommendations = recommendations
    .filter(inStock)
    .sort((a, b) => (b.hybridScore || 0) - (a.hybridScore || 0));
  const inStockNearby = nearby.filter(inStock);

  const sortedAllProducts = [...inStockFilteredProducts].sort((a, b) => {
    const aPromo = isOnPromotion(a) ? 1 : 0;
    const bPromo = isOnPromotion(b) ? 1 : 0;
    if (bPromo !== aPromo) return bPromo - aPromo;
    const aMatch = profilePetType && a.animalType === profilePetType ? 1 : 0;
    const bMatch = profilePetType && b.animalType === profilePetType ? 1 : 0;
    return bMatch - aMatch;
  });

  const getDiscountedPriceValue = (product) => getPromoPrice(product);

  const getCartProduct = (product) => ({
    ...product,
    originalPrice: Number(product.price || 0),
    price: getDiscountedPriceValue(product),
  });

  const addToCart = (product) => {
    window.dispatchEvent(new CustomEvent('addToCart', { detail: getCartProduct(product) }));

    const viewed = JSON.parse(localStorage.getItem('viewedProducts') || '[]');
    const id = productId(product);
    if (!viewed.includes(id)) {
      viewed.push(id);
      localStorage.setItem('viewedProducts', JSON.stringify(viewed.slice(-20)));
    }
  };

  const orderProduct = (product) => {
    addToCart(product);
    navigate('/checkout');
  };

  const openVendor = (product) => {
    const vendor = resolveVendor(product);
    navigate('/vendor', {
      state: {
        fromProduct: productId(product),
        vendorId: vendor.vendorId,
        shopName: vendor.vendorName,
      },
    });
  };

  const likeProduct = async (product) => {
    const id = productId(product);
    const isLiked = favoriteIds.has(id);
    try {
      if (isLiked) {
        await removeFavorite(id);
        setFavoriteIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      } else {
        await addFavorite(id);
        setFavoriteIds((prev) => new Set(prev).add(id));
      }
    } catch {
      window.alert('Impossible de mettre à jour les favoris');
    }
  };

  const getPrice = (product) => {
    return getDiscountedPriceValue(product).toFixed(2);
  };

  if (loading) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
        <div style={{ fontSize: '3rem', animation: 'float 2s ease-in-out infinite' }}>🐾</div>
        <p style={{ color: '#888' }}>Chargement des produits...</p>
      </div>
    );
  }

  if (error && products.length === 0) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
        <p style={{ color: '#dc2626', fontWeight: 600 }}>{error}</p>
        <button onClick={fetchData} style={{ padding: '12px 24px', background: '#10b981', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 700, cursor: 'pointer' }}>
          🔄 Réessayer
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px 16px' }}>
      {/* Hero */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          textAlign: 'center',
          marginBottom: '32px',
          padding: '40px 24px',
          background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
          borderRadius: '24px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h1 style={{ fontSize: '36px', fontWeight: 800, color: '#065f46', margin: '0 0 8px' }}>
            🛒 Nos Produits
          </h1>
          <p style={{ fontSize: '16px', color: '#6b7280', margin: '0 0 10px' }}>
            Croquettes, accessoires, jouets — photos réelles, promos et vendeurs marketplace
          </p>
          <Link
            to="/client-rse"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 13,
              fontWeight: 700,
              color: '#047857',
              textDecoration: 'none',
              padding: '6px 12px',
              background: 'rgba(255,255,255,0.7)',
              borderRadius: 20,
              border: '1px solid #6ee7b7',
            }}
          >
            🌱 Produits éco-responsables &amp; hub RSE
          </Link>
        </div>
      </motion.div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
          {[
            { id: 'all', label: '🏠 Tout le catalogue' },
            { id: 'croquettes', label: '🥣 Croquettes' },
            { id: 'friandises', label: '🦴 Friandises' },
            { id: 'jouets', label: '🎾 Jouets' },
            { id: 'accessoires', label: '🎒 Accessoires' },
            { id: 'niches', label: '🏠 Niches & maisons' },
            { id: 'litiere', label: '🚽 Litière' },
            { id: 'toilettage', label: '✂️ Toilettage' },
            { id: 'transport', label: '🧳 Transport' },
            { id: 'hygiene', label: '✨ Hygiène' },
            { id: 'sante', label: '💊 Santé' },
            { id: 'iot', label: '🤖 Innovants' },
            { id: 'personnalise', label: '🎁 Personnalisé' },
            { id: 'packs', label: '📦 Kits & packs' },
            { id: 'aquarium', label: '🐠 Aquarium' },
            { id: 'vetements', label: '👕 Vêtements' },
          ].map((chip) => (
            <button
              key={chip.id}
              type="button"
              onClick={() => { setCategoryFilter(chip.id); setPromoOnly(false); }}
              style={{
                padding: '10px 16px',
                borderRadius: 999,
                border: categoryFilter === chip.id ? '2px solid #059669' : '1px solid #e5e7eb',
                background: categoryFilter === chip.id ? '#ecfdf5' : 'white',
                color: categoryFilter === chip.id ? '#047857' : '#374151',
                fontWeight: 700,
                fontSize: 13,
                cursor: 'pointer',
              }}
            >
              {chip.label}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setPromoOnly((v) => !v)}
            style={{
              padding: '10px 16px',
              borderRadius: 999,
              border: promoOnly ? '2px solid #dc2626' : '1px solid #fecaca',
              background: promoOnly ? '#fef2f2' : '#fff7ed',
              color: '#b91c1c',
              fontWeight: 700,
              fontSize: 13,
              cursor: 'pointer',
            }}
          >
            🔥 Promotions
          </button>
        </div>

      {profile?.petType && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            marginBottom: 24,
            padding: '16px 20px',
            background: 'linear-gradient(135deg, #fff7ed, #ffedd5)',
            borderRadius: 16,
            border: '1px solid #fed7aa',
          }}
        >
          <p style={{ margin: 0, fontWeight: 800, color: '#9a3412', fontSize: 15 }}>
            🐾 Sélection adaptée à votre {PET_LABELS[profile.petType] || profile.petType}
            {profile.petAge != null ? ` (${profile.petAge} an(s))` : ''}
          </p>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#c2410c' }}>
            {inStockSoldes.length} promotion{inStockSoldes.length > 1 ? 's' : ''} en cours · produits triés selon votre profil
          </p>
        </motion.div>
      )}

      {/* Search */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        background: 'white',
        padding: '14px 20px',
        borderRadius: '16px',
        boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
        marginBottom: '16px',
        border: '2px solid #e5e7eb',
      }}>
        <Search size={20} color="#9ca3af" />
        <input
          type="search"
          placeholder="Rechercher croquettes, jouets, accessoires, marque…"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ flex: 1, border: 'none', outline: 'none', fontSize: '15px', background: 'transparent' }}
        />
        <span style={{ fontSize: '13px', color: '#9ca3af', whiteSpace: 'nowrap' }}>{filteredProducts.length} résultat(s)</span>
      </div>

      {categoryFilter === 'animaux' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            marginBottom: 16,
            padding: '16px 20px',
            borderRadius: 16,
            background: 'linear-gradient(135deg, #fef3c7, #fde68a)',
            border: '1px solid #fcd34d',
          }}
        >
          <p style={{ margin: 0, fontSize: 14, color: '#92400e', fontWeight: 600 }}>
            🐾 Animaux à adopter — oiseaux, lapins, poissons, hamsters et plus. Vente responsable avec suivi vétérinaire PetfoodTN.
          </p>
        </motion.div>
      )}

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
        {CATEGORY_FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setCategoryFilter(f.id)}
            style={{
              padding: '8px 14px',
              borderRadius: 20,
              border: categoryFilter === f.id ? '2px solid #e67e22' : '1px solid #e5e7eb',
              background: categoryFilter === f.id ? 'rgba(230,126,34,0.1)' : 'white',
              fontWeight: 700,
              cursor: 'pointer',
              fontSize: 13,
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 24, alignItems: 'center' }}>
        {ANIMAL_FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setAnimalFilter(f.id)}
            style={{
              padding: '8px 14px',
              borderRadius: 20,
              border: animalFilter === f.id ? '2px solid #10b981' : '1px solid #e5e7eb',
              background: animalFilter === f.id ? 'rgba(16,185,129,0.1)' : 'white',
              fontWeight: 700,
              cursor: 'pointer',
              fontSize: 13,
            }}
          >
            {f.label}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setPromoOnly((v) => !v)}
          style={{
            padding: '8px 14px',
            borderRadius: 20,
            border: promoOnly ? '2px solid #ef4444' : '1px solid #e5e7eb',
            background: promoOnly ? 'rgba(239,68,68,0.1)' : 'white',
            fontWeight: 700,
            cursor: 'pointer',
            fontSize: 13,
          }}
        >
          <Flame size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />
          {promoOnly ? 'Tous les produits' : 'Promotions uniquement'}
        </button>
      </div>

      <Section
        title={`Tous les produits (${sortedAllProducts.length})`}
        titleColor="#374151"
      >
        {sortedAllProducts.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#9ca3af', padding: '40px', fontSize: '15px' }}>
            {promoOnly ? 'Aucune promotion ne correspond à vos filtres.' : 'Aucun produit disponible pour l’instant (stock insuffisant).'}
          </p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '20px' }}>
            {sortedAllProducts.map((product) => (
              <ProductCard
                key={`all-${productId(product)}`}
                product={product}
                onAdd={addToCart}
                onOrder={orderProduct}
                onVendor={openVendor}
                onLike={likeProduct}
                isLiked={favoriteIds.has(productId(product))}
                getPrice={getPrice}
                isPromo={isOnPromotion(product)}
                profilePetType={profilePetType}
                onView={setSelectedProduct}
              />
            ))}
          </div>
        )}
      </Section>

      <Section title="📦 Packs produits" titleColor="#0d9488" icon={<Package size={20} />}>
        <ProductPacksPanel embedded />
      </Section>

      {inStockSoldes.length > 0 && !promoOnly && (
        <Section title={`🔥 Promotions (${inStockSoldes.length})`} titleColor="#dc2626" icon={<Flame size={20} />}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '20px' }}>
            {inStockSoldes.map((product) => (
              <ProductCard
                key={`promo-${productId(product)}`}
                product={product}
                onAdd={addToCart}
                onOrder={orderProduct}
                onVendor={openVendor}
                onLike={likeProduct}
                isLiked={favoriteIds.has(productId(product))}
                getPrice={getPrice}
                isPromo
                profilePetType={profilePetType}
                onView={setSelectedProduct}
              />
            ))}
          </div>
        </Section>
      )}

      {frequent.length > 0 && !promoOnly && (
        <Section title="🔄 Vos achats fréquents" titleColor="#0369a1" icon={<Sparkles size={20} />}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '20px' }}>
            {frequent.map((product) => (
              <ProductCard
                key={`freq-${productId(product)}`}
                product={product}
                onAdd={addToCart}
                onOrder={orderProduct}
                onVendor={openVendor}
                onLike={likeProduct}
                isLiked={favoriteIds.has(productId(product))}
                getPrice={getPrice}
                profilePetType={profilePetType}
                onView={setSelectedProduct}
              />
            ))}
          </div>
        </Section>
      )}

      {/* Recommandations — après le catalogue */}
      {inStockRecommendations.length > 0 && (
        <Section title="✨ Produits recommandés pour vous" titleColor="#059669" icon={<Sparkles size={20} />}>
          <p style={{ margin: '0 0 16px', fontSize: 14, color: '#64748b' }}>
            Sélection IA selon votre profil, vos achats et les avis clients.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '20px' }}>
            {inStockRecommendations.map((product) => (
              <ProductCard
                key={`rec-${productId(product)}`}
                product={product}
                onAdd={addToCart}
                onOrder={orderProduct}
                onVendor={openVendor}
                onLike={likeProduct}
                isLiked={favoriteIds.has(productId(product))}
                getPrice={getPrice}
                isRec
                profilePetType={profilePetType}
                onView={setSelectedProduct}
              />
            ))}
          </div>
        </Section>
      )}

      <RecommendationPipelinePanel
        role="client"
        limit={6}
        catalog={products}
        onSelectItem={(item) => {
          const match = products.find((p) => productId(p) === String(item.id || item._id));
          if (match) setSelectedProduct(match);
        }}
      />

      {/* Nearby */}
      {inStockNearby.length > 0 && (
        <Section title="📍 Près de chez vous — magasin assigné automatiquement" titleColor="#8b5cf6" icon={<MapPin size={20} />}>
          <div style={{
            marginBottom: 16,
            padding: '14px 18px',
            borderRadius: 14,
            background: 'linear-gradient(135deg, #ede9fe, #ddd6fe)',
            border: '1px solid #c4b5fd',
            fontSize: 14,
            color: '#5b21b6',
          }}>
            🏪 Votre magasin le plus proche : <strong>{DEMO_NEAREST_STORE.name}</strong> ({DEMO_NEAREST_STORE.distanceKm} km)
            — {DEMO_NEAREST_STORE.address} · ouvert jusqu&apos;à {DEMO_NEAREST_STORE.openUntil}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '20px' }}>
            {inStockNearby.map(product => (
              <ProductCard key={`near-${productId(product)}`} product={product} onAdd={addToCart} onOrder={orderProduct} onVendor={openVendor} onLike={likeProduct} isLiked={favoriteIds.has(productId(product))} getPrice={getPrice} isNearby onView={setSelectedProduct} />
            ))}
          </div>
        </Section>
      )}

      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={(p) => { addToCart(p); setSelectedProduct(null); }}
        onOrder={(p) => { orderProduct(p); setSelectedProduct(null); }}
        onVendor={openVendor}
        getPrice={getPrice}
        getImage={getProductImage}
        profilePetType={profilePetType}
      />

    </div>
  );
};

const Section = ({ title, titleColor, icon, children }) => (
  <motion.section
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    style={{ marginBottom: '36px' }}
  >
    <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '16px', paddingLeft: '4px', color: titleColor, display: 'flex', alignItems: 'center', gap: '8px' }}>
      {icon} {title}
    </h2>
    {children}
  </motion.section>
);

const PRODUCT_IMAGE_META = {
  dog: { icon: '🐕', label: 'Chien', from: '#fef3c7', to: '#f59e0b' },
  cat: { icon: '🐈', label: 'Chat', from: '#ede9fe', to: '#8b5cf6' },
  bird: { icon: '🐦', label: 'Oiseau', from: '#dbeafe', to: '#2563eb' },
  fish: { icon: '🐟', label: 'Poisson', from: '#cffafe', to: '#0891b2' },
  other: { icon: '🐾', label: 'Petfood', from: '#dcfce7', to: '#16a34a' },
};

const productFallbackImage = (product) => {
  const meta = PRODUCT_IMAGE_META[product.animalType] || PRODUCT_IMAGE_META.other;
  const title = (product.name || meta.label).slice(0, 28);
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="600" height="360" viewBox="0 0 600 360">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="${meta.from}"/>
          <stop offset="1" stop-color="${meta.to}"/>
        </linearGradient>
      </defs>
      <rect width="600" height="360" rx="32" fill="url(#g)"/>
      <circle cx="500" cy="70" r="90" fill="rgba(255,255,255,0.18)"/>
      <circle cx="88" cy="300" r="120" fill="rgba(255,255,255,0.14)"/>
      <text x="300" y="155" text-anchor="middle" font-size="86">${meta.icon}</text>
      <text x="300" y="220" text-anchor="middle" font-family="Arial, sans-serif" font-size="30" font-weight="700" fill="white">${title}</text>
      <text x="300" y="260" text-anchor="middle" font-family="Arial, sans-serif" font-size="18" font-weight="600" fill="rgba(255,255,255,0.85)">PetfoodTN Premium</text>
    </svg>
  `;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};

const getProductImage = (product) => {
  const raw = product?.imageUrl || product?.image || product?.icon;
  return sanitizeProductImageUrl(raw, product) || resolveNaturalProductImage(product) || productFallbackImage(product);
};

const ProductCard = ({ product, onAdd, onOrder, onVendor, onLike, getPrice, isPromo, isRec, isNearby, onView, profilePetType, isLiked }) => {
  const discount = getEffectiveDiscount(product);
  const finalPrice = getPrice(product);
  const profileMatch = profilePetType && product.animalType === profilePetType;

  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 300 }}
      style={{
        background: 'white',
        borderRadius: '20px',
        overflow: 'hidden',
        border: `2px solid ${isPromo ? '#fca5a5' : isRec ? '#6ee7b7' : isNearby ? '#c4b5fd' : '#e5e7eb'}`,
        boxShadow: isPromo ? '0 8px 24px rgba(220,38,38,0.12)' : isRec ? '0 8px 24px rgba(5,150,105,0.12)' : isNearby ? '0 8px 24px rgba(139,92,246,0.12)' : '0 4px 12px rgba(0,0,0,0.06)',
        transition: 'box-shadow 0.3s',
        cursor: 'pointer',
      }}
      onClick={() => onView?.(product)}
    >
      <div style={{ position: 'relative', overflow: 'hidden' }}>
        <motion.img
          whileHover={{ scale: 1.08 }}
          transition={{ duration: 0.4 }}
          src={getProductImage(product)}
          alt={product.name}
          style={{ width: '100%', height: '180px', objectFit: 'cover', display: 'block' }}
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = productFallbackImage(product);
          }}
        />
        {discount > 0 && (
          <span style={{
            position: 'absolute',
            top: '10px',
            left: '10px',
            background: '#ef4444',
            color: 'white',
            padding: '4px 12px',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: 800,
            boxShadow: '0 2px 8px rgba(239,68,68,0.3)',
          }}>
            -{discount}%
          </span>
        )}
        {profileMatch && (
          <span style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            background: '#059669',
            color: 'white',
            padding: '4px 10px',
            borderRadius: '20px',
            fontSize: '11px',
            fontWeight: 700,
          }}>
            ✨ Pour vous
          </span>
        )}
        {isNearby && product.distance && (
          <span style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            background: '#8b5cf6',
            color: 'white',
            padding: '4px 12px',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: 700,
            boxShadow: '0 2px 8px rgba(139,92,246,0.3)',
          }}>
            <MapPin size={12} style={{ verticalAlign: 'middle', marginRight: '2px' }} /> {product.distance}km
          </span>
        )}
        <button
          onClick={(e) => { e.stopPropagation(); onLike(product); }}
          style={{
            position: 'absolute',
            bottom: '10px',
            right: '10px',
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: 'white',
            border: 'none',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '16px',
          }}
          title={isLiked ? 'Retirer des favoris' : 'Ajouter aux favoris'}
        >
          {isLiked ? '❤️' : '🤍'}
        </button>
      </div>

      <div style={{ padding: '18px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#111827', margin: '0 0 6px' }}>{product.name}</h3>
        <div style={{ marginBottom: 6 }}>
          <ProductStarRating product={product} size="sm" />
        </div>
        <div style={{ marginBottom: 8 }}>
          <RseEcoBadge product={product} size="xs" showScore />
        </div>
        <p style={{ fontSize: '13px', color: '#6b7280', margin: '0 0 8px', lineHeight: '1.4', minHeight: '36px' }}>
          {product.description || 'Nourriture premium pour animaux'}
        </p>
        <p style={{ fontSize: '12px', color: '#64748b', margin: '0 0 12px', fontWeight: 600 }}>
          <Store size={12} style={{ verticalAlign: 'middle', marginRight: 4 }} />
          {product.vendorName || resolveVendor(product).vendorName}
        </p>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '20px', fontWeight: 800, color: '#059669' }}>{finalPrice} DT</span>
          {discount > 0 && (
            <span style={{ fontSize: '14px', color: '#9ca3af', textDecoration: 'line-through' }}>{product.price} DT</span>
          )}
          <VerifiedPriceBadge product={product} compact />
        </div>

        {product.recommendedReason && (
          <div style={{ margin: '0 0 12px' }}>
            <p style={{
              fontSize: '12px',
              color: '#6b7280',
              fontStyle: 'italic',
              margin: '0 0 4px',
              padding: '4px 10px',
              background: isRec ? 'rgba(5,150,105,0.08)' : 'rgba(139,92,246,0.08)',
              borderRadius: 8,
              display: 'inline-block',
            }}>
              {product.recommendedReason}
            </p>
            {product.hybridScore != null && (
              <span style={{
                fontSize: 10,
                fontWeight: 800,
                color: '#5b21b6',
                background: '#ede9fe',
                padding: '3px 8px',
                borderRadius: 999,
                marginLeft: 6,
              }}>
                IA hybride {(product.hybridScore * 100).toFixed(0)}%
              </span>
            )}
            {Array.isArray(product.reasons) && product.reasons.length > 1 && (
              <p style={{ fontSize: '11px', color: '#9ca3af', margin: '6px 0 0' }}>
                {product.reasons.slice(1, 3).join(' · ')}
              </p>
            )}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onView?.(product); }}
              style={{
                flex: 1,
                padding: '11px',
                border: '2px solid #e5e7eb',
                borderRadius: '12px',
                background: 'white',
                color: '#374151',
                fontWeight: 700,
                fontSize: '13px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
              }}
            >
              <Eye size={14} /> Détails
            </button>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onOrder?.(product); }}
              disabled={!product.stock}
              style={{
                flex: 1.2,
                padding: '11px',
                border: 'none',
                borderRadius: '12px',
                color: 'white',
                fontWeight: 800,
                fontSize: '13px',
                cursor: product.stock ? 'pointer' : 'not-allowed',
                background: product.stock
                  ? (isPromo ? 'linear-gradient(135deg,#dc2626,#b91c1c)' : 'linear-gradient(135deg,#10b981,#059669)')
                  : '#9ca3af',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
                boxShadow: product.stock ? '0 4px 14px rgba(16,185,129,0.3)' : 'none',
              }}
            >
              <ShoppingCart size={14} />
              {product.stock ? 'Passer commande' : 'Rupture'}
            </button>
          </div>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onVendor?.(product); }}
            style={{
              width: '100%',
              padding: '8px',
              border: 'none',
              borderRadius: '10px',
              background: 'transparent',
              color: '#4338ca',
              fontWeight: 700,
              fontSize: '12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
            }}
          >
            <Store size={13} /> Voir le vendeur
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ClientProductsPage;
