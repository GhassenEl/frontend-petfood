import React from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ChatAssistant from './ChatAssistant';

const ROLE_VARIANT = {
  admin: 'admin',
  client: 'client',
  livreur: 'livreur',
  vet: 'vet',
  moderator: 'moderator',
  vendor: 'vendor',
  visitor: 'visitor',
};

/** Préfixes où un layout monte déjà ChatAssistant */
const LAYOUT_CHAT_PREFIXES = [
  '/admin/',
  '/client',
  '/livreur/',
  '/vet/',
  '/vendor',
  '/moderator',
  '/contact',
];

/** Pages auth sans chatbot flottant */
const NO_CHAT_EXACT_PATHS = new Set([
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
]);

const pathHasLayoutChat = (pathname) =>
  LAYOUT_CHAT_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`) || pathname.startsWith(prefix),
  );

const pathBlocksGlobalChat = (pathname) => NO_CHAT_EXACT_PATHS.has(pathname);

/**
 * Chatbot global pour les pages sans layout dédié (accueil, enterprise, etc.).
 * Masqué sur login / register / mot de passe.
 */
const GlobalPlatformChat = () => {
  const { user } = useAuth();
  const { pathname } = useLocation();

  if (pathHasLayoutChat(pathname) || pathBlocksGlobalChat(pathname)) return null;

  const role = user?.role || user?.type;
  const variant = ROLE_VARIANT[role] || 'visitor';

  return <ChatAssistant variant={variant} />;
};

export default GlobalPlatformChat;
