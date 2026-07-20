/**
 * Filtre catalogue client : nom, description, catégorie, tags, type animal.
 */
export const matchProductSearch = (product, searchTerm) => {
  const q = String(searchTerm || '').trim().toLowerCase();
  if (!q) return true;

  const tags = Array.isArray(product.tags)
    ? product.tags.join(' ')
    : String(product.tags || '');

  const haystack = [
    product.name,
    product.description,
    product.category,
    product.animalType,
    tags,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  return q.split(/\s+/).every((word) => haystack.includes(word));
};

export const CATEGORY_FILTERS = [
  { id: 'all', label: 'Tout' },
  { id: 'croquettes', label: '🥣 Croquettes' },
  { id: 'patee', label: '🍖 Pâtée' },
  { id: 'friandises', label: '🦴 Friandises' },
  { id: 'nourriture', label: '🍽️ Nourriture' },
  { id: 'jouets', label: '🎾 Jouets' },
  { id: 'accessoires', label: '🎒 Accessoires' },
  { id: 'niches', label: '🏠 Niches & maisons' },
  { id: 'litiere', label: '🚽 Litière' },
  { id: 'toilettage', label: '✂️ Toilettage' },
  { id: 'transport', label: '🧳 Transport' },
  { id: 'hygiene', label: '✨ Hygiène maison' },
  { id: 'sante', label: '💊 Santé' },
  { id: 'iot', label: '🤖 Innovants' },
  { id: 'personnalise', label: '🎁 Personnalisé' },
  { id: 'packs', label: '📦 Kits & packs' },
  { id: 'aquarium', label: '🐠 Aquarium' },
  { id: 'vetements', label: '👕 Vêtements' },
  { id: 'animaux', label: '🐾 Animaux à adopter' },
];

export const ANIMAL_TYPE_FILTERS = [
  { id: 'all', label: 'Tous' },
  { id: 'dog', label: '🐕 Chien' },
  { id: 'cat', label: '🐈 Chat' },
  { id: 'bird', label: '🐦 Oiseau' },
  { id: 'fish', label: '🐟 Poisson' },
  { id: 'rabbit', label: '🐰 Lapin' },
  { id: 'hamster', label: '🐹 Hamster' },
  { id: 'reptile', label: '🦎 Reptile' },
  { id: 'other', label: '🐾 Autre' },
];

const haystack = (product) => {
  const tags = Array.isArray(product.tags)
    ? product.tags.join(' ')
    : String(product.tags || '');
  return [
    product.category,
    product.name,
    product.description,
    tags,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
};

export const matchCategoryFilter = (product, categoryFilter) => {
  if (!categoryFilter || categoryFilter === 'all') return true;
  const text = haystack(product);
  const cat = String(product.category || '').toLowerCase();

  const rules = {
    croquettes: ['croquette', 'kibble'],
    patee: ['patee', 'pâtée', 'pate', 'boîte', 'boite'],
    friandises: ['friandise', 'snack', 'récompense', 'recompense', 'bouchée'],
    jouets: ['jouet', 'jouets', 'balle', 'peluche', 'interactif'],
    accessoires: ['accessoire', 'laisse', 'collier', 'litière', 'litere', 'griffoir', 'arbre', 'gamelle', 'iot', 'connectee', 'feeder', 'distributeur'],
    niches: ['niche', 'maison', 'igloo', 'cage', 'couverture', 'housse', 'coussin', 'habitat', 'abri', 'nichoir', 'tunnel', 'lit orthopedique', 'lit orthopédique', 'panier'],
    litiere: ['litiere', 'litière', 'bac', 'pelle', 'copeaux', 'agglomerante'],
    toilettage: ['toilettage', 'shampooing', 'shampoing', 'brosse', 'coupe-griffes', 'griffes'],
    transport: ['transport', 'cage de transport', 'sac de transport', 'iata', 'voyage'],
    hygiene: ['hygiene', 'hygiène', 'odeur', 'lingette', 'aspirateur', 'poil', 'tapis anti', 'spray', 'maison propre', 'dejections', 'déjections'],
    sante: ['sante', 'santé', 'antiparasitaire', 'puces', 'tiques', 'complement', 'complément', 'vitamine'],
    iot: ['iot', 'gps', 'traceur', 'camera', 'caméra', 'distributeur', 'automatique', 'intelligent', 'porte electronique', 'feeder'],
    personnalise: ['personnalise', 'personnalisé', 'medaille', 'médaille', 'grave', 'gravé', 'portrait', 'cadeau', 'prenom', 'prénom'],
    packs: ['pack', 'kit', 'coffret', 'accueil', 'anniversaire', 'voyage', 'toilettage pack', 'kit d\'accueil'],
    aquarium: ['aquarium', 'filtre', 'chauffage', 'pompe', 'led', 'decoration', 'déco', 'eau aquarium'],
    vetements: ['vetement', 'vêtement', 'manteau', 'pull', 'harnais', 'impermeable', 'imperméable'],
    nourriture: ['nourriture', 'aliment', 'croquette', 'patee', 'pâtée', 'granule', 'melange'],
    animaux: ['animaux', 'adoption', 'élevage', 'elevage', 'compagnon', 'nac', 'perruche', 'lapin', 'hamster'],
  };

  const keys = rules[categoryFilter];
  if (keys) {
    if (cat === categoryFilter) return true;
    return keys.some((k) => text.includes(k));
  }

  return cat.includes(categoryFilter) || text.includes(categoryFilter);
};

export const buildProductAiContext = (product, catalog = []) => ({
  type: 'product_question',
  product: {
    id: product._id || product.id,
    name: product.name,
    price: product.price,
    discount: product.discount,
    category: product.category,
    animalType: product.animalType,
    description: product.description,
    stock: product.stock,
    tags: product.tags,
  },
  catalogSample: catalog.slice(0, 12).map((p) => ({
    name: p.name,
    category: p.category,
    animalType: p.animalType,
    price: p.price,
  })),
});

export const askAiAboutProduct = (product, catalog, navigate) => {
  try {
    sessionStorage.setItem('ai:productContext', JSON.stringify(buildProductAiContext(product, catalog)));
    sessionStorage.setItem('ai:initialQuestion', `Parle-moi de "${product.name}" : composition, pour quel animal, avantages et comment l'utiliser.`);
  } catch (e) { /* ignore */ }
  window.dispatchEvent(new CustomEvent('petfood:open-chat'));
  if (navigate) navigate('/client-products');
};
