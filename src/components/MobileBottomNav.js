import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import useIsMobile from '../hooks/useIsMobile';

const navAriaLabel = (item) => {
  const labels = {
    home: 'Accueil',
    products: 'Boutique',
    orders: 'Commandes',
    vet: 'Espace vétérinaire',
    menu: 'Ouvrir le menu',
    iot: 'Centre IoT',
    feeder: 'Distributeur IoT',
    water: 'Fontaine connectée',
    mobile: 'Application mobile',
    dash: 'Tableau de bord',
    intel: 'Intelligence artificielle',
    calendar: 'Agenda',
    dossiers: 'Dossiers médicaux',
    complaints: 'Réclamations',
    tickets: 'Tickets support',
    assist: 'Assistance',
    hub: 'Hub',
    reviews: 'Avis',
    visitor: 'Espace visiteur',
    login: 'Connexion',
    register: 'Inscription',
    contact: 'Contact',
    commissions: 'Commissions',
    sales: 'Business intelligence',
    users: 'Utilisateurs',
    content: 'Contenu',
    reports: 'Rapports',
  };
  return labels[item.id] || item.label;
};

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
              aria-label={navAriaLabel(item)}
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
            aria-label={navAriaLabel(item)}
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
  { id: 'home', to: '/client-products', icon: '🏷️', label: 'Boutique' },
  { id: 'products', to: '/client-products', icon: '🏷️', label: 'Boutique' },
  { id: 'orders', to: '/client-orders', icon: '📦', label: 'Commandes' },
  { id: 'vet', to: '/veterinary', icon: '🩺', label: 'Veto' },
  { id: 'menu', action: 'menu', icon: '☰', label: 'Menu' },
];

export const LIVREUR_MOBILE_NAV = [
  { id: 'dash', to: '/livreur/dashboard', icon: '📊', label: 'Accueil' },
  { id: 'orders', to: '/livreur/orders', icon: '📦', label: 'Courses' },
  { id: 'intel', to: '/livreur/intelligence', icon: '🧠', label: 'IA' },
  { id: 'menu', action: 'menu', icon: '☰', label: 'Menu' },
];

export const VET_MOBILE_NAV = [
  { id: 'dash', to: '/vet/dashboard', icon: '🩺', label: 'Accueil' },
  { id: 'calendar', to: '/vet/calendar', icon: '📅', label: 'Agenda' },
  { id: 'clinic', to: '/vet/clinic', icon: '🏥', label: 'Clinique' },
  { id: 'dossiers', to: '/vet/medical-dossiers', icon: '📁', label: 'Dossiers' },
  { id: 'menu', action: 'menu', icon: '☰', label: 'Menu' },
];

export const ADMIN_MOBILE_NAV = [
  { id: 'dash', to: '/admin/dashboard', icon: '📊', label: 'Accueil' },
  { id: 'orders', to: '/admin/orders', icon: '📦', label: 'Commandes' },
  { id: 'products', to: '/admin/sales', icon: '💰', label: 'Ventes' },
  { id: 'menu', action: 'menu', icon: '☰', label: 'Menu' },
];

export const MODERATOR_MOBILE_NAV = [
  { id: 'dash', to: '/moderator/dashboard', icon: '🛡️', label: 'Accueil' },
  { id: 'users', to: '/moderator/users', icon: '👤', label: 'Users' },
  { id: 'content', to: '/moderator/content', icon: '🏷️', label: 'Contenu' },
  { id: 'reviews', to: '/moderator/reviews', icon: '⭐', label: 'Avis' },
  { id: 'menu', action: 'menu', icon: '☰', label: 'Menu' },
];

export const VENDOR_MOBILE_NAV = [
  { id: 'dash', to: '/vendor/dashboard', icon: '📊', label: 'Dashboard' },
  { id: 'products', to: '/vendor/products', icon: '🏷️', label: 'Produits' },
  { id: 'sales', to: '/vendor/sales', icon: '📜', label: 'Ventes' },
  { id: 'orders', to: '/vendor/orders', icon: '📦', label: 'Commandes' },
  { id: 'menu', action: 'menu', icon: '☰', label: 'Menu' },
];

export const SUPPORT_MOBILE_NAV = [
  { id: 'dash', to: '/support/dashboard', icon: '📊', label: 'Accueil' },
  { id: 'complaints', to: '/support/complaints', icon: '⚠️', label: 'Réclam.' },
  { id: 'tickets', to: '/support/tickets', icon: '🎫', label: 'Tickets' },
  { id: 'assist', to: '/support/assist', icon: '🎧', label: 'Assist.' },
  { id: 'menu', action: 'menu', icon: '☰', label: 'Menu' },
];

export const MODERATOR_PUBLIC_MOBILE_NAV = [
  { id: 'hub', to: '/moderator', icon: '🛡️', label: 'Hub' },
  { id: 'reviews', to: '/moderator', icon: '⭐', label: 'Avis', match: '/moderator' },
  { id: 'contact', to: '/contact', icon: '📧', label: 'Contact' },
  { id: 'login', to: '/login', icon: '🔑', label: 'Connexion' },
  { id: 'menu', action: 'menu', icon: '☰', label: 'Menu' },
];

export const VENDOR_PUBLIC_MOBILE_NAV = [
  { id: 'hub', to: '/vendor', icon: '🏬', label: 'Hub' },
  { id: 'commissions', to: '/vendor', icon: '💰', label: 'Commissions', match: '/vendor' },
  { id: 'contact', to: '/contact', icon: '📧', label: 'Contact' },
  { id: 'login', to: '/login', icon: '🔑', label: 'Connexion' },
  { id: 'menu', action: 'menu', icon: '☰', label: 'Menu' },
];

export const AUTH_PUBLIC_MOBILE_NAV = [
  { id: 'home', to: '/marketing', icon: '🏠', label: 'Accueil' },
  { id: 'services', to: '/marketing#services', icon: '📋', label: 'Services' },
  { id: 'contact', to: '/contact', icon: '📧', label: 'Contact' },
  { id: 'login', to: '/login', icon: '🔑', label: 'Connexion' },
  { id: 'register', to: '/register', icon: '✨', label: 'Inscrire' },
];

export default MobileBottomNav;
