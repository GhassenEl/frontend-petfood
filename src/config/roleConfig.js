/** Configuration centrale des rôles PetfoodTN. */

export const ROLE_HOMES = {
  admin: '/admin/dashboard',
  stock_manager: '/admin/stock',
  client: '/client-products',
  livreur: '/livreur/dashboard',
  vet: '/vet/dashboard',
  vendor: '/vendor/dashboard',
  moderator: '/moderator/dashboard',
};

export const getRoleHome = (role) => ROLE_HOMES[role] || '/';

export const PLATFORM_ROLES = Object.keys(ROLE_HOMES);
