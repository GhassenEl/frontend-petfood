import api from './api';
import { getSearchIndexForRole } from '../config/globalSearchCatalog';
import { matchProductSearch, matchCategoryFilter } from './productCatalog';
import { productId } from './productId';
import { searchProductsByReviews } from '../services/hybridRecommendationService';
import { DEFAULT_PLATFORM_ADVANCED } from './platformAdvancedSearch';

const scoreMatch = (text, query) => {
  const hay = String(text || '').toLowerCase();
  const q = query.trim().toLowerCase();
  if (!q) return 0;
  if (hay === q) return 100;
  if (hay.startsWith(q)) return 80;
  if (hay.includes(q)) return 50;
  const words = q.split(/\s+/).filter(Boolean);
  if (words.every((w) => hay.includes(w))) return 40;
  return 0;
};

export const searchPages = (query, role) => {
  const q = query.trim();
  if (!q) return [];
  return getSearchIndexForRole(role)
    .map((item) => ({
      ...item,
      score: Math.max(scoreMatch(item.label, q), scoreMatch(item.keywords, q)),
    }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 24);
};

let productsCache = null;
let productsCacheAt = 0;
const CACHE_MS = 60_000;

async function loadProducts() {
  if (productsCache && Date.now() - productsCacheAt < CACHE_MS) return productsCache;
  const { data } = await api.get('/products');
  productsCache = Array.isArray(data) ? data : data?.products || [];
  productsCacheAt = Date.now();
  return productsCache;
}

const applyProductFilters = (list, advanced) => {
  let out = list;
  if (advanced.category && advanced.category !== 'all') {
    out = out.filter((p) => matchCategoryFilter(p, advanced.category));
  }
  if (advanced.animalType && advanced.animalType !== 'all') {
    out = out.filter((p) => p.animalType === advanced.animalType);
  }
  return out;
};

const sortProducts = (list, sortBy, query) => {
  const items = [...list];
  if (sortBy === 'name-asc') {
    return items.sort((a, b) => String(a.label).localeCompare(String(b.label), 'fr'));
  }
  if (sortBy === 'name-desc') {
    return items.sort((a, b) => String(b.label).localeCompare(String(a.label), 'fr'));
  }
  if (sortBy === 'price-asc') {
    return items.sort((a, b) => (a.price || 0) - (b.price || 0));
  }
  if (sortBy === 'price-desc') {
    return items.sort((a, b) => (b.price || 0) - (a.price || 0));
  }
  if (query) {
    return items.sort((a, b) => (b.score || 0) - (a.score || 0));
  }
  return items;
};

const mapCatalogProduct = (p, query, extra = {}) => ({
  type: 'product',
  id: productId(p),
  label: p.name || p.label,
  icon: '🏷️',
  route: `/client-products?q=${encodeURIComponent(query || p.name)}`,
  section: extra.section || 'Produits',
  meta: [p.category, p.animalType].filter(Boolean).join(' · ') || 'Produit',
  price: Number(p.price) || 0,
  score: extra.score,
  hybridScore: extra.hybridScore,
  nlpPowered: extra.nlpPowered,
});

export const searchProducts = async (query, { limit = 12, advanced = {} } = {}) => {
  const q = query.trim();
  if (!q || q.length < 2) return [];
  try {
    const list = applyProductFilters(await loadProducts(), advanced);
    return list
      .filter((p) => matchProductSearch(p, q))
      .slice(0, limit * 2)
      .map((p) => mapCatalogProduct(p, q, { score: scoreMatch(p.name, q) }))
      .slice(0, limit);
  } catch {
    return [];
  }
};

export const searchProductsNlp = async (query, { limit = 12, minRating } = {}) => {
  const q = query.trim();
  if (!q || q.length < 2) return [];
  try {
    const res = await searchProductsByReviews({
      query: q,
      minRating: minRating ? Number(minRating) : undefined,
      limit,
    });
    const products = res?.products || [];
    return products.map((item) => {
      const p = item.product || item;
      return mapCatalogProduct(p, q, {
        section: 'Produits · NLP avis',
        hybridScore: item.hybridScore,
        nlpPowered: true,
        score: Math.round((item.hybridScore || 0) * 100),
      });
    });
  } catch {
    return [];
  }
};

export const runGlobalSearch = async (query, role, advanced = DEFAULT_PLATFORM_ADVANCED) => {
  const q = query.trim();
  const scope = advanced?.scope || 'all';

  let pages = [];
  let products = [];
  let nlpProducts = [];

  if (scope === 'all' || scope === 'pages') {
    pages = q ? searchPages(q, role) : getSearchIndexForRole(role).slice(0, 12);
  }

  if (role === 'client' && (scope === 'all' || scope === 'products' || scope === 'nlp')) {
    if (scope === 'nlp' || advanced?.useNlp) {
      nlpProducts = q ? await searchProductsNlp(q, { limit: 20, minRating: advanced?.minRating }) : [];
    }
    if (scope === 'nlp') {
      products = nlpProducts;
    } else if (scope === 'products') {
      products = q ? await searchProducts(q, { limit: 20, advanced }) : [];
    } else {
      const catalog = q ? await searchProducts(q, { limit: 20, advanced }) : [];
      const nlpIds = new Set(nlpProducts.map((p) => p.id));
      products = [...nlpProducts, ...catalog.filter((p) => !nlpIds.has(p.id))];
    }

    products = sortProducts(products, advanced?.sortBy || 'relevance', q).slice(0, 24);
  }

  return {
    pages,
    products,
    nlpProducts,
    query: q,
    advanced,
    mode: advanced?.useNlp || scope === 'nlp' ? 'nlp' : 'standard',
  };
};
