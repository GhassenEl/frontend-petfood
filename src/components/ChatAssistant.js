import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, ShoppingCart, Sparkles } from 'lucide-react';
import api from '../utils/api';

const ChatAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasHistory, setHasHistory] = useState(false);
  const [isBackendOnline, setIsBackendOnline] = useState(true);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Greeting on first open
  useEffect(() => {
    if (isOpen && messages.length === 0 && !hasHistory) {
      setMessages([
        {
          role: 'assistant',
          content: 'Bonjour ! 🐾 Je suis votre assistant PetfoodTN. Je peux vous recommander des produits parfaits pour votre compagnon. De quoi avez-vous besoin ?',
          quickReplies: ['🐶 Recommandations', '💰 Promotions', '📋 Mon profil'],
          products: []
        }
      ]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const sendMessage = async (text) => {
    if (!text.trim()) return;
    const userMsg = { role: 'user', content: text.trim(), products: [], quickReplies: [] };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await api.post('/chat/message', { message: text.trim() });
      const data = res.data;
      const assistantMsg = {
        role: 'assistant',
        content: data.message,
        products: data.products || [],
        quickReplies: data.quickReplies || []
      };
      setMessages(prev => [...prev, assistantMsg]);
      setHasHistory(true);
      setIsBackendOnline(true);
    } catch (err) {
      const isOffline = err.isBackendOffline || !err.response;
      const isNotFound = err.isNotFound || err.response?.status === 404;
      setIsBackendOnline(false);

      let errorContent = 'Désolé, une erreur est survenue. 😅 Réessayez dans un instant.';
      let errorReplies = ['Réessayer'];

      if (isOffline) {
        errorContent = '⚠️ Le serveur semble inaccessible.\n\nVérifiez que le backend est démarré :\n`cd backend && npm start`\n\nPuis réessayez.';
        errorReplies = ['🔄 Réessayer', '❓ Aide'];
      } else if (isNotFound) {
        errorContent = '⚠️ La route API n\'a pas été trouvée (404).\n\nLe backend est peut-être mal configuré ou redémarre.';
        errorReplies = ['🔄 Réessayer'];
      }

      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: errorContent,
          quickReplies: errorReplies,
          products: []
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickReply = (reply) => {
    const cleanReply = reply.replace(/^\p{Emoji}\s*/u, '');
    sendMessage(cleanReply);
  };

  const addToCart = (product) => {
    window.dispatchEvent(new CustomEvent('addToCart', { detail: product }));
  };

  const formatPrice = (price, discount) => {
    if (!discount || discount <= 0) return price + ' DT';
    const discounted = price * (1 - discount / 100);
    return (
      <span>
        <span style={{ textDecoration: 'line-through', color: '#9ca3af', fontSize: '12px', marginRight: '6px' }}>
          {price} DT
        </span>
        <span style={{ color: '#e74c3c', fontWeight: 700 }}>
          {discounted.toFixed(2)} DT
        </span>
      </span>
    );
  };

  return (
    <>
      {/* Floating Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        style={styles.fab}
        aria-label="Assistant"
      >
        {isOpen ? <X size={24} color="white" /> : <MessageCircle size={24} color="white" />}
      </motion.button>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            style={styles.chatPanel}
          >
            {/* Header */}
            <div style={styles.header}>
              <div style={styles.headerLeft}>
                <div style={styles.headerIcon}>
                  <Sparkles size={18} color="white" />
                </div>
                <div>
                  <div style={styles.headerTitle}>Assistant PetfoodTN</div>
                  <div style={{
                    ...styles.headerSubtitle,
                    color: isBackendOnline ? '#059669' : '#dc2626'
                  }}>
                    {loading ? 'En train d\'écrire...' : (isBackendOnline ? 'En ligne' : 'Hors ligne ⚠️')}
                  </div>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} style={styles.closeBtn}>
                <X size={18} color="#666" />
              </button>
            </div>

            {/* Messages */}
            <div style={styles.messagesContainer}>
              {messages.map((msg, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    ...styles.messageBubble,
                    alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                    background: msg.role === 'user'
                      ? 'linear-gradient(135deg, #e67e22, #d35400)'
                      : '#f8f9fa',
                    color: msg.role === 'user' ? 'white' : '#374151',
                    borderBottomRightRadius: msg.role === 'user' ? '4px' : '18px',
                    borderBottomLeftRadius: msg.role === 'assistant' ? '4px' : '18px',
                  }}
                >
                  <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.5, fontSize: '14px' }}>
                    {msg.content}
                  </div>

                  {/* Product Cards */}
                  {msg.products && msg.products.length > 0 && (
                    <div style={styles.productsGrid}>
                      {msg.products.map((product, pidx) => (
                        <motion.div
                          key={pidx}
                          whileHover={{ scale: 1.03 }}
                          style={styles.productCard}
                        >
                          <div style={styles.productIcon}>
                            {product.icon || '📦'}
                          </div>
                          <div style={styles.productInfo}>
                            <div style={styles.productName}>{product.name}</div>
                            <div style={styles.productReason}>{product.reason}</div>
                            <div style={styles.productPrice}>
                              {formatPrice(product.price, product.discount)}
                            </div>
                          </div>
                          <button
                            onClick={() => addToCart(product)}
                            style={styles.addToCartBtn}
                            title="Ajouter au panier"
                          >
                            <ShoppingCart size={14} color="white" />
                          </button>
                        </motion.div>
                      ))}
                    </div>
                  )}

                  {/* Quick Replies */}
                  {msg.quickReplies && msg.quickReplies.length > 0 && msg.role === 'assistant' && (
                    <div style={styles.quickReplies}>
                      {msg.quickReplies.map((qr, qidx) => (
                        <button
                          key={qidx}
                          onClick={() => handleQuickReply(qr)}
                          style={styles.quickReplyBtn}
                        >
                          {qr}
                        </button>
                      ))}
                    </div>
                  )}
                </motion.div>
              ))}

              {loading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={styles.typingIndicator}
                >
                  <span style={styles.dot}></span>
                  <span style={styles.dot}></span>
                  <span style={styles.dot}></span>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
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
    zIndex: 1000,
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
    zIndex: 1000,
  },
  header: {
    padding: '16px 20px',
    background: 'linear-gradient(135deg, #fff8f0, #fef3e2)',
    borderBottom: '1px solid rgba(230,126,34,0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
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
};

export default ChatAssistant;
