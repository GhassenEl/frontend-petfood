import api from './httpClient';

export async function getProfile() {
  const { data } = await api.get('/users/profile');
  return data;
}

export async function getPets() {
  const { data } = await api.get('/pets');
  return data;
}

export async function updateProfile(payload) {
  const { data } = await api.put('/users/profile', payload);
  return data;
}
