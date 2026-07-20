/**
 * Moteur conversationnel PetBot — intents, scénario animal, upsell, multilingue.
 */
import { PET_SPECIES, PETBOT } from '../config/petBotConfig';

const I18N = {
  fr: {
    greet: (name, promo) =>
      `Bonjour${name ? ` ${name}` : ''} ! Je suis ${PETBOT.displayName}, votre conseiller virtuel.${promo ? ` ${promo}` : ''} Quel animal avez-vous ? Je vais vous aider à trouver les meilleurs produits.`,
    askAge: 'Quel âge a-t-il (ou elle) ?',
    askLifestyle: 'Vit-il principalement en intérieur ou en extérieur ? Est-il stérilisé ?',
    askBreedWeight: 'Quelle est sa race et son poids approximatif ?',
    recCatIndoor:
      'Pour un chat adulte stérilisé d’intérieur, je recommande des croquettes adaptées, une fontaine à eau et un griffoir — souvent achetés ensemble pour son bien-être. Souhaitez-vous les ajouter au panier ?',
    recDog: 'Pour votre chien, je peux proposer croquettes, friandises, laisse et harnais adaptés. Souhaitez une recommandation précise ?',
    recGeneric: 'Voici des produits adaptés. Dites « ajoute au panier » ou choisissez une suggestion.',
    cartAdded: (n) => `C’est ajouté ! ${n} article(s) dans votre panier. Besoin d’autre chose ?`,
    cartHintFree: 'Avec ce panier vous pourriez bénéficier de la livraison gratuite (seuil promo).',
    missingLitter: 'Il vous manque peut-être une litière adaptée — je peux vous en proposer.',
    orderTrack: (s) => `Voici le suivi : ${s}`,
    noOrders: 'Je ne vois pas encore de commande. Connectez-vous ou passez commande dans la boutique.',
    deliveryEta: 'Estimation livraison : 24 à 48 h en Tunisie (grandes villes), 2–4 jours ailleurs.',
    paymentHelp: 'Pour payer : ouvrez le panier → Commander. Cartes, wallet et à la livraison selon disponibilité. Je reste avec vous.',
    grooming: 'Je vous oriente vers la prise de RDV toilettage. Choisissez un créneau sur la page services.',
    loyalty: (pts) => `Vous avez ${pts} points fidélité. Badges et défis sont dans Fidélité — dites « mes points » pour un rappel.`,
    reviewAsk: 'Votre commande est livrée ! Un avis ⭐ aiderait d’autres propriétaires. Souhaitez ouvrir Mes avis ?',
    promo: (t) => t || 'Des promotions sont actives — dites « promos » pour les voir.',
    compare: 'Pour comparer deux croquettes, indiquez les noms ou ouvrez le comparateur dans la boutique.',
    videoHarness: 'Pour mettre un harnais : 1) passez la tête 2) bouclez sous le ventre 3) ajustez. Je peux ouvrir une démo vidéo.',
    emotionNeed: 'Pour détecter l’émotion (caméra/micro), j’ai besoin de votre autorisation.',
    emotionOk: 'Merci. Je tiendrai compte de votre humeur pour adapter mes conseils.',
    unknown: 'Je peux vous aider sur : produits, panier vocal, suivi commande, toilettage, paiement, livraisons, avis, fidélité. Que souhaitez-vous ?',
    langSwitched: 'Langue : français.',
  },
  en: {
    greet: (name, promo) =>
      `Hello${name ? ` ${name}` : ''}! I’m ${PETBOT.displayName}, your virtual advisor.${promo ? ` ${promo}` : ''} Which pet do you have?`,
    askAge: 'How old is your pet?',
    askLifestyle: 'Indoor or outdoor? Neutered/spayed?',
    askBreedWeight: 'Breed and approximate weight?',
    recCatIndoor:
      'For an adult indoor neutered cat I recommend suitable kibble, a water fountain and a scratcher. Add them to cart?',
    recDog: 'I can suggest dog food, treats, leash and harness. Want a precise pick?',
    recGeneric: 'Here are matching products. Say “add to cart” or pick a suggestion.',
    cartAdded: (n) => `Added! ${n} item(s) in your cart.`,
    cartHintFree: 'This cart may unlock free delivery.',
    missingLitter: 'You might still need litter — I can suggest some.',
    orderTrack: (s) => `Order status: ${s}`,
    noOrders: 'No orders found yet.',
    deliveryEta: 'Delivery estimate: 24–48h in major Tunisian cities, 2–4 days elsewhere.',
    paymentHelp: 'Open cart → Checkout. I can guide you through payment.',
    grooming: 'Opening grooming appointment booking for you.',
    loyalty: (pts) => `You have ${pts} loyalty points.`,
    reviewAsk: 'Order delivered! Leave a review?',
    promo: (t) => t || 'Promotions are live — say “promos”.',
    compare: 'Tell me both product names to compare.',
    videoHarness: 'Harness steps: head → belly buckle → adjust. Open demo video?',
    emotionNeed: 'I need your consent for emotion detection.',
    emotionOk: 'Thanks — I’ll adapt my tone.',
    unknown: 'I can help with products, cart, orders, grooming, payment, delivery, reviews, loyalty.',
    langSwitched: 'Language: English.',
  },
  ar: {
    greet: (name, promo) =>
      `مرحباً${name ? ` ${name}` : ''}! أنا ${PETBOT.displayName}.${promo ? ` ${promo}` : ''} ما هو حيوانك؟`,
    askAge: 'كم عمر حيوانك؟',
    askLifestyle: 'داخلي أم خارجي؟ هل هو معقم؟',
    askBreedWeight: 'السلالة والوزن التقريبي؟',
    recCatIndoor: 'للقطط البالغة المعقمة في الداخل أنصح بطعام مناسب ونافورة ماء وخدّاشة. هل نضيفها للسلة؟',
    recDog: 'يمكنني اقتراح طعام ولوازم للكلب. هل تريد توصية؟',
    recGeneric: 'إليك منتجات مناسبة. قل «أضف للسلة».',
    cartAdded: (n) => `تمت الإضافة! ${n} في السلة.`,
    cartHintFree: 'قد تحصل على توصيل مجاني.',
    missingLitter: 'قد تحتاج رمل فضلات — هل أقترح؟',
    orderTrack: (s) => `حالة الطلب: ${s}`,
    noOrders: 'لا توجد طلبات بعد.',
    deliveryEta: 'التوصيل: 24–48 ساعة في المدن الكبرى.',
    paymentHelp: 'افتح السلة ثم الدفع. أنا معك.',
    grooming: 'سأفتح حجز التزيين.',
    loyalty: (pts) => `لديك ${pts} نقطة ولاء.`,
    reviewAsk: 'تم التسليم! هل تترك تقييماً؟',
    promo: (t) => t || 'عروض متاحة — قل «عروض».',
    compare: 'أخبرني باسم المنتجين للمقارنة.',
    videoHarness: 'خطوات الحزام: الرأس ثم البطن ثم الضبط.',
    emotionNeed: 'أحتاج موافقتك لكشف المشاعر.',
    emotionOk: 'شكراً، سأكيّف الردود.',
    unknown: 'أساعدك في المنتجات، السلة، الطلبات، التزيين، الدفع، الولاء.',
    langSwitched: 'اللغة: العربية.',
  },
};

const t = (lang, key, ...args) => {
  const pack = I18N[lang] || I18N.fr;
  const val = pack[key] ?? I18N.fr[key];
  return typeof val === 'function' ? val(...args) : val;
};

export function detectLangHint(text) {
  const q = String(text || '').toLowerCase();
  if (/^(arabe|arabic|عربي|تونسي)/.test(q) || /بالعربية|speak arabic/.test(q)) return 'ar';
  if (/^(english|anglais|in english)/.test(q)) return 'en';
  if (/^(français|francais|french)/.test(q)) return 'fr';
  return null;
}

export function detectSpecies(text) {
  const q = String(text || '').toLowerCase();
  for (const [id, meta] of Object.entries(PET_SPECIES)) {
    if (meta.keywords.some((k) => q.includes(k))) return id;
  }
  return null;
}

export function extractAgeYears(text) {
  const m = String(text || '').match(/(\d+)\s*(ans?|years?|سنة|سنوات)?/i);
  return m ? Number(m[1]) : null;
}

export function detectIntent(text) {
  const q = String(text || '').toLowerCase();
  if (/panier|cart|ajoute|add to cart|أضف|سلة/.test(q)) return 'add_cart';
  if (/commande|suivi|tracking|où est|where is|طلبي|تتبع/.test(q)) return 'track_order';
  if (/livraison|délai|delivery|eta|توصيل/.test(q)) return 'delivery_eta';
  if (/payer|paiement|checkout|payment|دفع/.test(q)) return 'payment';
  if (/toilet|groom|toilettage|تزيين|حلاقة/.test(q)) return 'grooming';
  if (/avis|review|noter|تقييم/.test(q)) return 'review';
  if (/fidélité|points|badge|loyalty|نقاط/.test(q)) return 'loyalty';
  if (/promo|coupon|réduction|عرض|خصم/.test(q)) return 'promo';
  if (/comparer|différence|compare|مقارنة/.test(q)) return 'compare';
  if (/harnais|vidéo|comment mettre|how to|فيديو/.test(q)) return 'video_tip';
  if (/émotion|emotion|humeur|مزاج/.test(q)) return 'emotion';
  if (/photo|image|analyse|صورة/.test(q)) return 'image';
  if (/rappel|renouvel|vaccin|reminder|تذكير/.test(q)) return 'reminder';
  if (/bonjour|salut|hello|مرحبا|hi\b/.test(q)) return 'greet';
  if (/croquette|nourriture|litière|jouet|produit|food|litter|طعام/.test(q)) return 'recommend';
  if (/intérieur|extérieur|stéril|indoor|outdoor|معقم/.test(q)) return 'lifestyle';
  if (detectSpecies(q) || /\d+\s*ans/.test(q)) return 'pet_info';
  return 'unknown';
}

/**
 * @returns {{ content, quickReplies, mood, products?, actions?, navigate?, speakExtra? }}
 */
export function buildPetBotReply({
  text,
  lang = 'fr',
  userName = '',
  session = {},
  context = {},
}) {
  const intent = detectIntent(text);
  const langHint = detectLangHint(text);
  const nextLang = langHint || lang;
  const L = nextLang;

  if (langHint) {
    return {
      content: t(L, 'langSwitched'),
      quickReplies: L === 'fr' ? ['Un chat', 'Un chien', 'Promos'] : ['Cat', 'Dog', 'Promos'],
      mood: 'smile',
      lang: L,
      sessionPatch: {},
    };
  }

  // Scénario guidé : collecte profil animal
  const step = session.step || 'idle';
  const species = detectSpecies(text) || session.species;
  const age = extractAgeYears(text) ?? session.ageYears;

  if (intent === 'greet' || (step === 'idle' && intent === 'unknown' && !text)) {
    const promoLine = context.promoLine || '';
    return {
      content: t(L, 'greet', userName, promoLine),
      quickReplies:
        L === 'ar'
          ? ['قط', 'كلب', 'عروض']
          : L === 'en'
            ? ['A cat', 'A dog', 'Promos']
            : ['Un chat', 'Un chien', 'Promos du jour'],
      mood: 'smile',
      lang: L,
      sessionPatch: { step: 'await_species' },
    };
  }

  if (intent === 'pet_info' || step === 'await_species' || step === 'await_age') {
    if (species && !session.species) {
      return {
        content: t(L, 'askAge'),
        quickReplies: L === 'en' ? ['1 year', '3 years', '8 years'] : ['1 an', '3 ans', '8 ans'],
        mood: 'listen',
        lang: L,
        sessionPatch: { species, step: 'await_age' },
      };
    }
    if (age != null && (species || session.species)) {
      return {
        content: t(L, 'askLifestyle'),
        quickReplies:
          L === 'en'
            ? ['Indoor neutered', 'Outdoor']
            : ['Intérieur stérilisé', 'Extérieur'],
        mood: 'think',
        lang: L,
        sessionPatch: {
          species: species || session.species,
          ageYears: age,
          step: 'await_lifestyle',
        },
      };
    }
  }

  if (intent === 'lifestyle' || step === 'await_lifestyle') {
    const indoor = /intérieur|indoor|داخلي/.test(String(text).toLowerCase());
    const neutered = /stéril|neutered|spayed|معقم/.test(String(text).toLowerCase());
    const sp = session.species || species || 'cat';
    const content =
      sp === 'cat' && (indoor || neutered)
        ? t(L, 'recCatIndoor')
        : sp === 'dog'
          ? t(L, 'recDog')
          : t(L, 'recGeneric');
    return {
      content,
      quickReplies:
        L === 'en'
          ? ['Add to cart', 'See more', 'Grooming']
          : ['Ajouter au panier', 'Voir boutique', 'Toilettage'],
      mood: 'celebrate',
      lang: L,
      products: context.recommendedProducts || [],
      actions: ['suggest_products'],
      sessionPatch: {
        species: sp,
        indoor,
        neutered,
        step: 'recommend',
      },
    };
  }

  if (intent === 'add_cart') {
    return {
      content: t(L, 'cartAdded', context.cartCount ?? 1),
      quickReplies:
        L === 'en' ? ['Checkout', 'Continue'] : ['Payer', 'Continuer', 'Livraison'],
      mood: 'celebrate',
      lang: L,
      actions: ['add_recommended_to_cart'],
      speakExtra: context.cartCount >= 2 ? t(L, 'cartHintFree') : t(L, 'missingLitter'),
    };
  }

  if (intent === 'track_order') {
    const status = context.orderSummary || null;
    return {
      content: status ? t(L, 'orderTrack', status) : t(L, 'noOrders'),
      quickReplies: L === 'en' ? ['My orders', 'Delivery ETA'] : ['Mes commandes', 'Délai livraison'],
      mood: status ? 'smile' : 'concern',
      lang: L,
      navigate: '/client-orders',
      actions: status && /livré|delivered|تم/.test(String(status).toLowerCase()) ? ['ask_review'] : [],
    };
  }

  if (intent === 'delivery_eta') {
    return {
      content: t(L, 'deliveryEta'),
      quickReplies: L === 'en' ? ['Track order', 'Promos'] : ['Suivi commande', 'Promos'],
      mood: 'talk',
      lang: L,
    };
  }

  if (intent === 'payment') {
    return {
      content: t(L, 'paymentHelp'),
      quickReplies: L === 'en' ? ['Open cart', 'Help'] : ['Ouvrir panier', 'Aide'],
      mood: 'listen',
      lang: L,
      actions: ['open_cart'],
      navigate: '/checkout',
    };
  }

  if (intent === 'grooming') {
    return {
      content: t(L, 'grooming'),
      quickReplies: L === 'en' ? ['Book now'] : ['Prendre RDV'],
      mood: 'smile',
      lang: L,
      navigate: '/client-services?type=grooming',
    };
  }

  if (intent === 'loyalty') {
    return {
      content: t(L, 'loyalty', context.loyaltyPoints ?? 0),
      quickReplies: L === 'en' ? ['Loyalty page', 'Badges'] : ['Fidélité', 'Badges'],
      mood: 'celebrate',
      lang: L,
      navigate: '/client-loyalty',
    };
  }

  if (intent === 'review') {
    return {
      content: t(L, 'reviewAsk'),
      quickReplies: L === 'en' ? ['Leave review'] : ['Laisser un avis'],
      mood: 'smile',
      lang: L,
      navigate: '/client-reviews',
    };
  }

  if (intent === 'promo') {
    return {
      content: t(L, 'promo', context.promoLine),
      quickReplies: L === 'en' ? ['Shop', 'Coupon'] : ['Boutique', 'Coupon'],
      mood: 'celebrate',
      lang: L,
      navigate: '/client-products',
    };
  }

  if (intent === 'compare') {
    return {
      content: t(L, 'compare'),
      quickReplies: L === 'en' ? ['Products'] : ['Boutique'],
      mood: 'think',
      lang: L,
      navigate: '/client-products',
    };
  }

  if (intent === 'video_tip') {
    return {
      content: t(L, 'videoHarness'),
      quickReplies: L === 'en' ? ['Open video', 'Shop harness'] : ['Voir la vidéo', 'Harnais'],
      mood: 'talk',
      lang: L,
      actions: ['open_video_harness'],
      navigate: '/client-products?q=harnais',
    };
  }

  if (intent === 'emotion') {
    if (!context.emotionConsent) {
      return {
        content: t(L, 'emotionNeed'),
        quickReplies: L === 'en' ? ['Allow', 'No thanks'] : ['Autoriser', 'Non merci'],
        mood: 'listen',
        lang: L,
        actions: ['request_emotion_consent'],
      };
    }
    return {
      content: t(L, 'emotionOk'),
      quickReplies: [],
      mood: context.detectedEmotion === 'sad' ? 'concern' : 'smile',
      lang: L,
    };
  }

  if (intent === 'image') {
    return {
      content:
        L === 'en'
          ? 'Send a photo of your pet — I’ll estimate breed carefully and suggest collar/harness size.'
          : L === 'ar'
            ? 'أرسل صورة لحيوانك لتقدير السلالة واقتراح المقاس.'
            : 'Envoyez une photo de votre animal — j’estimerai la race avec prudence et suggérerai collier / harnais.',
      quickReplies: L === 'en' ? ['Upload photo'] : ['Envoyer une photo'],
      mood: 'think',
      lang: L,
      actions: ['request_image'],
    };
  }

  if (intent === 'reminder') {
    return {
      content:
        L === 'en'
          ? 'I can remind you: food refill, litter, vaccines, grooming. Open your pet profile to save preferences.'
          : 'Je peux rappeler : croquettes, litière, vaccins, toilettage. Ouvrez la fiche animal pour mémoriser.',
      quickReplies: L === 'en' ? ['Pet profile', 'Grooming'] : ['Fiche animal', 'Toilettage'],
      mood: 'smile',
      lang: L,
      navigate: '/client-pets',
    };
  }

  if (intent === 'recommend') {
    return {
      content: t(L, 'recGeneric'),
      quickReplies:
        L === 'en' ? ['Add to cart', 'More'] : ['Ajouter au panier', 'Voir plus'],
      mood: 'talk',
      lang: L,
      products: context.recommendedProducts || [],
      actions: ['suggest_products'],
      navigate: '/client-products',
    };
  }

  return {
    content: t(L, 'unknown'),
    quickReplies:
      L === 'en'
        ? ['My pet', 'Orders', 'Promos', 'Grooming']
        : ['Mon animal', 'Commandes', 'Promos', 'Toilettage'],
    mood: 'idle',
    lang: L,
  };
}

export function persistPetProfile(session) {
  try {
    localStorage.setItem(
      'petbot_pet_profile',
      JSON.stringify({
        species: session.species,
        ageYears: session.ageYears,
        indoor: session.indoor,
        neutered: session.neutered,
        updatedAt: Date.now(),
      })
    );
  } catch {
    /* ignore */
  }
}

export function loadPetProfile() {
  try {
    return JSON.parse(localStorage.getItem('petbot_pet_profile') || 'null');
  } catch {
    return null;
  }
}
