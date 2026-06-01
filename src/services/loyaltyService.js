import api from './httpClient';

export async function getLoyaltyAccount() {
  const { data } = await api.get('/loyalty');
  return data;
}

export async function redeemLoyaltyPoints(tierId) {
  const { data } = await api.post('/loyalty/redeem', { tierId });
  return data;
}

export async function getPersonalizedOffers() {
  const { data } = await api.get('/loyalty/offers');
  return data;
}

export async function getActivePromos() {
  const { data } = await api.get('/promotions/active');
  return data;
}
