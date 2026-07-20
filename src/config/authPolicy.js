/** Politique auth — cookies HttpOnly uniquement si explicitement activés.
 *  Le backend PetfoodTN authentifie via Bearer JWT (Authorization header).
 *  Ne pas déduire PROD → cookies : cela provoque des GET /auth/me 401 au démarrage.
 */
export const useHttpOnlyAuthCookie = () => {
  const raw = import.meta.env.VITE_AUTH_HTTPONLY;
  return raw === 'true' || raw === '1';
};
