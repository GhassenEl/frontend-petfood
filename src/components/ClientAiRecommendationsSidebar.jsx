import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, MessageCircle, ChevronRight } from 'lucide-react';
import api from '../utils/api';
import { resolveNaturalProductImage } from '../utils/productImages';
import useIsMobile from '../hooks/useIsMobile';

const cardStyle = {
  background: '#fff',
  borderRadius: 14,
  border: '1px solid #e2e8f0',
  padding: 14,
  marginBottom: 10,
};

const GUIDE_TIPS = [
  'Choisissez selon l’âge et l’activité de votre animal.',
  'Privilégiez les formules adaptées à la taille (ex. M pour manteau chien).',
  'Comparez les promotions avant d’ajouter au panier.',
];

const ClientAiRecommendationsSidebar = () => {
  const isMobile = useIsMobile();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/products')
      .then((r) => {
        const list = (r.data || [])
          .filter((p) => Number(p.stock ?? p.quantity ?? 1) > 0)
          .slice(0, 5)
          .map((p) => ({ ...p, imageUrl: resolveNaturalProductImage(p) }));
        setProducts(list);
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  if (isMobile) return null;

  const openAssistant = () => {
    window.dispatchEvent(new CustomEvent('petfood:open-chat'));
  };

  return (
    <aside
      aria-label="Assistant IA — recommandations produits"
      style={{
        position: 'fixed',
        top: 72,
        right: 16,
        width: 280,
        maxHeight: 'calc(100vh - 100px)',
        overflowY: 'auto',
        zIndex: 800,
        background: 'linear-gradient(180deg, #fff7ed 0%, #ffffff 40%)',
        borderRadius: 18,
        border: '1px solid #fed7aa',
        boxShadow: '0 8px 32px rgba(230,126,34,0.12)',
        padding: 16,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: 'linear-gradient(135deg, #e67e22, #d35400)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 18,
          }}
        >
          💡
        </div>
        <div>
          <strong style={{ fontSize: 14, display: 'block' }}>Assistant IA</strong>
          <span style={{ fontSize: 11, color: '#64748b' }}>Top produits pour vous guider</span>
        </div>
      </div>

      <div style={{ ...cardStyle, background: '#fffbeb', borderColor: '#fde68a' }}>
        <p style={{ margin: '0 0 8px', fontSize: 12, fontWeight: 700, color: '#92400e', display: 'flex', alignItems: 'center', gap: 4 }}>
          <Sparkles size={14} /> Conseils rapides
        </p>
        <ul style={{ margin: 0, paddingLeft: 16, fontSize: 11, color: '#78350f', lineHeight: 1.5 }}>
          {GUIDE_TIPS.map((tip) => (
            <li key={tip}>{tip}</li>
          ))}
        </ul>
      </div>

      <p style={{ fontSize: 12, fontWeight: 800, color: '#334155', margin: '14px 0 8px' }}>
        🏆 Recommandés pour vous
      </p>

      {loading ? (
        <p style={{ fontSize: 12, color: '#94a3b8' }}>Chargement…</p>
      ) : products.length === 0 ? (
        <p style={{ fontSize: 12, color: '#94a3b8' }}>Parcourez la boutique pour des suggestions.</p>
      ) : (
        products.map((p) => (
          <Link
            key={p.id || p._id}
            to="/client-products"
            style={{ ...cardStyle, display: 'block', textDecoration: 'none', color: 'inherit' }}
          >
            {p.imageUrl && (
              <img
                src={p.imageUrl}
                alt=""
                style={{ width: '100%', height: 72, objectFit: 'cover', borderRadius: 10, marginBottom: 8 }}
              />
            )}
            <strong style={{ fontSize: 12, lineHeight: 1.3, display: 'block' }}>{p.name}</strong>
            {p.price != null && (
              <span style={{ fontSize: 12, color: '#059669', fontWeight: 800 }}>{p.price} DT</span>
            )}
          </Link>
        ))
      )}

      <button
        type="button"
        onClick={openAssistant}
        style={{
          width: '100%',
          marginTop: 8,
          padding: '10px 12px',
          borderRadius: 12,
          border: 'none',
          background: 'linear-gradient(135deg, #10b981, #059669)',
          color: 'white',
          fontWeight: 700,
          fontSize: 13,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
        }}
      >
        <MessageCircle size={16} />
        Poser une question
        <ChevronRight size={14} />
      </button>

      <Link
        to="/client-products"
        style={{ display: 'block', textAlign: 'center', marginTop: 10, fontSize: 11, color: '#0ea5e9', fontWeight: 700 }}
      >
        Voir toute la boutique →
      </Link>
    </aside>
  );
};

export default ClientAiRecommendationsSidebar;
