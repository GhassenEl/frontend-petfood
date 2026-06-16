const normalize = (s) =>
  String(s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

const categoryFromItem = (item) => {
  const p = item.productId || item.product || item;
  if (typeof p === 'object' && p.category) return normalize(p.category);
  const name = normalize(typeof p === 'object' ? p.name : String(p || item.name || ''));
  if (/croquette|kibble|nourriture|patee|pate/.test(name)) return 'nourriture';
  if (/litiere|shampoing|hygiene/.test(name)) return 'hygiene';
  if (/jouet|toy/.test(name)) return 'jouet';
  if (/manteau|accessoire|laisse/.test(name)) return 'accessoire';
  if (/antiparasitaire|sante|vaccin/.test(name)) return 'sante';
  return 'autre';
};

/** Détection des tendances marché — catégories les plus demandées */
export const detectMarketTrends = ({ orders = [], products = [], windowDays = 90 } = {}) => {
  const cutoff = Date.now() - windowDays * 86400000;
  const catStats = new Map();
  const prevWindow = new Map();

  (orders || []).forEach((order) => {
    const ts = new Date(order.createdAt || order.date).getTime();
    if (Number.isNaN(ts)) return;

    (order.items || []).forEach((item) => {
      const cat = categoryFromItem(item);
      const qty = Number(item.quantity) || 1;
      const revenue = (Number(item.price) || 0) * qty;
      const target = ts >= cutoff ? catStats : prevWindow;
      const prev = target.get(cat) || { category: cat, units: 0, revenue: 0, orders: 0 };
      prev.units += qty;
      prev.revenue += revenue;
      prev.orders += 1;
      target.set(cat, prev);
    });
  });

  const trends = [...catStats.entries()].map(([category, stats]) => {
    const prev = prevWindow.get(category) || { units: 0, revenue: 0 };
    const growthUnits = prev.units ? ((stats.units - prev.units) / prev.units) * 100 : stats.units > 0 ? 100 : 0;
    const growthRev = prev.revenue ? ((stats.revenue - prev.revenue) / prev.revenue) * 100 : stats.revenue > 0 ? 100 : 0;

    let momentum = 'stable';
    if (growthUnits >= 15 || growthRev >= 15) momentum = 'rising';
    else if (growthUnits <= -10) momentum = 'declining';

    const label = category.charAt(0).toUpperCase() + category.slice(1);

    return {
      category,
      label,
      units: stats.units,
      revenue: Math.round(stats.revenue * 100) / 100,
      orderLines: stats.orders,
      growthUnitsPct: Math.round(growthUnits),
      growthRevenuePct: Math.round(growthRev),
      momentum,
      insight:
        momentum === 'rising'
          ? `Demande en hausse — renforcer le stock ${label.toLowerCase()}`
          : momentum === 'declining'
            ? `Ralentissement — promotions ciblées possibles`
            : `Demande stable sur la période`,
    };
  });

  trends.sort((a, b) => b.units - a.units);

  const top3 = trends.slice(0, 3).map((t) => t.label).join(', ');
  const rising = trends.filter((t) => t.momentum === 'rising');

  return {
    trends,
    topCategories: trends.slice(0, 6),
    risingCategories: rising,
    summary: top3
      ? `Catégories les plus demandées : ${top3}.${rising.length ? ` ${rising.length} en forte croissance.` : ''}`
      : 'Pas assez de données commandes pour les tendances.',
    windowDays,
  };
};

export default detectMarketTrends;
