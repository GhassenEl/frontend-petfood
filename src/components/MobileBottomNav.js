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
            className={({ isActive }) =>
              `mobile-bottom-nav__item ${isActive || (item.match && location.pathname.startsWith(item.match)) ? 'mobile-bottom-nav__item--active' : ''}`
            }
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

export default MobileBottomNav;
