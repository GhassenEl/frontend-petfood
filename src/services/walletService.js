import api from './httpClient';

export async function getWallet() {
  const { data } = await api.get('/wallet');
  return data;
}

export async function topUpWallet(amount, paymentMethod = 'demo') {
  const { data } = await api.post('/wallet/topup', { amount, paymentMethod });
  return data;
}
