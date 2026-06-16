import api from './httpClient';
import { DEMO_REVIEWS } from '../utils/clientDemoData';
import { filterReviewsByProduct } from '../utils/reviewInsightAnalyzer';

export async function getMyReviews() {
  const { data } = await api.get('/reviews');
  return Array.isArray(data) ? data : [];
}

/** Avis d'un produit (API ou fallback démo) */
export async function getProductReviews(productId) {
  const pid = String(productId || '');
  if (!pid) return [];

  try {
    const { data } = await api.get('/reviews', { params: { productId: pid } });
    const list = Array.isArray(data) ? data : data?.reviews || [];
    if (list.length) return list;
  } catch {
    /* fallback */
  }

  try {
    const { data } = await api.get(`/products/${pid}/reviews`);
    const list = Array.isArray(data) ? data : data?.reviews || [];
    if (list.length) return list;
  } catch {
    /* fallback */
  }

  try {
    const all = await getMyReviews();
    const mine = filterReviewsByProduct(all, pid);
    if (mine.length) return mine;
  } catch {
    /* fallback */
  }

  return filterReviewsByProduct(DEMO_REVIEWS, pid);
}

/** Admin : tous les avis produits */
export async function getAllReviews() {
  const { data } = await api.get('/reviews');
  return Array.isArray(data) ? data : [];
}

export async function createReview(payload) {
  const { data } = await api.post('/reviews', payload);
  return data;
}

export async function updateReview(id, payload) {
  const { data } = await api.put(`/reviews/${id}`, payload);
  return data;
}

export async function deleteReview(id) {
  await api.delete(`/reviews/${id}`);
}
