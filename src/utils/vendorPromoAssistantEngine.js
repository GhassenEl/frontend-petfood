/** Assistant IA — suggestions de promotions automatiques pour vendeurs. */
export const suggestVendorPromotions = ({ products = [], orders = [] } = {}) => {
  const suggestions = [];

  (products || []).forEach((p) => {
    const stock = Number(p.stock) ?? 0;
    const sold = Number(p.unitsSold) ?? 0;
    const currentPromo = Number(p.promotionPercent) || 0;
    const price = Number(p.price) || 0;
    if (currentPromo > 0) return;

    let discount = 0;
    const reasons = [];

    if (stock > 30 && sold < 5) {
      discount = 15;
      reasons.push('Stock élevé, ventes faibles — déstockage');
    } else if (stock > 0 && stock <= 5 && sold >= 10) {
      discount = 8;
      reasons.push('Forte demande, stock limité — promo flash pour booster');
    } else if (sold >= 20 && stock > 10) {
      discount = 10;
      reasons.push('Best-seller — promo fidélité pour accélérer le volume');
    } else if (price >= 60 && sold < 8) {
      discount = 12;
      reasons.push('Produit premium à rotation lente');
    }

    const recentOrders = (orders || []).filter(
      (o) => (o.items || []).some((i) => String(i.productId) === String(p.id)),
    ).length;
    if (recentOrders >= 3 && discount === 0) {
      discount = 7;
      reasons.push('Tendance commandes récente');
    }

    if (discount > 0) {
      const promoPrice = Math.round(price * (1 - discount / 100) * 100) / 100;
      suggestions.push({
        id: `promo-${p.id}`,
        productId: p.id,
        productName: p.name,
        discountPercent: discount,
        currentPrice: price,
        promoPrice,
        reason: reasons.join(' · '),
        urgency: stock <= 5 ? 'high' : sold < 5 ? 'medium' : 'low',
        aiPitch: `Promo -${discount}% sur « ${p.name} » : ${reasons[0]}. Prix suggéré ${promoPrice.toFixed(2)} DT.`,
        autoApplicable: true,
      });
    }
  });

  return suggestions.sort((a, b) => {
    const urg = { high: 3, medium: 2, low: 1 };
    return (urg[b.urgency] || 0) - (urg[a.urgency] || 0);
  });
};

export default suggestVendorPromotions;
