/**
 * Normalise note moyenne et nombre d'avis produit (API snake_case ou camelCase).
 */
export function getProductRating(product) {
  const avg = Number(product?.rating_avg ?? product?.ratingAvg ?? product?.rating ?? 0);
  const count = Number(product?.rating_count ?? product?.ratingCount ?? product?.reviewCount ?? 0);
  const safeAvg = Number.isFinite(avg) ? Math.min(5, Math.max(0, avg)) : 0;
  return {
    avg: safeAvg,
    count: Number.isFinite(count) ? Math.max(0, count) : 0,
    hasRating: safeAvg > 0,
  };
}

export function renderStars(avg, max = 5) {
  const rating = Math.min(max, Math.max(0, Number(avg) || 0));
  const full = Math.round(rating);
  const empty = Math.max(0, max - full);
  return `${'★'.repeat(full)}${'☆'.repeat(empty)}`;
}

const ROUTE_RE = /`?(\/[a-z][\w/-]*)`?/gi;
const API_RE = /(GET|POST|PUT|DELETE|PATCH)\s+(\/api\/[\w/-]+)/gi;

const ROUTE_LABELS = {
  '/client-products': 'Boutique produits',
  '/client-orders': 'Mes commandes',
  '/client-invoices': 'Factures',
  '/checkout': 'Paiement',
  '/client-reviews': 'Mes avis',
  '/client-recommendations': 'Recommandations IA',
  '/admin/orders': 'Commandes admin',
  '/admin/products': 'Produits admin',
  '/admin/dashboard': 'Dashboard admin',
  '/vendor/products': 'Produits vendeur',
  '/vendor/orders': 'Commandes vendeur',
  '/moderator/vendors': 'Vendeurs modération',
  '/livreur/orders': 'Commandes livreur',
  '/vet/dashboard': 'Dashboard vétérinaire',
  '/marketing': 'Présentation',
  '/register': 'Inscription',
};

export function extractLocalSources(content = '', extra = []) {
  const text = String(content || '');
  const sources = [...extra];
  const seen = new Set();

  const push = (source) => {
    const key = `${source.type}:${source.ref || source.label}`;
    if (seen.has(key)) return;
    seen.add(key);
    sources.push(source);
  };

  let match;
  const routeRe = new RegExp(ROUTE_RE.source, 'gi');
  while ((match = routeRe.exec(text)) !== null) {
    const route = match[1];
    if (route.length > 2) {
      push({ type: 'page', label: ROUTE_LABELS[route] || route, ref: route });
    }
  }

  const apiRe = new RegExp(API_RE.source, 'gi');
  while ((match = apiRe.exec(text)) !== null) {
    push({ type: 'api', label: `${match[1]} ${match[2]}`, ref: match[2] });
  }

  if (/architecture|groq|rag/i.test(text)) {
    push({ type: 'doc', label: 'ARCHITECTURE.md', ref: 'ARCHITECTURE.md' });
  }

  return sources.slice(0, 8);
}
