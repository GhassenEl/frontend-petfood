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
  { id: 'home', to: '/client-dashboard', icon: '🏠', label: 'Accueil' },
  { id: 'products', to: '/client-products', icon: '🏷️', label: 'Boutique' },
  { id: 'orders', to: '/client-orders', icon: '📦', label: 'Commandes' },
  { id: 'vet', to: '/veterinary', icon: '🩺', label: 'Veto' },
  { id: 'menu', action: 'menu', icon: '☰', label: 'Menu' },
];

/** Navigation basse contextuelle — parcours IoT (hub, distributeur, fontaine, app mobile). */
export const CLIENT_IOT_MOBILE_NAV = [
  { id: 'iot', to: '/client-iot', icon: '📡', label: 'IoT', match: '/client-iot' },
  { id: 'feeder', to: '/pet-feeder', icon: '🍽️', label: 'Distrib.', match: '/pet-feeder' },
  { id: 'water', to: '/client-smart-water', icon: '💧', label: 'Fontaine', match: '/client-smart-water' },
  { id: 'mobile', to: '/mobile#iot', icon: '📱', label: 'App', match: '/mobile' },
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
  { id: 'intel', to: '/vet/intelligence', icon: '🧠', label: 'IA' },
  { id: 'dossiers', to: '/vet/medical-dossiers', icon: '📁', label: 'Dossiers' },
  { id: 'menu', action: 'menu', icon: '☰', label: 'Menu' },
];

export const ADMIN_MOBILE_NAV = [
  { id: 'dash', to: '/admin/dashboard', icon: '📊', label: 'Accueil' },
  { id: 'orders', to: '/admin/orders', icon: '📦', label: 'Commandes' },
  { id: 'products', to: '/admin/powerbi', icon: '📈', label: 'BI' },
  { id: 'menu', action: 'menu', icon: '☰', label: 'Menu' },
];

export const MODERATOR_MOBILE_NAV = [
  { id: 'dash', to: '/moderator/dashboard', icon: '🛡️', label: 'Accueil' },
  { id: 'users', to: '/moderator/users', icon: '👤', label: 'Users' },
  { id: 'content', to: '/moderator/content', icon: '🏷️', label: 'Contenu' },
  { id: 'reports', to: '/moderator/bi', icon: '📈', label: 'BI' },
  { id: 'menu', action: 'menu', icon: '☰', label: 'Menu' },
];

export const VENDOR_MOBILE_NAV = [
  { id: 'dash', to: '/vendor/dashboard', icon: '📊', label: 'Dashboard' },
  { id: 'products', to: '/vendor/products', icon: '🏷️', label: 'Produits' },
  { id: 'sales', to: '/vendor/bi', icon: '📈', label: 'BI' },
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
  { id: 'visitor', to: '/visitor', icon: '👀', label: 'Visiteur' },
  { id: 'login', to: '/login', icon: '🔑', label: 'Connexion' },
  { id: 'menu', action: 'menu', icon: '☰', label: 'Menu' },
];

export const VENDOR_PUBLIC_MOBILE_NAV = [
  { id: 'hub', to: '/vendor', icon: '🏬', label: 'Hub' },
  { id: 'commissions', to: '/vendor', icon: '💰', label: 'Commissions', match: '/vendor' },
  { id: 'visitor', to: '/visitor', icon: '👀', label: 'Visiteur' },
  { id: 'login', to: '/login', icon: '🔑', label: 'Connexion' },
  { id: 'menu', action: 'menu', icon: '☰', label: 'Menu' },
];

export const VISITOR_MOBILE_NAV = [
  { id: 'hub', to: '/visitor', icon: '👀', label: 'Découvrir' },
  { id: 'products', to: '/visitor/products', icon: '🏷️', label: 'Produits' },
  { id: 'contact', to: '/contact', icon: '📧', label: 'Contact' },
  { id: 'register', to: '/register', icon: '✨', label: 'Inscription' },
  { id: 'menu', action: 'menu', icon: '☰', label: 'Menu' },
];

export const AUTH_PUBLIC_MOBILE_NAV = [
  { id: 'home', to: '/', icon: '🏠', label: 'Accueil' },
  { id: 'visitor', to: '/visitor', icon: '👀', label: 'Visiteur' },
  { id: 'contact', to: '/contact', icon: '📧', label: 'Contact' },
  { id: 'login', to: '/login', icon: '🔑', label: 'Connexion' },
  { id: 'register', to: '/register', icon: '✨', label: 'Inscrire' },
];

export default MobileBottomNav;
