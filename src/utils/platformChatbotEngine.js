/**
 * Moteur conversationnel multilingue (FR / EN / AR) — tous les acteurs PetfoodTN.
 * Utilisé en secours local quand l'API est indisponible et pour les réponses instantanées.
 */
import { getLocalVetAssistantReply } from './vetAssistantEngine';
import { buildLocalChatNlp } from './chatNlpPayload';
import { extractLocalSources } from './productRating';
import { getLocalMarketplaceKpiReply } from './marketplaceKpiLocal';

export const SUPPORTED_LANGS = ['fr', 'en', 'ar'];
export const LANG_LABELS = { fr: 'FR', en: 'EN', ar: 'AR' };
export const LANG_BCP47 = { fr: 'fr-FR', en: 'en-US', ar: 'ar-TN' };
export const CHAT_LANG_STORAGE_KEY = 'petfood-chat-lang';

const normalize = (s) =>
  String(s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

const ARABIC_RE = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/;
const EN_HINTS = /\b(hello|hi|how|what|where|when|order|product|delivery|help|thanks|please|price|stock|payment)\b/i;

export const detectLanguage = (text, fallback = 'fr') => {
  const raw = String(text || '').trim();
  if (!raw) return fallback;
  if (ARABIC_RE.test(raw)) return 'ar';
  const n = normalize(raw);
  if (EN_HINTS.test(n) && !/\b(bonjour|commande|produit|livraison|merci|comment|croquette|veterinaire|vétérinaire)\b/.test(n)) {
    return 'en';
  }
  return fallback;
};

export const loadStoredChatLang = () => {
  try {
    const v = localStorage.getItem(CHAT_LANG_STORAGE_KEY);
    return SUPPORTED_LANGS.includes(v) ? v : 'fr';
  } catch {
    return 'fr';
  }
};

export const saveStoredChatLang = (lang) => {
  try {
    if (SUPPORTED_LANGS.includes(lang)) localStorage.setItem(CHAT_LANG_STORAGE_KEY, lang);
  } catch {
    /* ignore */
  }
};

export const CHAT_UI = {
  fr: {
    placeholder: 'Écrivez un message…',
    online: 'En ligne',
    offline: 'Mode local',
    loading: 'Chargement…',
    typing: "En train d'écrire…",
    newChat: 'Nouvelle conversation',
    close: 'Fermer',
    langLabel: 'Langue',
    localBadge: 'Réponse locale multilingue',
    voiceStart: 'Message vocal',
    voiceStop: 'Arrêter le micro',
    voiceUnsupported: 'Vocal non supporté (Chrome/Edge recommandé).',
    voiceReplyOn: 'Lecture vocale activée',
    voiceReplyOff: 'Lecture vocale désactivée',
  },
  en: {
    placeholder: 'Type a message…',
    online: 'Online',
    offline: 'Local mode',
    loading: 'Loading…',
    typing: 'Typing…',
    newChat: 'New conversation',
    close: 'Close',
    langLabel: 'Language',
    localBadge: 'Multilingual local reply',
    voiceStart: 'Voice message',
    voiceStop: 'Stop microphone',
    voiceUnsupported: 'Voice not supported (use Chrome/Edge).',
    voiceReplyOn: 'Voice playback on',
    voiceReplyOff: 'Voice playback off',
  },
  ar: {
    placeholder: 'اكتب رسالة…',
    online: 'متصل',
    offline: 'وضع محلي',
    loading: 'جاري التحميل…',
    typing: 'يكتب…',
    newChat: 'محادثة جديدة',
    close: 'إغلاق',
    langLabel: 'اللغة',
    localBadge: 'رد محلي متعدد اللغات',
    voiceStart: 'رسالة صوتية',
    voiceStop: 'إيقاف الميكروفون',
    voiceUnsupported: 'الصوت غير مدعوم (استخدم Chrome/Edge).',
    voiceReplyOn: 'تشغيل الرد الصوتي',
    voiceReplyOff: 'إيقاف الرد الصوتي',
  },
};

/** Texte assistant lisible par synthèse vocale (sans markdown). */
export const stripTextForSpeech = (text) =>
  String(text || '')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/[•·]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const pick = (obj, lang) => obj[lang] || obj.fr;

const ROLE_GREETINGS = {
  client: {
    title: { fr: 'Assistant PetfoodTN', en: 'PetfoodTN Assistant', ar: 'مساعد PetfoodTN' },
    content: {
      fr: 'Bonjour ! Je réponds à toutes vos questions — produits, promotions, commandes, paiement, IoT et rendez-vous vétérinaires.',
      en: 'Hello! I can answer all your questions — products, promotions, orders, payment, IoT and vet appointments.',
      ar: 'مرحباً! أجيب على جميع أسئلتك — المنتجات، العروض، الطلبات، الدفع، IoT ومواعيد الطبيب البيطري.',
    },
    quickReplies: {
      fr: ['Recommandations', 'Codes promo', 'Mes commandes', 'Guide paiement', 'Santé animale'],
      en: ['Recommendations', 'Promo codes', 'My orders', 'Payment guide', 'Pet health'],
      ar: ['توصيات', 'أكواد خصم', 'طلباتي', 'دليل الدفع', 'صحة الحيوان'],
    },
  },
  admin: {
    title: { fr: 'Assistant Administration', en: 'Admin Assistant', ar: 'مساعد الإدارة' },
    content: {
      fr: 'Assistant administration — commandes, produits, BI et **KPI marketplace** (ventes, notes, catégories, souhaits).',
      en: 'Admin assistant — orders, products, BI and **marketplace KPIs** (sales, ratings, categories, wishlists).',
      ar: 'مساعد إدارة PetfoodTN — الطلبات، المنتجات، BI و**مؤشرات السوق**.',
    },
    quickReplies: {
      fr: ['KPI marketplace', 'Top ventes', 'Commandes', 'Produits', 'Dashboard'],
      en: ['Marketplace KPIs', 'Top sales', 'Orders', 'Products', 'Dashboard'],
      ar: ['مؤشرات السوق', 'أعلى المبيعات', 'الطلبات', 'المنتجات', 'لوحة التحكم'],
    },
  },
  livreur: {
    title: { fr: 'Assistant Livreur', en: 'Courier Assistant', ar: 'مساعد التوصيل' },
    content: {
      fr: 'Assistant livreur — commandes, carte, itinéraire, messages et gains. Je réponds en FR, EN ou AR.',
      en: 'Courier assistant — orders, map, route, messages and earnings. I reply in FR, EN or AR.',
      ar: 'مساعد التوصيل — الطلبات، الخريطة، المسار، الرسائل، الأرباح وسلسلة التبريد.',
    },
    quickReplies: {
      fr: ['Commandes', 'Carte', 'Messages', 'Gains', 'Tableau de bord'],
      en: ['Orders', 'Map', 'Messages', 'Earnings', 'Dashboard'],
      ar: ['الطلبات', 'الخريطة', 'الرسائل', 'الأرباح', 'لوحة التحكم'],
    },
  },
  vet: {
    title: { fr: 'Assistant IA Vétérinaire', en: 'Vet AI Assistant', ar: 'مساعد بيطري ذكي' },
    content: {
      fr: 'Docteur, assistant IA PetfoodTN — symptômes, diagnostics, vaccins, posologie et urgences. Mes suggestions ne remplacent pas votre jugement clinique.',
      en: 'Doctor, PetfoodTN AI assistant — symptoms, diagnostics, vaccines, dosing and emergencies. Suggestions do not replace clinical judgment.',
      ar: 'دكتور، مساعد PetfoodTN — الأعراض، التشخيص، اللقاحات، الجرعات والطوارئ. لا يغني عن الحكم السريري.',
    },
    quickReplies: {
      fr: ['Analyse symptômes', 'Protocole vaccin', 'Posologie', 'Urgence'],
      en: ['Symptom analysis', 'Vaccine protocol', 'Dosing', 'Emergency'],
      ar: ['تحليل الأعراض', 'بروتوكول اللقاح', 'الجرعة', 'طوارئ'],
    },
  },
  moderator: {
    title: { fr: 'Assistant modération NLP', en: 'Moderation NLP Assistant', ar: 'مساعد الإشراف' },
    content: {
      fr: 'Modération PetfoodTN — vendeurs, anti-fraude, contenu, litiges, remboursements et messagerie. Posez n\'importe quelle question.',
      en: 'PetfoodTN moderation — vendors, anti-fraud, content, disputes, refunds and messaging. Ask anything.',
      ar: 'إشراف PetfoodTN — البائعون، مكافحة الاحتيال، المحتوى، النزاعات، الاسترداد والرسائل.',
    },
    quickReplies: {
      fr: ['Vendeurs en attente', 'Centre anti-fraude', 'Produits à valider', 'Messagerie', 'Dashboard'],
      en: ['Pending vendors', 'Anti-fraud center', 'Products to validate', 'Messaging', 'Dashboard'],
      ar: ['بائعون بانتظار الموافقة', 'مركز مكافحة الاحتيال', 'منتجات للمراجعة', 'الرسائل', 'لوحة التحكم'],
    },
  },
  vendor: {
    title: { fr: 'Assistant vendeur NLP', en: 'Vendor NLP Assistant', ar: 'مساعد البائع' },
    content: {
      fr: 'Assistant vendeur — commandes, stock, commissions, ML, retours et recommandations basées sur les avis clients.',
      en: 'Vendor assistant — orders, stock, commissions, ML, returns and review-based recommendations.',
      ar: 'مساعد البائع — الطلبات، المخزون، العمولات، ML، المرتجعات والتوصيات من تقييمات العملاء.',
    },
    quickReplies: {
      fr: ['Dashboard', 'Assistant ML', 'Mes commandes', 'Recommandations produits'],
      en: ['Dashboard', 'ML assistant', 'My orders', 'Product recommendations'],
      ar: ['لوحة التحكم', 'مساعد ML', 'طلباتي', 'توصيات المنتجات'],
    },
  },
  visitor: {
    title: { fr: 'Assistant visiteur NLP', en: 'Visitor NLP Assistant', ar: 'مساعد الزائر' },
    content: {
      fr: 'Bonjour ! Je réponds à toutes vos questions — catalogue, nutrition, comparateur, points de vente, IoT et devenir vendeur.',
      en: 'Hello! I answer all your questions — catalog, nutrition, comparator, stores, IoT and becoming a vendor.',
      ar: 'مرحباً! أجيب على جميع أسئلتك — الكatalog، التغذية، المقارنة، نقاط البيع، IoT والانضمام كبائع.',
    },
    quickReplies: {
      fr: ['Recommandations', 'Simulateur nutrition', 'Boutique produits', 'Devenir vendeur'],
      en: ['Recommendations', 'Nutrition simulator', 'Product shop', 'Become a vendor'],
      ar: ['توصيات', 'محاكي التغذية', 'كتalog المنتجات', 'كن بائعاً'],
    },
  },
};

export const getRoleGreeting = (role = 'visitor', lang = 'fr') => {
  const cfg = ROLE_GREETINGS[role] || ROLE_GREETINGS.visitor;
  return {
    role: 'assistant',
    content: pick(cfg.content, lang),
    quickReplies: [...pick(cfg.quickReplies, lang)],
    products: [],
    title: pick(cfg.title, lang),
  };
};

const SHARED_QUESTIONS = [
  {
    keys: ['bonjour', 'salut', 'hello', 'hi', 'مرحب', 'السلام', 'ahlan', 'hey'],
    reply: {
      fr: 'Bonjour ! Comment puis-je vous aider aujourd\'hui ? Je parle français, anglais et arabe.',
      en: 'Hello! How can I help you today? I speak French, English and Arabic.',
      ar: 'مرحباً! كيف يمكنني مساعدتك؟ أتحدث الفرنسية والإنجليزية والعربية.',
    },
  },
  {
    keys: ['langue', 'language', 'arab', 'english', 'francais', 'français', 'اللغة', 'عربي', 'anglais'],
    reply: {
      fr: 'Choisissez FR, EN ou AR dans l\'en-tête du chat. Je détecte aussi la langue de votre message automatiquement.',
      en: 'Pick FR, EN or AR in the chat header. I also auto-detect your message language.',
      ar: 'اختر FR أو EN أو AR من رأس المحادثة. أكتشف لغة رسالتك تلقائياً أيضاً.',
    },
  },
  {
    keys: ['iot', 'esp32', 'distributeur', 'fontaine', 'camera', 'caméra', 'oled', 'capteur', 'sensor'],
    reply: {
      fr: 'Le pilotage IoT (ESP32, distributeurs, capteurs) est réservé aux espaces admin et vendeur. Consultez /admin/iot-anomalies ou /vendor/feeder-iot.',
      en: 'IoT management (ESP32, feeders, sensors) is available in admin and vendor spaces. See /admin/iot-anomalies or /vendor/feeder-iot.',
      ar: 'إدارة IoT متاحة لمساحات المسؤول والبائع. راجع /admin/iot-anomalies أو /vendor/feeder-iot.',
    },
  },
  {
    keys: ['devops', 'grafana', 'prometheus', 'docker', 'ci', 'cd', 'pipeline', 'monitoring', 'observabil'],
    reply: {
      fr: 'Hub DevOps intégré : /devops ou /admin/devops — CI/CD, Grafana, Prometheus, Docker, sécurité et sauvegardes (/admin/backups).',
      en: 'Integrated DevOps hub: /devops or /admin/devops — CI/CD, Grafana, Prometheus, Docker, security and backups (/admin/backups).',
      ar: 'مركز DevOps: /devops — CI/CD، Grafana، Prometheus، Docker، الأمان والنسخ الاحتياطي.',
    },
  },
  {
    keys: ['maladie', 'anomal', 'diagnostic', 'symptom', 'symptome', 'urgence', 'disease', 'مرض', 'عرض'],
    reply: {
      fr: 'Détection maladie : clients (/client-vet-intelligence), vétérinaires (/vet/diagnostics) avec scénarios démo. L\'IA analyse symptômes et propose un niveau d\'urgence — consultez toujours un vétérinaire.',
      en: 'Disease detection: clients (/client-vet-intelligence), vets (/vet/diagnostics) with demo scenarios. AI analyzes symptoms and urgency — always consult a vet.',
      ar: 'كشف الأمراض: (/vet/diagnostics) مع سيناريوهات تجريبية. يحلل الذكاء الاصطناعي الأعراض — استشر طبيباً بيطرياً دائماً.',
    },
  },
];

const ROLE_QUESTIONS = {
  visitor: [
    {
      keys: ['croquette', 'produit', 'catalogue', 'acheter', 'prix', 'product', 'catalog', 'price', 'منتج', 'سعر'],
      reply: {
        fr: 'Catalogue : croquettes, pâtées, friandises et accessoires. Créez un compte client (/register) pour parcourir la boutique et commander.',
        en: 'Catalog: kibble, wet food, treats and accessories. Create a client account (/register) to browse and order.',
        ar: 'الكتalog: croquettes ومعاليب ووجبات خفيفة. أنشئ حساب عميل (/register) للتصفح والطلب.',
      },
    },
    {
      keys: ['nutrition', 'simul', 'calorie', 'kcal', 'race', 'poids', 'weight', 'تغذية', 'سعرات'],
      reply: {
        fr: 'Besoins nutritionnels : renseignez le profil de votre animal après inscription (/register). Recommandations IA dans l\'espace client.',
        en: 'Nutrition needs: set up your pet profile after signup (/register). AI recommendations in the client area.',
        ar: 'احتياجات التغذية: أضف ملف حيوانك بعد التسجيل (/register). توصيات الذكاء الاصطناعي في مساحة العميل.',
      },
    },
    {
      keys: ['commande', 'livraison', 'panier', 'payer', 'order', 'delivery', 'cart', 'pay', 'طلب', 'توصيل'],
      reply: {
        fr: 'Commande : créez un compte (/register), ajoutez au panier, payez par carte ou wallet. Suivi dans « Mes commandes ». Livraison domicile ou point relais.',
        en: 'Order: create account (/register), add to cart, pay by card or wallet. Track in My orders. Home or relay delivery.',
        ar: 'الطلب: أنشئ حساباً (/register)، أضف للسلة، ادفع بالبطاقة. تتبع في «طلباتي».',
      },
    },
    {
      keys: ['veterinaire', 'veto', 'rdv', 'consultation', 'teleconsult', 'vet', 'appointment', 'بيطري', 'موعد'],
      reply: {
        fr: 'RDV vétérinaire : /veterinary ou téléconsultation pour clients connectés. Assistant IA pré-consultation : /client-vet-intelligence.',
        en: 'Vet appointment: /veterinary or teleconsult for logged-in clients. Pre-consult AI: /client-vet-intelligence.',
        ar: 'موعد بيطري: /veterinary أو استشارة عن بعد للعملاء المسجلين.',
      },
    },
    {
      keys: ['vendeur', 'partenaire', 'vendor', 'seller', 'بائع', 'شر partner'],
      reply: {
        fr: 'Devenir vendeur : /vendor#devenir-partenaire — inscription marketplace, validation modérateur, dashboard ventes et commissions.',
        en: 'Become a vendor: /vendor#devenir-partenaire — marketplace signup, moderator validation, sales dashboard and commissions.',
        ar: 'كن بائعاً: /vendor — التسجيل في السوق، موافقة المشرف، لوحة المبيعات.',
      },
    },
    {
      keys: ['compte', 'inscri', 'connexion', 'login', 'register', 'حساب', 'تسجيل'],
      reply: {
        fr: 'Inscription gratuite /register — boutique, fidélité, dossier animal et RDV véto. Espace visiteur sans compte pour découvrir.',
        en: 'Free signup /register — shop, loyalty, pet record and vet booking. Visitor space works without account.',
        ar: 'تسجيل مجاني /register — المتجر، الولاء، ملف الحيوان ومواعيد البيطري.',
      },
    },
  ],
  client: [
    {
      keys: ['promo', 'code', 'reduction', 'remise', 'discount', 'coupon', 'خصم', 'عرض'],
      reply: {
        fr: 'Codes promo : page Promotions ou demandez « Codes promo disponibles ». Remises appliquées automatiquement au panier si éligibles.',
        en: 'Promo codes: Promotions page or ask for available codes. Discounts auto-applied at checkout when eligible.',
        ar: 'أكواد الخصم: صفحة العروض. تُطبق تلقائياً عند الدفع.',
      },
    },
    {
      keys: ['commande', 'suivi', 'livraison', 'order', 'track', 'delivery', 'طلب', 'تتبع'],
      reply: {
        fr: 'Suivi commande : /client-orders — statut, livreur assigné, historique. Notifications temps réel si activées.',
        en: 'Order tracking: /client-orders — status, assigned courier, history. Real-time notifications if enabled.',
        ar: 'تتبع الطلب: /client-orders — الحالة والسائق والسجل.',
      },
    },
    {
      keys: ['facture', 'payer', 'paiement', 'wallet', 'invoice', 'payment', 'فاتورة', 'دفع'],
      reply: {
        fr: 'Paiement : carte bancaire, wallet ou espèces à la livraison. Factures dans /client-invoices. Guide paiement disponible via l\'assistant.',
        en: 'Payment: card, wallet or cash on delivery. Invoices at /client-invoices. Payment guide available here.',
        ar: 'الدفع: بطاقة، محفظة أو نقداً. الفواتير في /client-invoices.',
      },
    },
    {
      keys: ['reclam', 'plainte', 'complaint', 'support', 'شكوى', 'دعم'],
      reply: {
        fr: 'Réclamation : /client-complaints — décrivez le problème, joignez une photo si besoin. Délai de traitement affiché sur le ticket.',
        en: 'Complaint: /client-complaints — describe the issue, attach a photo if needed. Processing time shown on ticket.',
        ar: 'شكوى: /client-complaints — صف المشكلة وأرفق صورة إن أمكن.',
      },
    },
    {
      keys: ['fidel', 'point', 'loyalty', 'reward', 'ولاء', 'نقاط'],
      reply: {
        fr: 'Programme fidélité : points à chaque achat, niveaux Bronze/Argent/Or. Consultez votre solde dans le profil client.',
        en: 'Loyalty program: points per purchase, Bronze/Silver/Gold tiers. Check balance in client profile.',
        ar: 'برنامج الولاء: نقاط مع كل شراء ومستويات برونز/فضة/ذهب.',
      },
    },
    {
      keys: ['recommand', 'avis', 'note', 'review', 'rating', 'توصية', 'تقييم'],
      reply: {
        fr: 'Recommandations ML basées sur votre animal, historique et avis clients (/client-reviews). Demandez « Recommandations pour mon animal ».',
        en: 'ML recommendations based on your pet, history and reviews (/client-reviews). Ask for pet recommendations.',
        ar: 'توصيات ML حسب حيوانك وسجل الشراء والتقييمات.',
      },
    },
  ],
  admin: [
    {
      keys: ['commande', 'order', 'طلب'],
      reply: {
        fr: 'Gestion commandes : /admin/orders — filtres, statuts, assignation livreur, export.',
        en: 'Orders management: /admin/orders — filters, statuses, courier assignment, export.',
        ar: 'إدارة الطلبات: /admin/orders.',
      },
    },
    {
      keys: ['produit', 'stock', 'product', 'inventory', 'منتج', 'مخزون'],
      reply: {
        fr: 'Produits /admin/products et stock /admin/stock — alertes seuil, mouvements, synchronisation vendeurs.',
        en: 'Products /admin/products and stock /admin/stock — threshold alerts, movements, vendor sync.',
        ar: 'المنتجات /admin/products والمخزون /admin/stock.',
      },
    },
    {
      keys: ['utilisateur', 'user', 'client', 'livreur', 'مستخدم'],
      reply: {
        fr: 'Utilisateurs /admin/users, livreurs /admin/livreurs, vendeurs /admin/vendors.',
        en: 'Users /admin/users, couriers /admin/livreurs, vendors /admin/vendors.',
        ar: 'المستخدمون /admin/users، السائقون /admin/livreurs، البائعون /admin/vendors.',
      },
    },
    {
      keys: ['bi', 'powerbi', 'rapport', 'analytics', 'kpi', 'تقرير'],
      reply: {
        fr: 'BI intégré : /admin/powerbi — ventes, audience live /admin/live-audience, rapports /admin/reports.',
        en: 'Integrated BI: /admin/powerbi — sales, live audience /admin/live-audience, reports /admin/reports.',
        ar: 'BI: /admin/powerbi — المبيعات والجمهور المباشر.',
      },
    },
    {
      keys: ['secur', 'security', 'backup', 'sauvegarde', 'أمان', 'نسخ'],
      reply: {
        fr: 'Sécurité /admin/security, sauvegardes /admin/backups, logs /admin/activity-logs, config /admin/system.',
        en: 'Security /admin/security, backups /admin/backups, logs /admin/activity-logs, config /admin/system.',
        ar: 'الأمان /admin/security، النسخ /admin/backups، السجلات /admin/activity-logs.',
      },
    },
    {
      keys: ['anomal', 'iot', 'qualite', 'quality', 'جودة'],
      reply: {
        fr: 'Anomalies IoT /admin/iot-anomalies, qualité alimentaire /admin/food-quality, caméra /admin/food-quality-cam.',
        en: 'IoT anomalies /admin/iot-anomalies, food quality /admin/food-quality, camera /admin/food-quality-cam.',
        ar: 'شذوذ IoT /admin/iot-anomalies، جودة الغذاء /admin/food-quality.',
      },
    },
  ],
  vendor: [
    {
      keys: ['stock', 'rupture', 'alerte', 'inventory', 'مخزون'],
      reply: {
        fr: 'Alertes stock : /vendor/ml et /vendor/products — seuils, prévisions ML, réapprovisionnement.',
        en: 'Stock alerts: /vendor/ml and /vendor/products — thresholds, ML forecasts, restocking.',
        ar: 'تنبيهات المخزون: /vendor/ml و /vendor/products.',
      },
    },
    {
      keys: ['commande', 'order', 'vente', 'sale', 'طلب', 'بيع'],
      reply: {
        fr: 'Commandes vendeur /vendor/orders, ventes /vendor/sales, retours /vendor/returns.',
        en: 'Vendor orders /vendor/orders, sales /vendor/sales, returns /vendor/returns.',
        ar: 'طلبات البائع /vendor/orders، المبيعات /vendor/sales.',
      },
    },
    {
      keys: ['commission', 'revenu', 'gain', 'payout', 'عمولة'],
      reply: {
        fr: 'Commissions et revenus sur /vendor/dashboard — taux marketplace, période de règlement, historique.',
        en: 'Commissions and revenue on /vendor/dashboard — marketplace rate, payout period, history.',
        ar: 'العمولات والإيرادات في /vendor/dashboard.',
      },
    },
    {
      keys: ['ml', 'recommand', 'avis', 'review', 'sentiment', 'توصية'],
      reply: {
        fr: 'Assistant ML /vendor/ml — analyse avis 1–5★, sentiments, suggestions produits et promos.',
        en: 'ML assistant /vendor/ml — 1–5★ review analysis, sentiment, product and promo suggestions.',
        ar: 'مساعد ML /vendor/ml — تحليل التقييمات والمشاعر.',
      },
    },
    {
      keys: ['messag', 'communication', 'client', 'message', 'رسالة'],
      reply: {
        fr: 'Messagerie vendeur /vendor/communication — réponses clients, litiges, SLA affiché.',
        en: 'Vendor messaging /vendor/communication — client replies, disputes, SLA displayed.',
        ar: 'رسائل البائع /vendor/communication.',
      },
    },
    {
      keys: ['tracabil', 'blockchain', 'lot', 'sha', 'producteur', 'تتبع'],
      reply: {
        fr: 'Traçabilité alimentaire /vendor/traceability — producteur, numéro de lot, date fabrication, vérification SHA-256.',
        en: 'Food traceability /vendor/traceability — producer, batch, manufacturing date, SHA-256 verification.',
        ar: 'تتبع الغذاء /vendor/traceability.',
      },
    },
    {
      keys: ['esp32', 'distributeur', 'feeder', 'iot', 'reservoir', 'réservoir'],
      reply: {
        fr: 'IoT distributeur /vendor/feeder-iot — surveillance ESP32, réservoir, température, distribution manuelle et alertes.',
        en: 'Feeder IoT /vendor/feeder-iot — ESP32 monitoring, tank level, temperature, manual dispense and alerts.',
        ar: 'موزع IoT /vendor/feeder-iot.',
      },
    },
    {
      keys: ['recommand', 'top', 'mieux note', 'best', 'profil animal'],
      reply: {
        fr: 'Recommandations IA /vendor/recommendations — top produits et suggestions selon profil animal (race, âge).',
        en: 'AI recommendations /vendor/recommendations — top products and pet profile suggestions.',
        ar: 'توصيات /vendor/recommendations.',
      },
    },
  ],
  moderator: [
    {
      keys: ['vendeur', 'vendor', 'validation', 'pending', 'بائع', 'موافقة'],
      reply: {
        fr: 'Vendeurs en attente /moderator/vendors — KYC, documents, approbation ou rejet motivé.',
        en: 'Pending vendors /moderator/vendors — KYC, documents, approve or reject with reason.',
        ar: 'بائعون بانتظار الموافقة /moderator/vendors.',
      },
    },
    {
      keys: ['fraude', 'fraud', 'suspicious', 'risque', 'احتيال'],
      reply: {
        fr: 'Centre anti-fraude /moderator/fraud — scores ML, patterns paiement, comptes signalés.',
        en: 'Anti-fraud center /moderator/fraud — ML scores, payment patterns, flagged accounts.',
        ar: 'مركز مكافحة الاحتيال /moderator/fraud.',
      },
    },
    {
      keys: ['contenu', 'produit', 'moder', 'content', 'validate', 'محتوى'],
      reply: {
        fr: 'Validation contenu /moderator/content — photos, descriptions, conformité réglementaire.',
        en: 'Content validation /moderator/content — photos, descriptions, regulatory compliance.',
        ar: 'مراجعة المحتوى /moderator/content.',
      },
    },
    {
      keys: ['rembours', 'refund', 'litige', 'dispute', 'استرداد'],
      reply: {
        fr: 'Remboursements /moderator/refunds et réclamations /moderator/complaints — workflow arbitrage.',
        en: 'Refunds /moderator/refunds and complaints /moderator/complaints — arbitration workflow.',
        ar: 'الاسترداد /moderator/refunds والشكاوى /moderator/complaints.',
      },
    },
    {
      keys: ['signalement', 'report', 'avis', 'review', 'بلاغ'],
      reply: {
        fr: 'Signalements /moderator/reports, modération avis /moderator/reviews, analytics /moderator/analytics.',
        en: 'Reports /moderator/reports, review moderation /moderator/reviews, analytics /moderator/analytics.',
        ar: 'البلاغات /moderator/reports ومراجعة التقييمات.',
      },
    },
  ],
  livreur: [
    {
      keys: ['commande', 'order', 'livraison', 'delivery', 'colis', 'طلب', 'توصيل'],
      reply: {
        fr: 'Commandes livreur /livreur/orders — liste du jour, statuts, preuve de livraison.',
        en: 'Courier orders /livreur/orders — daily list, statuses, proof of delivery.',
        ar: 'طلبات التوصيل /livreur/orders.',
      },
    },
    {
      keys: ['carte', 'map', 'itineraire', 'route', 'gps', 'navigation', 'خريطة', 'مسار'],
      reply: {
        fr: 'Carte et navigation /livreur/map — itinéraire optimisé, trafic, points relais.',
        en: 'Map and navigation /livreur/map — optimized route, traffic, relay points.',
        ar: 'الخريطة /livreur/map — مسار محسّن.',
      },
    },
    {
      keys: ['gain', 'earning', 'salaire', 'paiement', 'commission', 'أرباح'],
      reply: {
        fr: 'Gains /livreur/earnings — courses du jour, bonus, historique paiements.',
        en: 'Earnings /livreur/earnings — daily runs, bonuses, payment history.',
        ar: 'الأرباح /livreur/earnings.',
      },
    },
    {
      keys: ['message', 'client', 'messagerie', 'contact', 'رسالة'],
      reply: {
        fr: 'Messages /livreur/messages — contact client, support dispatch, notifications push.',
        en: 'Messages /livreur/messages — client contact, dispatch support, push notifications.',
        ar: 'الرسائل /livreur/messages.',
      },
    },
  ],
  vet: [],
};

const FALLBACK = {
  fr: 'Je peux répondre à vos questions sur la plateforme PetfoodTN. Précisez votre besoin ou choisissez une suggestion ci-dessous. Langues : FR, EN, AR.',
  en: 'I can answer your questions about the PetfoodTN platform. Specify your need or pick a suggestion below. Languages: FR, EN, AR.',
  ar: 'يمكنني الإجابة عن أسئلتك حول منصة PetfoodTN. حدّد حاجتك أو اختر اقتراحاً. اللغات: FR, EN, AR.',
};

const OTHER_QUESTION = {
  fr: 'Autre question',
  en: 'Another question',
  ar: 'سؤال آخر',
};

/** Réponses détaillées inline pour les boutons rapides (sans redirection). */
const QUICK_TOPIC_REPLIES = {
  fr: {
    Commandes: {
      livreur: 'Vos commandes du jour regroupent les livraisons assignées, leur statut (en attente, en cours, livrée) et les adresses clients. Vous pouvez accepter une course, signaler un problème ou joindre une preuve de livraison photo. Les commandes urgentes ou avec créneau horaire apparaissent en priorité. Consultez aussi les instructions spéciales (étage, code, animaux).',
      admin: 'La gestion des commandes couvre tout le cycle : création client, paiement, préparation vendeur, assignation livreur et clôture. Vous pouvez filtrer par statut, région ou vendeur, exporter les données et réassigner un livreur en cas d\'incident. Les commandes en litige sont signalées pour traitement prioritaire.',
      client: 'Vos commandes affichent le statut en temps réel : confirmation, préparation, expédition, livraison. Vous y retrouvez le détail des articles, le montant, le mode de paiement et le suivi du livreur si assigné. Une notification vous informe à chaque étape. En cas de retard, vous pouvez ouvrir une réclamation directement depuis la commande concernée.',
      default: 'Les commandes sont le cœur de PetfoodTN : suivi client, préparation vendeur et livraison. Précisez votre rôle ou votre besoin pour une réponse plus ciblée.',
    },
    Carte: {
      livreur: 'La carte affiche vos arrêts du jour, l\'itinéraire optimisé et le trafic estimé. Chaque point correspond à une commande avec adresse, téléphone client et fenêtre de livraison. Vous pouvez lancer la navigation GPS externe ou signaler une adresse introuvable. Les points relais sont distingués des livraisons à domicile.',
      default: 'La carte livreur centralise tournée, GPS et points de passage pour organiser vos courses efficacement.',
    },
    Messages: {
      livreur: 'La messagerie vous permet d\'échanger avec les clients (retard, accès immeuble) et le support dispatch. Les messages non lus sont mis en évidence. Répondez rapidement pour améliorer votre note de service. L\'historique des conversations est conservé par client.',
      vendor: 'La messagerie vendeur regroupe les questions clients sur les produits, les commandes et les retours. Répondez sous 24 h pour maintenir une bonne réputation. Vous pouvez joindre des précisions sur la disponibilité ou proposer une alternative en cas de rupture.',
      moderator: 'La messagerie modérateur sert à traiter les litiges entre clients, vendeurs et livreurs. Chaque fil est lié à un ticket ou une réclamation. Documentez vos décisions pour l\'audit.',
      default: 'La messagerie interne facilite la communication entre tous les acteurs de la plateforme.',
    },
    Gains: {
      livreur: 'Vos gains comprennent la commission par livraison (5 DT par course en moyenne), les bonus ponctualité et les pourboires éventuels. Le tableau récapitule la semaine en cours, l\'historique des paiements et les courses en attente de validation. Les graphiques montrent l\'évolution sur 7 jours.',
      default: 'Les gains livreur sont calculés par course livrée, avec bonus et historique détaillé.',
    },
    'Tableau de bord': {
      livreur: 'Le tableau de bord livreur résume votre activité : courses du jour, gains de la semaine, taux de ponctualité, messages non lus et alertes. Les graphiques « Livraisons & gains » et « Activité 7 jours » visualisent votre performance. Vous y accédez aussi aux raccourcis commandes, carte et messagerie.',
      admin: 'Le tableau de bord admin centralise les KPI : ventes, commandes en cours, alertes stock, audience temps réel, réclamations et graphiques Power BI. C\'est votre point d\'entrée pour piloter la plateforme au quotidien.',
      vendor: 'Le tableau de bord vendeur affiche le chiffre d\'affaires, les commandes actives, les alertes stock, les avis récents et le panneau Business Intelligence intégré. Vous y voyez aussi vos commissions payées et en attente.',
      moderator: 'Le tableau de bord modérateur liste les vendeurs en attente, les signalements, les avis à modérer et les litiges remboursement. Les indicateurs anti-fraude mettent en avant les dossiers prioritaires.',
      default: 'Le tableau de bord résume l\'activité essentielle de votre espace PetfoodTN.',
    },
    Dashboard: {
      admin: 'Le dashboard admin regroupe ventes, pharmacie vétérinaire, maladies signalées, livraisons et audience temps réel. Les graphiques Power BI sont intégrés directement — pas besoin d\'une page séparée. Utilisez les filtres par période pour analyser les tendances.',
      vendor: 'Votre dashboard vendeur inclut le CA, le classement marketplace, les produits à réapprovisionner et le panneau BI. Les courbes de ventes et la répartition des commandes vous aident à anticiper la demande.',
      moderator: 'Le dashboard modérateur synthétise les tâches en attente : validation vendeurs, contenu signalé, remboursements litigieux et messagerie. Traitez les éléments urgents en premier.',
      default: 'Le dashboard est votre vue d\'ensemble personnalisée selon votre rôle sur PetfoodTN.',
    },
    Produits: {
      admin: 'La gestion produits admin couvre le catalogue global, les catégories, les promotions plateforme et la synchronisation avec les vendeurs. Vous pouvez modérer les fiches, forcer une mise hors ligne ou ajuster les prix selon la gouvernance tarifaire.',
      vendor: '« Mes produits » permet d\'ajouter, modifier ou retirer vos références : prix, stock, photos, descriptions et promotions. Les alertes stock signalent les ruptures. La traçabilité blockchain est disponible pour certains articles alimentaires.',
      default: 'Le catalogue produits PetfoodTN regroupe croquettes, pâtées, accessoires et hygiène pour chiens, chats et NAC.',
    },
    'Mes commandes': {
      vendor: 'Vos commandes vendeur listent les ventes en attente d\'acceptation, en préparation, expédiées ou livrées. Acceptez ou refusez avec motif, mettez à jour le statut et communiquez avec le client. Chaque commande affiche la commission prélevée et le montant net.',
      client: 'Retrouvez toutes vos commandes passées et en cours, avec suivi livreur, facture et possibilité de demander un retour dans les 14 jours selon la politique en vigueur.',
      default: 'Les commandes regroupent l\'historique d\'achat et le suivi des livraisons en cours.',
    },
    'Mes produits': {
      vendor: 'Gérez votre catalogue : titres, descriptions, prix TTC, stock, images et promotions. Les produits en rupture ou stock faible sont signalés. Les ventes par référence alimentent les recommandations ML pour optimiser votre assortiment.',
    },
    'Assistant ML': {
      vendor: 'L\'assistant ML analyse vos ventes, prévoit la demande sur 7 jours, suggère des promotions et identifie les produits à fort potentiel ou en sous-performance. Les alertes stock priorisent les réapprovisionnements urgents. Les ajustements de prix IA proposent des variations selon la concurrence et la saisonnalité.',
    },
    Recommandations: {
      client: 'Les recommandations IA s\'appuient sur le profil de votre animal (race, âge, poids), vos achats passés et les avis clients. Vous recevez des suggestions croquettes, pâtées, accessoires et soins adaptés. Mettez à jour le profil animal pour affiner les résultats.',
      vendor: 'Les recommandations vendeur identifient les produits à promouvoir, les bundles rentables et les références à retirer. Elles croisent vos ventes, les avis clients et les tendances marketplace.',
      visitor: 'Après inscription gratuite, PetfoodTN propose des recommandations nutrition personnalisées selon l\'espèce, l\'âge et les préférences alimentaires de votre animal. Un simulateur aide à estimer les besoins caloriques quotidiens.',
      default: 'Les recommandations IA personnalisent l\'expérience selon le profil animal et l\'historique d\'achat.',
    },
    'Codes promo': {
      client: 'Les codes promo actifs s\'appliquent automatiquement au panier si vous êtes éligible. Exemples courants : BIENVENUE10 pour les nouveaux clients, FIDELITE5 pour les membres fidélité. Vérifiez la date d\'expiration et les conditions (montant minimum, catégories exclues). Les promotions produit sont cumulables selon les règles affichées.',
    },
    'Guide paiement': {
      client: 'PetfoodTN accepte la carte bancaire (Visa, Mastercard), le wallet interne et le paiement à la livraison selon votre zone. Le paiement est sécurisé (3-D Secure). Les factures sont générées automatiquement et accessibles dans « Mes factures ». En cas d\'échec, vérifiez le plafond de votre carte ou réessayez avec le wallet.',
    },
    'Vendeurs en attente': {
      moderator: 'Les vendeurs en attente ont soumis une candidature partenaire avec documents boutique, SIRET ou équivalent et coordonnées. Vérifiez la cohérence des informations, l\'absence de doublons et l\'historique anti-fraude avant validation. Un refus doit être motivé et notifié au candidat.',
    },
    'Centre anti-fraude': {
      moderator: 'Le centre anti-fraude agrège les scores de risque, les commandes suspectes, les remboursements répétés et les avis spam. Chaque alerte propose des actions : bloquer, demander des pièces, escalader à l\'admin. Les patterns ML détectent les comportements anormaux (multiples comptes, adresses identiques).',
    },
    'Produits à valider': {
      moderator: 'Les fiches produit en attente sont vérifiées pour le contenu (photos conformes, prix réalistes, descriptions sans contrefaçon). Validez, demandez une correction ou rejetez avec motif. Les produits alimentaires nécessitent une attention particulière sur les allégations santé.',
    },
    Devops: {
      admin: 'Le hub DevOps intègre CI/CD, monitoring Grafana/Prometheus, état des conteneurs Docker, sauvegardes et alertes sécurité. Consultez les pipelines de déploiement, les logs centralisés et les métriques de performance API. Les sauvegardes automatiques sont planifiées quotidiennement.',
    },
    Sauvegardes: {
      admin: 'Les sauvegardes couvrent la base de données, les fichiers uploadés et la configuration. Vous pouvez lancer une sauvegarde manuelle, restaurer un point antérieur ou vérifier l\'intégrité des archives. La rétention par défaut est de 30 jours.',
    },
  },
};

const matchQuickTopic = (message, role, lang) => {
  const topics = QUICK_TOPIC_REPLIES[lang] || QUICK_TOPIC_REPLIES.fr;
  const hay = normalize(message);
  for (const [topic, roleReplies] of Object.entries(topics)) {
    if (hay === normalize(topic) || hay.includes(normalize(topic))) {
      const reply = roleReplies[role] || roleReplies.default;
      if (reply) return { topic, reply };
    }
  }
  return null;
};

function matchQuestions(questionList, hay) {
  for (const questionEntry of questionList) {
    if (questionEntry.keys.some((k) => hay.includes(normalize(k)))) return questionEntry;
  }
  return null;
}

export const getPlatformChatReply = ({ message, role = 'visitor', language = 'fr', pet = null }) => {
  const lang = SUPPORTED_LANGS.includes(language) ? language : 'fr';
  const hay = normalize(message);
  const nlp = buildLocalChatNlp(message, role);

  const withNlp = (payload) => ({
    ...payload,
    nlp,
    language: lang,
    sources: payload.sources?.length
      ? payload.sources
      : extractLocalSources(payload.message || '', payload.source ? [{ type: 'doc', label: `Moteur local (${payload.source})`, ref: payload.source }] : []),
  });

  if (role === 'vet') {
    const vet = getLocalVetAssistantReply(message, pet);
    if (vet.source === 'local-questions') {
      return withNlp({
        message: vet.message,
        quickReplies: vet.quickReplies || pick(ROLE_GREETINGS.vet.quickReplies, lang),
        shouldShowVetCTA: vet.shouldShowVetCTA,
        source: 'local-vet',
      });
    }
  }

  const quickHit = matchQuickTopic(message, role, lang);
  if (quickHit) {
    const greeting = ROLE_GREETINGS[role] || ROLE_GREETINGS.visitor;
    return withNlp({
      message: quickHit.reply,
      quickReplies: [pick(OTHER_QUESTION, lang), ...pick(greeting.quickReplies, lang).slice(0, 2)],
      source: 'local-quick-topic',
    });
  }

  const marketplaceKpi = getLocalMarketplaceKpiReply(message, role);
  if (marketplaceKpi) {
    return withNlp({
      message: marketplaceKpi.message,
      quickReplies: marketplaceKpi.quickReplies || [],
      source: 'local-marketplace-kpi',
    });
  }

  const shared = matchQuestions(SHARED_QUESTIONS, hay);
  if (shared) {
    return withNlp({
      message: pick(shared.reply, lang),
      quickReplies: pick(ROLE_GREETINGS[role]?.quickReplies || ROLE_GREETINGS.visitor.quickReplies, lang).slice(0, 3),
      source: 'local-shared',
    });
  }

  const roleQuestions = ROLE_QUESTIONS[role] || ROLE_QUESTIONS.visitor;
  const hit = matchQuestions(roleQuestions, hay);
  if (hit) {
    return withNlp({
      message: pick(hit.reply, lang),
      quickReplies: [pick(OTHER_QUESTION, lang), ...pick(ROLE_GREETINGS[role]?.quickReplies || ROLE_GREETINGS.visitor.quickReplies, lang).slice(0, 2)],
      source: 'local-role',
    });
  }

  const greeting = ROLE_GREETINGS[role] || ROLE_GREETINGS.visitor;
  return withNlp({
    message: pick(FALLBACK, lang),
    quickReplies: pick(greeting.quickReplies, lang).slice(0, 4),
    source: 'local-fallback',
  });
};

export default getPlatformChatReply;
