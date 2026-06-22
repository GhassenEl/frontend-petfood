import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingCart, Star, Package, Tag, Beaker, BookOpen, Sparkles, Store } from 'lucide-react';
import { getProductDetailFields, getEffectiveDiscount, getPromoPrice } from '../utils/productDetails';
import VerifiedPriceBadge from './VerifiedPriceBadge';
import ProductReviewAiPanel from './ProductReviewAiPanel';

const ANIMAL_LABELS = { dog: 'Chien', cat: 'Chat', bird: 'Oiseau', fish: 'Poisson', other: 'Autre' };

const ProductDetailModal = ({ product, onClose, onAddToCart, onOrder, onVendor, getPrice, getImage, profilePetType }) => {
  if (!product) return null;

  const id = product._id || product.id;
  const discount = getEffectiveDiscount(product);
  const price = Number(product.price || 0);
  const promoPrice = getPromoPrice(product);
  const finalPrice = getPrice ? getPrice(product) : promoPrice.toFixed(2);
  const savings = discount > 0 ? Number((price - promoPrice).toFixed(2)) : 0;
  const { composition, usage, benefits } = getProductDetailFields(product);
  const tags = Array.isArray(product.tags)
    ? product.tags
    : typeof product.tags === 'string' && product.tags
      ? product.tags.split(',').map((t) => t.trim()).filter(Boolean)
      : [];
  const profileMatch = profilePetType && product.animalType === profilePetType;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15,23,42,0.55)',
          zIndex: 2000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 16,
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          style={{
            background: 'white',
            borderRadius: 24,
            maxWidth: 720,
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto',
            boxShadow: '0 24px 60px rgba(0,0,0,0.2)',
          }}
        >
          <div style={{ position: 'relative' }}>
            <img
              src={getImage(product)}
              alt={product.name}
              style={{ width: '100%', height: 260, objectFit: 'cover', display: 'block' }}
            />
            {discount > 0 && (
              <span style={{
                position: 'absolute', top: 16, left: 16, background: '#ef4444', color: 'white',
                padding: '6px 14px', borderRadius: 20, fontWeight: 800, fontSize: 13,
              }}>
                -{discount}%
              </span>
            )}
            {profileMatch && (
              <span style={{
                position: 'absolute', top: 16, right: 56, background: '#059669', color: 'white',
                padding: '6px 14px', borderRadius: 20, fontWeight: 700, fontSize: 12,
              }}>
                ✨ Adapté à votre profil
              </span>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="Fermer"
              style={{
                position: 'absolute', top: 16, right: 16, width: 40, height: 40, borderRadius: '50%',
                border: 'none', background: 'white', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <X size={20} />
            </button>
          </div>

          <div style={{ padding: '24px 28px 28px' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
              <Badge icon={<Package size={12} />} text={ANIMAL_LABELS[product.animalType] || 'Animal'} color="#ecfdf5" textColor="#047857" />
              <Badge icon={<Tag size={12} />} text={product.category || 'nourriture'} color="#eff6ff" textColor="#1d4ed8" />
              {product.stock > 0 ? (
                <Badge text={`En stock (${product.stock})`} color="#f0fdf4" textColor="#15803d" />
              ) : (
                <Badge text="Rupture" color="#fef2f2" textColor="#b91c1c" />
              )}
              {discount > 0 && (
                <Badge text="En promotion" color="#fef2f2" textColor="#dc2626" />
              )}
            </div>

            <h2 style={{ margin: '0 0 8px', fontSize: 26, fontWeight: 800, color: '#111827' }}>{product.name}</h2>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 28, fontWeight: 800, color: '#059669' }}>{finalPrice} DT</span>
              {discount > 0 && (
                <>
                  <span style={{ fontSize: 16, color: '#9ca3af', textDecoration: 'line-through' }}>{price.toFixed(2)} DT</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#dc2626', background: '#fef2f2', padding: '4px 10px', borderRadius: 8 }}>
                    Économie {savings} DT
                  </span>
                </>
              )}
              <VerifiedPriceBadge product={product} />
              {product.rating_avg > 0 && (
                <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 14, color: '#f59e0b', fontWeight: 700 }}>
                  <Star size={16} fill="#f59e0b" /> {Number(product.rating_avg).toFixed(1)} ({product.rating_count || 0})
                </span>
              )}
            </div>

            <p style={{ margin: '0 0 16px', color: '#4b5563', lineHeight: 1.65, fontSize: 15 }}>
              {product.description || 'Produit premium PetfoodTN — nutrition de qualité pour votre compagnon.'}
            </p>

            {product.recommendedReason && (
              <div style={{ padding: 12, background: '#fff7ed', borderRadius: 12, marginBottom: 16, fontSize: 14, color: '#9a3412' }}>
                ✨ {product.recommendedReason}
              </div>
            )}

            <DetailBlock icon={<Beaker size={16} />} title="Composition" text={composition} />
            <DetailBlock icon={<BookOpen size={16} />} title="Mode d'emploi" text={usage} />

            {benefits?.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <p style={{ margin: '0 0 8px', fontWeight: 700, fontSize: 14, color: '#374151', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Sparkles size={16} color="#059669" /> Bénéfices
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {benefits.map((b) => (
                    <span key={b} style={{ padding: '4px 10px', background: '#ecfdf5', borderRadius: 20, fontSize: 12, fontWeight: 600, color: '#047857' }}>
                      {b}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {tags.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 20 }}>
                {tags.map((t) => (
                  <span key={t} style={{ padding: '4px 10px', background: '#f3f4f6', borderRadius: 20, fontSize: 12, fontWeight: 600, color: '#374151' }}>
                    #{t}
                  </span>
                ))}
              </div>
            )}

            <ProductReviewAiPanel productId={id} productName={product.name} />

            {product.vendorName && (
              <div style={{
                marginBottom: 16,
                padding: 14,
                borderRadius: 12,
                background: '#eef2ff',
                border: '1px solid #c7d2fe',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12,
                flexWrap: 'wrap',
              }}>
                <div>
                  <p style={{ margin: 0, fontSize: 12, color: '#6366f1', fontWeight: 700 }}>Vendeur marketplace</p>
                  <p style={{ margin: '4px 0 0', fontSize: 15, fontWeight: 800, color: '#312e81' }}>{product.vendorName}</p>
                </div>
                <button
                  type="button"
                  onClick={() => onVendor?.(product)}
                  style={{
                    padding: '10px 14px',
                    border: 'none',
                    borderRadius: 10,
                    background: '#4f46e5',
                    color: 'white',
                    fontWeight: 700,
                    fontSize: 13,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <Store size={16} /> Détails vendeur
                </button>
              </div>
            )}

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 20 }}>
              <button
                type="button"
                onClick={() => onOrder?.(product)}
                disabled={!product.stock}
                style={{
                  flex: 1, minWidth: 200, padding: '14px 20px', border: 'none', borderRadius: 14,
                  background: product.stock ? 'linear-gradient(135deg,#10b981,#059669)' : '#9ca3af', color: 'white', fontWeight: 800,
                  cursor: product.stock ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', gap: 8, fontSize: 15,
                }}
              >
                <ShoppingCart size={18} /> Passer commande
              </button>
              <button
                type="button"
                onClick={() => onAddToCart?.(product)}
                disabled={!product.stock}
                style={{
                  flex: 1, minWidth: 160, padding: '14px 20px', border: '2px solid #10b981', borderRadius: 14,
                  background: 'white', color: '#059669', fontWeight: 700,
                  cursor: product.stock ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', gap: 8, fontSize: 14,
                }}
              >
                Ajouter au panier
              </button>
            </div>

            <p style={{ margin: '14px 0 0', fontSize: 12, color: '#94a3b8' }}>Réf. {id?.slice?.(-8) || id}</p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

const DetailBlock = ({ icon, title, text }) => (
  <div style={{ marginBottom: 14, padding: 14, background: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0' }}>
    <p style={{ margin: '0 0 6px', fontWeight: 700, fontSize: 14, color: '#334155', display: 'flex', alignItems: 'center', gap: 6 }}>
      {icon} {title}
    </p>
    <p style={{ margin: 0, fontSize: 14, color: '#64748b', lineHeight: 1.6 }}>{text}</p>
  </div>
);

const Badge = ({ icon, text, color, textColor }) => (
  <span style={{
    display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px',
    background: color, color: textColor, borderRadius: 20, fontSize: 12, fontWeight: 700, textTransform: 'capitalize',
  }}>
    {icon} {text}
  </span>
);

export default ProductDetailModal;
