/** Matrice d'interactions démo — co-achats / vues pour filtrage collaboratif */
export const DEMO_USER_INTERACTIONS = [
  { userId: 'client-demo', itemIds: ['demo-prod-croq', 'demo-prod-manteau', 'demo-prod-patee'], petType: 'dog', categories: ['nourriture', 'accessoire'], tags: ['premium', 'adulte'] },
  { userId: 'client-2', itemIds: ['demo-prod-croq', 'demo-prod-patee', 'prd_dog_1'], petType: 'dog', categories: ['nourriture'], tags: ['premium'] },
  { userId: 'client-3', itemIds: ['demo-prod-litiere-budget', 'prd_cat_1', 'prd_cat_3'], petType: 'cat', categories: ['nourriture', 'hygiene'], tags: ['chat'] },
  { userId: 'client-4', itemIds: ['demo-prod-croq', 'prd_dog_3', 'demo-prod-manteau'], petType: 'dog', categories: ['nourriture'], tags: ['chien'] },
  { userId: 'vet-demo', itemIds: ['med-shampoo', 'med-anti-inflam', 'med-vaccin-rage'], focus: ['dermatite', 'arthrose'], tags: ['clinique'] },
  { userId: 'vet-2', itemIds: ['med-shampoo', 'med-antiparasitaire', 'nut-hypo'], focus: ['dermatite'], tags: ['chat'] },
  { userId: 'vendor-demo', itemIds: ['prd_dog_1', 'prd_cat_1', 'prd_cat_3'], categories: ['nourriture'], tags: ['stock_bas'] },
  { userId: 'livreur-demo', itemIds: ['liv-order-101', 'liv-order-103', 'liv-order-105'], categories: ['en_cours'], tags: ['tunis', 'prioritaire'] },
  { userId: 'admin-demo', itemIds: ['prd_cat_3', 'vendor-ridha', 'promo-anniv'], tags: ['pricing', 'moderation'] },
];

export const ROLE_PIPELINE_META = {
  client: {
    title: 'Recommandations produits & services',
    subtitle: 'Filtrage contenu (profil animal, historique) + utilisateurs similaires',
    contentWeight: 0.55,
    collabWeight: 0.45,
  },
  vet: {
    title: 'Recommandations cliniques',
    subtitle: 'Protocoles, médicaments et nutrition selon cas similaires',
    contentWeight: 0.5,
    collabWeight: 0.5,
  },
  admin: {
    title: 'Recommandations plateforme',
    subtitle: 'Produits à promouvoir, vendeurs et actions pricing',
    contentWeight: 0.6,
    collabWeight: 0.4,
  },
  vendor: {
    title: 'Recommandations catalogue',
    subtitle: 'Réassort, cross-sell et pricing selon pairs vendeurs',
    contentWeight: 0.5,
    collabWeight: 0.5,
  },
  livreur: {
    title: 'Recommandations tournées',
    subtitle: 'Priorisation livraisons selon historique et zones similaires',
    contentWeight: 0.45,
    collabWeight: 0.55,
  },
  moderator: {
    title: 'Recommandations modération',
    subtitle: 'Contenus à revoir selon signalements et modérateurs similaires',
    contentWeight: 0.65,
    collabWeight: 0.35,
  },
};

export default { DEMO_USER_INTERACTIONS, ROLE_PIPELINE_META };
