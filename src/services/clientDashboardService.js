import api from '../utils/api';

export const fetchClientDashboard = () =>
  api.get('/client/dashboard').then((r) => r.data);

export const fetchHousehold = () =>
  api.get('/client/family/household').then((r) => r.data);

export const createHousehold = (body) =>
  api.post('/client/family/household', body).then((r) => r.data);

export const joinHousehold = (inviteCode) =>
  api.post('/client/family/join', { inviteCode }).then((r) => r.data);

export const leaveHousehold = () =>
  api.delete('/client/family/household').then((r) => r.data);

export const fetchSharedPets = () =>
  api.get('/client/family/pets').then((r) => r.data);
