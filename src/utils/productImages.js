/** Images naturelles pour produits sans photo en base. */

const NATURAL_IMAGES = [
  {
    test: (name) => /manteau|pull|harnais|vetement|vêtement|coat/i.test(name),
    url: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=600&h=360&fit=crop',
  },
  {
    test: (name) => /croquette|nourrit|aliment|pâtée|patee|kibble/i.test(name),
    url: 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=600&h=360&fit=crop',
  },
  {
    test: (name) => /jouet|os|ball|peluche/i.test(name),
    url: 'https://images.unsplash.com/photo-1605568427561-40dd23c2acea?w=600&h=360&fit=crop',
  },
  {
    test: (name) => /chat|cat|felin|félin/i.test(name),
    url: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=600&h=360&fit=crop',
  },
  {
    test: (name) => /chien|dog|canin/i.test(name),
    url: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600&h=360&fit=crop',
  },
  {
    test: (name) => /shampo|toilett|soin|hygiène|hygiene/i.test(name),
    url: 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d4?w=600&h=360&fit=crop',
  },
];

export const resolveNaturalProductImage = (product) => {
  const existing = product?.imageUrl || product?.image;
  if (existing && !existing.startsWith('data:image/svg')) return existing;
  const name = `${product?.name || ''} ${product?.description || ''} ${product?.category || ''}`;
  const match = NATURAL_IMAGES.find(({ test }) => test(name));
  return match?.url || existing;
};

export default resolveNaturalProductImage;
