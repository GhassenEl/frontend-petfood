import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import useIsMobile from '../hooks/useIsMobile';

const MobileBottomNav = ({ items = [] }) => {
  const isMobile = useIsMobile();
  const location = useLocation();

  if (!isMobile || items.length === 0) return null;

  const openMenu = () => {
    window.dispatchEvent(new CustomEvent('petfood:open-mobile-nav'));
  };

  return (
    <nav className="mobile-bottom-nav" aria-label="Navigation principale mobile">
      {items.map((item) => {
        if (item.action === 'menu') {
          return (
            <button
              key={item.id}
              type="button"
              className="mobile-bottom-nav__item"
              onClick={openMenu}
              aria-label="Ouvrir le menu"
            >
              <span className="mobile-bottom-nav__icon" aria-hidden>{item.icon}</span>
              <span className="mobile-bottom-nav__label">{item.label}</span>
            </button>
          );
        }

        return (
          <NavLink
            key={item.id}
            to={item.to}
            className={({ isActive }) => {
              const queryMatch = item.matchQuery
                ? location.search.includes(item.matchQuery)
                : false;
              const pathMatch = isActive || (item.match && location.pathname.startsWith(item.match));
              return `mobile-bottom-nav__item ${pathMatch || queryMatch ? 'mobile-bottom-nav__item--active' : ''}`;
            }}
          >
            <span className="mobile-bottom-nav__icon" aria-hidden>{item.icon}</span>
            <span className="mobile-bottom-nav__label">{item.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
};

export const CLIENT_MOBILE_NAV = [
  { id: 'products', to: '/client-products', icon: '🏷️', label: 'Boutique' },
  { id: 'orders', to: '/client-orders', icon: '📦', label: 'Commandes' },
  { id: 'vet', to: '/veterinary', icon: '🩺', label: 'Veto' },
  { id: 'profile', to: '/client-profile', icon: '👤', label: 'Profil' },
  { id: 'menu', action: 'menu', icon: '☰', label: 'Menu' },
];

export const LIVREUR_MOBILE_NAV = [
  { id: 'dash', to: '/livreur/dashboard', icon: '📊', label: 'Accueil' },
  { id: 'orders', to: '/livreur/orders', icon: '📦', label: 'Courses' },
  { id: 'route', to: '/livreur/route', icon: '🛣️', label: 'Tournée' },
  { id: 'menu', action: 'menu', icon: '☰', label: 'Menu' },
];

export const VET_MOBILE_NAV = [
  { id: 'dash', to: '/vet/dashboard', icon: '🩺', label: 'Accueil' },
  { id: 'calendar', to: '/vet/calendar', icon: '📅', label: 'Agenda' },
  { id: 'dossiers', to: '/vet/medical-dossiers', icon: '📁', label: 'Dossiers' },
  { id: 'clients', to: '/vet/clients', icon: '👥', label: 'Clients' },
  { id: 'menu', action: 'menu', icon: '☰', label: 'Menu' },
];

export const ADMIN_MOBILE_NAV = [
  { id: 'dash', to: '/admin/dashboard', icon: '📊', label: 'Accueil' },
  { id: 'orders', to: '/admin/orders', icon: '📦', label: 'Commandes' },
  { id: 'products', to: '/admin/products', icon: '🏷️', label: 'Produits' },
  { id: 'menu', action: 'menu', icon: '☰', label: 'Menu' },
];

export const MODERATOR_MOBILE_NAV = [
  { id: 'dash', to: '/moderator/dashboard', icon: '🛡️', label: 'Accueil' },
  { id: 'users', to: '/moderator/users', icon: '👤', label: 'Users' },
  { id: 'content', to: '/moderator/content', icon: '🏷️', label: 'Contenu' },
  { id: 'reports', to: '/moderator/reports', icon: '⚖️', label: 'Litiges' },
  { id: 'menu', action: 'menu', icon: '☰', label: 'Menu' },
];

export const VENDOR_MOBILE_NAV = [
  { id: 'dash', to: '/vendor/dashboard', icon: '📊', label: 'Dashboard' },
  { id: 'products', to: '/vendor/products', icon: '🏷️', label: 'Produits' },
  { id: 'sales', to: '/vendor/sales', icon: '💰', label: 'Ventes' },
  { id: 'orders', to: '/vendor/orders', icon: '📦', label: 'Commandes' },
  { id: 'menu', action: 'menu', icon: '☰', label: 'Menu' },
];

export const SUPPORT_MOBILE_NAV = [
  { id: 'complaints', to: '/support/complaints', icon: '⚠️', label: 'Réclam.' },
  { id: 'tickets', to: '/support/tickets', icon: '🎫', label: 'Tickets' },
  { id: 'assist', to: '/support/assist', icon: '🎧', label: 'Assist.' },
  { id: 'returns', to: '/support/returns', icon: '↩️', label: 'Retours' },
  { id: 'menu', action: 'menu', icon: '☰', label: 'Menu' },
];

export const MODERATOR_PUBLIC_MOBILE_NAV = [
  { id: 'hub', to: '/moderator', icon: '🛡️', label: 'Hub' },
  { id: 'reviews', to: '/moderator', icon: '⭐', label: 'Avis', match: '/moderator' },
  { id: 'visitor', to: '/visitor', icon: '👀', label: 'Visiteur' },
  { id: 'login', to: '/login', icon: '🔑', label: 'Connexion' },
];

export const VENDOR_PUBLIC_MOBILE_NAV = [
  { id: 'hub', to: '/vendor', icon: '🏬', label: 'Hub' },
  { id: 'commissions', to: '/vendor', icon: '💰', label: 'Commissions', match: '/vendor' },
  { id: 'visitor', to: '/visitor', icon: '👀', label: 'Visiteur' },
  { id: 'login', to: '/login', icon: '🔑', label: 'Connexion' },
];

export const VISITOR_MOBILE_NAV = [
  { id: 'hub', to: '/visitor', icon: '👀', label: 'Découvrir' },
  { id: 'products', to: '/visitor/products', icon: '🏷️', label: 'Produits' },
  { id: 'tools', to: '/visitor/tools', icon: '🧪', label: 'Outils' },
  { id: 'register', to: '/register', icon: '✨', label: 'Inscription' },
];

export default MobileBottomNav;
