import api from '../utils/api';
import { getProducts } from './productService';
import { DEMO_ADMIN_ORDERS } from '../utils/adminDemoData';
import { withDemoFallback } from '../utils/clientDemoData';
import { buildDigitalMarketingPack } from '../utils/digitalMarketingEngine';
import { fetchMarketingLiveContext, mergeMarketingLiveData } from './marketingLiveEnrichment';

const NEWSLETTER_KEY = 'petfoodtn_newsletter_subs';

const readLocalNewsletter = () => {
  try {
    const raw = localStorage.getItem(NEWSLETTER_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const writeLocalNewsletter = (items) => {
  localStorage.setItem(NEWSLETTER_KEY, JSON.stringify(items));
};

/** Charge le pack marketing digital (API ou calcul local). */
export async function fetchDigitalMarketingPack() {
  try {
    const remote = await api.get('/admin/marketing/pack').then((r) => r.data);
    if (remote?.kpis) {
      const liveContext = await fetchMarketingLiveContext();
      return mergeMarketingLiveData({ ...remote, source: 'api' }, liveContext);
    }
  } catch {
    /* fallback local */
  }

  const [ordersRes, usersRes, productsRes] = await Promise.all([
    api.get('/orders').catch(() => ({ data: [] })),
    api.get('/users').catch(() => ({ data: [] })),
    getProducts().catch(() => []),
  ]);

  const orders = withDemoFallback(ordersRes.data, DEMO_ADMIN_ORDERS);
  const users = usersRes.data || [];
  const products = Array.isArray(productsRes) ? productsRes : [];
  const newsletterSubs = readLocalNewsletter();

  const base = buildDigitalMarketingPack({
    orders,
    users,
    products,
    newsletterSubs,
  });

  const liveContext = await fetchMarketingLiveContext();
  return mergeMarketingLiveData(base, liveContext);
}

/** Inscription newsletter publique */
export async function subscribeNewsletter({ email, name = '' }) {
  const entry = {
    id: `nl-${Date.now()}`,
    email: String(email).trim().toLowerCase(),
    name: String(name).trim(),
    subscribedAt: new Date().toISOString(),
    source: 'landing',
  };

  try {
    const res = await api.post('/marketing/newsletter', entry, { _publicMarketing: true });
    return res.data || entry;
  } catch {
    const existing = readLocalNewsletter();
    if (existing.some((s) => s.email === entry.email)) {
      throw new Error('Cet email est déjà inscrit.');
    }
    const next = [...existing, entry];
    writeLocalNewsletter(next);
    return entry;
  }
}

export async function fetchNewsletterSubscribers() {
  try {
    const res = await api.get('/admin/marketing/newsletter');
    return res.data?.subscribers || res.data || [];
  } catch {
    return readLocalNewsletter();
  }
}

export default fetchDigitalMarketingPack;
