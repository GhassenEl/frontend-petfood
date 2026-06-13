/** Données publiques visiteur — catalogue, packs, races (sans authentification). */

import { DEMO_FAVORITES } from './clientDemoData';

const CAT_TO_ANIMAL = {
  'cat-dog': 'dog',
  'cat-cat': 'cat',
  'cat-access': 'other',
  'cat-hygiene': 'cat',
};

const CAT_TO_CATEGORY = {
  'cat-dog': 'croquettes',
  'cat-cat': 'patee',
  'cat-access': 'accessoires',
  'cat-hygiene': 'accessoires',
};

const mapVendorProduct = (p) => ({
  id: p.id,
  _id: p.id,
  name: p.name,
  price: Number(p.price),
  stock: Number(p.stock ?? 0),
  discount: Number(p.promotionPercent || 0),
  promotionPercent: Number(p.promotionPercent || 0),
  description: p.description || '',
  imageUrl: p.imageUrl,
  category: CAT_TO_CATEGORY[p.categoryId] || 'nourriture',
  animalType: CAT_TO_ANIMAL[p.categoryId] || 'other',
  vendorName: 'Animalerie Tunis — Démo',
  tags: [p.categoryId, 'marketplace'].filter(Boolean),
});

const VENDOR_CATALOG = [
  {
    id: 'vp1', name: 'Croquettes premium chien 15 kg', categoryId: 'cat-dog',
    stock: 22, price: 89, promotionPercent: 0,
    description: 'Croquettes sans céréales, riche en protéines. Idéal chiens actifs.',
    imageUrl: 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=400&h=300&fit=crop',
  },
  {
    id: 'vp2', name: 'Pâtée chat saumon 12×400 g', categoryId: 'cat-cat',
    stock: 3, price: 42, promotionPercent: 10,
    description: 'Pâtée humide au saumon pour chat adulte.',
    imageUrl: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=400&h=300&fit=crop',
  },
  {
    id: 'vp3', name: 'Litière agglomérante 10 L', categoryId: 'cat-hygiene',
    stock: 12, price: 28, promotionPercent: 0,
    description: 'Litière minérale agglomérante parfumée.',
    imageUrl: 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d4?w=400&h=300&fit=crop',
  },
  {
    id: 'vp4', name: 'Jouet corde résistant', categoryId: 'cat-access',
    stock: 45, price: 18, promotionPercent: 15,
    description: 'Corde en coton pour chien, résistante.',
    imageUrl: 'https://images.unsplash.com/photo-1605568427561-40dd23c2acea?w=400&h=300&fit=crop',
  },
  {
    id: 'vp5', name: 'Fontaine eau chat 2 L', categoryId: 'cat-cat',
    stock: 8, price: 65, promotionPercent: 0,
    description: 'Fontaine filtrante silencieuse 2 litres.',
    imageUrl: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=400&h=300&fit=crop',
  },
  {
    id: 'vp6', name: 'Graines perruche premium 1 kg', categoryId: 'cat-access',
    stock: 30, price: 12, promotionPercent: 5,
    description: 'Mélange mil, alpiste et lin pour perruches.',
    imageUrl: 'https://images.unsplash.com/photo-1552728080-b815ada7f1ce?w=400&h=300&fit=crop',
    animalType: 'bird',
    category: 'nourriture',
  },
  {
    id: 'vp7', name: 'Flocons poissons tropicaux 100 g', categoryId: 'cat-access',
    stock: 20, price: 9.5, promotionPercent: 0,
    description: 'Aliment floconné enrichi en spiruline.',
    imageUrl: 'https://images.unsplash.com/photo-1524704654690-b56c05a4fe29?w=400&h=300&fit=crop',
    animalType: 'fish',
    category: 'nourriture',
  },
  {
    id: 'vp8', name: 'Granulés lapin nain 2 kg', categoryId: 'cat-dog',
    stock: 14, price: 24, promotionPercent: 8,
    description: 'Granulés riches en fibres pour lapin nain.',
    imageUrl: 'https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=400&h=300&fit=crop',
    animalType: 'rabbit',
    category: 'nourriture',
  },
].map((p) => {
  const base = mapVendorProduct(p);
  if (p.animalType) base.animalType = p.animalType;
  if (p.category) base.category = p.category;
  return base;
});

export const VISITOR_PUBLIC_PRODUCTS = [
  ...VENDOR_CATALOG,
  ...DEMO_FAVORITES.map((p) => ({
    ...p,
    discount: p.discount || 0,
    vendorName: 'PetfoodTN Boutique',
  })),
];

export const VISITOR_PRODUCT_PACKS = [
  {
    id: 'pack-chiot',
    type: 'puppy',
    label: 'Pack Chiot',
    icon: '🐶',
    description: 'Croquettes chiot + friandises éducatives + jouet — -8 % bundle.',
    discountPercent: 8,
    totalPrice: 72.5,
    originalPrice: 78.8,
    items: [
      { productId: 'vp1', name: 'Croquettes premium chien 3 kg', price: 28, quantity: 1 },
      { productId: 'vp4', name: 'Jouet corde résistant', price: 18, quantity: 1 },
      { productId: 'demo-fav-1', name: 'Friandises naturelles chiot', price: 14.5, quantity: 1 },
    ],
    forTypes: ['dog'],
    ageHint: '0–12 mois',
  },
  {
    id: 'pack-chaton',
    type: 'kitten',
    label: 'Pack Chaton',
    icon: '🐱',
    description: 'Pâtée chaton + litière starter + griffoir — -8 % bundle.',
    discountPercent: 8,
    totalPrice: 58.2,
    originalPrice: 63.3,
    items: [
      { productId: 'vp2', name: 'Pâtée chat saumon 6×400 g', price: 24, quantity: 1 },
      { productId: 'vp3', name: 'Litière agglomérante 5 L', price: 16, quantity: 1 },
      { productId: 'vp5', name: 'Griffoir carton chaton', price: 12, quantity: 1 },
    ],
    forTypes: ['cat'],
    ageHint: '0–12 mois',
  },
  {
    id: 'pack-senior',
    type: 'senior',
    label: 'Pack Senior',
    icon: '🦴',
    description: 'Alimentation senior + compléments articulations — -8 % bundle.',
    discountPercent: 8,
    totalPrice: 95.4,
    originalPrice: 103.7,
    items: [
      { productId: 'demo-fav-2', name: 'Croquettes Premium Chien Adulte 12 kg', price: 54.9, quantity: 1 },
      { productId: 'vp4', name: 'Jouet doux articulations', price: 22, quantity: 1 },
      { productId: 'vp1', name: 'Complément oméga-3', price: 18.5, quantity: 1 },
    ],
    forTypes: ['dog', 'cat'],
    ageHint: '7+ ans',
  },
  {
    id: 'pack-sport',
    type: 'sport',
    label: 'Pack Sportif',
    icon: '⚡',
    description: 'Croquettes haute énergie + friandises récupération — -8 % bundle.',
    discountPercent: 8,
    totalPrice: 88.0,
    originalPrice: 95.7,
    items: [
      { productId: 'vp1', name: 'Croquettes premium chien 15 kg', price: 89, quantity: 1 },
    ],
    forTypes: ['dog'],
    ageHint: 'Chiens actifs / Sloughi',
  },
];

/** Races tunisiennes et besoins — aperçu public. */
export const VISITOR_BREED_GUIDES = [
  {
    type: 'dog',
    icon: '🐕',
    label: 'Chien',
    breeds: [
      { name: 'Sloughi', origin: 'Tunisie / Maghreb', needs: 'Lévrier actif — protéines élevées, 2 repas/j, exercice quotidien.', idealKg: '18–28' },
      { name: 'Berger allemand', origin: 'Travail & sport', needs: 'Croquettes riches en glucides complexes, articulations surveillées.', idealKg: '28–38' },
      { name: 'Labrador', origin: 'Famille active', needs: 'Attention au surpoids — ration contrôlée, friandises limitées.', idealKg: '25–32' },
    ],
  },
  {
    type: 'cat',
    icon: '🐈',
    label: 'Chat',
    breeds: [
      { name: 'Chat tunisien / maghrébin', origin: 'Tunisie', needs: 'Carnivore strict — taurine, hydratation (pâtée + fontaine).', idealKg: '3,5–5' },
      { name: 'Européen', origin: 'Courant', needs: 'Stérilisation → réduire calories de 20 %.', idealKg: '3,5–5,5' },
    ],
  },
  {
    type: 'bird',
    icon: '🐦',
    label: 'Oiseau',
    breeds: [
      { name: 'Perruche', origin: 'Compagnie', needs: 'Graines variées + calcium, eau fraîche quotidienne.', idealKg: '0,03–0,05' },
      { name: 'Pigeon voyageur', origin: 'Sport', needs: 'Énergie élevée avant course — grains riches.', idealKg: '0,35–0,50' },
    ],
  },
  {
    type: 'rabbit',
    icon: '🐰',
    label: 'Lapin',
    breeds: [
      { name: 'Lapin nain', origin: 'NAC', needs: 'Foin à volonté + granulés limités, pas de légumes sucrés.', idealKg: '1,2–2' },
    ],
  },
  {
    type: 'reptile',
    icon: '🦎',
    label: 'Reptile',
    breeds: [
      { name: 'Tortue grecque', origin: 'Méditerranée', needs: 'Végétaux frais + calcium, UV quotidien.', idealKg: '0,5–1,2' },
      { name: 'Gecko léopard', origin: 'NAC', needs: 'Insectes + vitamines D3, terrarium chauffé.', idealKg: '0,05–0,08' },
    ],
  },
];

let visitorStore = null;

export const getVisitorDemoStore = () => {
  if (!visitorStore) {
    visitorStore = {
      products: [...VISITOR_PUBLIC_PRODUCTS],
    };
  }
  return visitorStore;
};
