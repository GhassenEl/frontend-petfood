import api from '../utils/api';
import { fetchRelayPoints } from './ecosystemService';
import { fetchPlatformRegions } from './platformCitiesService';
import {
  DEMO_NEARBY_VETS,
  DEMO_PARTNER_STORES,
  DEMO_LOCAL_ALERTS,
} from '../utils/clientDemoData';
import { getIntelligentVetRecommendations } from '../utils/nearbyVetSearch';
import { filterLocalAlerts, summarizeLocalAlerts } from '../utils/localAlertsEngine';

const DEFAULT_CENTER = { lat: 36.8065, lng: 10.1815 };

const getUserPosition = () =>
  new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(DEFAULT_CENTER);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => resolve(DEFAULT_CENTER),
      { timeout: 10000, maximumAge: 120000 }
    );
  });

export async function loadGeoServicesPack() {
  const position = await getUserPosition();
  let profileRegion = '';

  try {
    const profileRes = await api.get('/users/profile');
    profileRegion = profileRes.data?.region || '';
  } catch {
    /* démo */
  }

  let vets = [];
  let vetMeta = null;
  try {
    const res = await api.get('/veterinary/nearby', {
      params: { lat: position.lat, lng: position.lng, radius: 80, region: profileRegion || undefined },
    });
    const payload = res.data?.vets ? res.data : { vets: Array.isArray(res.data) ? res.data : [], meta: {} };
    vets = payload.vets || [];
    vetMeta = payload.meta || null;
  } catch {
    vets = [];
  }
  if (!vets.length) vets = DEMO_NEARBY_VETS;

  const vetIntel = getIntelligentVetRecommendations(vets, {
    lat: position.lat,
    lng: position.lng,
    region: profileRegion || vetMeta?.clientRegion,
  });

  let stores = [];
  try {
    const relay = await fetchRelayPoints({
      lat: position.lat,
      lng: position.lng,
      radius: 80,
    });
    stores = relay?.points || relay || [];
  } catch {
    stores = [];
  }
  if (!stores.length) stores = DEMO_PARTNER_STORES;

  let alerts = [];
  try {
    const res = await api.get('/ecosystem/local-alerts', {
      params: { lat: position.lat, lng: position.lng, region: profileRegion || undefined },
    });
    alerts = res.data?.alerts || res.data || [];
  } catch {
    alerts = [];
  }
  if (!alerts.length) alerts = DEMO_LOCAL_ALERTS;

  const filteredAlerts = filterLocalAlerts(alerts, {
    region: profileRegion || undefined,
  });

  let regions = [];
  try {
    const r = await fetchPlatformRegions();
    regions = r.regions || [];
  } catch {
    regions = ['Tunis', 'Ariana', 'La Marsa', 'Lac', 'Manouba', 'Carthage', 'Le Kram', 'Sidi Bou Said'];
  }

  return {
    position,
    profileRegion,
    regions,
    vets: vetIntel.vets,
    vetSummary: vetIntel.summary,
    availableVetCount: vetIntel.availableCount,
    bestVet: vetIntel.best,
    stores,
    alerts: filteredAlerts,
    alertsSummary: summarizeLocalAlerts(filteredAlerts),
    clientCenter: {
      lat: position.lat,
      lng: position.lng,
      label: profileRegion ? `votre position (${profileRegion})` : 'votre position',
    },
  };
}

export default loadGeoServicesPack;
