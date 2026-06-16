import { getPromoPrice, getEffectiveDiscount } from './productDetails';

/** Optimisation des prix selon demande, concurrence simulée et tendances */
export const optimizeProductPrices = ({ products = [], orders = [], marketTrends = [] } = {}) => {
  const velocity = new Map();
  (orders || []).forEach((o) => {
    (o.items || []).forEach((it) => {
      const id = String(it.productId?._id || it.productId?.id || it.productId || '');
      velocity.set(id, (velocity.get(id) || 0) + (Number(it.quantity) || 1));
    });
  });

  const trendMap = new Map((marketTrends || []).map((t) => [t.category || t.id, t.growthPct || 0]));

  return (products || []).map((p) => {
    const id = String(p.id || p._id);
    const sales = velocity.get(id) || 0;
    const price = Number(p.price || 0);
    const discount = getEffectiveDiscount(p);
    const stock = Number(p.stock ?? 0);
    const category = p.category || 'nourriture';
    const trend = trendMap.get(category) || 0;

    let action = 'maintain';
    let suggestedPrice = price;
    let deltaPct = 0;
    const reasons = [];

    if (stock <= 5 && sales >= 3) {
      action = 'increase';
      deltaPct = 5;
      suggestedPrice = Math.round(price * 1.05 * 100) / 100;
      reasons.push('Forte demande, stock bas');
    } else if (sales === 0 && stock > 20 && discount === 0) {
      action = 'promote';
      deltaPct = -10;
      suggestedPrice = Math.round(price * 0.9 * 100) / 100;
      reasons.push('Stock élevé, faible rotation');
    } else if (trend > 15) {
      action = 'increase';
      deltaPct = 3;
      suggestedPrice = Math.round(price * 1.03 * 100) / 100;
      reasons.push(`Tendance marché +${trend}%`);
    } else if (Number(p.rating_avg) >= 4.7 && sales >= 5) {
      action = 'maintain';
      reasons.push('Prix optimal — satisfaction élevée');
    } else if (discount > 15) {
      action = 'review';
      reasons.push('Promotion active — surveiller marge');
    }

    const competitorAvg = price * (0.96 + ((id.charCodeAt(0) || 0) % 8) * 0.005);
    if (price > competitorAvg * 1.08) {
      reasons.push('Au-dessus concurrence estimée');
      if (action === 'maintain') {
        action = 'decrease';
        deltaPct = -5;
        suggestedPrice = Math.round(price * 0.95 * 100) / 100;
      }
    }

    return {
      productId: id,
      name: p.name,
      currentPrice: price,
      promoPrice: getPromoPrice(p),
      suggestedPrice,
      deltaPct,
      action,
      reasons,
      salesCount: sales,
      stock,
      aiSummary:
        action === 'maintain'
          ? 'Prix actuel recommandé.'
          : `${action === 'increase' ? 'Augmenter' : action === 'decrease' || action === 'promote' ? 'Baisser' : 'Revoir'} à ${suggestedPrice.toFixed(2)} DT (${deltaPct > 0 ? '+' : ''}${deltaPct}%).`,
    };
  }).sort((a, b) => Math.abs(b.deltaPct) - Math.abs(a.deltaPct));
};

export default optimizeProductPrices;
