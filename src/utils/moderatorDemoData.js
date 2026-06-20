/** Données démo modération — utilisateurs, vendeurs, contenu, signalements. */

import { DEMO_ADMIN_USERS, DEMO_ADMIN_VENDORS } from './adminDemoData';

const daysAgo = (n) => new Date(Date.now() - n * 86400000).toISOString();
const hoursAgo = (h) => new Date(Date.now() - h * 3600000).toISOString();

export const DEMO_MODERATOR_STATS = {
  pendingReviews: 7,
  pendingComplaints: 4,
  flaggedMessages: 2,
  activeEvents: 3,
  resolvedToday: 12,
  avgResponseHours: 2.4,
  totalUsers: 12,
  activeUsers: 10,
  suspendedUsers: 2,
  pendingVendors: 2,
  pendingProducts: 5,
  openDisputes: 3,
  fakeReviewsFlagged: 4,
};

export const DEMO_MODERATOR_QUEUE = [
  { id: 'mq-1', type: 'review', title: 'Avis 1★ — livraison retardée', priority: 'high', ago: '12 min' },
  { id: 'mq-2', type: 'complaint', title: 'Produit endommagé #ORD-882', priority: 'high', ago: '34 min' },
  { id: 'mq-3', type: 'review', title: 'Avis suspect — spam détecté NLP', priority: 'medium', ago: '1 h' },
  { id: 'mq-4', type: 'product', title: 'Nouveau produit — validation requise', priority: 'medium', ago: '2 h' },
  { id: 'mq-5', type: 'vendor', title: 'Demande vendeur Zoo Market Nabeul', priority: 'low', ago: '3 h' },
];

export const DEMO_MODERATOR_USERS = DEMO_ADMIN_USERS.map((u) => ({
  ...u,
  abusiveReports: u.id === 'demo-client-3' ? 2 : 0,
  suspendedAt: u.isActive === false ? daysAgo(5) : null,
  lastLogin: daysAgo(u.role === 'client' ? 1 : 3),
}));

export const DEMO_MODERATOR_VENDOR_APPLICATIONS = [
  ...DEMO_ADMIN_VENDORS.map((v) => ({
    ...v,
    commercialInfo: {
      siret: v.status === 'pending' ? '—' : `MF-${v.id}-TN`,
      address: `${v.region}, Tunisie`,
      category: 'Animalerie',
      verified: v.status === 'active',
    },
    applicationStatus: v.status === 'pending' ? 'pending' : v.status === 'suspended' ? 'suspended' : 'approved',
  })),
  {
    id: 'v-5',
    userId: null,
    shopName: 'Aquarium Plus Bizerte',
    ownerName: 'Fares M.',
    ownerEmail: 'fares.aqua@email.tn',
    region: 'Bizerte',
    status: 'pending',
    applicationStatus: 'pending',
    productsCount: 0,
    createdAt: daysAgo(1),
    commercialInfo: {
      siret: 'MF-2024-8891',
      address: 'Zone industrielle, Bizerte',
      category: 'Aquariophilie',
      verified: false,
    },
  },
];

export const DEMO_MODERATOR_PENDING_PRODUCTS = [
  {
    id: 'mp-1', vendorId: 'v-1', vendorName: 'Animalerie Tunis',
    name: 'Croquettes chiot premium 8 kg', price: 62, category: 'croquettes',
    imageUrl: '/images/iot/bowl-kibble.jpg',
    status: 'pending', submittedAt: hoursAgo(2),
    imageFlag: null,
  },
  {
    id: 'mp-2', vendorId: 'v-2', vendorName: 'Pets & Co Sfax',
    name: 'Jouet interactif chat laser', price: 24, category: 'jouets',
    imageUrl: '/images/iot/bowl-kibble.jpg',
    status: 'pending', submittedAt: hoursAgo(5),
    imageFlag: null,
  },
  {
    id: 'mp-3', vendorId: 'v-5', vendorName: 'Aquarium Plus Bizerte',
    name: 'Pompe aquarium 200 L/h', price: 45, category: 'accessoires',
    imageUrl: '/images/placeholders/product-cat.svg',
    status: 'pending', submittedAt: hoursAgo(8),
    imageFlag: 'low_quality',
  },
  {
    id: 'mp-4', vendorId: 'v-1', vendorName: 'Animalerie Tunis',
    name: 'Shampoing chien hypoallergénique', price: 19, category: 'accessoires',
    imageUrl: '/images/placeholders/product-clothing.svg',
    status: 'pending', submittedAt: daysAgo(1),
    imageFlag: null,
  },
  {
    id: 'mp-5', vendorId: 'v-2', vendorName: 'Pets & Co Sfax',
    name: 'Promotion suspecte — -90%', price: 5, category: 'friandises',
    imageUrl: '/images/placeholders/product-toy.svg',
    status: 'pending', submittedAt: daysAgo(1),
    imageFlag: 'misleading',
  },
];

export const DEMO_MODERATOR_INAPPROPRIATE = [
  {
    id: 'ic-1', type: 'product_description', target: 'Produit #vp-spam',
    content: 'Description contenant langage offensant et promesses médicales non vérifiées.',
    reporter: 'Système NLP', status: 'open', createdAt: hoursAgo(4),
  },
  {
    id: 'ic-2', type: 'comment', target: 'Avis CMD-772',
    content: 'Commentaire avec insultes envers le livreur.',
    reporter: 'Client signalé', status: 'open', createdAt: hoursAgo(12),
  },
  {
    id: 'ic-3', type: 'image', target: 'Photo profil vendeur',
    content: 'Image non conforme aux règles marketplace.',
    reporter: 'Modérateur auto', status: 'resolved', createdAt: daysAgo(2),
  },
];

export const DEMO_MODERATOR_DISPUTES = [
  {
    id: 'disp-1', orderId: 'CMD-8842', clientName: 'Amira B.', vendorName: 'Animalerie Tunis',
    subject: 'Produit non conforme à la description', amount: 89,
    status: 'open', createdAt: daysAgo(2),
  },
  {
    id: 'disp-2', orderId: 'CMD-8791', clientName: 'Karim M.', vendorName: 'Pets & Co Sfax',
    subject: 'Retard livraison > 5 jours', amount: 42,
    status: 'in_review', createdAt: daysAgo(4),
  },
  {
    id: 'disp-3', orderId: 'CMD-8755', clientName: 'Salma K.', vendorName: 'Boutique Nour Pets',
    subject: 'Remboursement partiel demandé', amount: 65,
    status: 'resolved', createdAt: daysAgo(8),
  },
];

export const DEMO_MODERATOR_FAKE_REVIEWS = [
  {
    id: 'fr-1', productName: 'Croquettes premium chien', author: 'user_spam_42',
    rating: 5, comment: 'Meilleur produit !!! achetez maintenant !!!',
    nlpScore: 0.12, spamProbability: 0.94, status: 'flagged', createdAt: hoursAgo(3),
  },
  {
    id: 'fr-2', productName: 'Fontaine eau chat', author: 'bot_review_7',
    rating: 1, comment: 'Arnaque totale arnaque arnaque',
    nlpScore: 0.08, spamProbability: 0.89, status: 'flagged', createdAt: hoursAgo(6),
  },
  {
    id: 'fr-3', productName: 'Jouet corde', author: 'Amira B.',
    rating: 5, comment: 'Très bon jouet, mon chien adore.',
    nlpScore: 0.85, spamProbability: 0.05, status: 'cleared', createdAt: daysAgo(1),
  },
  {
    id: 'fr-4', productName: 'Pâtée chat saumon', author: 'fake_acc_99',
    rating: 5, comment: '★★★★★ parfait parfait parfait',
    nlpScore: 0.15, spamProbability: 0.91, status: 'flagged', createdAt: daysAgo(2),
  },
];

export const DEMO_MODERATOR_REPORTED_PRODUCTS = [
  { id: 'rp-1', name: 'Promotion suspecte — -90%', vendorName: 'Pets & Co Sfax', reports: 5, reason: 'Prix trompeur' },
  { id: 'rp-2', name: 'Croquettes sans label', vendorName: 'Boutique Nour Pets', reports: 3, reason: 'Informations manquantes' },
  { id: 'rp-3', name: 'Accessoire contrefait', vendorName: 'Zoo Market Nabeul', reports: 2, reason: 'Contrefaçon signalée' },
];

export const DEMO_MODERATOR_HISTORY = [
  { id: 'h-1', action: 'suspend_user', target: 'Youssef Gharbi', moderator: 'Nour Modération', at: hoursAgo(2) },
  { id: 'h-2', action: 'approve_product', target: 'Croquettes chiot premium 8 kg', moderator: 'Nour Modération', at: hoursAgo(5) },
  { id: 'h-3', action: 'reject_review', target: 'Avis spam #fr-1', moderator: 'Nour Modération', at: hoursAgo(8) },
  { id: 'h-4', action: 'approve_vendor', target: 'Pets & Co Sfax', moderator: 'Nour Modération', at: daysAgo(1) },
  { id: 'h-5', action: 'resolve_dispute', target: 'CMD-8755', moderator: 'Nour Modération', at: daysAgo(2) },
  { id: 'h-6', action: 'suspend_vendor', target: 'Boutique Nour Pets', moderator: 'Nour Modération', at: daysAgo(5) },
];

export const DEMO_MODERATOR_VENDOR_ACTIVITY = [
  { vendorId: 'v-1', shopName: 'Animalerie Tunis', productsAdded: 4, orders30d: 94, complaints: 1, status: 'active' },
  { vendorId: 'v-2', shopName: 'Pets & Co Sfax', productsAdded: 2, orders30d: 67, complaints: 0, status: 'active' },
  { vendorId: 'v-3', shopName: 'Boutique Nour Pets', productsAdded: 0, orders30d: 8, complaints: 3, status: 'suspended' },
  { vendorId: 'v-4', shopName: 'Zoo Market Nabeul', productsAdded: 0, orders30d: 0, complaints: 0, status: 'pending' },
];

export const MOD_ACTION_LABELS = {
  suspend_user: 'Compte suspendu',
  reactivate_user: 'Compte réactivé',
  flag_abusive: 'Comportement signalé',
  approve_vendor: 'Vendeur validé',
  suspend_vendor: 'Vendeur suspendu',
  verify_vendor: 'Infos commerciales vérifiées',
  approve_product: 'Produit validé',
  reject_product: 'Produit refusé',
  delete_content: 'Contenu supprimé',
  reject_review: 'Avis rejeté',
  approve_image: 'Image validée',
  resolve_dispute: 'Litige résolu',
  clear_fake_review: 'Faux avis écarté',
};

let modStore = null;

export const getModeratorDemoStore = () => {
  if (!modStore) {
    modStore = {
      users: DEMO_MODERATOR_USERS.map((u) => ({ ...u })),
      vendors: DEMO_MODERATOR_VENDOR_APPLICATIONS.map((v) => ({ ...v })),
      pendingProducts: DEMO_MODERATOR_PENDING_PRODUCTS.map((p) => ({ ...p })),
      inappropriate: DEMO_MODERATOR_INAPPROPRIATE.map((c) => ({ ...c })),
      disputes: DEMO_MODERATOR_DISPUTES.map((d) => ({ ...d })),
      fakeReviews: DEMO_MODERATOR_FAKE_REVIEWS.map((r) => ({ ...r })),
      history: [...DEMO_MODERATOR_HISTORY],
      reportedProducts: [...DEMO_MODERATOR_REPORTED_PRODUCTS],
      vendorActivity: [...DEMO_MODERATOR_VENDOR_ACTIVITY],
    };
  }
  return modStore;
};

export const withDemoModeratorStats = (data) => ({
  ...DEMO_MODERATOR_STATS,
  ...(data || {}),
});

export const withDemoModeratorQueue = (items) =>
  Array.isArray(items) && items.length > 0 ? items : DEMO_MODERATOR_QUEUE;
