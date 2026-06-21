/** Données de démonstration lorsque l'API renvoie des listes vides (espace client). */

import { getProductTraceabilityCerts } from '../config/platformComplianceCatalog';

const daysAgo = (n) => new Date(Date.now() - n * 86400000).toISOString();
const hoursAgo = (n) => new Date(Date.now() - n * 3600000).toISOString();
const daysAhead = (n) => new Date(Date.now() + n * 86400000).toISOString();

export const DEMO_ORDERS = [
  {
    _id: 'demo-order-001',
    id: 'demo-order-001',
    status: 'delivered',
    total: 89.5,
    createdAt: daysAgo(12),
    paymentMethod: 'wallet',
    items: [
      { quantity: 1, price: 54.9, productId: { _id: 'demo-prod-croq', id: 'demo-prod-croq', name: 'Croquettes Premium Chien Adulte 12 kg', category: 'nourriture', animalType: 'dog' } },
      { quantity: 1, price: 34.6, productId: { _id: 'demo-prod-manteau', id: 'demo-prod-manteau', name: 'Manteau chien taille M', category: 'accessoire', animalType: 'dog' } },
    ],
  },
  {
    _id: 'demo-order-002',
    id: 'demo-order-002',
    status: 'shipped',
    total: 42.0,
    createdAt: daysAgo(2),
    paymentMethod: 'stripe',
    items: [{ quantity: 2, price: 21.0, productId: { name: 'Pâtée chat saumon 400 g' } }],
  },
  {
    _id: 'demo-order-003',
    id: 'demo-order-003',
    status: 'pending',
    total: 28.5,
    createdAt: daysAgo(0),
    paymentMethod: 'paypal',
    items: [{ quantity: 1, price: 28.5, productId: { name: 'Jouet os caoutchouc naturel' } }],
  },
];

export const DEMO_INVOICES = [
  {
    _id: 'demo-inv-001',
    id: 'demo-inv-001',
    amount: 89.5,
    status: 'paid',
    paymentMethod: 'wallet',
    issuedAt: daysAgo(11),
    order: { _id: 'demo-order-001', id: 'demo-order-001', items: DEMO_ORDERS[0].items },
  },
  {
    _id: 'demo-inv-002',
    id: 'demo-inv-002',
    amount: 42.0,
    status: 'pending',
    paymentMethod: 'stripe',
    issuedAt: daysAgo(2),
    order: { _id: 'demo-order-002', id: 'demo-order-002', items: DEMO_ORDERS[1].items },
  },
];

export const DEMO_REVIEWS = [
  {
    _id: 'demo-rev-001',
    id: 'demo-rev-001',
    rating: 5,
    emotion: 'happy',
    comment: 'Excellent manteau, taille M parfaite pour mon berger. Tissu résistant et confortable.',
    createdAt: daysAgo(10),
    productId: { _id: 'demo-prod-manteau', name: 'Manteau chien taille M' },
  },
  {
    _id: 'demo-rev-002',
    id: 'demo-rev-002',
    rating: 4,
    emotion: 'satisfied',
    comment: 'Croquettes de bonne qualité, mon chien les adore. Livraison rapide au magasin le plus proche.',
    createdAt: daysAgo(8),
    productId: { _id: 'demo-prod-croq', name: 'Croquettes Premium Chien Adulte 12 kg' },
  },
  {
    _id: 'demo-rev-003',
    id: 'demo-rev-003',
    rating: 5,
    emotion: 'happy',
    comment: 'Excellente digestibilité, selles normales et pelage brillant après 3 semaines. Rapport qualité-prix top.',
    createdAt: daysAgo(14),
    productId: { _id: 'demo-prod-croq', name: 'Croquettes Premium Chien Adulte 12 kg' },
  },
  {
    _id: 'demo-rev-004',
    id: 'demo-rev-004',
    rating: 2,
    emotion: 'disappointed',
    comment: 'Mon chien refuse parfois le goût. Emballage un peu fragile à réception.',
    createdAt: daysAgo(5),
    productId: { _id: 'demo-prod-croq', name: 'Croquettes Premium Chien Adulte 12 kg' },
  },
  {
    _id: 'demo-rev-005',
    id: 'demo-rev-005',
    rating: 4,
    emotion: 'satisfied',
    comment: 'Bonne énergie et appétence au quotidien. Un peu cher mais qualité premium.',
    createdAt: daysAgo(2),
    productId: { _id: 'demo-prod-croq', name: 'Croquettes Premium Chien Adulte 12 kg' },
  },
  {
    _id: 'demo-rev-006',
    id: 'demo-rev-006',
    rating: 1,
    emotion: 'angry',
    comment: 'Litière qui sent très fort, mon chat refuse parfois. Emballage arrivé déchiré.',
    createdAt: daysAgo(4),
    productId: { _id: 'demo-prod-litiere-budget', name: 'Litière budget chat 5 L' },
  },
  {
    _id: 'demo-rev-007',
    id: 'demo-rev-007',
    rating: 2,
    emotion: 'disappointed',
    comment: 'Mauvaise agglomération, poussière et odeur désagréable. Je ne rachèterai pas.',
    createdAt: daysAgo(3),
    productId: { _id: 'demo-prod-litiere-budget', name: 'Litière budget chat 5 L' },
  },
  {
    _id: 'demo-rev-spam-001',
    id: 'demo-rev-spam-001',
    rating: 5,
    emotion: 'neutral',
    comment: 'CLIQUEZ ICI www.promo-gratuit.tn — gagnez un iPhone!!! Meilleur produit du monde 5 etoiles',
    createdAt: daysAgo(1),
    productId: { _id: 'demo-prod-croq', name: 'Croquettes Premium Chien Adulte 12 kg' },
  },
  {
    _id: 'demo-rev-ai-001',
    id: 'demo-rev-ai-001',
    rating: 5,
    emotion: 'neutral',
    comment: 'En tant que propriétaire, je recommande vivement ce produit sans hésitation. Dans l\'ensemble, il répond parfaitement à mes attentes et offre un excellent rapport qualité-prix.',
    createdAt: daysAgo(2),
    productId: { _id: 'demo-prod-croq', name: 'Croquettes Premium Chien Adulte 12 kg' },
  },
];

export const DEMO_COMPLAINTS = [
  {
    _id: 'demo-comp-001',
    id: 'demo-comp-001',
    subject: 'Produit produit',
    category: 'product',
    message: 'Un article du pack était légèrement abîmé à réception — remplacement demandé.',
    status: 'resolved',
    createdAt: daysAgo(20),
  },
  {
    _id: 'demo-comp-002',
    id: 'demo-comp-002',
    subject: 'Paiement ou facture',
    category: 'payment',
    message: 'Facture en double sur la commande #002 — merci de vérifier le montant débité.',
    status: 'in_progress',
    createdAt: daysAgo(3),
  },
];

export const DEMO_LOYALTY = {
  points: 142,
  ledger: [
    { id: 'l1', label: 'Commande croquettes premium', points: 55, date: daysAgo(12) },
    { id: 'l2', label: 'Toilettage complet Max', points: 45, date: daysAgo(25) },
    { id: 'l2b', label: 'Bonus fidélité mensuel', points: 20, date: daysAgo(30) },
    { id: 'l3', label: 'Manteau chien taille M', points: 22, date: daysAgo(10) },
  ],
};

export const DEMO_LOYALTY_OFFERS = {
  points: 142,
  products: [
    { _id: 'demo-off-1', name: 'Friandises naturelles chien', price: 18.9, discount: 15 },
    { _id: 'demo-off-2', name: 'Shampoing doux chat', price: 12.5, discount: 10 },
  ],
};

export const DEMO_COMMUNITY_POSTS = [
  {
    id: 'cp-1',
    type: 'photo',
    authorId: 'u-sarra',
    authorName: 'Sarra B.',
    authorAvatar: '🐕',
    content: 'Max après sa promenade du matin — toujours aussi énergique à 8 ans !',
    productName: null,
    likes: 24,
    comments: 5,
    createdAt: hoursAgo(3),
  },
  {
    id: 'cp-2',
    type: 'tip',
    authorId: 'u-karim',
    authorName: 'Karim M.',
    authorAvatar: '🐈',
    content: 'Conseil : introduisez une nouvelle croquette sur 10 jours (75 % ancienne / 25 % nouvelle la première semaine) pour éviter les troubles digestifs.',
    productName: null,
    likes: 41,
    comments: 12,
    createdAt: hoursAgo(8),
  },
  {
    id: 'cp-3',
    type: 'experience',
    authorId: 'u-leila',
    authorName: 'Leila H.',
    authorAvatar: '🐾',
    content: 'Après 3 semaines avec la fontaine connectée PetfoodTN, mon chat boit 30 % plus d\'eau. Le rappel mobile est très pratique quand je suis au bureau.',
    productName: 'Fontaine connectée',
    likes: 18,
    comments: 4,
    createdAt: daysAgo(1),
  },
  {
    id: 'cp-4',
    type: 'review',
    authorId: 'u-me',
    authorName: 'Vous',
    authorAvatar: '👤',
    content: 'Excellent rapport qualité-prix, croquettes bien tolérées par mon berger malinois actif. Livraison rapide.',
    productName: 'Croquettes Premium Chien Adulte 12 kg',
    rating: 5,
    likes: 9,
    comments: 2,
    createdAt: daysAgo(5),
  },
  {
    id: 'cp-5',
    type: 'tip',
    authorId: 'u-amine',
    authorName: 'Amine T.',
    authorAvatar: '🦴',
    content: 'Pour les friandises d\'éducation : morceaux de 5 mm max, comptez 10 % max des calories journalières pour ne pas déséquilibrer le régime.',
    productName: null,
    likes: 33,
    comments: 7,
    createdAt: daysAgo(2),
  },
];

export const DEMO_COMMUNITY_MEMBERS = [
  {
    id: 'u-me',
    name: 'Vous',
    avatar: '👤',
    posts: DEMO_COMMUNITY_POSTS.filter((p) => p.authorId === 'u-me'),
    reviews: [{ rating: 5, text: 'Excellent rapport qualité-prix…' }],
    likesReceived: 9,
    helpfulVotes: 3,
  },
  {
    id: 'u-karim',
    name: 'Karim M.',
    avatar: '🐈',
    posts: DEMO_COMMUNITY_POSTS.filter((p) => p.authorId === 'u-karim'),
    reviews: [],
    likesReceived: 41,
    helpfulVotes: 15,
  },
  {
    id: 'u-sarra',
    name: 'Sarra B.',
    avatar: '🐕',
    posts: DEMO_COMMUNITY_POSTS.filter((p) => p.authorId === 'u-sarra'),
    reviews: [{ rating: 4, text: 'Très bon produit' }],
    likesReceived: 24,
    helpfulVotes: 8,
  },
  {
    id: 'u-leila',
    name: 'Leila H.',
    avatar: '🐾',
    posts: DEMO_COMMUNITY_POSTS.filter((p) => p.authorId === 'u-leila'),
    reviews: [],
    likesReceived: 18,
    helpfulVotes: 6,
  },
  {
    id: 'u-amine',
    name: 'Amine T.',
    avatar: '🦴',
    posts: DEMO_COMMUNITY_POSTS.filter((p) => p.authorId === 'u-amine'),
    reviews: [{ rating: 5, text: 'Parfait pour l\'éducation' }],
    likesReceived: 33,
    helpfulVotes: 11,
  },
];

export const DEMO_FAVORITES = [
  {
    _id: 'demo-fav-1',
    id: 'demo-fav-1',
    name: 'Manteau chien taille M',
    price: 34.6,
    stock: 8,
    animalType: 'dog',
    category: 'vetements',
    description: 'Manteau imperméable doublé polaire — taille M (25–32 cm dos).',
    imageUrl: '/images/placeholders/product-clothing.svg',
  },
  {
    _id: 'demo-fav-2',
    id: 'demo-fav-2',
    name: 'Croquettes Premium Chien Adulte 12 kg',
    price: 54.9,
    stock: 15,
    animalType: 'dog',
    category: 'nourriture',
    description: 'Formule riche en protéines pour chien actif.',
    imageUrl: '/images/iot/bowl-kibble.jpg',
  },
];

export const DEMO_SERVICE_RATINGS = [
  {
    id: 'demo-sr-1',
    type: 'grooming',
    rating: 5,
    comment: 'Toilettage soigné, équipe très douce avec mon chien anxieux.',
    createdAt: daysAgo(14),
  },
  {
    id: 'demo-sr-1b',
    type: 'nail_trim',
    rating: 5,
    comment: 'Coupe griffes rapide et sans stress pour Luna.',
    createdAt: daysAgo(9),
  },
  {
    id: 'demo-sr-1c',
    type: 'wellness_pack',
    rating: 5,
    comment: 'Forfait bien-être excellent — toilettage, bain et griffes en une visite.',
    createdAt: daysAgo(7),
  },
  {
    id: 'demo-sr-1d',
    type: 'home_sitting',
    rating: 5,
    comment: 'Garde à domicile sur 3 jours — photos et nouvelles chaque matin.',
    createdAt: daysAgo(5),
  },
  {
    id: 'demo-sr-1e',
    type: 'dental_cleaning',
    rating: 4,
    comment: 'Nettoyage dentaire efficace, haleine nettement améliorée.',
    createdAt: daysAgo(18),
  },
  {
    id: 'demo-sr-2',
    type: 'veterinary',
    rating: 4,
    comment: 'Consultation claire et suivi vaccinal à jour. Accueil chaleureux.',
    createdAt: daysAgo(30),
  },
  {
    id: 'demo-sr-3',
    type: 'boarding',
    rating: 5,
    comment: 'Pension 3 nuits — photos quotidiennes et promenades régulières.',
    createdAt: daysAgo(45),
  },
  {
    id: 'demo-sr-4',
    type: 'delivery',
    rating: 5,
    comment: 'Livraison rapide et livreur très professionnel.',
    createdAt: daysAgo(3),
  },
];

export const SERVICE_RATE_CARDS = [
  { type: 'grooming', label: 'Toilettage complet', icon: '✂️', basePrice: 45, unit: 'session', avgRating: 4.8, reviewCount: 124, description: 'Coupe, brossage et soins du pelage.' },
  { type: 'bathing', label: 'Bain & soins', icon: '🛁', basePrice: 35, unit: 'session', avgRating: 4.6, reviewCount: 89, description: 'Shampooing adapté, séchage et parfum doux.' },
  { type: 'nail_trim', label: 'Coupe griffes', icon: '💅', basePrice: 15, unit: 'session', avgRating: 4.7, reviewCount: 56, description: 'Coupe sécurisée — chien, chat et NAC.' },
  { type: 'dental_cleaning', label: 'Nettoyage dentaire', icon: '🦷', basePrice: 50, unit: 'session', avgRating: 4.6, reviewCount: 41, description: 'Détartrage doux et conseils hygiène bucco-dentaire.' },
  {
    type: 'wellness_pack',
    label: 'Forfait bien-être',
    icon: '✨',
    basePrice: 85,
    unit: 'forfait',
    avgRating: 4.9,
    reviewCount: 92,
    description: 'Toilettage + bain + griffes — pack -10 % (95 → 85 DT).',
    badge: '-10 %',
  },
  {
    type: 'home_sitting',
    label: 'Garde à domicile',
    icon: '🏡',
    basePrice: 40,
    unit: 'jour',
    avgRating: 4.8,
    reviewCount: 73,
    description: 'Pet-sitting chez vous — repas, promenade et nouvelles quotidiennes.',
  },
  { type: 'boarding', label: 'Pension', icon: '🏠', basePrice: 35, unit: 'jour', avgRating: 4.9, reviewCount: 67, description: 'Hébergement en chenil partenaire avec sorties.' },
  { type: 'training', label: 'Dressage', icon: '🎓', basePrice: 60, unit: 'session', avgRating: 4.5, reviewCount: 42, description: 'Éducation positive — chiot ou rappel.' },
  { type: 'rehabilitation', label: 'Réhabilitation refuges', icon: '💚', basePrice: 0, unit: 'don', avgRating: 5.0, reviewCount: 38, description: 'Soutien aux refuges partenaires.' },
  { type: 'daycare', label: 'Garderie journée', icon: '🌞', basePrice: 28, unit: 'jour', avgRating: 4.7, reviewCount: 51, description: 'Garde de jour avec socialisation.' },
  { type: 'veterinary', label: 'Consultation véto', icon: '🩺', basePrice: 55, unit: 'consultation', avgRating: 4.8, reviewCount: 210, description: 'Sur rendez-vous — espace Santé vétérinaire.' },
  { type: 'delivery', label: 'Livraison', icon: '🚚', basePrice: 0, unit: 'commande', avgRating: 4.7, reviewCount: 156, description: 'Notez la livraison après réception de votre commande.' },
];

export const DEMO_FEEDER_HISTORY = [
  { id: 'fh1', type: 'dispense', grams: 30, label: 'Petit-déjeuner', createdAt: daysAgo(0) },
  { id: 'fh2', type: 'dispense', grams: 35, label: 'Déjeuner', createdAt: daysAgo(0) },
  { id: 'fh3', type: 'alert', message: 'Niveau croquettes bas (18 %)', createdAt: daysAgo(1) },
  { id: 'fh4', type: 'dispense', grams: 30, label: 'Dîner', createdAt: daysAgo(1) },
  { id: 'fh5', type: 'schedule', message: 'Horaire 08:00 activé — 30 g', createdAt: daysAgo(2) },
];

export const DEMO_FEEDER_SCHEDULE = [
  { id: 'sch-1', time: '08:00', portionGrams: 30, label: 'Petit-déjeuner', enabled: true },
  { id: 'sch-2', time: '13:00', portionGrams: 35, label: 'Déjeuner', enabled: true },
  { id: 'sch-3', time: '19:30', portionGrams: 30, label: 'Dîner', enabled: true },
];

export const DEMO_FEEDER_PETS = [
  { id: 'demo-pet-1', name: 'Max', type: 'dog', portionGrams: 95, dailyKcal: 890 },
  { id: 'demo-pet-2', name: 'Luna', type: 'cat', portionGrams: 55, dailyKcal: 240 },
];

/** Animaux démo pour nutrition (poids, race, âge). */
export const DEMO_NUTRITION_PETS = [
  {
    id: 'demo-nut-1',
    _id: 'demo-nut-1',
    name: 'Max',
    type: 'dog',
    breed: 'Labrador',
    weight: 28,
    weightKg: 28,
    birthDate: daysAgo(Math.round(5 * 365.25)),
    sex: 'M',
    isNeutered: true,
    allergies: 'Poulet',
  },
  {
    id: 'demo-nut-2',
    _id: 'demo-nut-2',
    name: 'Luna',
    type: 'cat',
    breed: 'Européen',
    weight: 4.2,
    weightKg: 4.2,
    birthDate: daysAgo(Math.round(3 * 365.25)),
    sex: 'F',
    isNeutered: true,
  },
  {
    id: 'demo-nut-3',
    _id: 'demo-nut-3',
    name: 'Rex',
    type: 'dog',
    breed: 'Berger allemand',
    weight: 32,
    weightKg: 32,
    birthDate: daysAgo(Math.round(8 * 365.25)),
    sex: 'M',
    isNeutered: true,
    chronicDiseases: 'Arthrose légère',
  },
  {
    id: 'demo-nut-4',
    _id: 'demo-nut-4',
    name: 'Aziza',
    type: 'dog',
    breed: 'Sloughi',
    weight: 20,
    weightKg: 20,
    birthDate: daysAgo(Math.round(4 * 365.25)),
    sex: 'F',
    isNeutered: true,
  },
  {
    id: 'demo-nut-5',
    _id: 'demo-nut-5',
    name: 'Mous',
    type: 'cat',
    breed: 'Chat tunisien',
    weight: 4,
    weightKg: 4,
    birthDate: daysAgo(Math.round(2 * 365.25)),
    sex: 'F',
    isNeutered: true,
  },
  {
    id: 'demo-nut-6',
    _id: 'demo-nut-6',
    name: 'Pico',
    type: 'bird',
    breed: 'Perruche',
    weight: 0.04,
    weightKg: 0.04,
    birthDate: daysAgo(Math.round(2 * 365.25)),
    sex: 'M',
    isNeutered: false,
  },
  {
    id: 'demo-nut-7',
    _id: 'demo-nut-7',
    name: 'Nemo',
    type: 'fish',
    breed: 'Poisson rouge',
    weight: 0.02,
    weightKg: 0.02,
    birthDate: daysAgo(Math.round(1 * 365.25)),
    sex: 'M',
    isNeutered: false,
  },
  {
    id: 'demo-nut-8',
    _id: 'demo-nut-8',
    name: 'Coco',
    type: 'rabbit',
    breed: 'Nain',
    weight: 1.8,
    weightKg: 1.8,
    birthDate: daysAgo(Math.round(3 * 365.25)),
    sex: 'F',
    isNeutered: true,
  },
  {
    id: 'demo-nut-9',
    _id: 'demo-nut-9',
    name: 'Chip',
    type: 'hamster',
    breed: 'Syrien',
    weight: 0.12,
    weightKg: 0.12,
    birthDate: daysAgo(Math.round(1 * 365.25)),
    sex: 'M',
    isNeutered: false,
  },
  {
    id: 'demo-nut-10',
    _id: 'demo-nut-10',
    name: 'Léo',
    type: 'reptile',
    breed: 'Gecko léopard',
    weight: 0.06,
    weightKg: 0.06,
    birthDate: daysAgo(Math.round(2 * 365.25)),
    sex: 'M',
    isNeutered: false,
  },
  {
    id: 'demo-nut-11',
    _id: 'demo-nut-11',
    name: 'Sami',
    type: 'bird',
    breed: 'Pigeon voyageur',
    weight: 0.42,
    weightKg: 0.42,
    birthDate: daysAgo(Math.round(3 * 365.25)),
    sex: 'M',
    isNeutered: false,
  },
  {
    id: 'demo-nut-12',
    _id: 'demo-nut-12',
    name: 'Carthage',
    type: 'reptile',
    breed: 'Tortue grecque',
    weight: 0.85,
    weightKg: 0.85,
    birthDate: daysAgo(Math.round(12 * 365.25)),
    sex: 'F',
    isNeutered: false,
  },
  {
    id: 'demo-nut-13',
    _id: 'demo-nut-13',
    name: 'Noussa',
    type: 'other',
    breed: 'Cochon d\'Inde',
    weight: 0.95,
    weightKg: 0.95,
    birthDate: daysAgo(Math.round(2 * 365.25)),
    sex: 'F',
    isNeutered: false,
  },
  {
    id: 'demo-nut-14',
    _id: 'demo-nut-14',
    name: 'Zorro',
    type: 'other',
    breed: 'Furet',
    weight: 1.2,
    weightKg: 1.2,
    birthDate: daysAgo(Math.round(3 * 365.25)),
    sex: 'M',
    isNeutered: true,
  },
];

/** Historique poids démo pour nutrition adaptative IA */
export const DEMO_PET_WEIGHT_HISTORY = {
  'demo-nut-1': [
    { date: daysAgo(90), weightKg: 26.2 },
    { date: daysAgo(60), weightKg: 26.8 },
    { date: daysAgo(30), weightKg: 27.5 },
    { date: daysAgo(7), weightKg: 28 },
  ],
  'demo-nut-2': [
    { date: daysAgo(60), weightKg: 4.3 },
    { date: daysAgo(30), weightKg: 4.2 },
    { date: daysAgo(7), weightKg: 4.2 },
  ],
  'demo-nut-3': [
    { date: daysAgo(45), weightKg: 33 },
    { date: daysAgo(14), weightKg: 32 },
  ],
};

/** Journal alimentaire démo par animal */
export const DEMO_PET_FOOD_JOURNAL = {
  'demo-nut-1': [
    { date: daysAgo(0), meal: 'Matin', product: 'Croquettes Premium Chien', grams: 140, reaction: 'good' },
    { date: daysAgo(0), meal: 'Soir', product: 'Croquettes Premium Chien', grams: 135, reaction: 'good' },
    { date: daysAgo(1), meal: 'Matin', product: 'Croquettes Premium Chien', grams: 140, reaction: 'good' },
    { date: daysAgo(1), meal: 'Soir', product: 'Friandise dentaire', grams: 15, reaction: 'good' },
    { date: daysAgo(2), meal: 'Matin', product: 'Croquettes Light', grams: 130, reaction: 'soft_stool' },
    { date: daysAgo(2), meal: 'Soir', product: 'Croquettes Premium Chien', grams: 140, reaction: 'good' },
  ],
  'demo-nut-2': [
    { date: daysAgo(0), meal: 'Matin', product: 'Croquettes Chat Stérilisé', grams: 30, reaction: 'good' },
    { date: daysAgo(0), meal: 'Soir', product: 'Pâtée saumon', grams: 40, reaction: 'good' },
    { date: daysAgo(1), meal: 'Matin', product: 'Croquettes Chat Stérilisé', grams: 28, reaction: 'good' },
  ],
  'demo-nut-3': [
    { date: daysAgo(0), meal: 'Matin', product: 'Croquettes Senior Mobilité', grams: 180, reaction: 'good' },
    { date: daysAgo(0), meal: 'Soir', product: 'Croquettes Senior Mobilité', grams: 175, reaction: 'good' },
  ],
};

/** Préférences alimentaires démo */
export const DEMO_PET_FOOD_PREFERENCES = {
  'demo-nut-1': ['Croquettes premium', 'Friandises dentaires'],
  'demo-nut-2': ['Croquettes stérilisé', 'Pâtée saumon'],
  'demo-nut-3': ['Croquettes senior', 'Oméga-3'],
};

/** Recommandations vétérinaires démo */
export const DEMO_PET_VET_NUTRITION_RECS = {
  'demo-nut-1': [{ source: 'Dr. Ben Ali', text: 'Formule light — objectif 26 kg sous 3 mois.', date: daysAgo(30) }],
  'demo-nut-3': [{ source: 'Dr. Karim', text: 'Régime mobilité + oméga-3 pour arthrose légère.', date: daysAgo(20) }],
};

/** Données jumeau numérique démo (médical, alimentation, activité, véto) */
export const DEMO_DIGITAL_TWIN_SNAPSHOTS = {
  'demo-nut-1': {
    feeding: {
      currentDiet: 'Croquettes Premium Chien Adulte 12 kg',
      dailyKcal: 890,
      gramsPerDay: 280,
      mealCount: 2,
      adherence: 0.88,
      consistency: 0.82,
      history: [
        { date: daysAgo(1), meal: 'Matin', product: 'Croquettes Premium', grams: 140, kcal: 445 },
        { date: daysAgo(1), meal: 'Soir', product: 'Croquettes Premium', grams: 140, kcal: 445 },
        { date: daysAgo(2), meal: 'Matin', product: 'Croquettes Premium', grams: 135, kcal: 428 },
      ],
      logs: [
        { date: daysAgo(0), grams: 65, source: 'distributeur IoT' },
        { date: daysAgo(1), grams: 280, source: 'manuel' },
      ],
    },
    activity: {
      weeklyMinutes: 210,
      dailyGoalMin: 30,
      dailyGoalMetPct: 0.85,
      source: 'IoT + manuel',
      sessions: [
        { date: daysAgo(0), type: 'Promenade', minutes: 35, intensity: 'modérée' },
        { date: daysAgo(1), type: 'Jeu', minutes: 25, intensity: 'élevée' },
        { date: daysAgo(2), type: 'Promenade', minutes: 40, intensity: 'modérée' },
        { date: daysAgo(3), type: 'Agility', minutes: 30, intensity: 'élevée' },
      ],
    },
    veterinary: {
      lastConsultDaysAgo: 45,
      lastCheckup: daysAgo(45),
      vaccinesUpToDate: true,
      upcomingAppointment: true,
      vetReferent: 'Dr. Ben Ali — VetCare',
    },
    medical: {
      followUpComplete: true,
      noOverdueVaccines: true,
      chronicManaged: false,
      vaccines: [
        { name: 'Rage', status: 'up_to_date', date: daysAgo(200), nextDue: daysAhead(165) },
        { name: 'CHPPi', status: 'up_to_date', date: daysAgo(180), nextDue: daysAhead(185) },
      ],
      consultations: [
        { date: daysAgo(45), type: 'Bilan annuel', vet: 'Dr. Ben Ali', notes: 'Poids stable, articulations OK.' },
        { date: daysAgo(120), type: 'Vaccination rappel', vet: 'Dr. Ben Ali', notes: 'CHPPi administré.' },
      ],
      prescriptions: [],
      chronicConditions: [],
    },
  },
  'demo-nut-2': {
    feeding: {
      currentDiet: 'Pâtée chat saumon + croquettes stérilisé',
      dailyKcal: 240,
      gramsPerDay: 55,
      mealCount: 3,
      adherence: 0.72,
      consistency: 0.68,
      history: [
        { date: daysAgo(1), meal: 'Matin', product: 'Pâtée saumon', grams: 20, kcal: 35 },
        { date: daysAgo(1), meal: 'Midi', product: 'Croquettes stérilisé', grams: 18, kcal: 70 },
      ],
      logs: [{ date: daysAgo(0), grams: 55, source: 'fontaine + gamelle' }],
    },
    activity: {
      weeklyMinutes: 95,
      dailyGoalMin: 20,
      dailyGoalMetPct: 0.62,
      source: 'capteur fontaine',
      sessions: [
        { date: daysAgo(0), type: 'Jeu interactif', minutes: 15, intensity: 'modérée' },
        { date: daysAgo(1), type: 'Grimpeur', minutes: 20, intensity: 'modérée' },
      ],
    },
    veterinary: {
      lastConsultDaysAgo: 95,
      lastCheckup: daysAgo(95),
      vaccinesUpToDate: true,
      upcomingAppointment: false,
      vetReferent: 'Clinique Carthage',
    },
    medical: {
      followUpComplete: true,
      noOverdueVaccines: true,
      chronicConditions: [],
      vaccines: [
        { name: 'Typhus / Coryza', status: 'due_soon', date: daysAgo(360), nextDue: daysAhead(14) },
      ],
      consultations: [
        { date: daysAgo(95), type: 'Stérilisation suivi', vet: 'Dr. Leila', notes: 'Cicatrisation OK.' },
      ],
      prescriptions: [],
    },
  },
  'demo-nut-3': {
    feeding: {
      currentDiet: 'Croquettes Senior Berger',
      dailyKcal: 1100,
      gramsPerDay: 320,
      mealCount: 2,
      adherence: 0.65,
      consistency: 0.7,
      history: [],
      logs: [],
    },
    activity: {
      weeklyMinutes: 140,
      dailyGoalMin: 45,
      dailyGoalMetPct: 0.55,
      sessions: [
        { date: daysAgo(0), type: 'Promenade', minutes: 25, intensity: 'légère' },
      ],
    },
    veterinary: {
      lastConsultDaysAgo: 200,
      vaccinesUpToDate: false,
      upcomingAppointment: false,
      vetReferent: 'Urgences Vet Lac',
    },
    medical: {
      followUpComplete: false,
      noOverdueVaccines: false,
      chronicManaged: true,
      chronicConditions: ['Arthrose légère'],
      vaccines: [{ name: 'Rage', status: 'overdue', date: daysAgo(400) }],
      consultations: [{ date: daysAgo(200), type: 'Douleur articulaire', vet: 'Dr. Amine', notes: 'Glucosamine prescrite.' }],
      prescriptions: [{ name: 'Glucosamine', since: daysAgo(200), active: true }],
    },
  },
};

export const DEMO_FEEDER_DEVICE = {
  id: 'demo-feeder-1',
  name: 'Distributeur Max — Salon',
  status: 'online',
  deviceKey: 'PETFEED-DEMO-MAX-8F3A',
  petId: 'demo-pet-1',
  reservoirPercent: 42,
  reservoirCm: 12.5,
  isLowFood: true,
  animalPresent: false,
  foodGrams: 28,
  temperature: 24.2,
  humidity: 58,
  offlineMinutes: 0,
  lastHeartbeat: new Date().toISOString(),
  schedules: DEMO_FEEDER_SCHEDULE,
};

export const DEMO_FEEDER_STATS = {
  todayGrams: 65,
  weekGrams: 420,
  dailyAverage: 60,
  dispenseCount: 14,
  consumptionByDay: Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return {
      date: d.toISOString(),
      grams: [52, 58, 61, 55, 68, 72, 65][i],
    };
  }),
};

export const DEMO_FEEDER_ALERTS = [
  { id: 'low-food', level: 'warning', type: 'low_food', title: 'Niveau de nourriture faible', message: 'Réservoir à 42 % — recharge recommandée sous 48 h.' },
  { id: 'missed-meal', level: 'warning', type: 'abnormal_eating', title: 'Repas programmé non consommé', message: 'Créneau 12:30 sans distribution détectée aujourd\'hui.' },
  { level: 'info', title: 'Prochain repas', message: 'Distribution programmée à 19:30 (30 g).' },
];

export const DEMO_FEEDER_INSIGHTS = [
  { icon: '🐕', text: 'Max (berger) : 95 g/jour répartis en 3 repas — objectif calories respecté cette semaine.' },
  { icon: '💧', text: 'Humidité ambiante 58 % — conditions optimales pour conserver les croquettes.' },
  { icon: '📊', text: 'Consommation +8 % vs semaine dernière — surveiller le poids.' },
];

export const DEMO_FEEDER_PLAN = {
  pet: { id: 'demo-pet-1', name: 'Max', type: 'dog' },
  dailyGrams: 95,
  portionGrams: 30,
  mealsPerDay: 3,
  tips: [
    'Répartir les repas toutes les 6–8 h pour éviter les fringales.',
    'Vérifier le niveau d\'eau fraîche à côté du distributeur.',
    'Nettoyer la gamelle 2× par semaine.',
  ],
};

export const DEMO_FEEDER_SPECIES_GUIDE = {
  label: 'Chien moyen (Max)',
  suggestedPortionGrams: 30,
  dailyGrams: 95,
};

export const DEMO_FEEDER_HISTORY_LOGS = [
  { id: 'log-1', eventType: 'dispense', portionGrams: 30, message: 'Distribution automatique — Petit-déjeuner', createdAt: hoursAgo(8) },
  { id: 'log-2', eventType: 'dispense', portionGrams: 35, message: 'Distribution automatique — Déjeuner', createdAt: hoursAgo(3) },
  { id: 'log-3', eventType: 'alert', message: 'Capteur ultrason : niveau sous 45 %', createdAt: hoursAgo(20) },
  { id: 'log-4', eventType: 'refill', portionGrams: 500, message: 'Recharge réservoir enregistrée', createdAt: daysAgo(2) },
  { id: 'log-5', eventType: 'manual_request', portionGrams: 25, message: 'Distribution manuelle depuis l\'app', createdAt: daysAgo(3) },
  { id: 'log-6', eventType: 'sensor', message: 'Temp. 24 °C · Humidité 58 % · Balance 28 g', createdAt: hoursAgo(1) },
];

export const getDemoFeederList = () => [DEMO_FEEDER_DEVICE];

export const DEMO_IOT_PACK = {
  mode: 'demo',
  healthScore: 76,
  counts: {
    feeders: 1,
    feedersOnline: 1,
    feederCams: 1,
    feederCamsOnline: 1,
    waterMonitors: 2,
    waterOnline: 2,
    scales: 1,
    smartFridges: 1,
    wearables: 2,
    wearablesOnline: 2,
    alerts: 7,
    criticalAlerts: 1,
    routinesToday: 9,
  },
  devices: [
    {
      id: 'demo-feeder-1',
      type: 'feeder',
      name: 'Distributeur Max — Salon',
      status: 'online',
      petName: 'Max',
      route: '/pet-feeder',
      metrics: { reservoirPercent: 42, temperature: 24.2, todayGrams: 65, avgDailyGrams: 65, capacityGrams: 1200, isLowFood: true },
      signalStrength: 82,
      lastSeen: new Date(Date.now() - 120000).toISOString(),
    },
    {
      id: 'demo-esp32cam-1',
      type: 'feeder-cam',
      name: 'ESP32-CAM — Bac croquettes Max',
      status: 'online',
      petName: 'Max',
      route: '/client-iot',
      metrics: {
        foodQuality: 'warning',
        qualityScore: 72,
        temperatureC: 24.2,
        humidityPct: 58,
        moldPixelRatio: 0.04,
        avgR: 130,
        avgG: 128,
        avgB: 78,
      },
      signalStrength: 88,
      lastSeen: new Date(Date.now() - 30000).toISOString(),
    },
    {
      id: 'demo-water-1',
      type: 'water',
      name: 'Fontaine Max — Salon',
      status: 'online',
      petName: 'Max',
      route: '/client-smart-water',
      metrics: { todayMl: 420, targetMl: 550, reservoirMl: 890, filterDaysLeft: 18, percentOfTarget: 76 },
      signalStrength: 91,
      batteryPercent: 88,
      lastSeen: new Date(Date.now() - 45000).toISOString(),
    },
    {
      id: 'demo-water-2',
      type: 'water',
      name: 'Fontaine Luna — Cuisine',
      status: 'online',
      petName: 'Luna',
      route: '/client-smart-water',
      metrics: { todayMl: 165, targetMl: 250, reservoirMl: 320, filterDaysLeft: 5, percentOfTarget: 66 },
      signalStrength: 74,
      batteryPercent: 62,
      lastSeen: new Date(Date.now() - 180000).toISOString(),
    },
    {
      id: 'demo-scale-1',
      type: 'scale',
      name: 'Balance connectée Max',
      status: 'online',
      petName: 'Max',
      route: '/client-iot?tab=advanced',
      metrics: { todayGrams: 65, targetGrams: 70, adherence: 93 },
      signalStrength: 85,
      lastSeen: new Date(Date.now() - 60000).toISOString(),
    },
    {
      id: 'demo-fridge-1',
      type: 'smart-fridge',
      name: 'Réfrigérateur aliments Max',
      status: 'online',
      petName: 'Max',
      route: '/client-iot?tab=advanced',
      metrics: { temperatureC: 4.2, humidityPct: 42, doorClosed: true, expiryDays: 45 },
      signalStrength: 90,
      lastSeen: new Date(Date.now() - 90000).toISOString(),
    },
    {
      id: 'demo-wearable-max',
      type: 'wearable-collar',
      name: 'PetCollar Vital — Max',
      status: 'online',
      petId: 'demo-pet-1',
      petName: 'Max',
      petType: 'dog',
      route: '/client-iot?tab=wearable',
      firmware: 'PetCollar Vital v2.1',
      metrics: {
        spo2Percent: 97,
        heartRateBpm: 82,
        respiratoryRate: 22,
        bodyTempC: 38.4,
        activityLevel: 'calm',
        animalState: 'calm',
        stepsToday: 4280,
        caloriesBurned: 312,
        stressIndex: 18,
        sleepMinutesTonight: 382,
        sleepQuality: 88,
        activeMinutesToday: 52,
        lastLocation: 'Salon — domicile',
      },
      batteryPercent: 74,
      signalStrength: 79,
      lastSeen: new Date(Date.now() - 8000).toISOString(),
    },
    {
      id: 'demo-wearable-luna',
      type: 'wearable-collar',
      name: 'PetCollar Vital — Luna',
      status: 'online',
      petId: 'demo-pet-2',
      petName: 'Luna',
      petType: 'cat',
      route: '/client-iot?tab=wearable',
      firmware: 'PetCollar Vital v2.1',
      metrics: {
        spo2Percent: 96,
        heartRateBpm: 138,
        respiratoryRate: 28,
        bodyTempC: 38.6,
        activityLevel: 'resting',
        animalState: 'calm',
        stepsToday: 890,
        caloriesBurned: 95,
        stressIndex: 24,
        sleepMinutesTonight: 445,
        sleepQuality: 76,
        activeMinutesToday: 28,
        lastLocation: 'Cuisine — domicile',
      },
      batteryPercent: 58,
      signalStrength: 71,
      lastSeen: new Date(Date.now() - 12000).toISOString(),
    },
  ],
  alerts: [
    { id: 'a1', source: 'feeder', severity: 'medium', title: 'Niveau croquettes bas', message: 'Réservoir à 42 % — recharge sous 48 h.', deviceId: 'demo-feeder-1', link: '/pet-feeder' },
    { id: 'a2', source: 'water', severity: 'high', title: 'Hydratation Luna', message: '66 % de l\'objectif journalier.', deviceId: 'demo-water-2', link: '/client-smart-water' },
    { id: 'a3', source: 'water', severity: 'medium', title: 'Filtre fontaine Luna', message: 'Filtre à changer dans 5 jours.', deviceId: 'demo-water-2', link: '/client-smart-water' },
    { id: 'a4', source: 'feeder', severity: 'low', title: 'Prochain repas Max', message: 'Distribution à 19:30 (30 g).', deviceId: 'demo-feeder-1', link: '/pet-feeder' },
    { id: 'a5', source: 'feeder-cam', severity: 'medium', title: 'Qualité croquettes — limite', message: 'ESP32-CAM : score 72/100 — température et humidité du bac à surveiller.', deviceId: 'demo-esp32cam-1', link: '/client-iot' },
    { id: 'a6', source: 'mobile', severity: 'low', title: 'Alerte smartphone', message: 'Push envoyé — consommation Max 93 % objectif (balance connectée).', deviceId: 'demo-scale-1', link: '/mobile' },
    { id: 'a7', source: 'wearable-collar', severity: 'medium', title: 'Collier Luna — activité', message: 'Rythme cardiaque 138 bpm au repos — surveiller si persistant.', deviceId: 'demo-wearable-luna', link: '/client-iot?tab=wearable' },
  ],
  automations: [
    { id: 'auto-1', label: 'Réappro croquettes', description: 'Commander quand réservoir < 30 %', trigger: 'feeder.low_food', enabled: true, link: '/client-subscriptions' },
    { id: 'auto-2', label: 'Rappel hydratation', description: 'Notification si < 70 % objectif eau', trigger: 'water.low_hydration', enabled: true, link: '/client-smart-water' },
    { id: 'auto-3', label: 'Sync livraison', description: 'Créneau lié au stock distributeur', trigger: 'delivery.predictive', enabled: true, link: '/client-smart-delivery' },
  ],
  routines: [
    { time: '07:15', label: 'Contrôle qualité — matin', device: 'ESP32-CAM Max', action: 'Scan bac', type: 'feeder-cam' },
    { time: '07:30', label: 'Petit-déjeuner Max', device: 'Distributeur', action: '30 g', type: 'feeder' },
    { time: '12:15', label: 'Contrôle qualité — midi', device: 'ESP32-CAM Max', action: 'Scan bac', type: 'feeder-cam' },
    { time: '12:30', label: 'Déjeuner Max', device: 'Distributeur', action: '35 g', type: 'feeder' },
    { time: '19:15', label: 'Contrôle qualité — soir', device: 'ESP32-CAM Max', action: 'Scan bac', type: 'feeder-cam' },
    { time: '19:30', label: 'Dîner Max', device: 'Distributeur', action: '30 g', type: 'feeder' },
    { time: '08:00', label: 'Remplissage fontaine', device: 'Fontaine Max', action: 'Check réservoir', type: 'water' },
    { time: '21:00', label: 'Contrôle Luna', device: 'Fontaine Luna', action: 'Rappel eau', type: 'water' },
    { time: '22:30', label: 'Sync vitaux Max', device: 'Collier Vital Max', action: 'SpO₂ + FC', type: 'wearable-collar' },
  ],
  foodQualitySchedules: [
    { id: 'sq-1', time: '07:15', label: 'Avant petit-déjeuner Max', enabled: true },
    { id: 'sq-2', time: '12:15', label: 'Avant déjeuner Max', enabled: true },
    { id: 'sq-3', time: '19:15', label: 'Avant dîner Max', enabled: true },
    { id: 'sq-4', time: '02:00', label: 'Contrôle nocturne bac', enabled: true },
  ],
  telemetry: {
    feederGrams7d: [52, 58, 61, 55, 68, 72, 65],
    waterMl7d: [480, 510, 445, 520, 490, 505, 420],
    temperature7d: [22.1, 22.8, 23.4, 24.2, 24.8, 24.2, 23.6],
    humidity7d: [52, 54, 56, 58, 62, 58, 55],
  },
  mqtt: {
    connected: true,
    broker: 'mqtt://localhost:1883',
    topicPrefix: 'petfood/',
    devicesSubscribed: 7,
  },
  mobilePush: {
    enabled: true,
    unread: 3,
    lastAlert: 'Qualité croquettes — score 87%',
    platforms: ['android', 'ios'],
    lastSyncAt: new Date(Date.now() - 120000).toISOString(),
  },
  sensorEvents: [
    { id: 'ev1', deviceId: 'demo-feeder-1', deviceName: 'Distributeur Max', type: 'level', icon: '📊', message: 'Distribution 30 g — repas matin', at: new Date(Date.now() - 900000).toISOString() },
    { id: 'ev2', deviceId: 'demo-water-2', deviceName: 'Fontaine Luna', type: 'hydration', icon: '💧', message: '165 ml aujourd\'hui (66 % objectif)', at: new Date(Date.now() - 600000).toISOString() },
    { id: 'ev3', deviceId: 'demo-feeder-1', deviceName: 'Distributeur Max', type: 'temperature', icon: '🌡️', message: 'Température bac 24.2 °C', at: new Date(Date.now() - 1800000).toISOString() },
    { id: 'ev4', deviceId: 'demo-esp32cam-1', deviceName: 'ESP32-CAM Max', type: 'food-quality', icon: '⚠️', message: 'Qualité croquettes : À surveiller (72/100)', at: new Date(Date.now() - 450000).toISOString() },
    { id: 'ev5', deviceId: 'demo-wearable-max', deviceName: 'Collier Max', type: 'vitals', icon: '❤️', message: 'SpO₂ 97 % · FC 82 bpm — état calme', at: new Date(Date.now() - 15000).toISOString() },
  ],
};

export const getDemoFeederBundle = () => ({
  feeder: { ...DEMO_FEEDER_DEVICE, schedules: [...DEMO_FEEDER_SCHEDULE] },
  stats: { ...DEMO_FEEDER_STATS, consumptionByDay: DEMO_FEEDER_STATS.consumptionByDay.map((d) => ({ ...d })) },
  alerts: [...DEMO_FEEDER_ALERTS],
  insights: [...DEMO_FEEDER_INSIGHTS],
  speciesGuide: { ...DEMO_FEEDER_SPECIES_GUIDE },
  plan: { ...DEMO_FEEDER_PLAN },
  history: [...DEMO_FEEDER_HISTORY_LOGS],
  pets: [...DEMO_FEEDER_PETS],
});

export const DEMO_WATER_PETS = [
  { petId: 'demo-pet-1', name: 'Max', type: 'dog', alert: false },
  { petId: 'demo-pet-2', name: 'Luna', type: 'cat', alert: true },
];

const buildHourlyToday = (peakHours) => {
  const hours = [];
  for (let h = 0; h < 24; h += 1) {
    const label = `${String(h).padStart(2, '0')}h`;
    const isPeak = peakHours.includes(h);
    hours.push({ label, hour: h, volumeMl: isPeak ? 45 + (h % 3) * 8 : h % 4 === 0 ? 12 : 0 });
  }
  return hours;
};

const buildWaterSeries = (baseMl, variance) => Array.from({ length: 14 }, (_, i) => {
  const d = new Date();
  d.setDate(d.getDate() - (13 - i));
  const totalMl = baseMl + (i % 3) * variance - (i === 13 ? 40 : 0);
  return {
    label: d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' }),
    date: d.toISOString(),
    totalMl: Math.max(80, totalMl),
  };
});

const DEMO_WATER_BY_PET = {
  'demo-pet-1': {
    petId: 'demo-pet-1',
    petName: 'Max',
    petType: 'dog',
    todayMl: 420,
    targetMl: 550,
    percentOfTarget: 76,
    monitor: {
      id: 'demo-water-1',
      name: 'Fontaine Max — Salon',
      status: 'online',
      online: true,
      reservoirMl: 890,
      reservoirCapacityMl: 1500,
      waterTempC: 18.5,
      flowRateMlMin: 12,
      filterDaysLeft: 18,
      pumpActive: false,
      lastDrinkAt: hoursAgo(2),
    },
    stats: { avg7dMl: 485, maxDayMl: 610 },
    alerts: [
      { severity: 'medium', message: 'Hydratation à 76 % de l\'objectif — encouragez Max à boire après la promenade.' },
    ],
    hourlyToday: buildHourlyToday([7, 8, 12, 18, 19, 21]),
    series: buildWaterSeries(480, 35),
    hydrationTip: 'Un chien actif de 25 kg a besoin d\'environ 550 ml/jour. Proposez de l\'eau fraîche après l\'exercice.',
    insights: [
      { icon: '🐕', text: 'Pic de consommation entre 18h et 21h — normal après la promenade.' },
      { icon: '🌡️', text: 'Eau à 18,5 °C — température idéale pour inciter à boire.' },
    ],
  },
  'demo-pet-2': {
    petId: 'demo-pet-2',
    petName: 'Luna',
    petType: 'cat',
    todayMl: 165,
    targetMl: 250,
    percentOfTarget: 66,
    monitor: {
      id: 'demo-water-2',
      name: 'Fontaine Luna — Cuisine',
      status: 'online',
      online: true,
      reservoirMl: 420,
      reservoirCapacityMl: 2000,
      waterTempC: 19.2,
      flowRateMlMin: 0,
      filterDaysLeft: 6,
      pumpActive: false,
      lastDrinkAt: hoursAgo(5),
    },
    stats: { avg7dMl: 210, maxDayMl: 280 },
    alerts: [
      { severity: 'high', message: 'Hydratation basse (66 %) — vérifiez la fontaine et la propreté du bol.' },
      { severity: 'low', message: 'Filtre à remplacer dans 6 jours.' },
    ],
    hourlyToday: buildHourlyToday([6, 10, 14, 20]),
    series: buildWaterSeries(220, 25),
    hydrationTip: 'Les chats boivent peu : une fontaine avec eau fraîche augmente la consommation de 40 % en moyenne.',
    insights: [
      { icon: '🐱', text: 'Luna boit surtout le matin — envisagez une 2e fontaine près de la litière.' },
      { icon: '🔧', text: 'Filtre bientôt à changer — goût de l\'eau moins attractif pour les chats.' },
    ],
  },
};

export const getDemoWaterOverview = () => ({
  pets: DEMO_WATER_PETS.map((p) => ({ ...p })),
  demoMode: true,
});

export const getDemoWaterTracking = (petId) => {
  const key = DEMO_WATER_BY_PET[petId] ? petId : 'demo-pet-1';
  const data = DEMO_WATER_BY_PET[key];
  return JSON.parse(JSON.stringify(data));
};

/** Fusionne données API et courbes démo si séries manquantes. */
export const mergeWaterTrackingWithDemoCurves = (apiData, petId) => {
  const demo = getDemoWaterTracking(petId);
  const base = apiData?.tracking && typeof apiData.tracking === 'object'
    ? { ...demo, ...apiData, ...apiData.tracking }
    : { ...demo, ...apiData };
  return {
    ...base,
    hourlyToday: base.hourlyToday?.length ? base.hourlyToday : demo.hourlyToday,
    series: base.series?.length ? base.series : demo.series,
    stats: base.stats || demo.stats,
    insights: base.insights?.length ? base.insights : demo.insights,
  };
};

export const applyDemoWaterLog = (tracking, volumeMl) => {
  const next = JSON.parse(JSON.stringify(tracking));
  next.todayMl = (next.todayMl || 0) + volumeMl;
  next.percentOfTarget = Math.min(100, Math.round((next.todayMl / next.targetMl) * 100));
  if (next.monitor) {
    next.monitor.lastDrinkAt = new Date().toISOString();
    next.monitor.flowRateMlMin = 18;
    next.monitor.pumpActive = true;
  }
  next.alerts = recomputeDemoWaterAlerts(next);
  return next;
};

export const recomputeDemoWaterAlerts = (tracking) => {
  const alerts = [];
  const pct = tracking.percentOfTarget ?? 0;
  const todayMl = tracking.todayMl ?? 0;
  const targetMl = tracking.targetMl ?? 0;
  const monitor = tracking.monitor || {};

  if (pct < 50) {
    alerts.push({
      type: 'critical_hydration',
      severity: 'high',
      message: `Alerte critique : consommation très faible (${pct} % de l'objectif)`,
      action: 'Contactez votre vétérinaire si la situation persiste 24 h.',
    });
  } else if (pct < 70) {
    alerts.push({
      type: 'low_hydration',
      severity: 'medium',
      message: `Hydratation basse — ${todayMl} ml / objectif ${targetMl} ml (${pct} %)`,
      action: 'Encouragez votre animal à boire ou vérifiez la fontaine.',
    });
  }

  if (monitor.reservoirMl != null && monitor.reservoirMl < 250) {
    alerts.push({
      type: 'low_reservoir',
      severity: monitor.reservoirMl < 120 ? 'high' : 'medium',
      message: `Réservoir bas — ${monitor.reservoirMl} ml restants`,
      action: 'Rechargez la fontaine.',
    });
  }

  if (monitor.filterDaysLeft != null && monitor.filterDaysLeft <= 7) {
    alerts.push({
      type: 'filter_expiry',
      severity: monitor.filterDaysLeft <= 3 ? 'high' : 'medium',
      message: `Filtre à remplacer dans ${monitor.filterDaysLeft} jour(s)`,
      action: 'Un filtre encrassé réduit l\'attrait de l\'eau.',
    });
  }

  if (monitor.online === false) {
    alerts.push({
      type: 'device_offline',
      severity: 'high',
      message: 'Fontaine IoT hors ligne',
      action: 'Vérifiez alimentation Wi-Fi et capteur ESP32.',
    });
  }

  return alerts;
};

export const applyDemoWaterRefill = (tracking, volumeMl = 1500) => {
  const next = JSON.parse(JSON.stringify(tracking));
  if (next.monitor) {
    next.monitor.reservoirMl = Math.min(
      next.monitor.reservoirCapacityMl || 2000,
      (next.monitor.reservoirMl || 0) + volumeMl,
    );
    next.monitor.filterDaysLeft = Math.min(30, (next.monitor.filterDaysLeft || 0) + 1);
  }
  next.alerts = recomputeDemoWaterAlerts(next);
  return next;
};

const DEMO_GENESIS_HASH = '0'.repeat(64);
const DEMO_BLOCK_HASHES = [
  'a3f8c2e1b9d04f6a8e7c5d3b2a1f0e9d8c7b6a5f4e3d2c1b0a9f8e7d6c5b4a3',
  'b4e9d3f2c0a15e7b9d8f6e4c3b2a1f0e9d8c7b6a5f4e3d2c1b0a9f8e7d6c5b4a3',
  'c5f0e4a3b1c26f8d0b9a7e5d4c3b2a1f0e9d8c7b6a5f4e3d2c1b0a9f8e7d6c5b4a3',
  'd6a1f5b4c3e27f9e1c0b8a7f6e5d4c3b2a1f0e9d8c7b6a5f4e3d2c1b0a9f8e7d6c5b4a3',
  'e6f1a5b4c3d26f8e0d9b7a6e5d4c3b2a1f0e9d8c7b6a5f4e3d2c1b0a9f8e7d6c5b4a3',
];
const DEMO_MERKLE_ROOT = '5052df2f01dc08d6c4563a59e8f4d763d13203e72c14a629a290d307e40d4e3f';

const buildDemoSupplyChain = () => [
  {
    step: 'origine',
    label: 'Origine matières premières',
    location: 'Béja, Tunisie',
    actor: 'NutriPet SARL',
    timestamp: daysAgo(90),
    hash: DEMO_BLOCK_HASHES[0],
    prevHash: DEMO_GENESIS_HASH,
    dataPayload: 'LOT:PF-TN-2026-A042 | Matières: volaille 42%, céréales 38%',
  },
  {
    step: 'transformation',
    label: 'Fabrication / conditionnement',
    location: 'Usine de conditionnement Béja Nord',
    actor: 'NutriPet SARL',
    timestamp: daysAgo(45),
    hash: DEMO_BLOCK_HASHES[1],
    prevHash: DEMO_BLOCK_HASHES[0],
    dataPayload: 'Temp extrusion: 85°C | Humidité: 8.2%',
  },
  {
    step: 'certification',
    label: 'Contrôle & certification',
    location: 'Laboratoire partenaire',
    actor: 'PetfoodTN Quality Lab',
    timestamp: daysAgo(30),
    hash: DEMO_BLOCK_HASHES[2],
    prevHash: DEMO_BLOCK_HASHES[1],
    dataPayload: 'ISO 22000 | Salmonelle: négatif | Aflatoxines: OK',
  },
  {
    step: 'distribution',
    label: 'Entrepôt & distribution',
    location: 'Hub PetfoodTN Tunis',
    actor: 'PetfoodTN Logistics',
    timestamp: daysAgo(20),
    hash: DEMO_BLOCK_HASHES[3],
    prevHash: DEMO_BLOCK_HASHES[2],
    dataPayload: 'Chaîne du froid: 4–18°C | GPS: 36.8065, 10.1815',
  },
  {
    step: 'retail',
    label: 'Mise en vente marketplace',
    location: 'PetfoodTN Marketplace',
    actor: 'PetfoodTN',
    timestamp: daysAgo(5),
    hash: DEMO_BLOCK_HASHES[4],
    prevHash: DEMO_BLOCK_HASHES[3],
    dataPayload: 'SKU marketplace | Prix TTC enregistré',
  },
];

export const getDemoProductTraceability = (productId, productName = 'Croquettes Premium Chien') => ({
  product: { id: productId, name: productName },
  batchCode: 'PF-TN-2026-A042',
  origin: {
    country: 'Tunisie',
    region: 'Béja',
    producer: 'NutriPet SARL',
    facility: 'Usine de conditionnement Béja Nord',
    harvestDate: daysAgo(45),
  },
  certifications: getProductTraceabilityCerts(),
  blockchain: {
    network: 'PetfoodTN Chain (SHA-256)',
    algorithm: 'SHA-256',
    blockCount: 5,
    rootHash: DEMO_MERKLE_ROOT,
    merkleRoot: DEMO_MERKLE_ROOT,
    lastBlockHash: DEMO_BLOCK_HASHES[4],
    isVerified: true,
    trustScore: 94,
    verification: { valid: true, reason: 'Chaîne intacte — aucune altération détectée (démo).', blockCount: 5 },
  },
  iotAnchor: {
    deviceId: 'ESP32-CAM-PFIOT-001',
    qualityScore: 87,
    txHash: 'f7a2b3c4d5e6789012345678901234567890abcdef1234567890abcdef123456',
    capturedAt: daysAgo(3),
    temperature: 22.4,
    humidity: 48,
  },
  nutrition: { protein: '26%', fat: '12%', fiber: '4%', moisture: '9%', ash: '7%', kcalPer100g: 360 },
  allergens: ['Volaille'],
  ingredients: ['Viande déshydratée de poulet', 'Riz complet', 'Huile de poisson', 'Légumes déshydratés', 'Vitamines & minéraux'],
  qrPayload: { batchCode: 'PF-TN-2026-A042', productId: productId, verifyUrl: '/client-traceability?batch=PF-TN-2026-A042', rootHash: DEMO_MERKLE_ROOT.slice(0, 16) },
  supplyChain: buildDemoSupplyChain(),
  demoMode: true,
});

export const DEMO_MY_ORDER_TRACES = {
  orders: [
    {
      orderId: 'demo-order-001',
      date: daysAgo(12),
      status: 'delivered',
      traces: [getDemoProductTraceability('demo-order-prod-1', 'Croquettes Premium Chien Adulte 12 kg')],
    },
    {
      orderId: 'demo-order-002',
      date: daysAgo(2),
      status: 'shipped',
      traces: [getDemoProductTraceability('demo-order-prod-2', 'Pâtée chat saumon 400 g')],
    },
  ],
  total: 2,
};

export const DEMO_RELAY_POINTS = [
  {
    id: 'relay-demo-1',
    name: 'Animalerie PetfoodTN La Marsa',
    type: 'pet_shop',
    typeLabel: 'Animalerie partenaire',
    typeIcon: '🏪',
    address: 'Av. Habib Bourguiba, La Marsa, Tunis',
    distanceKm: 1.2,
    phone: '+216 71 000 001',
    hours: 'Lun–Sam 9h–19h',
    partnerCode: 'MRS-001',
    lat: 36.878,
    lng: 10.325,
  },
  {
    id: 'relay-demo-2',
    name: 'Clinique Vétérinaire Carthage',
    type: 'vet_clinic',
    typeLabel: 'Clinique vétérinaire',
    typeIcon: '🩺',
    address: 'Rue de la République, Carthage',
    distanceKm: 2.8,
    phone: '+216 71 000 002',
    hours: 'Lun–Ven 8h30–18h',
    partnerCode: 'VET-CAR-02',
    lat: 36.852,
    lng: 10.331,
  },
];

export const DEMO_NEAREST_STORE = {
  name: 'Animalerie PetfoodTN La Marsa',
  distanceKm: 1.2,
  address: 'Av. Habib Bourguiba, La Marsa',
  openUntil: '19h00',
};

export const DEMO_NEARBY_VETS = [
  {
    id: 'vet-demo-1',
    name: 'Dr. Ben Ali — Clinique VetCare',
    region: 'La Marsa',
    address: 'Av. Taieb Mhiri, La Marsa',
    phone: '+216 71 000 101',
    lat: 36.878,
    lng: 10.325,
    distance: 1.4,
    sameRegion: true,
    availableNow: true,
    teleconsult: true,
    openUntil: '18h30',
    specialties: ['vaccination', 'chirurgie'],
    rating_avg: 4.8,
    rating_count: 124,
  },
  {
    id: 'vet-demo-2',
    name: 'Clinique Vétérinaire Carthage',
    region: 'Carthage',
    address: 'Rue de la République, Carthage',
    phone: '+216 71 000 002',
    lat: 36.852,
    lng: 10.331,
    distance: 2.8,
    sameRegion: false,
    availableNow: true,
    teleconsult: false,
    openUntil: '18h00',
    specialties: ['vaccination', 'dentaire'],
    rating_avg: 4.6,
    rating_count: 89,
  },
  {
    id: 'vet-demo-3',
    name: 'Centre Vet Sidi Bou Said',
    region: 'Sidi Bou Said',
    address: 'Rue Habib Thameur, Sidi Bou Said',
    phone: '+216 71 000 103',
    lat: 36.871,
    lng: 10.341,
    distance: 3.5,
    sameRegion: false,
    availableNow: false,
    teleconsult: true,
    openUntil: '17h00',
    specialties: ['dermatologie'],
    rating_avg: 4.9,
    rating_count: 56,
  },
  {
    id: 'vet-demo-4',
    name: 'Urgences Vet Tunis Lac',
    region: 'Lac',
    address: 'Les Berges du Lac, Tunis',
    phone: '+216 71 000 104',
    lat: 36.838,
    lng: 10.241,
    distance: 8.2,
    sameRegion: false,
    availableNow: true,
    teleconsult: true,
    openUntil: '22h00',
    specialties: ['urgence', 'chirurgie'],
    rating_avg: 4.4,
    rating_count: 210,
  },
];

/** Magasins PetfoodTN (démo — page Nos magasins). */
export const DEMO_STORE_LOCATIONS = [
  { id: 'store-tunis', name: 'PetfoodTN Tunis Centre', address: 'Av. Habib Bourguiba, Tunis', phone: '+216 71 000 101', hours: 'Lun–Sam 9h–20h', lat: 36.8065, lng: 10.1815 },
  { id: 'store-marsa', name: 'Animalerie PetfoodTN La Marsa', address: 'Av. Habib Bourguiba, La Marsa', phone: '+216 71 000 102', hours: 'Lun–Dim 10h–19h', lat: 36.878, lng: 10.3247 },
  { id: 'store-lac', name: 'Animalerie PetfoodTN Lac 2', address: 'Centre commercial Lac 2, Tunis', phone: '+216 71 000 103', hours: 'Lun–Dim 10h–20h', lat: 36.838, lng: 10.241 },
  { id: 'store-ariana', name: 'PetShop Ariana', address: 'Centre Ariana, Ariana', phone: '+216 71 000 104', hours: 'Lun–Sam 9h–19h', lat: 36.862, lng: 10.195 },
  { id: 'store-sfax', name: 'PetfoodTN Sfax', address: 'Rue Hedi Chaker, Sfax', phone: '+216 74 000 201', hours: 'Lun–Sam 9h–19h', lat: 34.7406, lng: 10.7603 },
  { id: 'store-sousse', name: 'PetfoodTN Sousse', address: 'Bd Yahia Ibn Omar, Sousse', phone: '+216 73 000 301', hours: 'Lun–Sam 9h–19h', lat: 35.8256, lng: 10.637 },
  { id: 'store-nabeul', name: 'PetfoodTN Nabeul', address: 'Av. de la République, Nabeul', phone: '+216 72 000 401', hours: 'Lun–Sam 9h–18h30', lat: 36.4513, lng: 10.7357 },
  { id: 'store-bizerte', name: 'PetfoodTN Bizerte', address: 'Rue Bourguiba, Bizerte', phone: '+216 72 000 501', hours: 'Lun–Sam 9h–18h', lat: 37.2744, lng: 9.8739 },
  { id: 'store-monastir', name: 'PetfoodTN Monastir', address: 'Av. de l\'Indépendance, Monastir', phone: '+216 73 000 601', hours: 'Lun–Sam 9h–18h', lat: 35.7643, lng: 10.8113 },
  { id: 'store-gabes', name: 'PetfoodTN Gabès', address: 'Rue Farhat Hached, Gabès', phone: '+216 75 000 701', hours: 'Lun–Ven 9h–18h', lat: 33.8815, lng: 10.0982 },
];

export const DEMO_PARTNER_STORES = [
  ...DEMO_RELAY_POINTS,
  {
    id: 'store-demo-3',
    name: 'Animalerie PetfoodTN Lac 2',
    type: 'pet_shop',
    typeLabel: 'Animalerie partenaire',
    typeIcon: '🏪',
    address: 'Centre commercial Lac 2, Tunis',
    distanceKm: 6.5,
    phone: '+216 71 000 003',
    hours: 'Lun–Dim 10h–20h',
    partnerCode: 'LAC-003',
    lat: 36.838,
    lng: 10.241,
  },
  {
    id: 'store-demo-4',
    name: 'PetShop Ariana',
    type: 'pet_shop',
    typeLabel: 'Animalerie partenaire',
    typeIcon: '🏪',
    address: 'Centre Ariana, Ariana',
    distanceKm: 9.1,
    phone: '+216 71 000 004',
    hours: 'Lun–Sam 9h–19h',
    partnerCode: 'ARI-004',
    lat: 36.862,
    lng: 10.195,
  },
  {
    id: 'store-demo-5',
    name: 'Point relais PetfoodTN Manouba',
    type: 'relay',
    typeLabel: 'Point relais',
    typeIcon: '📦',
    address: 'Av. de la République, Manouba',
    distanceKm: 12.3,
    phone: '+216 71 000 005',
    hours: 'Lun–Ven 8h–17h',
    partnerCode: 'MAN-005',
    lat: 36.81,
    lng: 10.097,
  },
];

export const DEMO_LOCAL_ALERTS = [
  {
    id: 'alert-vac-1',
    type: 'vaccination',
    title: 'Campagne antirabique — La Marsa',
    description: 'Vaccination gratuite pour chiens et chats. Apportez le carnet de santé. Samedi 9h–14h, place centrale.',
    region: 'La Marsa',
    date: daysAhead(5),
    urgency: 'high',
    distanceKm: 1.2,
    lat: 36.878,
    lng: 10.325,
  },
  {
    id: 'alert-vac-2',
    type: 'vaccination',
    title: 'Rappel vaccin CHPPi — Carthage',
    description: 'Clinique VetCarthage : rappels CHPPi chiens à tarif réduit (−30 %) jusqu\'à fin du mois.',
    region: 'Carthage',
    date: daysAhead(12),
    urgency: 'medium',
    distanceKm: 2.8,
  },
  {
    id: 'alert-promo-1',
    type: 'promotion',
    title: '−20 % croquettes premium chien',
    description: 'Offre exclusive animalerie La Marsa — croquettes 12 kg adulte. Valable 7 jours.',
    region: 'La Marsa',
    date: daysAhead(7),
    urgency: 'medium',
    distanceKm: 1.2,
  },
  {
    id: 'alert-promo-2',
    type: 'promotion',
    title: 'Pack toilettage + shampoing offert',
    description: 'PetShop Ariana : shampoing offert pour toute prestation toilettage ce week-end.',
    region: 'Ariana',
    date: daysAhead(3),
    urgency: 'low',
    distanceKm: 9.1,
  },
  {
    id: 'alert-event-1',
    type: 'event',
    title: 'Salon animalier Tunis 2026',
    description: 'Rencontrez des éleveurs, démonstrations éducation canine, stands PetfoodTN. Entrée gratuite.',
    region: 'Toute la Tunisie',
    date: daysAhead(21),
    urgency: 'medium',
    distanceKm: 8,
    lat: 36.8065,
    lng: 10.1815,
  },
  {
    id: 'alert-event-2',
    type: 'event',
    title: 'Concours agility — Sidi Bou Said',
    description: 'Inscriptions ouvertes pour le concours d\'agility du 28 juin. Catégories chien S/M/L.',
    region: 'Sidi Bou Said',
    date: daysAhead(14),
    urgency: 'low',
    distanceKm: 3.5,
  },
];

export const DEMO_DASHBOARD = {
  activeOrder: {
    id: 'demo-order-002',
    status: 'shipped',
    total: 42,
    createdAt: daysAgo(2),
    items: [{ quantity: 2, productId: { name: 'Pâtée chat saumon 400 g' } }],
  },
  nextAppointment: {
    id: 'demo-appt-1',
    petName: 'Max',
    type: 'Consultation',
    date: daysAhead(3),
    status: 'scheduled',
    visitMode: 'cabinet',
  },
  loyalty: { points: 142, tier: 'standard' },
  iotAlerts: [
    { id: 'iot-1', type: 'feeder', level: 'warning', message: 'Distributeur : niveau bas (18 %)', petName: 'Max' },
    { id: 'iot-2', type: 'water', level: 'info', message: 'Hydratation sous l\'objectif — Luna', petName: 'Luna' },
  ],
  subscriptions: [
    {
      id: 'demo-sub-1',
      productId: 'demo-prod-croq',
      product: { name: 'Croquettes Premium Chien Adulte 12 kg', price: 54.9 },
      quantity: 1,
      frequencyDays: 30,
      nextDeliveryAt: daysAhead(12),
      status: 'active',
      discountPercent: 10,
    },
  ],
  household: {
    id: 'demo-hh',
    name: 'Foyer démo',
    inviteCode: 'PET-DEMO01',
    myRole: 'owner',
    members: [
      { userId: 'demo_client', name: 'Client Test', email: 'client@petfood.tn', role: 'owner' },
      { userId: 'demo_member', name: 'Conjoint(e)', email: 'conjoint@petfood.tn', role: 'member' },
    ],
  },
  stats: {
    ordersActive: 1,
    appointmentsUpcoming: 1,
    iotAlertCount: 2,
    subscriptionCount: 1,
    familyMembers: 2,
  },
};

export const DEMO_FAMILY = {
  household: DEMO_DASHBOARD.household,
  pets: [
    { id: 'demo-pet-1', name: 'Max', type: 'dog', breed: 'Labrador', ownerId: 'demo_client' },
    { id: 'demo-pet-2', name: 'Luna', type: 'cat', breed: 'Européen', ownerId: 'demo_member' },
  ],
};

export const DEMO_SUBSCRIPTIONS = [
  {
    id: 'demo-sub-1',
    productId: 'demo-prod-croq',
    product: { id: 'demo-prod-croq', name: 'Croquettes Premium Chien Adulte 12 kg', price: 54.9, imageUrl: null },
    quantity: 1,
    frequencyDays: 30,
    nextDeliveryAt: daysAhead(12),
    status: 'active',
    discountPercent: 10,
    petName: 'Max',
  },
  {
    id: 'demo-sub-2',
    productId: 'demo-prod-patee',
    product: { id: 'demo-prod-patee', name: 'Pâtée chat saumon 400 g', price: 21.0, imageUrl: null },
    quantity: 2,
    frequencyDays: 30,
    nextDeliveryAt: daysAhead(22),
    status: 'paused',
    discountPercent: 10,
    petName: 'Luna',
  },
];

export const withDemoFallback = (data, demo) => {
  if (Array.isArray(data) && data.length > 0) return data;
  return demo;
};

export const buildDemoHistory = () => [
  {
    id: 'hist-order-1',
    date: daysAgo(12),
    title: 'Commande 001 — Livrée',
    description: '2 article(s) — 89.50 DT — croquettes + manteau chien M',
  },
  {
    id: 'hist-inv-1',
    date: daysAgo(11),
    title: 'Facture payée',
    description: '89.50 DT — portefeuille PetfoodTN',
  },
  {
    id: 'hist-review-1',
    date: daysAgo(10),
    title: 'Avis — Manteau chien taille M',
    description: '5/5 — Excellent manteau, taille M parfaite',
  },
  {
    id: 'hist-service-1',
    date: daysAgo(14),
    title: 'Toilettage Max',
    description: 'Service terminé — 45 DT — note 5/5',
  },
  {
    id: 'hist-loyalty-1',
    date: daysAgo(12),
    title: 'Points fidélité',
    description: '+55 points — commande croquettes premium',
  },
];

export const DEMO_CLIENT_ADVANCED_AI = {
  mode: 'demo',
  groqPowered: true,
  pets: [
    {
      id: 'pet-demo-1',
      name: 'Rex',
      type: 'dog',
      breed: 'Berger allemand',
      ageYears: 4,
      weightKg: 32,
      healthScore: 82,
      healthLabel: 'Bon état général',
      nutritionTip: 'Croquettes riches en protéines (26-28 %) pour chien actif de grande taille.',
      vetReminder: 'Vaccin rappel dans 45 jours',
      riskFlags: [],
    },
    {
      id: 'pet-demo-2',
      name: 'Misty',
      type: 'cat',
      breed: 'Européen',
      ageYears: 2,
      weightKg: 4.2,
      healthScore: 75,
      healthLabel: 'Surveillance poids',
      nutritionTip: 'Chat d\'intérieur : portions contrôlées, croquettes stérilisé recommandées.',
      vetReminder: 'Déparasitage trimestriel à prévoir',
      riskFlags: ['prise de poids légère'],
    },
  ],
  smartReorder: [
    {
      productId: 'prod-1',
      productName: 'Croquettes Premium Chien Adulte 12 kg',
      petName: 'Rex',
      daysUntilEmpty: 8,
      urgency: 'soon',
      suggestedDate: new Date(Date.now() + 8 * 86400000).toISOString().slice(0, 10),
      avgCycleDays: 30,
      confidence: 0.87,
    },
    {
      productId: 'prod-2',
      productName: 'Pâtée chat saumon 400 g',
      petName: 'Misty',
      daysUntilEmpty: 14,
      urgency: 'normal',
      suggestedDate: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
      avgCycleDays: 21,
      confidence: 0.72,
    },
  ],
  healthSummary: 'Rex est en excellente forme — pensez au rappel vaccinal dans 6 semaines. Misty présente une légère prise de poids : adaptez les portions et privilégiez une alimentation « light » ou stérilisé.',
  recommendations: [
    { name: 'Croquettes Senior Chien 10 kg', reason: 'Alternative si Rex vieillit', score: 0.82 },
    { name: 'Croquettes Stérilisé Chat 3 kg', reason: 'Adapté au profil Misty', score: 0.79 },
  ],
};
