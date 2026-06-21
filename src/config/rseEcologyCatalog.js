/**
 * Référentiel RSE — écologie, nature, environnement & responsabilité sociale.
 */

export const RSE_PILLARS = [
  {
    id: 'ecology',
    icon: '♻️',
    label: 'Écologie',
    color: '#059669',
    light: '#ecfdf5',
    description: 'Économie circulaire, anti-gaspillage, emballages responsables et circuits courts.',
    kpis: [
      { label: 'Gaspillage évité', value: '1 240 kg', trend: '+12 %' },
      { label: 'Emballages recyclables', value: '78 %', trend: '+5 %' },
      { label: 'Produits locaux', value: '62 %', trend: '+8 %' },
    ],
  },
  {
    id: 'nature',
    icon: '🌿',
    label: 'Nature & biodiversité',
    color: '#16a34a',
    light: '#dcfce7',
    description: 'Protection des espèces, refuges partenaires, reboisement et habitats naturels.',
    kpis: [
      { label: 'Refuges soutenus', value: '18', trend: '+3' },
      { label: 'Arbres plantés', value: '4 200', trend: '+850' },
      { label: 'Espèces protégées', value: '34', trend: '+6' },
    ],
  },
  {
    id: 'environment',
    icon: '🌍',
    label: 'Environnement',
    color: '#0284c7',
    light: '#e0f2fe',
    description: 'Empreinte carbone, eau, énergie renouvelable et logistique bas carbone.',
    kpis: [
      { label: 'CO₂ / livraison', value: '0,82 kg', trend: '−18 %' },
      { label: 'Eau économisée', value: '12 400 L', trend: '+9 %' },
      { label: 'Énergie verte hubs', value: '40 %', trend: '+6 %' },
    ],
  },
  {
    id: 'social',
    icon: '🤝',
    label: 'RSE sociale',
    color: '#7c3aed',
    light: '#ede9fe',
    description: 'Emploi local, formation, inclusion, bien-être animal et engagement communautaire.',
    kpis: [
      { label: 'Emplois locaux', value: '156', trend: '+24' },
      { label: 'Heures bénévolat', value: '2 840 h', trend: '+320 h' },
      { label: 'Formations RSE', value: '94 %', trend: '+11 %' },
    ],
  },
];

export const NATURE_INITIATIVES = [
  {
    id: 'refuges',
    icon: '🏠',
    title: 'Partenariats refuges & associations',
    description: 'Dons alimentaires, kits d\'accueil et campagnes d\'adoption responsable.',
    impact: '340 animaux secourus en 2025',
    status: 'actif',
    partners: ['SPA Tunis', 'Refuge Nabeul', 'Association Terre & Pattes'],
  },
  {
    id: 'reforestation',
    icon: '🌳',
    title: 'Reboisement & espaces verts',
    description: '1 arbre planté pour 50 commandes éco-labellisées — zones Sahel et Nord-Ouest.',
    impact: '4 200 arbres depuis 2023',
    status: 'actif',
    partners: ['ONF Tunisie', 'EcoSahel'],
  },
  {
    id: 'wetlands',
    icon: '🦆',
    title: 'Protection zones humides',
    description: 'Soutien aux écosystèmes côtiers et migration aviaire — capteurs IoT qualité eau.',
    impact: '3 sites protégés',
    status: 'actif',
    partners: ['BirdLife Tunisie'],
  },
  {
    id: 'wildlife',
    icon: '🦊',
    title: 'Faune sauvage & NAC',
    description: 'Programmes éducation NAC, lutte contre le commerce illégal et soins spécialisés.',
    impact: '12 espèces NAC suivies',
    status: 'actif',
    partners: ['Cliniques vétérinaires partenaires'],
  },
  {
    id: 'beaches',
    icon: '🏖️',
    title: 'Nettoyage côtes & océans',
    description: 'Journées citoyennes avec livreurs et clients — plastiques récupérés et recyclés.',
    impact: '2,8 t déchets retirés',
    status: 'saisonnier',
    partners: ['Municipalités côtières'],
  },
];

export const ECOLOGY_ACTIONS = [
  {
    id: 'waste-ia',
    icon: '🤖',
    title: 'IA anti-gaspillage',
    description: 'Prédiction de la demande, redistribution des lots proches de la péremption.',
    metric: '1 240 kg évités',
    route: '/food-quality-surveillance',
  },
  {
    id: 'eco-pack',
    icon: '📦',
    title: 'Emballages éco-conçus',
    description: 'Matériaux recyclables, réduction plastique −40 %, certification FSC.',
    metric: '78 % recyclables',
    route: '/compliance#packaging',
  },
  {
    id: 'local',
    icon: '🇹🇳',
    title: 'Circuit court tunisien',
    description: 'Priorité aux producteurs locaux certifiés bio et agriculture raisonnée.',
    metric: '62 % produits locaux',
    route: '/client-products',
  },
  {
    id: 'compost',
    icon: '🍂',
    title: 'Compostage & zéro déchet entrepôt',
    description: 'Tri sélectif, compostage organique et recyclage partenaires.',
    metric: '94 % déchets valorisés',
    route: '/compliance#waste',
  },
];

export const ECO_PRODUCT_LABELS = [
  { id: 'bio', icon: '🌾', label: 'Bio', color: '#16a34a' },
  { id: 'local', icon: '🇹🇳', label: 'Local', color: '#dc2626' },
  { id: 'recyclable', icon: '♻️', label: 'Recyclable', color: '#0284c7' },
  { id: 'low-carbon', icon: '🌱', label: 'Bas carbone', color: '#059669' },
  { id: 'cruelty-free', icon: '🐾', label: 'Cruelty-free', color: '#7c3aed' },
  { id: 'refuge-donation', icon: '❤️', label: 'Don refuge', color: '#e11d48' },
];

export const ECO_PLEDGES = [
  { id: 'eco-delivery', label: 'Choisir la livraison groupée (moins de CO₂)', co2Saved: 0.3 },
  { id: 'recyclable-pack', label: 'Privilégier les emballages recyclables', co2Saved: 0.1 },
  { id: 'local-products', label: 'Acheter des produits locaux certifiés', co2Saved: 0.2 },
  { id: 'tree-planting', label: 'Contribuer au programme 1 arbre / 50 commandes', co2Saved: 0.5 },
  { id: 'refuge-support', label: 'Soutenir un refuge partenaire', co2Saved: 0 },
];

export const RSE_TIMELINE = [
  { year: '2023', event: 'Lancement programme zéro gaspillage IA et compensation carbone livraisons.' },
  { year: '2024', event: 'Partenariat 12 refuges — 1 800 arbres plantés, emballages 100 % recyclables objectif.' },
  { year: '2025', event: 'Hub RSE plateforme, capteurs IoT qualité eau zones humides, formation RSE 94 % équipes.' },
  { year: '2026', event: 'Objectif −30 % CO₂ logistique, extension reboisement Sahel, label PetfoodTN Green.' },
  { year: '2027', event: 'Neutralité carbone livraisons Grand Tunis — compensation vérifiée tiers.' },
];

export const ROLE_RSE_FOCUS = {
  client: {
    title: 'Mon impact écologique',
    subtitle: 'Suivez votre empreinte, adoptez des gestes responsables et soutenez la nature.',
    tabs: ['panorama', 'ecology', 'nature', 'environment', 'impact'],
  },
  admin: {
    title: 'Pilotage RSE plateforme',
    subtitle: 'Tableau de bord écologie, nature, environnement et responsabilité sociale.',
    tabs: ['panorama', 'ecology', 'nature', 'environment', 'social', 'timeline'],
  },
  vendor: {
    title: 'RSE vendeur partenaire',
    subtitle: 'Engagements écologiques, emballages responsables et circuit court.',
    tabs: ['panorama', 'ecology', 'nature', 'social'],
  },
  livreur: {
    title: 'Logistique verte',
    subtitle: 'Optimisation CO₂, tournées éco et engagement environnemental.',
    tabs: ['panorama', 'environment', 'ecology', 'impact'],
  },
  public: {
    title: 'RSE PetfoodTN',
    subtitle: 'Écologie, nature, environnement et responsabilité sociale au service des animaux.',
    tabs: ['panorama', 'ecology', 'nature', 'environment', 'social', 'timeline'],
  },
};

export default {
  RSE_PILLARS,
  NATURE_INITIATIVES,
  ECOLOGY_ACTIONS,
  ECO_PRODUCT_LABELS,
  ECO_PLEDGES,
  RSE_TIMELINE,
  ROLE_RSE_FOCUS,
};
