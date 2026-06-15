import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Brain, Sparkles, Heart, Package, MessageCircle, ShoppingCart } from 'lucide-react';
import { SPECIES_MAP } from '../utils/animalSpecies';
import useClientMlAgent from '../hooks/useClientMlAgent';
import { productId } from '../utils/productId';

const badge = {
  fontSize: 11,
  fontWeight: 700,
  padding: '4px 10px',
  borderRadius: 999,
  background: '#f3e8ff',
  color: '#7c3aed',
};

const ClientMlAgentPage = () => {
  const { data, loading, pythonPowered, groqPowered, reload } = useClientMlAgent();

  const addToCart = (product) => {
    window.dispatchEvent(
      new CustomEvent('addToCart', {
        detail: { ...product, price: Number(product.price || 0) },
      })
    );
  };

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '24px 16px' }}>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          marginBottom: 24,
          padding: '32px 24px',
          borderRadius: 24,
          background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 50%, #faf5ff 100%)',
          border: '1px solid #a7f3d0',
        }}
      >
        <h1 style={{ margin: '0 0 8px', fontSize: 30, fontWeight: 800, color: '#065f46' }}>
          <Brain size={28} style={{ verticalAlign: 'middle', marginRight: 8 }} />
          Agent IA Client
        </h1>
        <p style={{ margin: 0, color: '#64748b', maxWidth: 560 }}>
          Recommandations personnalisées Groq + XGBoost selon vos animaux, achats et tendances boutique.
        </p>
        <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {pythonPowered && <span style={badge}>XGBoost</span>}
          {groqPowered && <span style={{ ...badge, background: '#ecfdf5', color: '#059669' }}>Groq</span>}
          <button type="button" onClick={reload} style={btnOutline}>
            Actualiser
          </button>
          <Link to="/client-ai" style={{ ...btnPrimary, textDecoration: 'none' }}>
            <MessageCircle size={16} /> Chat catalogue
          </Link>
          <Link to="/client-advanced-ai" style={{ ...btnOutline, textDecoration: 'none' }}>
            IA avancée
          </Link>
        </div>
      </motion.div>

      {loading ? (
        <p style={{ color: '#94a3b8' }}>Analyse de votre profil en cours…</p>
      ) : !data ? (
        <p style={{ color: '#dc2626' }}>Agent IA indisponible. Vérifiez que le backend et le service ML sont démarrés.</p>
      ) : (
        <>
          {data.summary && (
            <div style={card}>
              <h3 style={{ margin: '0 0 10px', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Sparkles size={20} color="#7c3aed" />
                Analyse personnalisée
              </h3>
              <p style={{ margin: 0, fontSize: 15, color: '#334155', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                {data.summary}
              </p>
              {data.tip && (
                <p style={{ margin: '12px 0 0', fontSize: 13, color: '#6b21a8' }}>{data.tip}</p>
              )}
            </div>
          )}

          {data.rebuyScore && (
            <div style={{ ...card, background: '#fff7ed', borderColor: '#fed7aa' }}>
              <Heart size={18} color="#c2410c" style={{ verticalAlign: 'middle' }} />
              {' '}
              Probabilité de rachat : <strong>{(data.rebuyScore.rebuyProbability * 100).toFixed(0)}%</strong>
              {' '}({data.rebuyScore.riskLabel})
            </div>
          )}

          {data.actionHints?.length > 0 && (
            <div style={card}>
              <h3 style={{ margin: '0 0 12px' }}>Actions suggérées</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                {data.actionHints.map((h) => (
                  <Link key={h.type} to={h.link} style={chipLink}>
                    {h.label}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {data.topRecommendations?.length > 0 && (
            <div style={card}>
              <h3 style={{ margin: '0 0 16px' }}>
                <Package size={18} style={{ verticalAlign: 'middle' }} /> Top recommandations IA
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 14 }}>
                {data.topRecommendations.map((p) => (
                  <div key={productId(p)} style={productCard}>
                    {p.imageUrl && (
                      <img src={p.imageUrl} alt="" style={{ width: '100%', height: 100, objectFit: 'cover', borderRadius: 10 }} />
                    )}
                    <strong style={{ fontSize: 14 }}>{p.name}</strong>
                    <p style={{ margin: '4px 0', fontSize: 12, color: '#64748b' }}>
                      {p.recommendedReason || p.reasons?.[0] || 'Adapté à votre profil'}
                    </p>
                    <p style={{ margin: '0 0 8px', fontWeight: 800, color: '#059669' }}>{p.price} DT</p>
                    <button type="button" onClick={() => addToCart(p)} style={btnPrimary}>
                      <ShoppingCart size={14} /> Ajouter
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {data.petRankings?.length > 0 && (
            <div style={card}>
              <h3 style={{ margin: '0 0 12px' }}>Classement XGBoost par animal</h3>
              {data.petRankings.map((block) => (
                <div key={block.pet.id} style={{ marginBottom: 16 }}>
                  <p style={{ margin: '0 0 6px', fontWeight: 700 }}>
                    {block.pet.name} ({SPECIES_MAP[block.pet.type]?.label || block.pet.type})
                  </p>
                  <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: '#5b21b6' }}>
                    {block.items.slice(0, 5).map((r) => (
                      <li key={r.productId}>
                        {r.productName} — score {((r.score ?? 0) * 100).toFixed(0)}%
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}

          {data.adoptionCatalog?.length > 0 && (
            <div style={card}>
              <h3 style={{ margin: '0 0 10px' }}>🐾 Adoption (catalogue IA)</h3>
              <ul style={{ margin: 0, paddingLeft: 18, fontSize: 14 }}>
                {data.adoptionCatalog.map((a) => (
                  <li key={a.id}>
                    {a.name} — {SPECIES_MAP[a.animalType]?.label || a.animalType} · {a.price} DT
                  </li>
                ))}
              </ul>
              <Link to="/client-products?category=animaux" style={{ ...btnOutline, display: 'inline-block', marginTop: 12 }}>
                Voir les animaux
              </Link>
            </div>
          )}

          {data.trendingProducts?.length > 0 && (
            <div style={card}>
              <h3 style={{ margin: '0 0 8px' }}>Tendances demande (plateforme)</h3>
              <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13 }}>
                {data.trendingProducts.map((t) => (
                  <li key={t.productId}>{t.productName}</li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
};

const card = {
  background: 'white',
  borderRadius: 16,
  padding: 20,
  marginBottom: 20,
  border: '1px solid #e5e7eb',
};

const productCard = {
  padding: 12,
  borderRadius: 12,
  border: '1px solid #e5e7eb',
  background: '#fafafa',
};

const btnPrimary = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  padding: '8px 14px',
  background: '#059669',
  color: 'white',
  border: 'none',
  borderRadius: 10,
  fontWeight: 700,
  cursor: 'pointer',
  fontSize: 13,
};

const btnOutline = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  padding: '8px 14px',
  background: 'white',
  color: '#334155',
  border: '1px solid #e5e7eb',
  borderRadius: 10,
  fontWeight: 600,
  cursor: 'pointer',
  fontSize: 13,
};

const chipLink = {
  padding: '10px 14px',
  borderRadius: 12,
  background: '#f0fdf4',
  color: '#047857',
  fontWeight: 600,
  fontSize: 13,
  textDecoration: 'none',
  border: '1px solid #bbf7d0',
};

export default ClientMlAgentPage;
