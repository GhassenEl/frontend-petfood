/** Détection des produits à fort potentiel commercial. */
export const detectHighPotentialProducts = ({ products = [], orders = [], reviews = [] } = {}) => {
  const reviewMap = new Map();
  (reviews || []).forEach((r) => {
    const pid = String(r.productId?._id || r.productId?.id || r.productId || '');
    if (!pid) return;
    if (!reviewMap.has(pid)) reviewMap.set(pid, []);
    reviewMap.get(pid).push(r);
  });

  return (products || [])
    .map((p) => {
      const pid = String(p.id || p._id);
      const sold = Number(p.unitsSold) || 0;
      const stock = Number(p.stock) ?? 0;
      const price = Number(p.price) || 0;
      const productReviews = reviewMap.get(pid) || [];
      const avgRating =
        productReviews.length
          ? productReviews.reduce((s, r) => s + Number(r.rating || 0), 0) / productReviews.length
          : Number(p.rating_avg) || 0;

      let potentialScore = 40;
      const signals = [];

      if (sold >= 15) {
        potentialScore += 20;
        signals.push('Ventes solides');
      } else if (sold >= 5 && sold < 15) {
        potentialScore += 12;
        signals.push('Croissance des ventes');
      }

      if (avgRating >= 4.5 && productReviews.length >= 2) {
        potentialScore += 15;
        signals.push('Excellents avis clients');
      } else if (avgRating >= 4) {
        potentialScore += 8;
        signals.push('Bonne satisfaction');
      }

      if (stock > 0 && stock <= 8 && sold >= 10) {
        potentialScore += 18;
        signals.push('Demande > stock — réappro urgent');
      }

      if (price >= 40 && price <= 120 && sold >= 8) {
        potentialScore += 10;
        signals.push('Segment premium rentable');
      }

      const orderHits = (orders || []).filter((o) =>
        (o.items || []).some((i) => String(i.productId || i.product?.id) === pid),
      ).length;
      if (orderHits >= 4) {
        potentialScore += 12;
        signals.push('Tendance commandes récente');
      }

      if (Number(p.promotionPercent) === 0 && sold >= 20) {
        potentialScore += 8;
        signals.push('Peut supporter une promo sans cannibaliser');
      }

      potentialScore = Math.min(100, potentialScore);

      return {
        productId: pid,
        productName: p.name,
        potentialScore,
        unitsSold: sold,
        stock,
        avgRating: Math.round(avgRating * 10) / 10,
        signals,
        tier: potentialScore >= 75 ? 'high' : potentialScore >= 55 ? 'medium' : 'low',
        aiSummary:
          potentialScore >= 75
            ? 'Fort potentiel — prioriser stock, visibilité et cross-selling.'
            : potentialScore >= 55
              ? 'Potentiel prometteur — surveiller la demande et les avis.'
              : 'Potentiel modéré — optimiser fiche produit et prix.',
      };
    })
    .filter((p) => p.tier !== 'low')
    .sort((a, b) => b.potentialScore - a.potentialScore)
    .slice(0, 12);
};

export default detectHighPotentialProducts;
