/**
 * Comptes de démonstration PetfoodTN — login & mot de passe par acteur.
 * Utilisé après seed backend (RUN_SEED=true). Environnement dev / démo uniquement.
 */
import { ROLE_HOMES } from './roleConfig';

/** Comptes principaux — un par rôle métier authentifié. */
export const DEMO_ACCOUNTS = [
  {
    id: 'admin',
    role: 'admin',
    label: 'Administrateur',
    icon: '⚙️',
    name: 'Ghassen Admin',
    email: 'admin@petfood.tn',
    password: 'PetfoodTN2024!',
    home: ROLE_HOMES.admin,
    primary: true,
  },
  {
    id: 'client',
    role: 'client',
    label: 'Client',
    icon: '🐾',
    name: 'Sami Ben Ali',
    email: 'client@petfood.tn',
    password: 'MonChat123!',
    home: ROLE_HOMES.client,
    primary: true,
  },
  {
    id: 'vet',
    role: 'vet',
    label: 'Vétérinaire',
    icon: '🩺',
    name: 'Dr. Amira Khelifi',
    email: 'vet@petfood.tn',
    password: 'Vet2024!',
    home: ROLE_HOMES.vet,
    primary: true,
  },
  {
    id: 'livreur',
    role: 'livreur',
    label: 'Livreur',
    icon: '🛵',
    name: 'Karim Mansouri',
    email: 'livreur@petfood.tn',
    password: 'Livreur123!',
    home: ROLE_HOMES.livreur,
    primary: true,
  },
  {
    id: 'vendor',
    role: 'vendor',
    label: 'Vendeur',
    icon: '🏬',
    name: 'Leila Mansouri',
    email: 'vendor@petfood.tn',
    password: 'Vendor2024!',
    home: ROLE_HOMES.vendor,
    primary: true,
  },
  {
    id: 'moderator',
    role: 'moderator',
    label: 'Modérateur',
    icon: '🛡️',
    name: 'Nour Modération',
    email: 'moderator@petfood.tn',
    password: 'Moderator2024!',
    home: ROLE_HOMES.moderator,
    primary: true,
  },
];

/** Comptes secondaires optionnels (tests multi-utilisateurs). */
export const SECONDARY_DEMO_ACCOUNTS = [
  {
    role: 'client',
    label: 'Client',
    name: 'Amina Ben Ali',
    email: 'amina@petfood.tn',
    password: 'Amina2024!',
    home: ROLE_HOMES.client,
  },
  {
    role: 'client',
    label: 'Client',
    name: 'Youssef Trabelsi',
    email: 'youssef@petfood.tn',
    password: 'Youssef2024!',
    home: ROLE_HOMES.client,
  },
  {
    role: 'livreur',
    label: 'Livreur',
    name: 'Sami Livreur',
    email: 'sami.livreur@petfood.tn',
    password: 'SamiLivreur2024!',
    home: ROLE_HOMES.livreur,
  },
];

/** Visiteur — accès public sans authentification. */
export const VISITOR_ACCESS = {
  label: 'Visiteur',
  icon: '👀',
  home: '/visitor',
  note: 'Pas de login — catalogue et outils publics accessibles sans compte.',
};

export const DEMO_APP_URL = 'http://localhost:3001';
export const DEMO_LOGIN_URL = '/login';

export const getDemoAccountByRole = (role) =>
  DEMO_ACCOUNTS.find((a) => a.role === role) || null;

export const getDemoAccountByEmail = (email) => {
  const normalized = String(email || '').trim().toLowerCase();
  return (
    DEMO_ACCOUNTS.find((a) => a.email === normalized)
    || SECONDARY_DEMO_ACCOUNTS.find((a) => a.email === normalized)
    || null
  );
};

export const getPrimaryDemoAccounts = () => DEMO_ACCOUNTS.filter((a) => a.primary);

export default DEMO_ACCOUNTS;
