import api from '../utils/api';



export const fetchEcosystemHub = (params) => api.get('/ecosystem/hub', { params }).then((r) => r.data);



export const fetchPremiumPack = (params) => api.get('/ecosystem/premium', { params }).then((r) => r.data);

export const generateMealPlan = (body) => api.post('/ecosystem/premium/meal-plan', body).then((r) => r.data);

export const fetchBudget = (params) => api.get('/ecosystem/premium/budget', { params }).then((r) => r.data);

export const fetchFutureNeeds = (params) => api.get('/ecosystem/premium/future-needs', { params }).then((r) => r.data);

export const fetchHealthRisks = (body) => api.post('/ecosystem/premium/health-risks', body).then((r) => r.data);



export const fetchGamification = () => api.get('/ecosystem/gamification').then((r) => r.data);

export const claimChallenge = () => api.post('/ecosystem/gamification/claim-challenge').then((r) => r.data);



export const fetchMarketplace = () => api.get('/ecosystem/marketplace').then((r) => r.data);

export const fetchVendorProducts = (vendorId) =>

  api.get(`/ecosystem/marketplace/vendors/${vendorId}/products`).then((r) => r.data);

export const registerVendor = (body) => api.post('/ecosystem/vendor/register', body).then((r) => r.data);

export const fetchVendorDashboard = () => api.get('/ecosystem/vendor/dashboard').then((r) => r.data);

export const fetchVendorMlAgent = () => api.get('/ecosystem/vendor/ml-agent').then((r) => r.data);

export const fetchAdminVendors = () => api.get('/ecosystem/admin/vendors').then((r) => r.data);

export const fetchAdminVendor = (vendorId) =>
  api.get(`/ecosystem/admin/vendors/${vendorId}`).then((r) => r.data);

export const fetchAdminMarketplaceStats = () =>
  api.get('/ecosystem/admin/marketplace').then((r) => r.data);

export const updateAdminVendor = (vendorId, body) =>
  api.patch(`/ecosystem/admin/vendors/${vendorId}`, body).then((r) => r.data);



export const fetchSubscriptions = () => api.get('/ecosystem/subscriptions').then((r) => r.data);

export const createSubscription = (body) => api.post('/ecosystem/subscriptions', body).then((r) => r.data);

export const updateSubscription = (id, body) => api.patch(`/ecosystem/subscriptions/${id}`, body).then((r) => r.data);



export const fetchShelters = () => api.get('/ecosystem/shelters').then((r) => r.data);

export const applyAdoption = (body) => api.post('/ecosystem/shelters/adopt', body).then((r) => r.data);

export const fetchRehabOverview = (params) =>
  api.get('/ecosystem/rehabilitation', { params }).then((r) => r.data);

export const fetchRehabProgram = (animalId) =>
  api.get(`/ecosystem/rehabilitation/animals/${animalId}`).then((r) => r.data);

export const fetchRehabMlAdvice = (animalId) =>
  api.get(`/ecosystem/rehabilitation/animals/${animalId}/advice`).then((r) => r.data);

export const logRehabTreatment = (body) =>
  api.post('/ecosystem/rehabilitation/treatments', body).then((r) => r.data);

export const fetchRelayPoints = (params) =>
  api.get('/ecosystem/relay-points', { params }).then((r) => r.data);

export const fetchRelayPoint = (id) =>
  api.get(`/ecosystem/relay-points/${id}`).then((r) => r.data);

export const fetchPetPassports = () =>
  api.get('/ecosystem/pet-passport').then((r) => r.data);

export const fetchPetPassport = (petId) =>
  api.get(`/ecosystem/pet-passport/${petId}`).then((r) => r.data);

export const fetchWaterMonitorOverview = () =>
  api.get('/ecosystem/water-monitor').then((r) => r.data);

export const fetchWaterMonitorTracking = (petId) =>
  api.get(`/ecosystem/water-monitor/${petId}`).then((r) => r.data);

export const logWaterConsumption = (petId, body) =>
  api.post(`/ecosystem/water-monitor/${petId}/log`, body).then((r) => r.data);

export const recordWaterRefill = (petId, body) =>
  api.post(`/ecosystem/water-monitor/${petId}/refill`, body).then((r) => r.data);

export const fetchWaterAlerts = () =>
  api.get('/ecosystem/water-monitor/alerts').then((r) => r.data);

export const pushWaterIotReading = (petId, body) =>
  api.post(`/ecosystem/water-monitor/${petId}/iot`, body).then((r) => r.data);

export const fetchPetCareCatalog = () => api.get('/ecosystem/pet-care/catalog').then((r) => r.data);

export const fetchPetCareProviders = (type) =>

  api.get('/ecosystem/pet-care/providers', { params: { type } }).then((r) => r.data);

export const bookPetCare = (body) => api.post('/ecosystem/pet-care/book', body).then((r) => r.data);



export const analyzeImage = (body) => api.post('/ecosystem/image/analyze', body).then((r) => r.data);



export const fetchPredictiveDelivery = (params) =>

  api.get('/ecosystem/delivery/predictive', { params }).then((r) => r.data);

export const proposeAutoOrder = (body) => api.post('/ecosystem/delivery/propose-order', body).then((r) => r.data);

export const fetchLiveDeliveries = () => api.get('/ecosystem/delivery/live').then((r) => r.data);

export const fetchLiveDelivery = (orderId) =>

  api.get(`/ecosystem/delivery/live/${orderId}`).then((r) => r.data);



export const analyzeEmotions = (body) => api.post('/ecosystem/emotion/analyze', body).then((r) => r.data);

export const fetchEmotionHistory = () => api.get('/ecosystem/emotion/history').then((r) => r.data);



export const fetchSmartLoyalty = () => api.get('/ecosystem/loyalty/smart').then((r) => r.data);



export const vetChat24 = (body) => api.post('/ecosystem/vet-chat', body).then((r) => r.data);



export const fetchFullRecommendations = (params) =>
  api.get('/ecosystem/recommendations/full', { params }).then((r) => r.data);

export const fetchProductPacks = (params) => api.get('/ecosystem/packs', { params }).then((r) => r.data);
export const fetchProductPack = (packType, params) =>
  api.get(`/ecosystem/packs/${packType}`, { params }).then((r) => r.data);
export const addProductPackToCart = (packType, body) =>
  api.post(`/ecosystem/packs/${packType}/add-to-cart`, body).then((r) => r.data);

export const compareProducts = (productIds) =>
  api.post('/ecosystem/products/compare', { productIds }).then((r) => r.data);

export const fetchPetWeightTracking = (petId) =>
  api.get(`/ecosystem/pets/${petId}/weight`).then((r) => r.data);

export const logPetWeight = (petId, body) =>
  api.post(`/ecosystem/pets/${petId}/weight`, body).then((r) => r.data);

export const fetchTraceabilityList = (params) =>
  api.get('/ecosystem/traceability', { params }).then((r) => r.data);

export const fetchProductTraceability = (productId) =>
  api.get(`/ecosystem/traceability/product/${productId}`).then((r) => r.data);

export const verifyProductTraceability = (productId) =>
  api.post(`/ecosystem/traceability/product/${productId}/verify`).then((r) => r.data);

