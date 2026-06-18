import {
  ADMIN_MOBILE_NAV,
  CLIENT_MOBILE_NAV,
  LIVREUR_MOBILE_NAV,
  VET_MOBILE_NAV,
  VENDOR_MOBILE_NAV,
  MODERATOR_MOBILE_NAV,
  VISITOR_MOBILE_NAV,
} from '../components/MobileBottomNav';

const MAP = {
  admin: ADMIN_MOBILE_NAV,
  client: CLIENT_MOBILE_NAV,
  livreur: LIVREUR_MOBILE_NAV,
  vet: VET_MOBILE_NAV,
  vendor: VENDOR_MOBILE_NAV,
  moderator: MODERATOR_MOBILE_NAV,
};

export const getMobileNavForRole = (role) => MAP[role] || VISITOR_MOBILE_NAV;
