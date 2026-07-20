/** Catalogue supports print & branding PetfoodTN */

export const MARKETING_PRINT_TEMPLATES = [
  {
    id: 'business-card',
    label: 'Carte de visite',
    icon: '💳',
    format: '85 × 55 mm',
    description: 'Recto / verso — logo, contacts, QR et gamme IoT.',
    sides: 2,
  },
  {
    id: 'flyer-a5',
    label: 'Flyer A5',
    icon: '📄',
    format: '148 × 210 mm',
    description: 'Offre boutique + gamelle intelligente + QR inscription.',
    sides: 1,
  },
  {
    id: 'rollup',
    label: 'Roll-up salon',
    icon: '🪧',
    format: '85 × 200 cm',
    description: 'Bannière événement — nutrition, IoT et marketplace.',
    sides: 1,
  },
  {
    id: 'product-tag',
    label: 'Étiquette produit',
    icon: '🏷️',
    format: '60 × 40 mm',
    description: 'Étiquette rayon — gamelle, accessoires, traçabilité.',
    sides: 1,
  },
];

export const DEFAULT_PRINT_PROFILE = {
  brandName: 'PetfoodTN',
  tagline: 'Nutrition & bien-être animal — Tunisie',
  personName: 'Ghassen El',
  role: 'Fondateur · Marketplace IoT',
  phone: '+216 98 000 000',
  email: 'contact@petfoodtn.tn',
  website: 'www.petfoodtn.tn',
  address: 'Tunis · Sousse · Sfax',
  slogan: 'Gamelle intelligente · Vétérinaire en ligne · Livraison 24h',
  qrUrl: 'https://petfoodtn.tn',
};

export const VENDOR_PRINT_DEFAULTS = {
  brandName: 'Ma boutique PetfoodTN',
  tagline: 'Partenaire marketplace — alimentation & accessoires',
  personName: '',
  role: 'Vendeur certifié',
  phone: '+216 00 000 000',
  email: 'boutique@example.tn',
  website: 'petfoodtn.tn/vendor',
  address: 'Tunis',
  slogan: 'Croquettes premium · Gamelle connectée · Fidélité client',
  qrUrl: 'https://petfoodtn.tn/register',
};
