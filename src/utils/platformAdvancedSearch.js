/** Options recherche avancée plateforme */

export const DEFAULT_PLATFORM_ADVANCED = {
  scope: 'all',
  category: 'all',
  animalType: 'all',
  minRating: '',
  useNlp: false,
  sortBy: 'relevance',
};

export const PLATFORM_SCOPES = [
  { id: 'all', label: 'Tout' },
  { id: 'pages', label: 'Pages uniquement' },
  { id: 'products', label: 'Produits catalogue' },
  { id: 'nlp', label: 'Produits via avis NLP (IA)' },
];

export const PLATFORM_SORTS = [
  { id: 'relevance', label: 'Pertinence' },
  { id: 'name-asc', label: 'Nom A → Z' },
  { id: 'name-desc', label: 'Nom Z → A' },
  { id: 'price-asc', label: 'Prix croissant' },
  { id: 'price-desc', label: 'Prix décroissant' },
];

export const countActivePlatformFilters = (advanced) => {
  let n = 0;
  if (!advanced) return 0;
  if (advanced.scope !== 'all') n += 1;
  if (advanced.category !== 'all') n += 1;
  if (advanced.animalType !== 'all') n += 1;
  if (advanced.minRating) n += 1;
  if (advanced.useNlp) n += 1;
  if (advanced.sortBy !== 'relevance') n += 1;
  return n;
};

export const parsePlatformAdvancedFromParams = (searchParams) => ({
  scope: searchParams.get('scope') || DEFAULT_PLATFORM_ADVANCED.scope,
  category: searchParams.get('category') || 'all',
  animalType: searchParams.get('animal') || 'all',
  minRating: searchParams.get('minRating') || '',
  useNlp: searchParams.get('nlp') === '1',
  sortBy: searchParams.get('sort') || 'relevance',
});

export const platformAdvancedToParams = (q, advanced, extra = {}) => {
  const p = new URLSearchParams();
  if (q?.trim()) p.set('q', q.trim());
  if (extra.advanced) p.set('advanced', '1');
  if (advanced.scope !== 'all') p.set('scope', advanced.scope);
  if (advanced.category !== 'all') p.set('category', advanced.category);
  if (advanced.animalType !== 'all') p.set('animal', advanced.animalType);
  if (advanced.minRating) p.set('minRating', String(advanced.minRating));
  if (advanced.useNlp) p.set('nlp', '1');
  if (advanced.sortBy !== 'relevance') p.set('sort', advanced.sortBy);
  return p;
};
