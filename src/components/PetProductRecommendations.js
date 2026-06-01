import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { PawPrint, ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../utils/api';

const PET_EMOJI = { dog: '🐕', cat: '🐈', bird: '🐦', fish: '🐟', rabbit: '🐰', other: '🐾' };

const PRODUCT_IMAGE_META = {
  dog: { icon: '🐕', from: '#fef3c7', to: '#f59e0b' },
  cat: { icon: '🐈', from: '#ede9fe', to: '#8b5cf6' },
  bird: { icon: '🐦', from: '#dbeafe', to: '#2563eb' },
  fish: { icon: '🐟', from: '#cffafe', to: '#0891b2' },
  other: { icon: '🐾', from: '#dcfce7', to: '#16a34a' },
};

const normalizeProduct = (p) => {
  if (!p) return p;
  return {
    ...p,
    stock: Number(p.stock ?? p.quantity ?? 0),
    discount: Number(p.discount ?? 0),
    price: Number(p.price ?? 0),
    imageUrl: p.imageUrl ?? p.image ?? undefined,
  };
};

const productFallbackImage = (product) => {
  const meta = PRODUCT_IMAGE_META[product.animalType] || PRODUCT_IMAGE_META.other;
  const title = (product.name || 'Petfood').slice(0, 28);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="360" viewBox="0 0 600 360"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${meta.from}"/><stop offset="1" stop-color="${meta.to}"/></linearGradient></defs><rect width="600" height="360" rx="32" fill="url(#g)"/><text x="300" y="155" text-anchor="middle" font-size="86">${meta.icon}</text><text x="300" y="220" text-anchor="middle" font-family="Arial" font-size="30" font-weight="700" fill="white">${title}</text></svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};

const getDiscountedPrice = (product) => {
  const price = Number(product.price || 0);
  const discount = Number(product.discount || 0);
  return Number((price * (1 - discount / 100)).toFixed(2));
};

const PetProductRecommendations = ({
  limit = 8,
  compact = false,
  defaultPetId = '',
  filterPetType = null,
  showPetSelector = true,
  linkToShop = false,
  title,
}) => {
  const [pets, setPets] = useState([]);
  const [selectedPetId, setSelectedPetId] = useState(defaultPetId);
  const [recommendations, setRecommendations] = useState([]);
  const [catalog, setCatalog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/products')
      .then((res) => setCatalog(res.data || []))
      .catch(() => setCatalog([]));
  }, []);

  const enrichWithCatalog = useCallback((recs) => {
    if (!recs?.length) return [];
    const map = new Map(catalog.map((p) => [p._id || p.id, p]));
    return recs.map((rec) => {
      const base = map.get(rec._id || rec.id);
      return base ? normalizeProduct({ ...base, ...rec, stock: base.stock ?? rec.stock }) : normalizeProduct(rec);
    });
  }, [catalog]);

  useEffect(() => {
    if (filterPetType) setSelectedPetId('');
  }, [filterPetType]);

  const fetchRecommendations = useCallback(async (petId = '') => {
    setLoading(true);
    setError('');
    try {
      const params = petId ? `?petId=${encodeURIComponent(petId)}&limit=${limit}` : `?limit=${limit}`;
      const { data } = await api.get(`/products/recommendations/pets${params}`);

      let petList = Array.isArray(data?.pets) ? data.pets : [];
      if (filterPetType) {
        petList = petList.filter((p) => p.type === filterPetType);
      }
      if (petList.length > 0) setPets(petList);

      const raw = (data?.recommendations || []).map((d) => ({
        ...d,
        recommendedReason: d.recommendedReason || d.reasons?.[0],
      }));

      let enriched = enrichWithCatalog(raw);
      if (filterPetType && !petId) {
        enriched = enriched.filter((p) => p.petType === filterPetType || p.animalType === filterPetType);
      }
      setRecommendations(enriched.filter((p) => Number(p.stock) > 0));
    } catch (err) {
      console.error('Pet recommendations error:', err);
      setError('Impossible de charger les recommandations.');
      setRecommendations([]);
    } finally {
      setLoading(false);
    }
  }, [limit, filterPetType, enrichWithCatalog]);

  useEffect(() => {
    fetchRecommendations(selectedPetId);
  }, [selectedPetId, fetchRecommendations]);

  useEffect(() => {
    if (recommendations.length > 0 && catalog.length > 0) {
      setRecommendations((prev) => enrichWithCatalog(prev).filter((p) => Number(p.stock) > 0));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [catalog.length]);

  const selectedPet = pets.find((p) => p.id === selectedPetId);
  const sectionTitle = title || (selectedPet
    ? `${PET_EMOJI[selectedPet.type] || '🐾'} Recommandé pour ${selectedPet.name}`
    : '🐾 Recommandé pour vos animaux');

  const addToCart = (product) => {
    window.dispatchEvent(new CustomEvent('addToCart', {
      detail: { ...product, originalPrice: product.price, price: getDiscountedPrice(product) },
    }));
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        padding: compact ? '16px' : '20px',
        background: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)',
        borderRadius: '20px',
        border: '1px solid rgba(230,126,34,0.15)',
      }}
    >
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '12px', marginBottom: '16px' }}>
        <h2 style={{ fontSize: compact ? '17px' : '20px', fontWeight: 700, margin: 0, color: '#9a3412', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <PawPrint size={compact ? 18 : 20} /> {sectionTitle}
        </h2>
        {linkToShop && (
          <Link to="/client-products" style={{ fontSize: '13px', fontWeight: 700, color: '#c2410c', textDecoration: 'none' }}>
            Voir tous les produits →
          </Link>
        )}
      </div>

      {showPetSelector && pets.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
          <button
            type="button"
            onClick={() => setSelectedPetId('')}
            style={{
              padding: '8px 14px', borderRadius: '20px', cursor: 'pointer', fontWeight: 700, fontSize: '13px',
              border: selectedPetId === '' ? '2px solid #e67e22' : '1px solid #ddd',
              background: selectedPetId === '' ? '#fff' : 'white',
            }}
          >
            Tous mes animaux
          </button>
          {pets.map((pet) => (
            <button
              key={pet.id}
              type="button"
              onClick={() => setSelectedPetId(pet.id)}
              style={{
                padding: '8px 14px', borderRadius: '20px', cursor: 'pointer', fontWeight: 700, fontSize: '13px',
                border: selectedPetId === pet.id ? '2px solid #e67e22' : '1px solid #ddd',
                background: selectedPetId === pet.id ? '#fff' : 'white',
              }}
            >
              {pet.emoji || PET_EMOJI[pet.type] || '🐾'} {pet.name}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <p style={{ color: '#9a3412', margin: 0 }}>Analyse du profil de votre animal…</p>
      ) : error ? (
        <p style={{ color: '#b91c1c', margin: 0 }}>{error}</p>
      ) : recommendations.length === 0 ? (
        <p style={{ color: '#9a3412', margin: 0 }}>
          Ajoutez un animal dans <strong>Mon Profil</strong> pour des recommandations adaptées (âge, race, santé).
        </p>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: compact
            ? 'repeat(auto-fill, minmax(200px, 1fr))'
            : 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: compact ? '14px' : '20px',
        }}
        >
          {recommendations.map((product) => (
            <motion.div
              key={`pet-rec-${product._id || product.id}`}
              whileHover={{ y: -4, scale: 1.01 }}
              style={{
                background: 'white', borderRadius: '16px', overflow: 'hidden',
                border: '2px solid #6ee7b7', boxShadow: '0 6px 20px rgba(5,150,105,0.1)',
              }}
            >
              <img
                src={product.imageUrl || productFallbackImage(product)}
                alt={product.name}
                style={{ width: '100%', height: compact ? '120px' : '160px', objectFit: 'cover', display: 'block' }}
                onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = productFallbackImage(product); }}
              />
              <div style={{ padding: compact ? '12px' : '16px' }}>
                <h3 style={{ fontSize: compact ? '14px' : '15px', fontWeight: 700, margin: '0 0 6px', color: '#111827' }}>{product.name}</h3>
                {product.recommendedReason && (
                  <p style={{ fontSize: '11px', color: '#6b7280', margin: '0 0 8px', fontStyle: 'italic' }}>{product.recommendedReason}</p>
                )}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                  <span style={{ fontSize: compact ? '16px' : '18px', fontWeight: 800, color: '#059669' }}>
                    {getDiscountedPrice(product).toFixed(2)} DT
                  </span>
                  <button
                    type="button"
                    onClick={() => addToCart(product)}
                    style={{
                      padding: '8px 12px', border: 'none', borderRadius: '10px', background: '#10b981',
                      color: 'white', fontWeight: 700, fontSize: '12px', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: '4px',
                    }}
                  >
                    <ShoppingCart size={14} /> Ajouter
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.section>
  );
};

export default PetProductRecommendations;
