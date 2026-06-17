/**
 * Marketplace intelligente — comparaison prix, alternatives, promos personnalisées.
 */

export const DEMO_MARKETPLACE_INTEL = {
  priceComparisons: [
    {
      id: 'cmp-1',
      product: 'Croquettes Premium Chien 12 kg',
      ourPrice: 89.9,
      marketAvg: 94.5,
      savings: 4.6,
      bestDeal: true,
    },
    {
      id: 'cmp-2',
      product: 'Pâtée Chat Saumon 400 g',
      ourPrice: 12.5,
      marketAvg: 11.8,
      savings: -0.7,
      bestDeal: false,
    },
  ],
  alternatives: [
    {
      id: 'alt-1',
      from: 'Croquettes Light Chat 3 kg',
      to: 'Croquettes Digestion Chat 3 kg',
      reason: 'Même gamme prix — meilleure digestibilité selon profil Luna.',
      priceDelta: -2.4,
      link: '/client-products',
    },
    {
      id: 'alt-2',
      from: 'Friandises dentaires',
      to: 'Os à mâcher naturel',
      reason: 'Alternative moins calorique — profil Max en perte de poids.',
      priceDelta: 1.5,
      link: '/client-products',
    },
  ],
  personalizedPromos: [
    { id: 'pr-1', title: '−15 % croquettes Max', code: 'MAX15', expiresInDays: 5, reason: 'Réappro prédictive — stock bas' },
    { id: 'pr-2', title: 'Livraison offerte > 80 TND', code: 'LIVFREE', expiresInDays: 12, reason: 'Panier moyen 72 TND — incitation fidélité' },
    { id: 'pr-3', title: '+100 points bonus IoT', code: null, expiresInDays: 30, reason: 'Client distributeur connecté actif' },
  ],
};

export default DEMO_MARKETPLACE_INTEL;
