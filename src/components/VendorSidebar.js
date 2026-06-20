import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import NotificationBell from './NotificationBell';
import ThemeToggles from './ThemeToggles';
import PetfoodLogo from './PetfoodLogo';
import SidebarAvatar from './SidebarAvatar';

const VendorSidebar = ({ onLogout, user, onNavigate }) => {
  const location = useLocation();

  const sections = [
    {
      title: '📊 Tableau de bord',
      items: [
        { id: 'dashboard', label: 'Vue d\'ensemble', icon: '📊' },
      ],
    },
    {
      title: '🏷️ Gestion produits',
      items: [
        { to: '/vendor/products', label: 'Mes produits', icon: '🏷️' },
        { id: 'food-quality', label: 'Qualité alimentaire IoT', icon: '🌡️' },
      ],
    },
    {
      title: '📦 Commandes',
      items: [
        { to: '/vendor/orders', label: 'Commandes actives', icon: '📦' },
        { to: '/vendor/sales', label: 'Historique ventes', icon: '📜' },
      ],
    },
    {
      title: '↩️ Après-vente',
      items: [
        { to: '/vendor/returns', label: 'Gestion des retours', icon: '↩️' },
      ],
    },
    {
      title: '💬 Communication',
      items: [
        { to: '/vendor/communication', label: 'Avis & messages', icon: '⭐' },
      ],
    },
    {
      title: '👤 Compte',
      items: [
        { id: 'profile', label: 'Profil', icon: '👤' },
      ],
    },
  ];

  const isTabActive = (to) => location.pathname === to;

  return (
    <aside className="livreur-sidebar vendor-sidebar" aria-label="Navigation vendeur">
      <div className="sidebar-header" style={{ paddingBottom: 12 }}>
        <PetfoodLogo size="sm" showTagline subtitle="Marketplace vendeur" />
      </div>

      <div className="sidebar-user">
        <div className="user-info">
          <SidebarAvatar user={user} role="vendor" className="w-12 h-12 rounded-full object-cover ring-2 ring-teal-300/50" />
          <div>
            <p>{user?.name || 'Vendeur'}</p>
            <p>Vendeur marketplace</p>
          </div>
        </div>
        <NotificationBell />
      </div>

      <nav className="sidebar-nav">
        {sections.map((section) => (
          <div key={section.title} className="admin-sidebar-section">
            <p className="admin-sidebar-section-title">{section.title}</p>
            {section.items.map((item) => {
              if (item.to) {
                return (
                  <NavLink
                    key={item.to + item.label}
                    to={item.to}
                    onClick={() => onNavigate?.()}
                    className={() => `admin-sidebar-item ${isTabActive(item.to) ? 'active' : ''}`}
                  >
                    <span className="icon">{item.icon}</span>
                    <span>{item.label}</span>
                  </NavLink>
                );
              }

              const to = `/vendor/${item.id}`;
              return (
                <NavLink
                  key={item.id}
                  to={to}
                  onClick={() => onNavigate?.()}
                  className={({ isActive }) =>
                    `admin-sidebar-item ${isActive && !location.search ? 'active' : ''}`
                  }
                >
                  <span className="icon">{item.icon}</span>
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <ThemeToggles />
        <button type="button" onClick={onLogout} className="btn btn-danger">
          <span>🚪</span>
          <span>Déconnexion</span>
        </button>
      </div>
    </aside>
  );
};

export default VendorSidebar;
