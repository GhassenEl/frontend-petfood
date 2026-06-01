import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, ShoppingCart, MessageSquarePlus } from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import useSocket from '../hooks/useSocket';
import { useNavigate } from 'react-router-dom';
import { getEffectiveDiscount, isOnPromotion } from '../utils/productDetails';

const PET_GREETING_LABELS = { dog: 'chien', cat: 'chat', bird: 'oiseau', fish: 'poisson', other: 'animal' };

async function buildClientPersonalizedGreeting() {
  try {
    const [profileRes, productsRes] = await Promise.all([
      api.get('/users/profile'),
      api.get('/products'),
    ]);
    const profile = profileRes.data;
    const promos = (productsRes.data || []).filter(isOnPromotion);
    const petLabel = PET_GREETING_LABELS[profile?.petType] || null;
    const prefs = Array.isArray(profile?.preferences)
      ? profile.preferences
      : typeof profile?.preferences === 'string'
        ? (() => { try { return JSON.parse(profile.preferences); } catch { return []; } })()
        : [];

    const firstName = profile?.name?.split(' ')[0];
    let content = firstName ? `Bonjour ${firstName} ! ` : 'Bonjour ! ';
    content += 'Je suis l\'assistant PetfoodTN. ';

    if (petLabel && profile?.petAge != null && prefs.length) {
      content += `Votre profil est enregistré (${petLabel}, ${profile.petAge} an(s)). `;
      content += 'Je peux vous conseiller sur les produits, les promotions, vos commandes et le paiement.';
    } else {
      content += 'Je peux vous aider sur les produits, les codes promo, le suivi de commande et le paiement.';
    }

    if (promos.length) {
      content += ` ${promos.length} promotion${promos.length > 1 ? 's' : ''} est disponible${promos.length > 1 ? 's' : ''} en ce moment.`;
    }

    return {
      role: 'assistant',
      content,
      quickReplies: ['Recommandations', 'Voir les promotions', 'Codes promo', 'Mes commandes', 'Guide paiement'],
      products: [],
    };
  } catch {
    return null;
  }
}

const VARIANT_CONFIG = {
  client: {
    title: 'Assistant PetfoodTN',
    makeGreeting: () => ({
      role: 'assistant',
      content:
        'Bonjour ! Je suis l\'assistant PetfoodTN. Je peux vous orienter sur les produits, les codes promo, vos commandes et le paiement. Comment puis-je vous aider ?',
      quickReplies: ['Recommandations', 'Codes promo', 'Mes commandes', 'Guide paiement'],
      products: [],
    }),
  },
  admin: {
    title: 'Assistant Administration',
    makeGreeting: () => ({
      role: 'assistant',
      content:
        'Bonjour. Assistant administration PetfoodTN : commandes, produits, avis, réclamations, factures ou utilisateurs. Que recherchez-vous ?',
      quickReplies: ['Commandes', 'Produits', 'Avis', 'Réclamations', 'Dashboard'],
      products: [],
    }),
  },
  livreur: {
    title: 'Assistant Livreur',
    makeGreeting: () => ({
      role: 'assistant',
      content:
        'Bonjour. Assistant livreur PetfoodTN : commandes, carte, messages et gains. Que souhaitez-vous consulter ?',
      quickReplies: ['Commandes', 'Carte', 'Messages', 'Gains', 'Tableau de bord'],
      products: [],
    }),
  },
  vet: {
    title: 'Assistant Clinique',
    makeGreeting: () => ({
      role: 'assistant',
      content:
        'Bonjour Docteur. Assistant clinique PetfoodTN : analyse, pistes diagnostiques et recommandations. Mes suggestions ne remplacent pas votre jugement clinique. Comment puis-je vous aider ?',
      quickReplies: ['Analyse symptômes', 'Protocole vaccin', 'Posologie', 'Urgence'],
      products: [],
    }),
  },
};

const AVATAR_CONFIG = {
  client: { emoji: '🤖', gradient: 'linear-gradient(135deg, #10b981, #059669)' },
  admin: { emoji: '⚙️', gradient: 'linear-gradient(135deg, #6366f1, #4f46e5)' },
  livreur: { emoji: '🚚', gradient: 'linear-gradient(135deg, #f59e0b, #d97706)' },
  vet: { emoji: '🩺', gradient: 'linear-gradient(135deg, #0ea5e9, #0284c7)' },
};

const AssistantAvatar = ({ variant = 'client', size = 40 }) => {
  const cfg = AVATAR_CONFIG[variant] || AVATAR_CONFIG.client;
  return (
    <div
      aria-hidden
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: cfg.gradient,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: Math.round(size * 0.45),
        flexShrink: 0,
        boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
      }}
    >
      {cfg.emoji}
    </div>
  );
};

const mapHistoryRow = (m) => ({
  role: m.role,
  content: m.content,
  products: m.products || [],
  quickReplies: m.quickReplies || [],
  shouldShowVetCTA: !!m.shouldShowVetCTA,
});

/**
 * @param {{ variant?: 'client' | 'admin' | 'livreur' | 'vet', title?: string }} props
 */
const ChatAssistant = ({ variant = 'client', title: titleOverride }) => {
  const cfg = VARIANT_CONFIG[variant] || VARIANT_CONFIG.client;
  const displayTitle = titleOverride || cfg.title;
  const { user } = useAuth();

  const makeGreetingMessage = useMemo(() => {
    const g = cfg.makeGreeting();
    return {
      ...g,
      quickReplies: [...(g.quickReplies || [])],
      products: g.products || [],
    };
  }, [cfg]);

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isBackendOnline, setIsBackendOnline] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const socket = useSocket(user ? `user-${user.id || user._id}` : 'global');
  const navigate = useNavigate();

  const shouldShowVetCTA = (text) => {
    const t = String(text || '').toLowerCase();
    return (
      t.includes('vétérinaire') ||
      t.includes('veterinaire') ||
      t.includes('validation') ||
      t.includes('contacter') ||
      t.includes('contact')
    );
  };

  // Prevent duplicate assistant bubbles when an assistant reply is received both via HTTP response
  // and via Socket.IO broadcast.
  const lastHttpAssistantContentRef = useRef('');
  const lastHttpAssistantAtRef = useRef(0);




  useEffect(() => {
    if (!isOpen) return;
    if (messages.length > 0) return;

    let cancelled = false;
    setHistoryLoading(true);

    (async () => {
      try {
        const { data } = await api.get('/chat/history');
        if (cancelled) return;
        if (Array.isArray(data) && data.length > 0) {
          setMessages(data.map(mapHistoryRow));
          return;
        }
      } catch {
        /* historique indisponible */
      } finally {
        if (!cancelled) setHistoryLoading(false);
      }

      if (!cancelled) {
        if (variant === 'client') {
          const personalized = await buildClientPersonalizedGreeting();
          if (!cancelled && personalized) {
            setMessages([personalized]);
            return;
          }
        }
        setMessages([makeGreetingMessage]);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isOpen, messages.length, makeGreetingMessage, variant]);

  useEffect(() => {
    const open = () => setIsOpen(true);
    window.addEventListener('petfood:open-chat', open);
    return () => window.removeEventListener('petfood:open-chat', open);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!socket) return;
    const handler = (payload) => {
      if (!payload) return;
      const incomingContent = payload.content || payload.message || '';

      // If we just received the same assistant content via the HTTP request, ignore the socket broadcast.
      const now = Date.now();
      if (
        incomingContent &&
        incomingContent === lastHttpAssistantContentRef.current &&
        now - lastHttpAssistantAtRef.current < 2000
      ) {
        return;
      }


      const incoming = { role: 'assistant', content: incomingContent };
      setMessages((prev) => [...prev, incoming]);
    };

    socket.on('chat:message', handler);
    return () => {
      socket.off('chat:message', handler);
    };
  }, [socket]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const sendMessage = async (text, context) => {
    if (!text.trim()) return;

    const userMsg = { role: 'user', content: text.trim(), products: [], quickReplies: [] };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const chatEndpoint = variant === 'vet' ? '/vet/ai/chat' : '/chat/message';
      const res = await api.post(chatEndpoint, {
        message: text.trim(),
        context: context || undefined,
      });

      const data = res.data || {};
      const assistantText = data.message ?? data.content ?? '';
      // Mark the last HTTP assistant reply to ignore the matching socket broadcast.
      lastHttpAssistantContentRef.current = String(assistantText || '');
      lastHttpAssistantAtRef.current = Date.now();

      const assistantMsg = {
        role: 'assistant',
        content: String(assistantText),
        products: data.products || [],
        quickReplies: data.quickReplies || [],
      };
      if (data.promoCode) {
        try {
          sessionStorage.setItem('petfood_promo_hint', data.promoCode);
        } catch { /* ignore */ }
      }
      setMessages((prev) => [...prev, assistantMsg]);
      setIsBackendOnline(true);
      // Socket emit removed: backend HTTP endpoint already returns the assistant reply,
      // and the backend socket handler broadcasts the same message to the room,
      // causing duplicate assistant bubbles on the sender.
    } catch (err) {
      const isOffline = err?.isBackendOffline || !err?.response;
      const isNotFound = err?.isNotFound || err?.response?.status === 404;
      setIsBackendOnline(false);

      let errorContent =
        'Désolé, une erreur est survenue. 🙅‍♂️ Réessayez dans un instant.';
      let errorReplies = ['Réessayer'];

      if (isOffline) {
        errorContent =
          '⚠️ Le serveur semble inaccessible.\n\nVérifiez que le backend est démarré :\n`cd backend && npm start`\n\nPuis réessayez.';
        errorReplies = ['🔄 Réessayer', '❓ Aide'];
      } else if (isNotFound) {
        errorContent =
          "⚠️ La route API n'a pas été trouvée (404).\n\nLe backend est peut-être mal configuré ou redémarre.";
        errorReplies = ['🔄 Réessayer'];
      }

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: errorContent,
          quickReplies: errorReplies,
          products: [],
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickReply = (reply) => {
    const cleanReply = reply.replace(/^\p{Extended_Pictographic}\s*/u, '').trim() || reply;

    if (cleanReply === 'Aller sur Événements') {
      navigate('/events');
      return;
    }

    if (cleanReply === 'Agent IA complet') {
      setIsOpen(false);
      navigate('/client-ai');
      return;
    }

    if (cleanReply === 'Mes commandes') {
      setIsOpen(false);
      navigate('/client-orders');
      return;
    }

    const livreurNav = {
      Commandes: '/livreur/orders',
      Carte: '/livreur/map',
      Messages: '/livreur/messages',
      Gains: '/livreur/earnings',
      'Tableau de bord': '/livreur/dashboard',
    };
    if (variant === 'livreur' && livreurNav[cleanReply]) {
      setIsOpen(false);
      navigate(livreurNav[cleanReply]);
      return;
    }

    const adminNav = {
      Commandes: '/admin/orders',
      Produits: '/admin/products',
      Avis: '/admin/reviews',
      Réclamations: '/admin/complaints',
      Dashboard: '/admin/dashboard',
    };
    if (variant === 'admin' && adminNav[cleanReply]) {
      setIsOpen(false);
      navigate(adminNav[cleanReply]);
      return;
    }

    if (cleanReply === 'Guide paiement') {
      sendMessage('Guide paiement');
      return;
    }

    if (cleanReply === 'Codes promo disponibles' || cleanReply === 'Codes promo') {
      sendMessage('Codes promo disponibles');
      return;
    }

    if (cleanReply === 'Recommandations' || cleanReply === 'Voir les promotions') {
      sendMessage(cleanReply === 'Voir les promotions' ? 'Voir les promotions' : 'Recommandations pour mon animal');
      return;
    }

    // Auto-workflow triggers
    if (cleanReply === 'Lancer automatiquement') {

      // 1) Aller chercher les produits remisés côté serveur
      // 2) Les mettre au panier via event addToCart
      // 3) Ouvrir le checkout (puis créer commande via la page)
      (async () => {
        try {
          const res = await api.get('/products');
          const discounted = (res.data || []).filter((p) => getEffectiveDiscount(p) > 0 || p.isOnSale);
          discounted.slice(0, 4).forEach(addToCart);
          navigate('/checkout');
        } catch (e) {
          setMessages((prev) => [
            ...prev,
            { role: 'assistant', content: 'Impossible de récupérer les produits avec remise pour l\'instant.', quickReplies: [], products: [] },
          ]);
        }
      })();
      return;
    }

    if (cleanReply === 'Passer commande') {
      try {
        const hint = sessionStorage.getItem('petfood_promo_hint');
        if (hint) sessionStorage.setItem('petfood_checkout_promo', hint);
      } catch { /* ignore */ }
      setIsOpen(false);
      navigate('/checkout');
      return;
    }

    if (cleanReply === 'Payer mes factures') {
      // Auto-paiement: payer toutes les factures non payées
      (async () => {
        try {
          const res = await api.get('/invoices');
          const pending = (res.data || []).filter(inv => inv.status !== 'paid');
          if (pending.length === 0) {
            setMessages((prev) => [
              ...prev,
              { role: 'assistant', content: 'Toutes vos factures sont déjà payées ✅', quickReplies: [], products: [] },
            ]);
            return;
          }

          for (const inv of pending) {
            // paymentMethod par défaut : cash
            await api.post(`/invoices/${inv._id}/pay`, { paymentMethod: inv.paymentMethod || 'cash' });
          }

          setMessages((prev) => [
            ...prev,
            { role: 'assistant', content: `Paiement terminé: ${pending.length} facture(s) payée(s) ✅`, quickReplies: [], products: [] },
          ]);
        } catch (e) {
          setMessages((prev) => [
            ...prev,
            { role: 'assistant', content: 'Erreur lors du paiement automatique des factures. Essayez depuis la page Factures.', quickReplies: ['Payer mes factures'], products: [] },
          ]);
        }
      })();
      return;
    }

    sendMessage(cleanReply);
  };

  const startNewConversation = async () => {
    try {
      await api.delete('/chat/history');
    } catch {
      /* ignore */
    }
    setMessages([makeGreetingMessage]);
    setIsBackendOnline(true);
  };

  const getDiscountedPriceValue = (product) => {
    const price = Number(product.price || 0);
    const discount = Number(product.discount || 0);
    return Number((price * (1 - discount / 100)).toFixed(2));
  };

  const getCartProduct = (product) => ({
    ...product,
    originalPrice: Number(product.price || 0),
    price: getDiscountedPriceValue(product),
  });

  const addToCart = (product) => {
    window.dispatchEvent(new CustomEvent('addToCart', { detail: getCartProduct(product) }));
  };

  const formatPrice = (price, discount) => {
    if (!discount || discount <= 0) return price + ' DT';
    const discounted = Number(price || 0) * (1 - Number(discount || 0) / 100);
    return (
      <span>
        <span
          style={{
            textDecoration: 'line-through',
            color: '#9ca3af',
            fontSize: '12px',
            marginRight: '6px',
          }}
        >
          {price} DT
        </span>
        <span style={{ color: '#e74c3c', fontWeight: 700 }}>{discounted.toFixed(2)} DT</span>
      </span>
    );
  };

  return (
    <>
      <motion.button
        type="button"
        className="platform-chat-fab"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        style={styles.fab}
        aria-label={isOpen ? "Fermer l'assistant" : `Ouvrir ${displayTitle}`}
        aria-expanded={isOpen}
        aria-controls="petfood-chat-panel"
      >
        {isOpen ? <X size={24} color="white" /> : <MessageCircle size={24} color="white" />}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="petfood-chat-panel"
            className="platform-chat-panel"
            role="dialog"
            aria-modal="true"
            aria-label={displayTitle}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            style={styles.chatPanel}
          >
            <div style={styles.header}>
              <div style={styles.headerLeft}>
                <div style={styles.headerIcon}>
                  <AssistantAvatar variant={variant} size={40} />
                </div>
                <div>
                  <div style={styles.headerTitle}>{displayTitle}</div>
                  <div
                    style={{
                      ...styles.headerSubtitle,
                      color: isBackendOnline ? '#059669' : '#dc2626',
                    }}
                  >
                    {historyLoading
                      ? 'Chargement…'
                      : loading
                        ? "En train d'écrire..."
                        : isBackendOnline
                          ? 'En ligne'
                          : 'Hors ligne'}
                  </div>
                </div>
              </div>
              <div style={styles.headerActions}>
                <button
                  type="button"
                  onClick={startNewConversation}
                  style={styles.iconActionBtn}
                  title="Nouvelle conversation"
                  aria-label="Nouvelle conversation"
                >
                  <MessageSquarePlus size={18} color="#666" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  style={styles.closeBtn}
                  aria-label="Fermer"
                >
                  <X size={18} color="#666" />
                </button>
              </div>
            </div>

            <div style={styles.messagesContainer}>
              {historyLoading && messages.length === 0 && (
                <div style={styles.historyLoadingBanner} role="status">
                  Chargement de la conversation…
                </div>
              )}
              {messages.map((msg, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    ...styles.messageBubble,
                    alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                    background: msg.role === 'user' ? 'linear-gradient(135deg, #e67e22, #d35400)' : '#f8f9fa',
                    color: msg.role === 'user' ? 'white' : '#374151',
                    borderBottomRightRadius: msg.role === 'user' ? '4px' : '18px',
                    borderBottomLeftRadius: msg.role === 'assistant' ? '4px' : '18px',
                  }}
                >
                  <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.5, fontSize: '14px' }}>{msg.content}</div>

                  {msg.products && msg.products.length > 0 && (
                    <div style={styles.productsGrid}>
                      {msg.products
                        .filter((product) => (product.stock ?? 0) > 0)
                        .map((product, pidx) => (
                          <motion.div key={pidx} whileHover={{ scale: 1.03 }} style={styles.productCard}>
                            <div style={styles.productIcon}>{product.icon || '📦'}</div>
                            <div style={styles.productInfo}>
                              <div style={styles.productName}>{product.name}</div>
                              <div style={styles.productReason}>{product.reason}</div>
                              <div style={styles.productPrice}>{formatPrice(product.price, product.discount)}</div>
                            </div>
                            {variant === 'client' && (
                              <button
                                type="button"
                                onClick={() => addToCart(product)}
                                style={styles.addToCartBtn}
                                title="Ajouter au panier"
                              >
                                <ShoppingCart size={14} color="white" />
                              </button>
                            )}
                          </motion.div>
                        ))}
                    </div>
                  )}

                  {msg.quickReplies && msg.quickReplies.length > 0 && msg.role === 'assistant' && (
                    <div style={styles.quickReplies}>
                      {msg.quickReplies.map((qr, qidx) => (
                        <button key={qidx} onClick={() => handleQuickReply(qr)} style={styles.quickReplyBtn}>
                          {qr}
                        </button>
                      ))}
                    </div>
                  )}

                  {(msg.role === 'assistant' && (msg.shouldShowVetCTA || shouldShowVetCTA(msg.content))) && (
                    <div style={styles.vetCtaWrap}>
                      <button
                        type="button"
                        onClick={() => {
                          setIsOpen(false);
                          navigate('/veterinary');
                        }}
                        style={styles.vetCtaBtn}
                      >
                        Contacter vétérinaire
                      </button>
                    </div>
                  )}

                </motion.div>
              ))}

              {loading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={styles.typingIndicator}>
                  <span style={styles.dot}></span>
                  <span style={styles.dot}></span>
                  <span style={styles.dot}></span>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            <div style={styles.inputArea}>
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage(input)}
                placeholder="Écrivez un message..."
                style={styles.input}
              />
              <button
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || loading}
                style={{
                  ...styles.sendBtn,
                  opacity: input.trim() && !loading ? 1 : 0.5,
                }}
              >
                <Send size={18} color="white" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

const styles = {
  fab: {
    position: 'fixed',
    bottom: '24px',
    right: '24px',
    width: '56px',
    height: '56px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #e67e22, #d35400)',
    border: 'none',
    boxShadow: '0 8px 24px rgba(230, 126, 34, 0.4)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1400,
    transition: 'all 0.3s ease',
  },
  chatPanel: {
    position: 'fixed',
    bottom: '90px',
    right: '24px',
    width: '380px',
    maxWidth: 'calc(100vw - 48px)',
    height: '520px',
    maxHeight: 'calc(100vh - 120px)',
    background: 'white',
    borderRadius: '20px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    zIndex: 1400,
  },
  header: {
    padding: '16px 20px',
    background: 'linear-gradient(135deg, #fff8f0, #fef3e2)',
    borderBottom: '1px solid rgba(230,126,34,0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '8px',
  },
  headerActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  iconActionBtn: {
    background: 'rgba(0,0,0,0.05)',
    border: 'none',
    borderRadius: '10px',
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  headerIcon: {
    width: '36px',
    height: '36px',
    borderRadius: '12px',
    background: 'linear-gradient(135deg, #e67e22, #d35400)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 12px rgba(230,126,34,0.25)',
  },
  assistantAvatar: {
    width: '36px',
    height: '36px',
    borderRadius: '12px',
    objectFit: 'cover',
  },
  headerTitle: {
    fontSize: '15px',
    fontWeight: 700,
    color: '#1f2937',
  },
  headerSubtitle: {
    fontSize: '12px',
    color: '#059669',
    fontWeight: 600,
  },
  closeBtn: {
    background: 'rgba(0,0,0,0.05)',
    border: 'none',
    borderRadius: '10px',
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  messagesContainer: {
    flex: 1,
    overflowY: 'auto',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    background: '#fafbfc',
  },
  historyLoadingBanner: {
    alignSelf: 'center',
    fontSize: '13px',
    color: '#6b7280',
    padding: '12px 16px',
    background: '#f3f4f6',
    borderRadius: '12px',
  },
  messageBubble: {
    maxWidth: '85%',
    padding: '12px 16px',
    borderRadius: '18px',
    fontSize: '14px',
    lineHeight: 1.5,
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  },
  productsGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginTop: '12px',
  },
  productCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    background: 'white',
    borderRadius: '12px',
    padding: '10px 12px',
    border: '1px solid #e5e7eb',
    boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
    cursor: 'default',
  },
  productIcon: {
    fontSize: '28px',
    width: '44px',
    height: '44px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(230,126,34,0.08)',
    borderRadius: '10px',
    flexShrink: 0,
  },
  productInfo: {
    flex: 1,
    minWidth: 0,
  },
  productName: {
    fontWeight: 700,
    fontSize: '13px',
    color: '#1f2937',
    marginBottom: '2px',
  },
  productReason: {
    fontSize: '11px',
    color: '#059669',
    marginBottom: '2px',
  },
  productPrice: {
    fontSize: '13px',
    fontWeight: 600,
    color: '#374151',
  },
  addToCartBtn: {
    width: '32px',
    height: '32px',
    borderRadius: '10px',
    background: 'linear-gradient(135deg, #27ae60, #2ecc71)',
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    flexShrink: 0,
    boxShadow: '0 2px 8px rgba(39,174,96,0.25)',
    transition: 'all 0.2s',
  },
  quickReplies: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px',
    marginTop: '10px',
  },
  quickReplyBtn: {
    padding: '6px 14px',
    borderRadius: '16px',
    border: '1px solid #e67e22',
    background: 'white',
    color: '#d35400',
    fontSize: '12px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  typingIndicator: {
    alignSelf: 'flex-start',
    background: '#f3f4f6',
    padding: '10px 16px',
    borderRadius: '18px',
    display: 'flex',
    gap: '4px',
    alignItems: 'center',
  },
  dot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    background: '#9ca3af',
    animation: 'bounce 1.4s infinite ease-in-out both',
  },
  inputArea: {
    padding: '12px 16px',
    borderTop: '1px solid #e5e7eb',
    background: 'white',
    display: 'flex',
    gap: '10px',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    padding: '10px 14px',
    borderRadius: '14px',
    border: '1px solid #e5e7eb',
    background: '#f9fafb',
    fontSize: '14px',
    outline: 'none',
    transition: 'all 0.2s',
  },
  sendBtn: {
    width: '40px',
    height: '40px',
    borderRadius: '12px',
    background: 'linear-gradient(135deg, #e67e22, #d35400)',
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(230,126,34,0.25)',
    transition: 'all 0.2s',
  },

  vetCtaWrap: {
    marginTop: '10px',
    display: 'flex',
    justifyContent: 'flex-start',
  },
  vetCtaBtn: {
    padding: '8px 14px',
    borderRadius: 16,
    border: '1px solid rgba(220,38,38,0.25)',
    background: 'rgba(220,38,38,0.08)',
    color: '#b91c1c',
    fontSize: 12,
    fontWeight: 900,
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
};
export default ChatAssistant;