import { resolveUploadPreviewUrl } from '../services/uploadService';

/** Images locales — toujours disponibles sans dépendance externe */
export const PLATFORM_IMAGES = {
  hero: '/images/heroes/pets-hero.svg',
  productDefault: '/images/placeholders/product-default.svg',
  productFood: '/images/iot/bowl-kibble.jpg',
  productCare: '/images/iot/complements.jpg',
  productToy: '/images/placeholders/product-toy.svg',
  productClothing: '/images/placeholders/product-clothing.svg',
  productDog: '/images/placeholders/product-dog.svg',
  productCat: '/images/placeholders/product-cat.svg',
  pets: {
    dog: '/images/pets/dog.svg',
    cat: '/images/pets/cat.svg',
    bird: '/images/pets/bird.svg',
    fish: '/images/pets/fish.svg',
    rabbit: '/images/pets/rabbit.svg',
    hamster: '/images/pets/hamster.svg',
    reptile: '/images/pets/reptile.svg',
    guinea: '/images/pets/guinea.svg',
    ferret: '/images/pets/ferret.svg',
    other: '/images/pets/other.svg',
  },
  avatars: {
    admin: '/images/avatars/admin.svg',
    client: '/images/avatars/client.svg',
    vendor: '/images/avatars/vendor.svg',
    livreur: '/images/avatars/livreur.svg',
    vet: '/images/avatars/vet.svg',
    moderator: '/images/avatars/moderator.svg',
    serviceClient: '/images/avatars/service-client.svg',
  },
};

const PRODUCT_IMAGE_META = {
  dog: { icon: '🐕', label: 'Chien', from: '#fef3c7', to: '#f59e0b' },
  cat: { icon: '🐈', label: 'Chat', from: '#ede9fe', to: '#8b5cf6' },
  bird: { icon: '🐦', label: 'Oiseau', from: '#dbeafe', to: '#2563eb' },
  fish: { icon: '🐟', label: 'Poisson', from: '#cffafe', to: '#0891b2' },
  other: { icon: '🐾', label: 'Petfood', from: '#dcfce7', to: '#16a34a' },
};

const CATEGORY_RULES = [
  { test: (name) => /manteau|pull|harnais|vetement|vêtement|coat/i.test(name), url: PLATFORM_IMAGES.productClothing },
  { test: (name) => /croquette|nourrit|aliment|pâtée|patee|kibble|granule/i.test(name), url: PLATFORM_IMAGES.productFood },
  { test: (name) => /jouet|os|ball|peluche|corde/i.test(name), url: PLATFORM_IMAGES.productToy },
  { test: (name) => /chat|cat|felin|félin/i.test(name), url: PLATFORM_IMAGES.productCat },
  { test: (name) => /chien|dog|canin/i.test(name), url: PLATFORM_IMAGES.productDog },
  { test: (name) => /shampo|toilett|soin|hygiène|hygiene|complément|vitamin/i.test(name), url: PLATFORM_IMAGES.productCare },
];

export const isValidImageUrl = (url) => {
  if (url == null || typeof url !== 'string') return false;
  const t = url.trim();
  if (!t || t === 'null' || t === 'undefined') return false;
  return true;
};

/** Fallback SVG inline selon type d'animal (jamais cassé) */
export const buildProductFallbackDataUri = (product = {}) => {
  const meta = PRODUCT_IMAGE_META[product.animalType] || PRODUCT_IMAGE_META.other;
  const title = String(product.name || meta.label).slice(0, 28).replace(/[<>&"]/g, '');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="360" viewBox="0 0 600 360"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${meta.from}"/><stop offset="1" stop-color="${meta.to}"/></linearGradient></defs><rect width="600" height="360" rx="32" fill="url(#g)"/><circle cx="500" cy="70" r="90" fill="rgba(255,255,255,0.18)"/><text x="300" y="155" text-anchor="middle" font-size="86">${meta.icon}</text><text x="300" y="220" text-anchor="middle" font-family="Arial,sans-serif" font-size="28" font-weight="700" fill="white">${title}</text><text x="300" y="260" text-anchor="middle" font-family="Arial,sans-serif" font-size="16" fill="rgba(255,255,255,0.85)">PetfoodTN</text></svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};

export const resolveCategoryProductImage = (product = {}) => {
  const name = `${product.name || ''} ${product.description || ''} ${product.category || ''} ${product.animalType || ''}`;
  const match = CATEGORY_RULES.find(({ test }) => test(name));
  return match?.url || PLATFORM_IMAGES.productDefault;
};

export const resolveNaturalProductImage = (product = {}) => {
  const raw = product?.imageUrl || product?.image;
  if (isValidImageUrl(raw) && !String(raw).startsWith('data:image/svg')) {
    return resolveUploadPreviewUrl(raw) || raw;
  }
  return resolveCategoryProductImage(product);
};

export const resolveImageSrc = (src, fallback = PLATFORM_IMAGES.productDefault) => {
  if (!isValidImageUrl(src)) return fallback;
  const resolved = resolveUploadPreviewUrl(src) || src;
  return resolved || fallback;
};

export const getRoleAvatar = (role) => {
  const map = {
    admin: PLATFORM_IMAGES.avatars.admin,
    client: PLATFORM_IMAGES.avatars.client,
    vendor: PLATFORM_IMAGES.avatars.vendor,
    livreur: PLATFORM_IMAGES.avatars.livreur,
    vet: PLATFORM_IMAGES.avatars.vet,
    veterinarian: PLATFORM_IMAGES.avatars.vet,
    moderator: PLATFORM_IMAGES.avatars.moderator,
    service_client: PLATFORM_IMAGES.avatars.serviceClient,
  };
  return map[String(role || '').toLowerCase()] || PLATFORM_IMAGES.avatars.client;
};

export const getPetPhoto = (type, breed) => {
  const b = String(breed || '').toLowerCase();
  if (b.includes('cochon') || b.includes('cobaye')) return PLATFORM_IMAGES.pets.guinea;
  if (b.includes('furet') || b.includes('ferret')) return PLATFORM_IMAGES.pets.ferret;
  return PLATFORM_IMAGES.pets[type] || PLATFORM_IMAGES.pets.other;
};

export const HERO_BACKGROUND = PLATFORM_IMAGES.hero;

export default PLATFORM_IMAGES;
