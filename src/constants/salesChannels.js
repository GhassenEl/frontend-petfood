export const SALES_CHANNELS = [
  {
    id: 'online',
    label: 'En ligne',
    description: 'Boutique marketplace — panier et paiement web',
    icon: '🛒',
  },
  {
    id: 'instore',
    label: 'Présentiel / magasin',
    description: 'Vente en animalerie, retrait sur place',
    icon: '🏪',
  },
  {
    id: 'phone',
    label: 'Téléphone',
    description: 'Commande prise par appel',
    icon: '📞',
  },
  {
    id: 'courier',
    label: 'Courrier / colis',
    description: 'Envoi postal ou coursier',
    icon: '✉️',
  },
];

export const salesChannelLabel = (id) =>
  SALES_CHANNELS.find((c) => c.id === id)?.label || id;
