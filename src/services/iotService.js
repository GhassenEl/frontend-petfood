import api from '../utils/api';

export const fetchIoTPack = () =>
  api.get('/client/iot/pack').then((r) => r.data);
