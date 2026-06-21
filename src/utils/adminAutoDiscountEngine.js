/** Calcul automatique des remises — règles métier admin. */

export const computeAutoDiscountSuggestions = (products = []) => {
  const now = new Date();
  const month = now.getMonth();

  return products.slice(0, 20).map((p) => {
    let suggestedPct = 0;
    const reasons = [];

    const stock = p.stock ?? p.quantity ?? 100;
    if (stock > 80) {
      suggestedPct += 10;
      reasons.push('Stock élevé (>80 u.)');
    } else if (stock < 15) {
      suggestedPct -= 5;
      reasons.push('Stock faible — éviter remise');
    }

    if (p.category === 'jouets' && [11, 0].includes(month)) {
      suggestedPct += 15;
      reasons.push('Saison fêtes — jouets');
    }
    if (p.category === 'croquettes' && stock > 50) {
      suggestedPct += 5;
      reasons.push('Produit d\'appel croquettes');
    }
    if (p.daysSinceListed > 90 && (p.salesCount || 0) < 5) {
      suggestedPct += 12;
      reasons.push('Rotation lente (>90 j.)');
    }
    if (p.currentDiscount > 0) {
      suggestedPct = Math.max(suggestedPct, p.currentDiscount);
      reasons.push('Remise existante conservée');
    }

    suggestedPct = Math.max(0, Math.min(35, suggestedPct));

    return {
      id: p.id || p._id,
      name: p.name,
      category: p.category,
      price: p.price,
      stock,
      suggestedPct,
      reasons,
      estimatedMarginImpact: suggestedPct > 0 ? `-${(p.price * suggestedPct / 100).toFixed(2)} DT/u.` : '—',
    };
  }).filter((s) => s.suggestedPct > 0).sort((a, b) => b.suggestedPct - a.suggestedPct);
};

export default { computeAutoDiscountSuggestions };
