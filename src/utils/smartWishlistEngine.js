import { searchProductsNaturalLanguage } from './naturalLanguageProductSearch';

/** Suggestions liste de souhaits IA selon navigation et profil */
export const suggestWishlistProducts = ({
  products = [],
  browseIds = [],
  petType = null,
  limit = 8,
} = {}) => {
  const browsed = browseIds
    .map((id) => products.find((p) => String(p.id || p._id) === String(id)))
    .filter(Boolean);

  const scores = new Map();

  const bump = (p, pts, reason) => {
    const id = String(p.id || p._id);
    const prev = scores.get(id) || { product: p, score: 0, reasons: [] };
    prev.score += pts;
    if (reason && !prev.reasons.includes(reason)) prev.reasons.push(reason);
    scores.set(id, prev);
  };

  browsed.forEach((p) => {
    const type = p.animalType || p.petType;
    products
      .filter(
        (x) =>
          String(x.id || x._id) !== String(p.id || p._id) &&
          (x.category === p.category || x.animalType === type),
      )
      .slice(0, 3)
      .forEach((x) => bump(x, 15, 'Complémentaire à votre navigation'));
  });

  if (petType) {
    products
      .filter((p) => p.animalType === petType || p.petType === petType)
      .forEach((p) => bump(p, 10, `Adapté ${petType === 'cat' ? 'chat' : petType === 'dog' ? 'chien' : petType}`));
  }

  products
    .filter((p) => Number(p.rating_avg) >= 4.3 && Number(p.rating_count) >= 5)
    .forEach((p) => bump(p, 8, 'Très bien noté'));

  products
    .filter((p) => Number(p.discount || p.promotionPercent) > 0)
    .forEach((p) => bump(p, 6, 'Promotion en cours'));

  if (petType === 'cat') {
    const nl = searchProductsNaturalLanguage(products, 'litière chat', 2);
    nl.results.forEach(({ product: p }) => bump(p, 12, 'Souvent acheté avec croquettes chat'));
  }

  return [...scores.values()]
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ product, score, reasons }) => ({
      ...product,
      wishlistScore: score,
      wishlistReasons: reasons.slice(0, 2),
    }));
};

export default suggestWishlistProducts;
