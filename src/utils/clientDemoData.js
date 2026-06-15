/** Données de démonstration lorsque l'API renvoie des listes vides (espace client). */

const daysAgo = (n) => new Date(Date.now() - n * 86400000).toISOString();
const hoursAgo = (n) => new Date(Date.now() - n * 3600000).toISOString();

export const DEMO_ORDERS = [
  {
    _id: 'demo-order-001',
    id: 'demo-order-001',
    status: 'delivered',
    total: 89.5,
    createdAt: daysAgo(12),
    paymentMethod: 'wallet',
    items: [
      { quantity: 1, price: 54.9, productId: { name: 'Croquettes Premium Chien Adulte 12 kg' } },
      { quantity: 1, price: 34.6, productId: { name: 'Manteau chien taille M' } },
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
    imageUrl: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=600&h=360&fit=crop',
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
    imageUrl: 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=600&h=360&fit=crop',
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
  { level: 'warning', title: 'Niveau croquettes bas', message: 'Réservoir à 42 % — recharge recommandée sous 48 h.' },
  { level: 'info', title: 'Prochain repas', message: 'Distribution programmée à 19:30 (30 g).' },
  { level: 'info', title: 'Capteur IR', message: 'Aucun animal détecté devant la gamelle.' },
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
    waterMonitors: 2,
    waterOnline: 2,
    alerts: 4,
    criticalAlerts: 1,
    routinesToday: 5,
  },
  devices: [
    {
      id: 'demo-feeder-1',
      type: 'feeder',
      name: 'Distributeur Max — Salon',
      status: 'online',
      petName: 'Max',
      route: '/pet-feeder',
      metrics: { reservoirPercent: 42, temperature: 24.2, todayGrams: 65, isLowFood: true },
    },
    {
      id: 'demo-water-1',
      type: 'water',
      name: 'Fontaine Max — Salon',
      status: 'online',
      petName: 'Max',
      route: '/client-smart-water',
      metrics: { todayMl: 420, targetMl: 550, reservoirMl: 890, filterDaysLeft: 18 },
    },
    {
      id: 'demo-water-2',
      type: 'water',
      name: 'Fontaine Luna — Cuisine',
      status: 'online',
      petName: 'Luna',
      route: '/client-smart-water',
      metrics: { todayMl: 165, targetMl: 250, reservoirMl: 320, filterDaysLeft: 5 },
    },
  ],
  alerts: [
    { id: 'a1', source: 'feeder', severity: 'medium', title: 'Niveau croquettes bas', message: 'Réservoir à 42 % — recharge sous 48 h.', deviceId: 'demo-feeder-1', link: '/pet-feeder' },
    { id: 'a2', source: 'water', severity: 'high', title: 'Hydratation Luna', message: '66 % de l\'objectif journalier.', deviceId: 'demo-water-2', link: '/client-smart-water' },
    { id: 'a3', source: 'water', severity: 'medium', title: 'Filtre fontaine Luna', message: 'Filtre à changer dans 5 jours.', deviceId: 'demo-water-2', link: '/client-smart-water' },
    { id: 'a4', source: 'feeder', severity: 'low', title: 'Prochain repas Max', message: 'Distribution à 19:30 (30 g).', deviceId: 'demo-feeder-1', link: '/pet-feeder' },
  ],
  automations: [
    { id: 'auto-1', label: 'Réappro croquettes', description: 'Commander quand réservoir < 30 %', trigger: 'feeder.low_food', enabled: true, link: '/client-subscriptions' },
    { id: 'auto-2', label: 'Rappel hydratation', description: 'Notification si < 70 % objectif eau', trigger: 'water.low_hydration', enabled: true, link: '/client-smart-water' },
    { id: 'auto-3', label: 'Sync livraison', description: 'Créneau lié au stock distributeur', trigger: 'delivery.predictive', enabled: true, link: '/client-smart-delivery' },
  ],
  routines: [
    { time: '07:30', label: 'Petit-déjeuner Max', device: 'Distributeur', action: '30 g', type: 'feeder' },
    { time: '12:30', label: 'Déjeuner Max', device: 'Distributeur', action: '35 g', type: 'feeder' },
    { time: '19:30', label: 'Dîner Max', device: 'Distributeur', action: '30 g', type: 'feeder' },
    { time: '08:00', label: 'Remplissage fontaine', device: 'Fontaine Max', action: 'Check réservoir', type: 'water' },
    { time: '21:00', label: 'Contrôle Luna', device: 'Fontaine Luna', action: 'Rappel eau', type: 'water' },
  ],
  telemetry: {
    feederGrams7d: [52, 58, 61, 55, 68, 72, 65],
    waterMl7d: [480, 510, 445, 520, 490, 505, 420],
  },
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
  return {
    ...JSON.parse(JSON.stringify(data)),
    tracking: undefined,
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
  certifications: [
    { certId: 'CERT-ISO22000', type: 'ISO 22000', issuer: 'TUNAC', standard: 'Sécurité alimentaire', verified: true },
    { certId: 'CERT-BIO-TN', type: 'Bio Tunisie', issuer: 'ONAB', standard: 'Agriculture biologique', verified: true },
  ],
  blockchain: {
    network: 'PetfoodTN Chain (SHA-256)',
    algorithm: 'SHA-256',
    blockCount: 5,
    rootHash: 'a3f8c2e1b9d04f6a8e7c5d3b2a1f0e9d8c7b6a5f4e3d2c1b0a9f8e7d6',
    lastBlockHash: 'e6f1a5b4c3d26f8e0d9b7a6e5d4c3b2a1f0e9d8c7b6a5f4e3d2c1b0a9f8',
    isVerified: true,
    trustScore: 94,
    verification: { valid: true, reason: 'Chaîne intacte — aucune altération détectée (démo).', blockCount: 5 },
  },
  nutrition: { protein: '26%', fat: '12%', fiber: '4%', moisture: '9%', ash: '7%', kcalPer100g: 360 },
  allergens: ['Volaille'],
  ingredients: ['Viande déshydratée de poulet', 'Riz complet', 'Huile de poisson', 'Légumes déshydratés', 'Vitamines & minéraux'],
  qrPayload: { batchCode: 'PF-TN-2026-A042', productId: productId, verifyUrl: '/client-traceability?batch=PF-TN-2026-A042', rootHash: 'a3f8c2e1b9d04f6a' },
  supplyChain: [
    { step: 'origine', label: 'Origine matières premières', location: 'Béja, Tunisie', actor: 'NutriPet SARL', timestamp: daysAgo(90), hash: 'a3f8c2e1b9d04f6a8e7c5d3b2a1f0e9d8c7b6a5f4e3d2c1b0a9f8e7d6' },
    { step: 'transformation', label: 'Fabrication / conditionnement', location: 'Usine de conditionnement Béja Nord', actor: 'NutriPet SARL', timestamp: daysAgo(45), hash: 'b4e9d3f2c0a15e7b9d8f6e4c3b2a1f0e9d8c7b6a5f4e3' },
    { step: 'certification', label: 'Contrôle & certification', location: 'Laboratoire partenaire', actor: 'PetfoodTN Quality Lab', timestamp: daysAgo(30), hash: 'c5f0e4a3b1c26f8d0b9a7e5d4c3b2a1f0e9d8c7b6a5f4e3d2' },
    { step: 'distribution', label: 'Entrepôt & distribution', location: 'Hub PetfoodTN Tunis', actor: 'PetfoodTN Logistics', timestamp: daysAgo(20), hash: 'd6a1f5b4c3e27g9e1c0b8a7f6e5d4c3b2a1f0e9d8c7b6a5f4e3d2' },
    { step: 'retail', label: 'Mise en vente marketplace', location: 'PetfoodTN Marketplace', actor: 'PetfoodTN', timestamp: daysAgo(5), hash: 'e6f1a5b4c3d26f8e0d9b7a6e5d4c3b2a1f0e9d8c7b6a5f4e3d2c1b0a9f8' },
  ],
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

const daysAhead = (n) => new Date(Date.now() + n * 86400000).toISOString();

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
