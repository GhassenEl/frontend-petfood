import api from './api';
import { enrichDeliverySurveillancePack } from '../utils/deliveryColdChainEngine';
import {
  DEMO_DELIVERY_SURVEILLANCE,
  getClientDeliverySurveillance,
  getLivreurDeliverySurveillance,
  getVendorDeliverySurveillance,
} from '../utils/deliveryColdChainDemoData';

export async function fetchDeliveryColdChainSurveillance(role = 'admin', orderId = null) {
  try {
    const path =
      role === 'client'
        ? `/ecosystem/delivery/cold-chain${orderId ? `/${orderId}` : ''}`
        : role === 'livreur'
          ? '/livreur/delivery/cold-chain'
          : role === 'vendor'
            ? '/vendor/delivery/cold-chain'
            : '/admin/delivery/cold-chain/surveillance';
    const { data } = await api.get(path);
    if (data?.deliveries?.length) {
      return enrichDeliverySurveillancePack({ ...data, mode: data.mode || 'live' });
    }
  } catch {
    /* démo */
  }

  let base = DEMO_DELIVERY_SURVEILLANCE;
  if (role === 'client') base = getClientDeliverySurveillance(orderId);
  else if (role === 'livreur') base = getLivreurDeliverySurveillance();
  else if (role === 'vendor') base = getVendorDeliverySurveillance();

  return enrichDeliverySurveillancePack({ ...base, mode: 'demo' });
}

export default fetchDeliveryColdChainSurveillance;
