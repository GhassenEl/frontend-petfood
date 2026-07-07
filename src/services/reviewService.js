import api from './httpClient';
import { DEMO_REVIEWS } from '../utils/clientDemoData';
import { DEMO_ADMIN_REVIEWS } from '../utils/adminDemoData';
import { withDemoFallback } from '../utils/liveDataResolver';
import { filterReviewsByProduct } from '../utils/reviewInsightAnalyzer';

export async function getAllReviews() {
  try {
    const { data } = await api.get('/reviews');
    return withDemoFallback(Array.isArray(data) ? data : [], DEMO_ADMIN_REVIEWS);
  } catch {
    return withDemoFallback([], DEMO_ADMIN_REVIEWS);
  }
}

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
