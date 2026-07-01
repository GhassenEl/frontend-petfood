import api from '../utils/api';

/** Recommandations hybrides FastAPI via backend Node */
export const fetchHybridRecommendations = async ({ role, limit = 10, query, minRating, petId } = {}) => {
  const { data } = await api.get('/recommendations/hybrid', {
    params: {
      role,
      limit,
      q: query || undefined,
      minRating: minRating ?? undefined,
      petId: petId || undefined,
    },
  });
  return data;
};

export const fetchAdminClientRecommendations = async (userId, limit = 12) => {
  const { data } = await api.get(`/recommendations/admin/client/${userId}`, {
    params: { limit },
  });
  return data;
};

export const fetchSalesTrafficExplanation = async () => {
  const { data } = await api.get('/recommendations/admin/explain-sales');
  return data;
};

export const searchProductsByReviews = async ({ query, minRating, limit = 12 } = {}) => {
  const { data } = await api.get('/recommendations/search', {
    params: { q: query, minRating, limit },
  });
  return data;
};

export default {
  fetchHybridRecommendations,
  fetchAdminClientRecommendations,
  fetchSalesTrafficExplanation,
  searchProductsByReviews,
};
