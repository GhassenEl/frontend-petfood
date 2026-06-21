/** Données démo — marketing vendeur, réseaux sociaux, candidature partenaire */

export const DEFAULT_VENDOR_SOCIAL_LINKS = [
  { id: 'facebook', name: 'Facebook', emoji: 'f', url: 'https://facebook.com/petfoodtn', color: '#1877f2', enabled: true },
  { id: 'instagram', name: 'Instagram', emoji: '📷', url: 'https://instagram.com/petfoodtn', color: '#e4405f', enabled: true },
  { id: 'linkedin', name: 'LinkedIn', emoji: 'in', url: 'https://linkedin.com/company/petfoodtn', color: '#0a66c2', enabled: true },
  { id: 'tiktok', name: 'TikTok', emoji: '♪', url: 'https://tiktok.com/@petfoodtn', color: '#010101', enabled: true },
  { id: 'x', name: 'Twitter / X', emoji: '𝕏', url: 'https://x.com/petfoodtn', color: '#14171a', enabled: false },
  { id: 'whatsapp', name: 'WhatsApp', emoji: '💬', url: 'https://wa.me/21671100100', color: '#25d366', enabled: true },
];

export const DEMO_VENDOR_MARKETING = {
  campaigns: [
    { id: 'c1', name: 'Promo printemps -10 %', channel: 'Email + réseaux', status: 'active', reach: 1240, clicks: 186, budget: 120 },
    { id: 'c2', name: 'Story Instagram — nouveautés chat', channel: 'Instagram', status: 'scheduled', reach: 0, clicks: 0, budget: 45 },
    { id: 'c3', name: 'Newsletter fidélité mars', channel: 'Newsletter', status: 'completed', reach: 890, clicks: 112, budget: 0 },
  ],
  communicationTips: [
    'Publiez 2 à 3 posts par semaine avec photos produits en situation.',
    'Répondez aux avis sous 24 h pour améliorer votre note boutique.',
    'Croisez promotions catalogue et stories Instagram pour +18 % de clics.',
  ],
  partnerApplication: {
    status: 'approved',
    submittedAt: '2025-11-12T10:00:00.000Z',
    shopName: 'Animalerie Leila — Tunis',
    reference: 'VND-2025-0042',
  },
};

export default { DEFAULT_VENDOR_SOCIAL_LINKS, DEMO_VENDOR_MARKETING };
