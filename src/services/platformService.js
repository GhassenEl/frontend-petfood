import api from '../utils/api';
import {
  getServicesForRole,
  getServicesByCategory,
  getBookableServices,
  findPlatformService,
  PLATFORM_SERVICES,
} from '../config/platformServicesCatalog';
import { SERVICE_RATE_CARDS } from '../utils/clientDemoData';
import { mergeServiceCatalog } from '../utils/serviceCatalogUtils';

/**
 * Catalogue des services plateforme filtré par rôle.
 */
export const fetchPlatformCatalog = (role = 'client') =>
  Promise.resolve({
    role,
    services: getServicesForRole(role),
    categories: getServicesByCategory(role),
    bookable: getBookableServices(role),
    total: getServicesForRole(role).length,
  });

/**
 * Détail d'un service + métadonnées API.
 */
export const fetchPlatformService = (serviceId) => {
  const service = findPlatformService(serviceId);
  if (!service) {
    return Promise.reject(new Error(`Service inconnu : ${serviceId}`));
  }
  return Promise.resolve(service);
};

/**
 * Statut agrégé des services (santé API) — fallback démo si endpoint absent.
 */
export const fetchPlatformHealth = async () => {
  const result = await import('./backendHealthService').then((m) => m.pingBackendHealth());
  if (result.ok) {
    return { ok: true, backend: result.payload, latencyMs: result.latencyMs, checkedAt: result.checkedAt, mode: 'live' };
  }
  return {
    ok: false,
    mode: result.strictLive ? 'offline' : 'demo',
    message: result.error || 'Backend indisponible',
    checkedAt: result.checkedAt,
  };
};

/**
 * Services réservables enrichis (tarifs + catalogue API).
 */
export const fetchBookableServicesCatalog = async () => {
  try {
    const { data } = await api.get('/service-bookings/catalog');
    return mergeServiceCatalog(Array.isArray(data) ? data : []);
  } catch {
    return mergeServiceCatalog(SERVICE_RATE_CARDS);
  }
};

/**
 * Résumé nutrition multi-espèces (lien service plateforme).
 */
export const fetchNutritionServiceSummary = async () => {
  try {
    const { data } = await api.get('/pets/nutrition?productLimit=0');
    const pets = data?.pets || [];
    return {
      available: true,
      petCount: pets.length,
      species: [...new Set(pets.map((p) => p.type).filter(Boolean))],
      source: 'api',
    };
  } catch {
    return {
      available: true,
      petCount: 0,
      species: ['dog', 'cat', 'bird', 'fish', 'rabbit', 'hamster', 'reptile', 'other'],
      source: 'catalog',
      message: 'Nutrition multi-espèces — races tunisiennes et NAC.',
    };
  }
};

/**
 * Hub complet : catalogue + santé + soins réservables.
 */
export const fetchPlatformHub = async (role = 'client') => {
  const [catalog, health, bookable, nutrition] = await Promise.all([
    fetchPlatformCatalog(role),
    fetchPlatformHealth(),
    role === 'client' ? fetchBookableServicesCatalog() : Promise.resolve([]),
    role === 'client' ? fetchNutritionServiceSummary() : Promise.resolve(null),
  ]);

  return {
    ...catalog,
    health,
    bookableServices: bookable,
    nutrition,
    exportedModules: [
      'productService',
      'orderService',
      'userService',
      'vetService',
      'ecosystemService',
      'petNutritionService',
      'serviceBookingService',
      'mlService',
      'adminOpsService',
      'chatService',
      'walletService',
      'loyaltyService',
    ],
  };
};

export {
  getServicesForRole,
  getServicesByCategory,
  getBookableServices,
  findPlatformService,
  PLATFORM_SERVICES,
};

export default fetchPlatformHub;
