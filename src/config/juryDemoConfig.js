/**
 * Configuration démo jury — acteurs, interfaces clés, marketing digital.
 */
import { DEMO_ACCOUNTS } from './demoAccounts';
import { ROLE_HOMES } from './roleConfig';
import { MARKETING_DIGITAL_FEATURES } from './marketingContent';

export const JURY_DEMO_SECTIONS = [
  { id: 'overview', label: 'Vue d\'ensemble', icon: '🏛️' },
  { id: 'actors', label: 'Acteurs & interfaces', icon: '👥' },
  { id: 'marketing', label: 'Marketing digital', icon: '📣' },
  { id: 'chatbot', label: 'Chatbot & IA', icon: '🤖' },
  { id: 'tour', label: 'Parcours live', icon: '🎬' },
];

/** Interfaces à montrer au jury par acteur */
export const ACTOR_DEMO_INTERFACES = [
  {
    role: 'admin',
    icon: '⚙️',
    title: 'Administrateur',
    tagline: 'Pilotage plateforme, BI, sécurité, marketing',
    home: ROLE_HOMES.admin,
    account: DEMO_ACCOUNTS.find((a) => a.role === 'admin'),
    features: [
      'Dashboard Power BI — ventes, pharmacie, livraisons',
      'Marketing digital — campagnes IA, SEO, newsletter, audience live',
      'Gestion commandes, produits, utilisateurs, vendeurs',
      'IoT, qualité alimentaire, DevOps & observabilité',
      'Chatbot admin — KPI marketplace, orientation back-office',
    ],
    interfaces: [
      { label: 'Dashboard', path: '/admin/dashboard', desc: 'KPIs CA, courbes, top produits' },
      { label: 'Marketing digital', path: '/admin/digital-marketing', desc: 'Entonnoir, campagnes IA, SEO' },
      { label: 'Commandes', path: '/admin/orders', desc: 'Suivi et statuts' },
      { label: 'Recommandations IA', path: '/admin/recommendations', desc: 'Moteur hybride ML' },
      { label: 'Audience live', path: '/admin/live-audience', desc: 'Sessions temps réel' },
      { label: 'Sécurité', path: '/admin/security', desc: 'Centre sécurité 12 piliers' },
    ],
    accent: '#dc2626',
  },
  {
    role: 'client',
    icon: '🐾',
    title: 'Client',
    tagline: 'Boutique, nutrition, vétérinaire, IoT',
    home: ROLE_HOMES.client,
    account: DEMO_ACCOUNTS.find((a) => a.role === 'client'),
    features: [
      'Catalogue produits, panier, checkout Stripe',
      'Fidélité, factures, dossier médical animal',
      'Smart Hub — assistant vocal, nutrition, traçabilité',
      'Recommandations personnalisées par profil animal',
      'Chatbot client — commandes, promos, vétérinaire',
    ],
    interfaces: [
      { label: 'Boutique', path: '/client-products', desc: 'Catalogue & promotions' },
      { label: 'Commandes', path: '/client-orders', desc: 'Suivi livraison' },
      { label: 'Smart Hub', path: '/client-smart-hub', desc: 'IoT, vocal, outils' },
      { label: 'Recommandations', path: '/client-recommendations', desc: 'Reco hybride' },
      { label: 'Dossier médical', path: '/medical-dossier', desc: 'Santé animal' },
      { label: 'Checkout', path: '/checkout', desc: 'Paiement en ligne' },
    ],
    accent: '#2563eb',
  },
  {
    role: 'vendor',
    icon: '🏬',
    title: 'Vendeur',
    tagline: 'Marketplace, stock, marketing vendeur',
    home: ROLE_HOMES.vendor,
    account: DEMO_ACCOUNTS.find((a) => a.role === 'vendor'),
    features: [
      'Catalogue, stock, commissions (~12 %)',
      'Assistant ML — prévisions rupture',
      'Marketing vendeur — réseaux sociaux, notifications',
      'Traçabilité blockchain, IoT distributeur',
      'Chatbot vendeur — benchmark KPI marketplace',
    ],
    interfaces: [
      { label: 'Dashboard', path: '/vendor/dashboard', desc: 'CA & commissions' },
      { label: 'Marketing', path: '/vendor/marketing', desc: 'Social, campagnes' },
      { label: 'Produits', path: '/vendor/products', desc: 'Catalogue vendeur' },
      { label: 'Assistant ML', path: '/vendor/ml', desc: 'Alertes stock' },
      { label: 'Recommandations', path: '/vendor/recommendations', desc: 'Top avis clients' },
    ],
    accent: '#0d9488',
  },
  {
    role: 'moderator',
    icon: '🛡️',
    title: 'Modérateur',
    tagline: 'Anti-fraude, contenu, litiges',
    home: ROLE_HOMES.moderator,
    account: DEMO_ACCOUNTS.find((a) => a.role === 'moderator'),
    features: [
      'Validation vendeurs et produits',
      'Centre anti-fraude, remboursements litigieux',
      'Avis NLP signalés, messagerie multi-rôles',
      'Analytics modération & BI',
      'Chatbot — KPI produits mal notés',
    ],
    interfaces: [
      { label: 'Dashboard', path: '/moderator/dashboard', desc: 'File d\'attente' },
      { label: 'Anti-fraude', path: '/moderator/fraud', desc: 'Litiges suspects' },
      { label: 'Contenu', path: '/moderator/content', desc: 'Produits à valider' },
      { label: 'Analytics', path: '/moderator/analytics', desc: 'KPIs modération' },
      { label: 'Messagerie', path: '/moderator/messages', desc: 'Contact acteurs' },
    ],
    accent: '#d97706',
  },
  {
    role: 'livreur',
    icon: '🛵',
    title: 'Livreur',
    tagline: 'Tournées, carte, gains',
    home: ROLE_HOMES.livreur,
    account: DEMO_ACCOUNTS.find((a) => a.role === 'livreur'),
    features: [
      'Commandes du jour, preuve de livraison',
      'Carte & itinéraire optimisé',
      'Gains, statistiques, disponibilité',
      'Assistant ML charge de travail',
      'Chatbot — volume colis par catégorie',
    ],
    interfaces: [
      { label: 'Dashboard', path: '/livreur/dashboard', desc: 'Tournée du jour' },
      { label: 'Commandes', path: '/livreur/orders', desc: 'Statuts livraison' },
      { label: 'Carte', path: '/livreur/map', desc: 'Points GPS' },
      { label: 'Gains', path: '/livreur/earnings', desc: 'Commissions' },
      { label: 'Statistiques', path: '/livreur/stats', desc: 'Performance' },
    ],
    accent: '#059669',
  },
  {
    role: 'vet',
    icon: '🩺',
    title: 'Vétérinaire',
    tagline: 'Clinique, ordonnances, téléconsult',
    home: ROLE_HOMES.vet,
    account: DEMO_ACCOUNTS.find((a) => a.role === 'vet'),
    features: [
      'Agenda RDV, dossiers médicaux',
      'Ordonnances, diagnostics assistés IA',
      'Téléconsultation, agent ML clinique',
      'Dashboard BI clinique',
      'Chatbot vétérinaire — protocoles, urgence',
    ],
    interfaces: [
      { label: 'Dashboard', path: '/vet/dashboard', desc: 'Activité clinique' },
      { label: 'Calendrier', path: '/vet/calendar', desc: 'RDV patients' },
      { label: 'Dossiers', path: '/vet/medical-dossiers', desc: 'Historique médical' },
      { label: 'Téléconsult', path: '/vet/teleconsult', desc: 'Visio sécurisée' },
      { label: 'Agent ML', path: '/vet/ml-agent', desc: 'Aide diagnostic' },
    ],
    accent: '#4f46e5',
  },
  {
    role: 'visitor',
    icon: '👀',
    title: 'Visiteur',
    tagline: 'Sans compte — découverte',
    home: '/',
    account: null,
    features: [
      'Landing marketing, newsletter, codes promo',
      'Outils nutrition & comparateur produits',
      'Hub vendeur / modérateur (présentation)',
      'Chatbot visiteur — catalogue, devenir vendeur',
    ],
    interfaces: [
      { label: 'Accueil', path: '/', desc: 'Landing marketing' },
      { label: 'Fonctionnalités', path: '/enterprise', desc: 'Vue entreprise' },
      { label: 'Hub vendeur', path: '/vendor', desc: 'Devenir partenaire' },
      { label: 'Intelligence IA', path: '/intelligence', desc: 'ML & reco' },
      { label: 'Démo jury', path: '/jury-demo', desc: 'Cette page' },
    ],
    accent: '#38bdf8',
  },
];

export const CHATBOT_DEMO_POINTS = [
  { title: 'Multilingue FR / EN / AR', detail: 'platformChatbotEngine.js + détection automatique' },
  { title: 'Tous les acteurs', detail: 'ChatAssistant variant admin, client, vendor, moderator, livreur, vet, visitor' },
  { title: 'Message vocal', detail: 'useVoiceAssistant.js — micro + lecture TTS' },
  { title: 'KPI marketplace', detail: 'marketplaceKpiChat.service.js — 1 827 produits dataset' },
  { title: 'Recommandations dans le chat', detail: 'petRecommendation.service.js — cartes produits' },
  { title: 'Fallback offline', detail: 'Réponses locales si API indisponible' },
];

export const RECO_DEMO_POINTS = [
  { title: 'Hybride contenu + collaboratif', detail: 'fastapi_service/app/ml/recommendation_engine.py' },
  { title: 'Par profil animal', detail: 'backend/services/petRecommendation.service.js' },
  { title: 'NLP avis clients', detail: 'filter_by_reviews_nlp + reviewEnrichment' },
  { title: 'Fallback Node', detail: 'hybridRecommendationLocal.service.js si FastAPI down' },
  { title: 'API REST', detail: 'GET /api/recommendations/hybrid' },
];

export const MARKETING_DEMO = {
  ...MARKETING_DIGITAL_FEATURES,
  vendorRoute: '/vendor/marketing',
  juryRoute: '/jury-demo',
  demoSteps: [
    { step: 1, label: 'Landing & newsletter', path: '/' },
    { step: 2, label: 'Hub marketing admin', path: '/admin/digital-marketing' },
    { step: 3, label: 'Campagnes IA & entonnoir', path: '/admin/digital-marketing', tab: 'campaigns' },
    { step: 4, label: 'Audience live', path: '/admin/live-audience' },
    { step: 5, label: 'Marketing vendeur', path: '/vendor/marketing' },
  ],
};

/** Ordre du parcours vidéo jury */
export const JURY_VIDEO_TOUR = [
  { phase: 'Intro', path: '/jury-demo', pauseMs: 5000 },
  { phase: 'Landing', path: '/', pauseMs: 4000 },
  ...ACTOR_DEMO_INTERFACES.filter((a) => a.account).flatMap((actor) =>
    (actor.interfaces.slice(0, 3)).map((iface) => ({
      phase: `${actor.title} — ${iface.label}`,
      path: iface.path,
      pauseMs: 4500,
      loginAs: actor.role,
    })),
  ),
  { phase: 'Marketing admin', path: '/admin/digital-marketing', pauseMs: 6000, loginAs: 'admin' },
  { phase: 'Marketing vendeur', path: '/vendor/marketing', pauseMs: 5000, loginAs: 'vendor' },
];

export default ACTOR_DEMO_INTERFACES;
