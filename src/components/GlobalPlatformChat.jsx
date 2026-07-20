import React from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ChatAssistant from './ChatAssistant';
import PetBotAvatar from './PetBotAvatar';

const ROLE_VARIANT = {
  admin: 'admin',
  client: 'client',
  livreur: 'livreur',
  vet: 'vet',
  moderator: 'moderator',
  vendor: 'vendor',
  visitor: 'visitor',
};

/** Préfixes où un layout monte déjà le chat / PetBot */
const LAYOUT_CHAT_PREFIXES = [
  '/admin/',
  '/client',
  '/livreur/',
  '/vet/',
  '/vendor',
  '/moderator',
  '/contact',
  '/support-agent',
  '/carte-visite',
  '/checkout',
  '/veterinary',
  '/medical-dossier',
  '/store-locator',
  '/pet-advice',
  '/pet-feeder',
  '/recommendations',
  '/capabilities',
];

const NO_CHAT_EXACT_PATHS = new Set([
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
]);

const pathHasLayoutChat = (pathname) =>
  LAYOUT_CHAT_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`) || pathname.startsWith(prefix)
  );

/**
 * Un seul avatar public : PetBot.
 * ChatAssistant réservé aux rôles staff (admin/vendor/…) hors layouts dédiés.
 */
const GlobalPlatformChat = () => {
  const { user } = useAuth();
  const { pathname } = useLocation();

  if (NO_CHAT_EXACT_PATHS.has(pathname)) return null;
  if (pathHasLayoutChat(pathname)) return null;

  const role = user?.role || user?.type;
  const isClientLike = !role || role === 'client' || role === 'visitor';

  if (isClientLike) {
    return <PetBotAvatar autoOpen />;
  }

  const variant = ROLE_VARIANT[role] || 'visitor';
  return <ChatAssistant variant={variant} />;
};

export default GlobalPlatformChat;
