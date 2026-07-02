/** Routes hub recommandations — source unique pour navigation par profil */

export const RECOMMENDATION_HUB_ROUTES = {
  client: '/client-recommendations',
  vet: '/vet/recommendations',
  veterinarian: '/vet/recommendations',
  admin: '/admin/recommendations',
  vendor: '/vendor/recommendations',
  livreur: '/livreur/recommendations',
  moderator: '/moderator/recommendations',
};

export const RECOMMENDATION_ALLOWED_ROLES = Object.keys(RECOMMENDATION_HUB_ROUTES);

export const getRecommendationHubRoute = (role = 'client') => {
  const key = role === 'veterinarian' ? 'vet' : role;
  return RECOMMENDATION_HUB_ROUTES[key] || RECOMMENDATION_HUB_ROUTES.client;
};

export const normalizeRecommendationRole = (role = 'client') => {
  if (role === 'veterinarian') return 'vet';
  return role;
};
