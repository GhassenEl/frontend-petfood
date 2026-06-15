/** Fiches détail produit (miroir frontend du catalogue backend) */
export const PRODUCT_DETAILS = {
  prd_dog_1: {
    composition: 'Poulet déshydraté 28 %, riz, maïs, graisses animales, vitamines A/D/E.',
    usage: '2 repas/jour. Transition alimentaire sur 7 jours.',
    benefits: ['Digestion', 'Pelage', 'Énergie'],
  },
  prd_cat_1: {
    composition: 'Viandes 40 %, poisson 8 %, taurine, vitamines.',
    usage: '1–2 sachets/jour selon le poids du chat.',
    benefits: ['Hydratation', 'Taurine', 'Appétence'],
  },
  prd_bird_1: {
    composition: 'Mil, alpiste, lin, vitamines, calcium.',
    usage: 'À volonté, mangeoire propre, renouvellement quotidien.',
    benefits: ['Plumage', 'Vitalité'],
  },
  prd_fish_1: {
    composition: 'Poisson, crevettes, spiruline, vitamines.',
    usage: '2–3 pincées/jour, retirer l\'excédent.',
    benefits: ['Couleurs', 'Eau claire'],
  },
  prd_dog_2: {
    composition: 'Riz, protéines animales, chlorophylle, menthe.',
    usage: '1 snack/jour maximum.',
    benefits: ['Dents propres', 'Haleine fraîche'],
  },
  prd_cat_2: {
    composition: 'Argile bentonite agglomérante.',
    usage: 'Couche 5–7 cm, nettoyage quotidien.',
    benefits: ['Odeurs', 'Confort'],
  },
  prd_dog_3: {
    composition: 'Viande bovine, céréales, minéraux.',
    usage: '1 boîte / 10 kg / jour.',
    benefits: ['Digestibilité', 'Prix doux'],
  },
  prd_cat_3: {
    composition: 'Saumon 26 %, patate douce, probiotiques.',
    usage: '45–65 g/jour pour chat 4–6 kg.',
    benefits: ['Sans céréales', 'Pelage'],
  },
};

export const getProductDetailFields = (product) => {
  const id = product?._id || product?.id;
  const base = PRODUCT_DETAILS[id] || {};
  return {
    composition: product?.composition || base.composition || 'Formule équilibrée PetfoodTN — voir emballage pour liste complète.',
    usage: product?.usage || base.usage || 'Respectez les doses indiquées sur l\'emballage. Eau fraîche à volonté.',
    benefits: product?.benefits || base.benefits || ['Qualité PetfoodTN', 'Adapté à votre animal'],
  };
};

export const getEffectiveDiscount = (product) => {
  const d = Number(product?.discount || product?.promotionPercent || 0);
  if (d > 0) return d;
  if (product?.isOnSale && product?.discountPrice > 0 && product?.price > 0) {
    return Math.round((1 - product.discountPrice / product.price) * 100);
  }
  return 0;
};

export const getPromoPrice = (product) => {
  const price = Number(product?.price || 0);
  const discount = getEffectiveDiscount(product);
  if (product?.discountPrice > 0 && product?.isOnSale) return Number(product.discountPrice);
  if (discount > 0) return Number((price * (1 - discount / 100)).toFixed(2));
  return price;
};

export const isOnPromotion = (product) => getEffectiveDiscount(product) > 0 || product?.isOnSale;

export const formatPriceVerifiedDate = (iso) => {
  if (!iso) return null;
  try {
    return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return null;
  }
};

export const isPriceVerified = (product) => Boolean(product?.priceVerified || product?.priceVerifiedAt);
