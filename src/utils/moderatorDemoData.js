export const DEMO_MODERATOR_STATS = {
  pendingReviews: 7,
  pendingComplaints: 4,
  flaggedMessages: 2,
  activeEvents: 3,
  resolvedToday: 12,
  avgResponseHours: 2.4,
};

export const DEMO_MODERATOR_QUEUE = [
  { id: 'mq-1', type: 'review', title: 'Avis 1★ — livraison retardée', priority: 'high', ago: '12 min' },
  { id: 'mq-2', type: 'complaint', title: 'Produit endommagé #ORD-882', priority: 'high', ago: '34 min' },
  { id: 'mq-3', type: 'review', title: 'Avis suspect — spam détecté NLP', priority: 'medium', ago: '1 h' },
  { id: 'mq-4', type: 'event', title: 'Inscription concours — vérification lot', priority: 'low', ago: '2 h' },
  { id: 'mq-5', type: 'message', title: 'Message signalé — chat communauté', priority: 'medium', ago: '3 h' },
];

export const withDemoModeratorStats = (data) => ({
  ...DEMO_MODERATOR_STATS,
  ...(data || {}),
});

export const withDemoModeratorQueue = (items) =>
  Array.isArray(items) && items.length > 0 ? items : DEMO_MODERATOR_QUEUE;
