/** Identifiant stable produit (Prisma id / legacy _id). */
export const productId = (p) => {
  if (!p) return '';
  return String(p.id || p._id || '');
};

/** Déduplique une liste de produits par id. */
export const dedupeProducts = (list) => {
  if (!Array.isArray(list)) return [];
  const seen = new Set();
  return list.filter((p) => {
    const id = productId(p);
    if (!id || seen.has(id)) return false;
    seen.add(id);
    return true;
  });
};

/** Normalise id et _id sur un produit. */
export const withProductIds = (p) => {
  if (!p) return p;
  const id = productId(p);
  return id ? { ...p, id, _id: id } : p;
};
