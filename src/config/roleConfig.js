/** Configuration centrale des rôles PetfoodTN. */

export const ROLE_HOMES = {
  admin: '/admin/dashboard',
  client: '/client-dashboard',
  livreur: '/livreur/dashboard',
  vet: '/vet/dashboard',
  vendor: '/vendor/dashboard',
  moderator: '/moderator/dashboard',
};

export const getRoleHome = (role) => ROLE_HOMES[role] || '/';

export const PLATFORM_ROLES = Object.keys(ROLE_HOMES);
