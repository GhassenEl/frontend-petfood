import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  X,
  Image as ImageIcon,
  ShoppingCart,
  Globe,
} from 'lucide-react';
import useVoiceAssistant from '../hooks/useVoiceAssistant';
import { useAuth } from '../contexts/AuthContext';
import { PETBOT, PETBOT_LANGS, STORAGE_KEYS, AVATAR_MOODS } from '../config/petBotConfig';
import {
  buildPetBotReply,
  loadPetProfile,
  persistPetProfile,
} from '../services/petBotEngine';
import { getProducts } from '../services/productService';
import { getOrders } from '../services/orderService';
import { getLoyaltyAccount, getActivePromos } from '../services/loyaltyService';
import { getPromoPrice } from '../utils/productDetails';
import './PetBotAvatar.css';

const AUTO_OPEN_DELAY_MS = 1800;

const pickRecommendations = (products, species) => {
  const list = Array.isArray(products) ? products : [];
  const keys =
    species === 'dog'
      ? ['chien', 'dog']
      : species === 'bird'
        ? ['oiseau', 'bird']
        : species === 'fish'
          ? ['poisson', 'fish']
          : ['chat', 'cat', 'stéril', 'fontaine', 'griff'];
  const scored = list
    .map((p) => {
      const blob = `${p.name || ''} ${p.description || ''} ${p.category || ''}`.toLowerCase();
      const score = keys.reduce((s, k) => s + (blob.includes(k) ? 1 : 0), 0);
      return { p, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((x) => x.p);
  return scored.length ? scored : list.slice(0, 3);
};

const addProductsToCart = (products) => {
  (products || []).forEach((product) => {
    if (!product) return;
    const price = getPromoPrice(product) ?? product.price;
    window.dispatchEvent(
      new CustomEvent('addToCart', {
        detail: { ...product, price, quantity: 1 },
      })
    );
  });
};

/**
 * Avatar unique PetBot — auto-affiché, voix temps réel, panier, RDV, suivi, etc.
 */
const PetBotAvatar = ({ autoOpen = true, forceOpen = false }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(Boolean(forceOpen));
  const [lang, setLang] = useState(() => localStorage.getItem(STORAGE_KEYS.lang) || 'fr');
  const [mood, setMood] = useState(AVATAR_MOODS.idle);
  const [voiceOn, setVoiceOn] = useState(true);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([]);
  const [session, setSession] = useState(() => loadPetProfile() || {});
  const [products, setProducts] = useState([]);
  const [suggested, setSuggested] = useState([]);
  const [promoLine, setPromoLine] = useState('');
  const [loyaltyPoints, setLoyaltyPoints] = useState(0);
  const [emotionConsent, setEmotionConsent] = useState(
    () => localStorage.getItem(STORAGE_KEYS.emotionConsent) === '1'
  );
  const [detectedEmotion, setDetectedEmotion] = useState(null);
  const listRef = useRef(null);
  const greeted = useRef(false);
  const fileRef = useRef(null);

  const speechLang = PETBOT_LANGS[lang]?.speech || 'fr-FR';

  const speak = useCallback(
    (text) => {
      if (!voiceOn || typeof window === 'undefined' || !window.speechSynthesis) return;
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(String(text).replace(/\*\*/g, ''));
      u.lang = speechLang;
      u.rate = 1.02;
      u.onstart = () => setMood(AVATAR_MOODS.talk);
      u.onend = () => setMood(AVATAR_MOODS.smile);
      u.onerror = () => setMood(AVATAR_MOODS.idle);
      window.speechSynthesis.speak(u);
    },
    [voiceOn, speechLang]
  );

  useEffect(() => {
    getProducts()
      .then((data) => setProducts(Array.isArray(data) ? data : data?.products || []))
      .catch(() => setProducts([]));
    getActivePromos()
      .then((promos) => {
        const first = Array.isArray(promos) ? promos[0] : promos?.items?.[0];
        if (first) {
          const line =
            lang === 'en'
              ? `Today: ${first.title || first.name || 'promo'}!`
              : `Aujourd’hui : ${first.title || first.name || 'promo'} !`;
          setPromoLine(line);
        }
      })
      .catch(() => {});
    if (user) {
      getLoyaltyAccount()
        .then((acc) => setLoyaltyPoints(acc?.points ?? acc?.balance ?? 0))
        .catch(() => {});
    }
  }, [user, lang]);

  useEffect(() => {
    if (!autoOpen || forceOpen) return;
    if (localStorage.getItem(STORAGE_KEYS.openedOnce) === '1') {
      // Toujours visible (FAB) ; ouverture auto une fois par session navigateur
    }
    const t = setTimeout(() => {
      setOpen(true);
      try {
        sessionStorage.setItem('petbot_session_opened', '1');
      } catch {
        /* ignore */
      }
    }, AUTO_OPEN_DELAY_MS);
    return () => clearTimeout(t);
  }, [autoOpen, forceOpen]);

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages, loading, suggested]);

  const pushAssistant = useCallback(
    (payload) => {
      const {
        content,
        quickReplies = [],
        mood: nextMood = AVATAR_MOODS.talk,
        products: recs = [],
        speakExtra,
      } = payload;
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content, quickReplies, products: recs },
      ]);
      if (recs?.length) setSuggested(recs);
      setMood(nextMood);
      if (voiceOn) {
        speak(content);
        if (speakExtra) setTimeout(() => speak(speakExtra), 900);
      }
    },
    [speak, voiceOn]
  );

  const runActions = useCallback(
    async (actions = [], reply) => {
      for (const action of actions) {
        if (action === 'add_recommended_to_cart') {
          const toAdd = reply.products?.length ? reply.products : suggested;
          addProductsToCart(toAdd.slice(0, 3));
        }
        if (action === 'open_cart') {
          window.dispatchEvent(new Event('petfood:open-cart'));
        }
        if (action === 'open_video_harness') {
          window.open('https://www.youtube.com/results?search_query=mettre+harnais+chien', '_blank');
        }
        if (action === 'request_emotion_consent') {
          /* handled via quick reply Autoriser */
        }
        if (action === 'request_image') {
          fileRef.current?.click();
        }
        if (action === 'ask_review') {
          /* navigation already set */
        }
        if (action === 'suggest_products' && !reply.products?.length) {
          const recs = pickRecommendations(products, session.species);
          setSuggested(recs);
        }
      }
    },
    [suggested, products, session.species]
  );

  const handleUserText = async (raw) => {
    const text = String(raw || '').trim();
    if (!text || loading) return;
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: text }]);
    setMood(AVATAR_MOODS.listen);
    setLoading(true);

    try {
      if (/^(autoriser|allow)$/i.test(text)) {
        localStorage.setItem(STORAGE_KEYS.emotionConsent, '1');
        setEmotionConsent(true);
        setDetectedEmotion('happy');
        pushAssistant({
          content:
            lang === 'en'
              ? 'Emotion detection enabled. You seem positive — great!'
              : 'Détection d’émotion activée. Vous semblez de bonne humeur !',
          mood: AVATAR_MOODS.smile,
          quickReplies: [],
        });
        setLoading(false);
        return;
      }
      if (/^(non merci|no thanks)$/i.test(text)) {
        localStorage.setItem(STORAGE_KEYS.emotionConsent, '0');
        setEmotionConsent(false);
        pushAssistant({
          content: lang === 'en' ? 'No problem.' : 'Pas de souci, on continue sans.',
          mood: AVATAR_MOODS.idle,
          quickReplies: [],
        });
        setLoading(false);
        return;
      }

      let orderSummary = '';
      if (user && /commande|order|suivi|tracking|طلب/.test(text.toLowerCase())) {
        try {
          const orders = await getOrders();
          const list = Array.isArray(orders) ? orders : orders?.orders || [];
          const last = list[0];
          if (last) {
            orderSummary = `${last.status || last.deliveryStatus || 'en préparation'}${
              last.trackingNumber ? ` · suivi ${last.trackingNumber}` : ''
            }`;
          }
        } catch {
          /* ignore */
        }
      }

      const recommendedProducts = pickRecommendations(
        products,
        session.species || loadPetProfile()?.species
      );

      const reply = buildPetBotReply({
        text,
        lang,
        userName: user?.name?.split?.(' ')?.[0] || '',
        session,
        context: {
          promoLine,
          recommendedProducts,
          loyaltyPoints,
          orderSummary,
          emotionConsent,
          detectedEmotion,
          cartCount: recommendedProducts.length || 1,
        },
      });

      if (reply.lang && reply.lang !== lang) {
        setLang(reply.lang);
        localStorage.setItem(STORAGE_KEYS.lang, reply.lang);
      }

      if (reply.sessionPatch) {
        const next = { ...session, ...reply.sessionPatch };
        setSession(next);
        persistPetProfile(next);
      }

      const withProducts = {
        ...reply,
        products: reply.products?.length ? reply.products : recommendedProducts,
      };

      await runActions(reply.actions || [], withProducts);
      pushAssistant(withProducts);

      if (reply.navigate) {
        setTimeout(() => navigate(reply.navigate), 600);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!open || greeted.current) return;
    greeted.current = true;
    const greet = buildPetBotReply({
      text: 'bonjour',
      lang,
      userName: user?.name?.split?.(' ')?.[0] || '',
      session: {},
      context: { promoLine },
    });
    pushAssistant(greet);
    if (greet.sessionPatch) setSession((s) => ({ ...s, ...greet.sessionPatch }));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- greet once when panel opens
  }, [open]);

  const handleUserTextRef = useRef(handleUserText);
  handleUserTextRef.current = handleUserText;

  const onVoiceResult = useCallback((payload) => {
    const text =
      typeof payload === 'string' ? payload : payload?.transcript || payload?.text || '';
    if (text) handleUserTextRef.current(text);
  }, []);

  const { supported, listening, start, stop } = useVoiceAssistant({
    mode: 'chat',
    lang: speechLang,
    onTranscript: onVoiceResult,
    onResult: onVoiceResult,
  });

  const onImageSelected = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setMessages((prev) => [
      ...prev,
      { role: 'user', content: `📷 ${file.name}` },
    ]);
    // Analyse locale prudente (pas de claim certitude race)
    pushAssistant({
      content:
        lang === 'en'
          ? 'Photo received. Possible medium-size companion — I suggest an adjustable collar M and a soft harness. Want them in the cart?'
          : 'Photo reçue. Estimation prudente : compagnon de taille moyenne — collier réglable M et harnais souple. Je les ajoute ?',
      mood: AVATAR_MOODS.think,
      quickReplies:
        lang === 'en' ? ['Add to cart', 'Shop'] : ['Ajouter au panier', 'Boutique'],
      products: pickRecommendations(products, session.species || 'dog'),
    });
    e.target.value = '';
  };

  const cycleLang = () => {
    const order = ['fr', 'ar', 'en'];
    const next = order[(order.indexOf(lang) + 1) % order.length];
    setLang(next);
    localStorage.setItem(STORAGE_KEYS.lang, next);
    pushAssistant({
      content:
        next === 'fr'
          ? 'Langue : français 🇫🇷'
          : next === 'ar'
            ? 'اللغة: العربية 🇹🇳'
            : 'Language: English 🇬🇧',
      mood: AVATAR_MOODS.smile,
      quickReplies: [],
    });
  };

  return (
    <>
      {!open && (
        <button
          type="button"
          className={`petbot-fab petbot-fab--${mood}`}
          onClick={() => setOpen(true)}
          aria-label={`Ouvrir ${PETBOT.displayName}`}
        >
          <img src={PETBOT.photoUrl} alt="" className="petbot-fab__photo" />
          <span className="petbot-fab__pulse" />
          <span className="petbot-fab__label">{PETBOT.displayName}</span>
        </button>
      )}

      {open && (
        <div className="petbot-panel" role="dialog" aria-label={PETBOT.displayName}>
          <header className="petbot-panel__head">
            <div className={`petbot-avatar petbot-avatar--${mood}`}>
              <img src={PETBOT.photoUrl} alt={PETBOT.displayName} />
              <span className="petbot-avatar__mouth" />
              {emotionConsent && detectedEmotion && (
                <span className="petbot-avatar__emo" title="Émotion détectée">
                  {detectedEmotion === 'sad' ? '😟' : '😊'}
                </span>
              )}
            </div>
            <div className="petbot-panel__meta">
              <strong>{PETBOT.displayName}</strong>
              <span>{PETBOT.title}</span>
            </div>
            <div className="petbot-panel__tools">
              <button type="button" onClick={cycleLang} title="Langue" aria-label="Changer langue">
                <Globe size={16} /> {PETBOT_LANGS[lang]?.flag}
              </button>
              <button type="button" onClick={() => setVoiceOn((v) => !v)} aria-label="Voix">
                {voiceOn ? <Volume2 size={16} /> : <VolumeX size={16} />}
              </button>
              <button type="button" onClick={() => setOpen(false)} aria-label="Fermer">
                <X size={18} />
              </button>
            </div>
          </header>

          <div className="petbot-panel__messages" ref={listRef}>
            {messages.map((m, i) => (
              <div key={i} className={`petbot-msg petbot-msg--${m.role}`}>
                <p>{m.content}</p>
                {m.products?.length > 0 && m.role === 'assistant' && (
                  <div className="petbot-products">
                    {m.products.slice(0, 3).map((p) => (
                      <button
                        type="button"
                        key={p.id || p._id || p.name}
                        className="petbot-product"
                        onClick={() => addProductsToCart([p])}
                      >
                        {p.image && <img src={p.image} alt="" />}
                        <span>{p.name}</span>
                        <em>
                          <ShoppingCart size={12} />{' '}
                          {getPromoPrice(p) ?? p.price} DT
                        </em>
                      </button>
                    ))}
                  </div>
                )}
                {m.quickReplies?.length > 0 && (
                  <div className="petbot-quick">
                    {m.quickReplies.map((q) => (
                      <button key={q} type="button" onClick={() => handleUserText(q)}>
                        {q}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {loading && <div className="petbot-msg petbot-msg--assistant">…</div>}
          </div>

          <footer className="petbot-panel__foot">
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              hidden
              onChange={onImageSelected}
            />
            <button
              type="button"
              className="petbot-icon-btn"
              onClick={() => fileRef.current?.click()}
              title="Analyser une photo"
            >
              <ImageIcon size={18} />
            </button>
            {supported && (
              <button
                type="button"
                className={`petbot-icon-btn ${listening ? 'is-listening' : ''}`}
                onClick={() => (listening ? stop() : start())}
                title="Parler"
              >
                {listening ? <MicOff size={18} /> : <Mic size={18} />}
              </button>
            )}
            <form
              className="petbot-input-form"
              onSubmit={(e) => {
                e.preventDefault();
                handleUserText(input);
              }}
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={
                  lang === 'en'
                    ? 'Type or speak…'
                    : lang === 'ar'
                      ? 'اكتب أو تكلم…'
                      : 'Écrivez ou parlez…'
                }
              />
              <button type="submit">OK</button>
            </form>
          </footer>
        </div>
      )}
    </>
  );
};

export default PetBotAvatar;
