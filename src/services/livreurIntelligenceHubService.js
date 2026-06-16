import api from '../utils/api';
import {
  DEMO_LIVREUR_ORDERS,
  DEMO_LIVREUR_ROUTE,
  DEMO_LIVREUR_STATS,
} from '../utils/livreurDemoData';
import { enrichLivreurIntelligencePack } from '../utils/livreurIntelligenceEngine';

export async function loadLivreurIntelligenceHubPack() {
  let mode = 'demo';
  let orders = DEMO_LIVREUR_ORDERS;
  let route = DEMO_LIVREUR_ROUTE;
  let stats = DEMO_LIVREUR_STATS;

  try {
    const [ordersRes, routeRes, statsRes] = await Promise.all([
      api.get('/livreur/orders').catch(() => null),
      api.get('/livreur/route').catch(() => null),
      api.get('/livreur/stats').catch(() => null),
    ]);
    if (ordersRes?.data?.length) {
      orders = ordersRes.data;
      mode = 'live';
    }
    if (routeRes?.data?.stops?.length) route = routeRes.data;
    if (statsRes?.data) stats = { ...stats, ...statsRes.data };
  } catch {
    /* démo */
  }

  return enrichLivreurIntelligencePack({
    mode,
    orders,
    route,
    stats,
    traffic: 'moderate',
    weather: 'clear',
    startPoint: { lat: 36.8065, lng: 10.1815 },
  });
}

export default loadLivreurIntelligenceHubPack;
