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
  { id: 'accessoires', label: '🎾 Accessoires' },
  { id: 'nourriture', label: '🍽️ Nourriture' },
];

export const matchCategoryFilter = (product, categoryFilter) => {
  if (!categoryFilter || categoryFilter === 'all') return true;
  const cat = String(product.category || '').toLowerCase();
  const name = String(product.name || '').toLowerCase();
  const tags = String(product.tags || '').toLowerCase();

  if (categoryFilter === 'croquettes') {
    return cat.includes('croquette') || name.includes('croquette') || tags.includes('croquette');
  }
  if (categoryFilter === 'patee') {
    return cat.includes('patee') || cat.includes('pâtée') || name.includes('pâtée') || name.includes('patee');
  }
  if (categoryFilter === 'friandises') {
    return cat.includes('friandise') || name.includes('friandise') || tags.includes('friandise');
  }
  if (categoryFilter === 'accessoires') {
    return cat.includes('accessoire') || name.includes('accessoire');
  }
  return cat.includes(categoryFilter) || name.includes(categoryFilter);
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
  navigate('/client-ai');
};
