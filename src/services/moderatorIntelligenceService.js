import api from '../utils/api';
import { withDemoFallback, DEMO_REVIEWS, DEMO_COMMUNITY_POSTS } from '../utils/clientDemoData';
import {
  DEMO_ADMIN_ORDERS,
  DEMO_ADMIN_COMPLAINTS,
  DEMO_ADMIN_USERS,
} from '../utils/adminDemoData';
import {
  DEMO_MODERATOR_FAKE_REVIEWS,
  DEMO_MODERATOR_INAPPROPRIATE,
  getModeratorDemoStore,
} from '../utils/moderatorDemoData';
import { scanReviewsBatch, detectReviewAnomalies, scanAiGeneratedReviews } from '../utils/contentAnomalyDetector';
import { moderateBatch } from '../utils/autoModerationFilter';
import { classifyComplaintsBatch } from '../utils/complaintClassificationEngine';
import { analyzePlatformReputation } from '../utils/reputationSentimentEngine';
import { detectSuspiciousActivities } from '../utils/moderatorActivityEngine';
import { computeUserReputation } from '../utils/userReputationEngine';
import { analyzeContentQualityBatch } from '../utils/contentQualityAnalyzer';
import { getProducts } from './productService';

const DEMO_EXTRA_COMPLAINTS = [
  {
    _id: 'demo-comp-003',
    subject: 'Retard livraison commande #8842',
    message: 'Colis non reçu après 8 jours, livreur injoignable.',
    status: 'open',
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    _id: 'demo-comp-004',
    subject: 'Consultation vétérinaire annulée',
    message: 'RDV téléconsultation reporté sans préavis, animal en attente de soins.',
    status: 'ai_proposed',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    _id: 'demo-comp-005',
    subject: 'Produit périmé reçu',
    message: 'Date limite de consommation dépassée sur les croquettes reçues.',
    status: 'open',
    createdAt: new Date(Date.now() - 5 * 3600000).toISOString(),
  },
];

const buildLiveFeed = ({
  fakeReviews,
  moderationQueue,
  suspiciousActivities,
  classifiedComplaints,
  inappropriate,
}) => {
  const feed = [];

  fakeReviews.forEach((item) => {
    feed.push({
      id: `feed-review-${item.review?.id || item.review?._id}`,
      type: 'fake_review',
      icon: '🚨',
      title: `Faux avis suspect — ${item.review?.productName || item.review?.productId?.name || 'Produit'}`,
      detail: item.anomaly?.summary,
      severity: item.anomaly?.severity,
      score: item.anomaly?.score,
      ago: item.review?.createdAt,
    });
  });

  moderationQueue.slice(0, 6).forEach((item) => {
    feed.push({
      id: `feed-mod-${item.id}`,
      type: 'content',
      icon: '🔎',
      title: `Modération auto — ${item.action}`,
      detail: item.summary,
      severity: item.score >= 8 ? 'high' : item.score >= 5 ? 'medium' : 'low',
      score: item.score,
    });
  });

  suspiciousActivities.slice(0, 5).forEach((item) => {
    feed.push({
      id: `feed-act-${item.id}`,
      type: 'activity',
      icon: '⚠️',
      title: item.title,
      detail: item.detail,
      severity: item.severity,
      score: item.score,
    });
  });

  classifiedComplaints
    .filter((c) => c.complaint.status !== 'resolved')
    .slice(0, 4)
    .forEach((item) => {
      feed.push({
        id: `feed-comp-${item.complaint._id || item.complaint.id}`,
        type: 'complaint',
        icon: item.classification.categoryIcon,
        title: item.complaint.subject || 'Réclamation',
        detail: item.classification.aiSummary,
        severity: item.classification.confidence === 'high' ? 'medium' : 'low',
        score: 40,
        ago: item.complaint.createdAt,
      });
    });

  inappropriate
    .filter((c) => c.status === 'open')
    .forEach((item) => {
      feed.push({
        id: `feed-ic-${item.id}`,
        type: 'report',
        icon: '📑',
        title: `Signalement — ${item.type}`,
        detail: item.content,
        severity: 'medium',
        score: 50,
        ago: item.createdAt,
      });
    });

  return feed.sort((a, b) => (b.score || 0) - (a.score || 0)).slice(0, 15);
};

export async function loadModeratorIntelligencePack() {
  const [reviewsRes, complaintsRes, ordersRes, usersRes, productsRes] = await Promise.all([
    api.get('/reviews').catch(() => ({ data: [] })),
    api.get('/complaints').catch(() => ({ data: [] })),
    api.get('/orders').catch(() => ({ data: [] })),
    api.get('/users').catch(() => ({ data: [] })),
    getProducts().catch(() => []),
  ]);

  const reviews = withDemoFallback(reviewsRes.data, DEMO_REVIEWS);
  const complaints = withDemoFallback(complaintsRes.data, [
    ...DEMO_ADMIN_COMPLAINTS,
    ...DEMO_EXTRA_COMPLAINTS,
  ]);
  const orders = withDemoFallback(ordersRes.data, DEMO_ADMIN_ORDERS);
  const users = withDemoFallback(usersRes.data, DEMO_ADMIN_USERS);
  const store = getModeratorDemoStore();

  const fakeReviewSources = [
    ...DEMO_MODERATOR_FAKE_REVIEWS.filter((r) => r.status === 'flagged'),
    ...reviews,
  ];
  const fakeReviews = scanReviewsBatch(fakeReviewSources).map((item) => ({
    ...item,
    review: {
      ...item.review,
      productName:
        item.review.productName ||
        item.review.productId?.name ||
        'Produit',
      author: item.review.author || item.review.user?.name || 'Anonyme',
    },
  }));

  const contentSources = [
    ...reviews.map((r) => ({ ...r, comment: r.comment })),
    ...store.inappropriate.map((c) => ({
      id: c.id,
      comment: c.content,
      rating: 0,
    })),
    ...DEMO_COMMUNITY_POSTS.map((p) => ({
      id: p.id,
      comment: p.content || p.text,
    })),
  ];
  const moderationQueue = moderateBatch(contentSources).filter((r) => r.suspicious);

  const reputation = analyzePlatformReputation({ reviews, complaints });
  const suspiciousActivities = detectSuspiciousActivities({
    users,
    orders,
    posts: DEMO_COMMUNITY_POSTS,
    reviews,
  });

  const classifiedComplaints = classifyComplaintsBatch(complaints);

  const categoryBreakdown = classifiedComplaints.reduce((acc, item) => {
    const cat = item.classification.category;
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {});

  const userWatchlist = users.slice(0, 8).map((u) => {
    const userReviews = reviews.filter(
      (r) => r.user?.email === u.email || r.userId === u.id,
    );
    const rep = computeUserReputation({ reviews: userReviews });
    return {
      userId: u.id || u._id,
      name: u.name || u.email,
      reputation: rep.score,
      level: rep.levelLabel,
      suspiciousReviews: userReviews.filter((r) => detectReviewAnomalies(r).suspicious).length,
    };
  }).filter((u) => u.reputation < 55 || u.suspiciousReviews > 0);

  const liveFeed = buildLiveFeed({
    fakeReviews,
    moderationQueue,
    suspiciousActivities,
    classifiedComplaints,
    inappropriate: store.inappropriate,
  });

  const aiGeneratedReviews = scanAiGeneratedReviews(reviews).map((item) => ({
    ...item,
    review: {
      ...item.review,
      productName: item.review.productName || item.review.productId?.name || 'Produit',
      author: item.review.author || item.review.user?.name || 'Anonyme',
    },
  }));

  const products = Array.isArray(productsRes) ? productsRes : [];
  const contentQualityItems = analyzeContentQualityBatch([
    ...products.slice(0, 15),
    ...store.pendingProducts,
    ...DEMO_COMMUNITY_POSTS.map((p) => ({
      id: p.id,
      name: p.title || 'Publication',
      content: p.content || p.text,
    })),
  ]);

  return {
    fakeReviews,
    aiGeneratedReviews,
    contentQualityItems,
    moderationQueue,
    reputation,
    suspiciousActivities,
    classifiedComplaints,
    categoryBreakdown,
    userWatchlist,
    liveFeed,
    stats: {
      fakeReviewCount: fakeReviews.length,
      aiGeneratedCount: aiGeneratedReviews.length,
      contentQualityIssues: contentQualityItems.filter((c) => c.quality.needsReview).length,
      moderationPending: moderationQueue.length,
      incidentCount: suspiciousActivities.length,
      openComplaints: complaints.filter((c) => c.status !== 'resolved').length,
      negativeReviews: reputation.negativeReviewCount,
      satisfactionScore: reputation.satisfactionScore,
      reportsOpen: store.inappropriate.filter((c) => c.status === 'open').length,
    },
  };
}

export default loadModeratorIntelligencePack;
