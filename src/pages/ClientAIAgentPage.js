import React, { useEffect, useState, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, TrendingUp, TrendingDown, Minus, Star, ShoppingCart, Brain, Send, MessageCircle } from 'lucide-react';
import api from '../utils/api';
import PetProductRecommendations from '../components/PetProductRecommendations';
import { buildProductAiContext } from '../utils/productCatalog';

const QUICK_PROMPTS = [
  'Quelles croquettes pour mon chat adulte ?',
  'Différence croquettes vs pâtée ?',
  'Produit en promotion pour chien ?',
  'Comment choisir la bonne portion ?',
  'Comparer les produits chat disponibles',
];

const CatalogChatPanel = ({ catalog }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [productCtx, setProductCtx] = useState(null);
  const endRef = useRef(null);
  const booted = useRef(false);

  const send = useCallback(async (text, extraContext) => {
    const msg = String(text || '').trim();
    if (!msg) return;
    setMessages((prev) => [...prev, { role: 'user', content: msg }]);
    setInput('');
    setLoading(true);
    try {
      const context = extraContext || (productCtx ? buildProductAiContext(productCtx, catalog) : {
        type: 'catalog_question',
        catalogSample: catalog.slice(0, 15).map((p) => ({
          name: p.name,
          category: p.category,
          animalType: p.animalType,
          price: p.price,
          description: p.description?.slice?.(0, 80),
        })),
      });
      const res = await api.post('/chat/message', { message: msg, context });
      const data = res.data || {};
      setMessages((prev) => [...prev, {
        role: 'assistant',
        content: data.message || data.content || 'Je n\'ai pas pu répondre.',
        products: data.products || [],
        quickReplies: data.quickReplies || [],
      }]);
    } catch {
      setMessages((prev) => [...prev, {
        role: 'assistant',
        content: 'Service IA momentanément indisponible. Consultez le catalogue ou réessayez.',
        products: [],
      }]);
    } finally {
      setLoading(false);
    }
  }, [catalog, productCtx]);

  useEffect(() => {
    if (booted.current) return;
    booted.current = true;
    let ctx = null;
    let question = null;
    try {
      ctx = JSON.parse(sessionStorage.getItem('ai:productContext') || 'null');
      question = sessionStorage.getItem('ai:initialQuestion');
      sessionStorage.removeItem('ai:productContext');
      sessionStorage.removeItem('ai:initialQuestion');
    } catch { /* ignore */ }

    if (ctx?.product) {
      setProductCtx(ctx.product);
      setMessages([{
        role: 'assistant',
        content: `Bonjour ! Vous consultez ${ctx.product.name} (${ctx.product.category || 'produit'}, ${ctx.product.animalType || 'animal'}). Posez-moi vos questions sur les croquettes, la composition, les portions ou des alternatives du catalogue.`,
        quickReplies: ['Composition et avantages', 'Pour quel animal ?', 'Alternative moins chère'],
      }]);
      if (question) send(question, ctx);
    } else {
      setMessages([{
        role: 'assistant',
        content: 'Bonjour ! Je suis votre expert produits PetfoodTN. Demandez-moi des conseils sur les croquettes, la pâtée, les friandises ou un produit précis du catalogue.',
        quickReplies: QUICK_PROMPTS.slice(0, 3),
      }]);
    }
  }, [send]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} style={chatPanelStyle}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <MessageCircle size={22} color="#e67e22" />
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>Posez vos questions — croquettes & catalogue</h2>
      </div>
      {productCtx && (
        <div style={{ padding: '10px 14px', background: '#fff7ed', borderRadius: 12, marginBottom: 12, fontSize: 13, color: '#9a3412', fontWeight: 600 }}>
          Produit sélectionné : {productCtx.name}
        </div>
      )}
      <div style={chatBoxStyle}>
        {messages.map((m, i) => (
          <div key={i} style={{ ...bubbleStyle, ...(m.role === 'user' ? userBubble : assistantBubble) }}>
            <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.55, fontSize: 14 }}>{m.content}</div>
            {m.products?.length > 0 && (
              <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
                {m.products.slice(0, 4).map((p) => (
                  <div key={p._id || p.id || p.name} style={{ padding: 8, background: 'rgba(255,255,255,0.6)', borderRadius: 8, fontSize: 12 }}>
                    <strong>{p.name}</strong> — {Number(p.price || 0).toFixed(2)} DT
                  </div>
                ))}
              </div>
            )}
            {m.quickReplies?.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
                {m.quickReplies.map((q) => (
                  <button key={q} type="button" onClick={() => send(q)} style={chipBtn}>{q}</button>
                ))}
              </div>
            )}
          </div>
        ))}
        {loading && <div style={{ ...bubbleStyle, ...assistantBubble, opacity: 0.7 }}>Réflexion…</div>}
        <div ref={endRef} />
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
        {QUICK_PROMPTS.map((q) => (
          <button key={q} type="button" onClick={() => send(q)} style={chipBtnOutline}>{q}</button>
        ))}
      </div>
      <form
        onSubmit={(e) => { e.preventDefault(); send(input); }}
        style={{ display: 'flex', gap: 8 }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ex : quelle croquette pour chat stérilisé 4 kg ?"
          style={chatInputStyle}
          disabled={loading}
        />
        <button type="submit" disabled={loading || !input.trim()} style={sendBtnStyle}>
          <Send size={18} />
        </button>
      </form>
    </motion.div>
  );
};

const trendIcon = (direction) => {
  if (direction === 'up') return <TrendingUp size={18} color="#16a34a" />;
  if (direction === 'down') return <TrendingDown size={18} color="#dc2626" />;
  return <Minus size={18} color="#6b7280" />;
};

const ClientAIAgentPage = () => {
  const [loading, setLoading] = useState(true);
  const [insights, setInsights] = useState(null);
  const [recoPack, setRecoPack] = useState(null);
  const [catalog, setCatalog] = useState([]);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [insRes, recoRes, prodRes] = await Promise.all([
        api.get('/ai/insights'),
        api.get('/ai/recommendations?limit=8'),
        api.get('/products').catch(() => ({ data: [] })),
      ]);
      setInsights(insRes.data);
      setRecoPack(recoRes.data);
      setCatalog(prodRes.data || []);
    } catch (err) {
      console.error(err);
      setError('Impossible de charger l\'agent IA. Vérifiez que le serveur backend tourne.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const addToCart = (product) => {
    window.dispatchEvent(new CustomEvent('addToCart', { detail: product }));
  };

  if (loading) {
    return (
      <div style={{ padding: '48px', textAlign: 'center', color: '#6b7280' }}>
        <Brain size={40} style={{ marginBottom: '16px', opacity: 0.5 }} />
        Analyse de vos achats et avis en cours…
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '32px', maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
        <p style={{ color: '#b45309' }}>{error}</p>
        <button type="button" onClick={load} style={retryBtnStyle}>Réessayer</button>
      </div>
    );
  }

  const purchase = insights?.insights?.purchase || recoPack?.insights?.purchase;
  const reviews = insights?.insights?.reviews || recoPack?.reviewExperience;
  const trends = recoPack?.trends;
  const prefs = recoPack?.preferences;

  return (
    <div style={{ padding: '24px', maxWidth: '1100px', margin: '0 auto' }}>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} style={heroStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <Sparkles size={28} color="#e67e22" />
          <h1 style={{ margin: 0, fontSize: '32px', fontWeight: 800 }}>Agent IA PetfoodTN</h1>
        </div>
        <p style={{ color: '#6b7280', margin: 0 }}>
          Posez des questions sur les croquettes et produits, consultez tendances d&apos;achat et recommandations personnalisées.
          {(recoPack?.aiPowered || insights?.aiPowered) && (
            <span style={aiBadgeStyle}> · Synthèse Groq</span>
          )}
        </p>
      </motion.div>

      <CatalogChatPanel catalog={catalog} />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        style={summaryCardStyle}
      >
        <h2 style={sectionH2}>Analyse personnalisée</h2>
        <p style={{ whiteSpace: 'pre-wrap', lineHeight: 1.65, color: '#374151', margin: 0 }}>
          {recoPack?.summary || insights?.summary}
        </p>
      </motion.div>

      <div style={gridStyle}>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={statCardStyle}>
          <h3 style={statTitle}>Achats</h3>
          <p style={statValue}>{purchase?.orderCount ?? 0} commandes</p>
          <p style={statSub}>{purchase?.totalSpent ?? 0} DT au total</p>
          {trends?.direction && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px', fontSize: '13px' }}>
              {trendIcon(trends.direction)}
              Tendance {trends.direction === 'up' ? 'à la hausse' : trends.direction === 'down' ? 'en baisse' : 'stable'}
            </div>
          )}
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={statCardStyle}>
          <h3 style={statTitle}>Expérience avis</h3>
          <p style={statValue}>
            <Star size={16} style={{ verticalAlign: 'middle' }} />{' '}
            {reviews?.avgRating != null ? `${reviews.avgRating}/5` : '—'}
          </p>
          <p style={statSub}>{reviews?.count ?? 0} avis · {recoPack?.trends?.satisfaction || '—'}</p>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={statCardStyle}>
          <h3 style={statTitle}>Préférences</h3>
          <p style={statSub}>
            {(prefs?.declared || []).join(', ') || 'Non renseignées'}
          </p>
          {prefs?.inferredFromPurchases?.length > 0 && (
            <p style={{ ...statSub, marginTop: '8px' }}>
              Acheté souvent : {prefs.inferredFromPurchases.slice(0, 3).join(', ')}
            </p>
          )}
        </motion.div>
      </div>

      {purchase?.spendTrend?.length > 0 && (
        <div style={sectionCardStyle}>
          <h2 style={sectionH2}>Évolution des dépenses (6 derniers mois)</h2>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end', height: '120px' }}>
            {purchase.spendTrend.map((m) => {
              const max = Math.max(...purchase.spendTrend.map((x) => x.amount), 1);
              const h = Math.max(8, (m.amount / max) * 100);
              return (
                <div key={m.month} style={{ flex: 1, textAlign: 'center' }}>
                  <div
                    style={{
                      height: `${h}%`,
                      background: 'linear-gradient(180deg, #e67e22, #d35400)',
                      borderRadius: '6px 6px 0 0',
                      minHeight: '8px',
                    }}
                    title={`${m.amount} DT`}
                  />
                  <small style={{ fontSize: '10px', color: '#6b7280' }}>{m.month.slice(5)}</small>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {recoPack?.recommendations?.length > 0 && (
        <div style={sectionCardStyle}>
          <h2 style={sectionH2}>Produits recommandés par l&apos;agent</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
            {recoPack.recommendations.map((p) => (
              <article key={p.id || p._id} style={productCardStyle}>
                <strong style={{ display: 'block', marginBottom: '6px' }}>{p.name}</strong>
                <p style={{ fontSize: '12px', color: '#059669', margin: '0 0 8px' }}>
                  {p.recommendedReason}
                </p>
                <p style={{ fontWeight: 700, color: '#e67e22', margin: '0 0 12px' }}>
                  {Number(p.price || 0).toFixed(2)} DT
                </p>
                <button type="button" style={cartBtnStyle} onClick={() => addToCart(p)}>
                  <ShoppingCart size={14} /> Panier
                </button>
              </article>
            ))}
          </div>
        </div>
      )}

      <div style={{ marginTop: '32px' }}>
        <h2 style={{ ...sectionH2, marginBottom: '16px' }}>Recommandations par animal (moteur profil)</h2>
        <PetProductRecommendations limit={6} showPetSelector linkToShop />
      </div>

      <div style={{ marginTop: '24px', textAlign: 'center' }}>
        <button type="button" onClick={load} style={retryBtnStyle}>
          Actualiser l&apos;analyse
        </button>
      </div>
    </div>
  );
};

const heroStyle = {
  background: 'linear-gradient(135deg, #fff7ed 0%, #ffffff 100%)',
  borderRadius: '20px',
  padding: '28px',
  marginBottom: '24px',
  boxShadow: '0 10px 28px rgba(0,0,0,0.06)',
};

const summaryCardStyle = {
  background: 'white',
  borderRadius: '18px',
  padding: '24px',
  marginBottom: '24px',
  border: '2px solid rgba(230,126,34,0.15)',
  boxShadow: '0 4px 20px rgba(230,126,34,0.08)',
};

const sectionCardStyle = {
  background: 'white',
  borderRadius: '18px',
  padding: '24px',
  marginBottom: '24px',
  boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
};

const gridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
  gap: '16px',
  marginBottom: '24px',
};

const statCardStyle = {
  background: 'white',
  borderRadius: '16px',
  padding: '20px',
  boxShadow: '0 4px 16px rgba(0,0,0,0.05)',
};

const statTitle = { margin: '0 0 8px', fontSize: '13px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' };
const statValue = { margin: 0, fontSize: '22px', fontWeight: 800, color: '#111827' };
const statSub = { margin: '6px 0 0', fontSize: '13px', color: '#6b7280' };
const sectionH2 = { margin: '0 0 16px', fontSize: '18px', fontWeight: 700, color: '#111827' };
const aiBadgeStyle = { color: '#7c3aed', fontWeight: 600 };

const productCardStyle = {
  border: '1px solid #e5e7eb',
  borderRadius: '14px',
  padding: '16px',
  background: '#fafafa',
};

const cartBtnStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  padding: '8px 14px',
  background: '#16a34a',
  color: 'white',
  border: 'none',
  borderRadius: '10px',
  fontWeight: 600,
  cursor: 'pointer',
  fontSize: '13px',
};

const retryBtnStyle = {
  marginTop: '12px',
  padding: '12px 24px',
  background: '#e67e22',
  color: 'white',
  border: 'none',
  borderRadius: '12px',
  fontWeight: 700,
  cursor: 'pointer',
};

const chatPanelStyle = {
  background: 'white',
  borderRadius: 20,
  padding: 24,
  marginBottom: 24,
  border: '2px solid rgba(230,126,34,0.2)',
  boxShadow: '0 8px 28px rgba(230,126,34,0.1)',
};

const chatBoxStyle = {
  maxHeight: 340,
  overflowY: 'auto',
  marginBottom: 12,
  padding: '4px 0',
};

const bubbleStyle = {
  padding: '12px 14px',
  borderRadius: 14,
  marginBottom: 10,
  maxWidth: '92%',
};

const userBubble = {
  marginLeft: 'auto',
  background: 'linear-gradient(135deg, #e67e22, #d35400)',
  color: 'white',
};

const assistantBubble = {
  background: '#f8fafc',
  color: '#1e293b',
  border: '1px solid #e2e8f0',
};

const chipBtn = {
  padding: '6px 10px',
  borderRadius: 20,
  border: 'none',
  background: '#fff7ed',
  color: '#c2410c',
  fontSize: 11,
  fontWeight: 700,
  cursor: 'pointer',
};

const chipBtnOutline = {
  padding: '6px 10px',
  borderRadius: 20,
  border: '1px solid #fed7aa',
  background: 'white',
  color: '#9a3412',
  fontSize: 11,
  fontWeight: 600,
  cursor: 'pointer',
};

const chatInputStyle = {
  flex: 1,
  padding: '12px 14px',
  borderRadius: 12,
  border: '2px solid #e5e7eb',
  fontSize: 14,
  outline: 'none',
};

const sendBtnStyle = {
  padding: '12px 16px',
  background: '#e67e22',
  color: 'white',
  border: 'none',
  borderRadius: 12,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
};

export default ClientAIAgentPage;
