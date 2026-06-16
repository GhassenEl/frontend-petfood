/** Assistant conversationnel visiteur — FAQ produits, nutrition, commandes, RDV véto */
const FAQ = [
  {
    keys: ['croquette', 'produit', 'catalogue', 'acheter', 'prix'],
    reply: () =>
      'Notre catalogue couvre croquettes, pâtées, friandises et accessoires pour chiens, chats et NAC. Utilisez la recherche intelligente avec une phrase naturelle ou parcourez /visitor/products. Créez un compte client pour commander.',
  },
  {
    keys: ['composition', 'nutrition', 'proteine', 'calorie', 'kcal', 'ingredient'],
    reply: () =>
      'Chaque fiche produit affiche composition et valeurs nutritionnelles (protéines, lipides, fibres). Le simulateur nutrition (/visitor/tools) estime les besoins caloriques selon poids, race et activité.',
  },
  {
    keys: ['commande', 'livraison', 'suivi', 'panier', 'payer'],
    reply: () =>
      'Pour passer commande : créez un compte client, ajoutez des produits au panier et validez (carte ou wallet). Suivi commande dans « Mes commandes ». Livraison à domicile ou point relais partenaire.',
  },
  {
    keys: ['veterinaire', 'veto', 'rdv', 'rendez-vous', 'consultation', 'teleconsult'],
    reply: () =>
      'Les clients connectés peuvent prendre RDV vétérinaire (/veterinary) ou une téléconsultation. L\'assistant IA vétérinaire (/client-vet-intelligence) oriente avant consultation — réservé aux comptes clients.',
  },
  {
    keys: ['allerg', 'sans cereale', 'hypoallerg', 'sterilis', 'stérilis'],
    reply: () =>
      'Essayez la recherche : « croquettes sans céréales pour chat stérilisé » ou « hypoallergénique chien senior ». Filtrez par espèce et consultez les compositions sur chaque fiche.',
  },
  {
    keys: ['compte', 'inscri', 'connexion', 'register', 'login'],
    reply: () =>
      'Inscription gratuite sur /register — accès boutique, fidélité, dossier médical animal et RDV vétérinaires. L\'espace visiteur reste accessible sans compte pour découvrir le catalogue.',
  },
];

const normalize = (s) =>
  String(s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

export const VISITOR_CHAT_QUICK = [
  'Quelles croquettes pour un chat stérilisé ?',
  'Comment passer une commande ?',
  'Prendre rendez-vous vétérinaire',
  'Où voir la composition nutritionnelle ?',
];

export const getVisitorAssistantReply = (message) => {
  const hay = normalize(message);
  for (const faq of FAQ) {
    if (faq.keys.some((k) => hay.includes(normalize(k)))) {
      return {
        message: faq.reply(),
        quickReplies: ['Autre question', 'Voir les produits', 'Créer un compte'],
      };
    }
  }
  return {
    message:
      'Je peux vous orienter sur les produits, la nutrition, les commandes et les rendez-vous vétérinaires. Précisez votre question ou utilisez la recherche intelligente avec une phrase complète.',
    quickReplies: VISITOR_CHAT_QUICK.slice(0, 3),
  };
};

export default getVisitorAssistantReply;
