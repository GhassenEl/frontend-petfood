const parsePackageGrams = (name = '') => {
  const n = String(name);
  const kg = n.match(/(\d+(?:[.,]\d+)?)\s*kg/i);
  if (kg) return parseFloat(kg[1].replace(',', '.')) * 1000;
  const g = n.match(/(\d+)\s*g(?:\s|$)/i);
  if (g) return parseInt(g[1], 10);
  return 1000;
};

const normalize = (s) =>
  String(s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

const dailyUsageGrams = (product, quantity = 1) => {
  const name = normalize(`${product?.name} ${product?.category}`);
  const pack = parsePackageGrams(product?.name) * quantity;
  if (/croquette|croquettes|kibble|aliment|nourriture/.test(name)) {
    if (/chat|cat/.test(name)) return 55;
    if (/chien|dog|chiot|puppy/.test(name)) return 120;
    return 80;
  }
  if (/patee|pâtée|boite|boîte/.test(name)) return 40;
  if (/litiere|litière/.test(name)) return pack / 14;
  return pack / 30;
};

const productKey = (item) => {
  const p = item.productId || item.product || item;
  if (typeof p === 'object') return p._id || p.id || p.name;
  return p;
};

const productName = (item) => {
  const p = item.productId || item.product || item;
  if (typeof p === 'object') return p.name || 'Produit';
  return String(p);
};

/** Estime la date de rupture et recommande un réapprovisionnement */
export const buildReplenishmentPlan = ({ orders = [], products = [], subscriptions = [] } = {}) => {
  const events = [];

  (orders || []).forEach((order) => {
    const date = order.createdAt || order.date;
    (order.items || []).forEach((item) => {
      events.push({
        key: productKey(item),
        name: productName(item),
        date: new Date(date),
        quantity: Number(item.quantity) || 1,
        product: typeof item.productId === 'object' ? item.productId : null,
      });
    });
  });

  const byKey = new Map();
  events.forEach((ev) => {
    if (!byKey.has(ev.key)) byKey.set(ev.key, []);
    byKey.get(ev.key).push(ev);
  });

  const catalogMap = new Map((products || []).map((p) => [String(p.id || p._id), p]));

  const plans = [];

  byKey.forEach((evs, key) => {
    evs.sort((a, b) => a.date - b.date);
    const last = evs[evs.length - 1];
    const catalogProduct = catalogMap.get(String(key)) || last.product || { name: last.name };
    const qty = last.quantity || 1;
    const packGrams = parsePackageGrams(catalogProduct.name || last.name) * qty;
    const daily = dailyUsageGrams(catalogProduct, qty);

    let avgIntervalDays = 30;
    if (evs.length >= 2) {
      const gaps = [];
      for (let i = 1; i < evs.length; i += 1) {
        gaps.push((evs[i].date - evs[i - 1].date) / 86400000);
      }
      avgIntervalDays = gaps.reduce((a, b) => a + b, 0) / gaps.length;
    }

    const estimatedDaysLeft = Math.max(1, Math.round(packGrams / daily));
    const reorderBy = new Date(Date.now() + Math.max(0, estimatedDaysLeft - 5) * 86400000);
    const urgency =
      estimatedDaysLeft <= 3 ? 'critical' : estimatedDaysLeft <= 7 ? 'soon' : estimatedDaysLeft <= 14 ? 'upcoming' : 'ok';

    const sub = (subscriptions || []).find(
      (s) => String(s.productId) === String(key) || s.product?.name === last.name,
    );

    plans.push({
      productId: key,
      productName: catalogProduct.name || last.name,
      product: catalogProduct,
      lastOrderAt: last.date.toISOString(),
      packGrams,
      dailyUsageGrams: Math.round(daily),
      estimatedDaysLeft,
      reorderBy: reorderBy.toISOString(),
      avgReorderIntervalDays: Math.round(avgIntervalDays),
      urgency,
      hasSubscription: Boolean(sub && sub.status === 'active'),
      aiSummary: `Stock estimé épuisé dans ~${estimatedDaysLeft} j (${Math.round(daily)} g/jour). Commandez avant le ${reorderBy.toLocaleDateString('fr-FR')}.`,
    });
  });

  (subscriptions || [])
    .filter((s) => s.status === 'active')
    .forEach((sub) => {
      if (plans.some((p) => String(p.productId) === String(sub.productId))) return;
      const next = sub.nextDeliveryAt ? new Date(sub.nextDeliveryAt) : null;
      plans.push({
        productId: sub.productId,
        productName: sub.product?.name || 'Abonnement',
        product: sub.product,
        estimatedDaysLeft: next ? Math.ceil((next - Date.now()) / 86400000) : sub.frequencyDays,
        reorderBy: sub.nextDeliveryAt || null,
        urgency: 'ok',
        hasSubscription: true,
        aiSummary: `Abonnement actif — prochaine livraison ${next ? next.toLocaleDateString('fr-FR') : 'planifiée'}.`,
      });
    });

  return plans.sort((a, b) => {
    const order = { critical: 0, soon: 1, upcoming: 2, ok: 3 };
    return (order[a.urgency] ?? 9) - (order[b.urgency] ?? 9);
  });
};

export default buildReplenishmentPlan;
