import api from './httpClient';
import { buildRseEcologyPack } from '../utils/rseEcologyEngine';

const PLEDGES_KEY = 'petfood_eco_pledges';

function getStoredPledges(email) {
  try {
    const all = JSON.parse(localStorage.getItem(PLEDGES_KEY) || '{}');
    return all[(email || '').toLowerCase()] || [];
  } catch {
    return [];
  }
}

export function saveEcoPledges(email, pledges) {
  try {
    const all = JSON.parse(localStorage.getItem(PLEDGES_KEY) || '{}');
    all[(email || '').toLowerCase()] = pledges;
    localStorage.setItem(PLEDGES_KEY, JSON.stringify(all));
  } catch { /* ignore */ }
}

export async function fetchRseEcologyPack(role = 'public') {
  let orders = [];
  let email = '';
  let pledges = [];

  if (role === 'client') {
    try {
      const [profileRes, ordersRes] = await Promise.all([
        api.get('/users/profile').catch(() => ({ data: {} })),
        api.get('/orders').catch(() => ({ data: [] })),
      ]);
      email = profileRes.data?.email || '';
      orders = Array.isArray(ordersRes.data) ? ordersRes.data : ordersRes.data?.orders || [];
      pledges = getStoredPledges(email);
    } catch { /* demo fallback */ }
  }

  const pack = buildRseEcologyPack(role, { orders, pledges, email });

  if (role === 'client') {
    pack.clientPledges = pledges;
    pack.userEmail = email;
  }

  return pack;
}

export async function toggleEcoPledge(email, pledgeId) {
  const current = getStoredPledges(email);
  const next = current.includes(pledgeId)
    ? current.filter((id) => id !== pledgeId)
    : [...current, pledgeId];
  saveEcoPledges(email, next);
  return next;
}

export default { fetchRseEcologyPack, toggleEcoPledge, saveEcoPledges };
