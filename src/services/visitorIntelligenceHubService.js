import api from '../utils/api';
import {
  fetchVisitorProducts,
  getVisitorBrowseHistory,
} from './visitorService';
import { searchProductsNaturalLanguage } from '../utils/naturalLanguageProductSearch';
import { compareProductsSmart } from '../utils/productComparator';
import { suggestWishlistProducts } from '../utils/smartWishlistEngine';
import { getVisitorAssistantReply, VISITOR_CHAT_QUICK } from '../utils/visitorAssistantEngine';
import { DEMO_REVIEWS } from '../utils/clientDemoData';

export async function searchVisitorProducts(query) {
  const { data: products } = await fetchVisitorProducts();
  return searchProductsNaturalLanguage(products, query, 12);
}

export async function askVisitorAssistant(message) {
  try {
    const { data } = await api.post('/chat/public', {
      message,
      role: 'visitor',
      context: { type: 'visitor_assist' },
    });
    if (data?.message || data?.content) {
      return {
        message: data.message || data.content,
        quickReplies: data.quickReplies || [],
      };
    }
  } catch {
    /* local */
  }
  return getVisitorAssistantReply(message);
}

export async function loadVisitorIntelligenceHub(petType = 'dog') {
  const { data: products } = await fetchVisitorProducts();
  const browseIds = getVisitorBrowseHistory();

  let reviews = DEMO_REVIEWS;
  try {
    const res = await api.get('/reviews/public').catch(() => api.get('/reviews'));
    if (res.data?.length) reviews = res.data;
  } catch {
    /* démo */
  }

  const reviewsByProductId = {};
  reviews.forEach((r) => {
    const pid = String(r.productId?._id || r.productId?.id || r.productId || '');
    if (!reviewsByProductId[pid]) reviewsByProductId[pid] = [];
    reviewsByProductId[pid].push(r);
  });

  const wishlistSuggestions = suggestWishlistProducts({
    products,
    browseIds,
    petType,
  });

  return {
    products,
    browseIds,
    wishlistSuggestions,
    reviewsByProductId,
    quickQuestions: VISITOR_CHAT_QUICK,
  };
}

export function compareVisitorProducts(products, reviewsByProductId) {
  return compareProductsSmart(products, reviewsByProductId);
}

export default loadVisitorIntelligenceHub;
