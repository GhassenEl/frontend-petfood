import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import NotificationBell from './NotificationBell';
import ThemeToggles from './ThemeToggles';

const ModeratorSidebar = ({ onLogout, user, onNavigate }) => {
  const [sidebarImageError, setSidebarImageError] = useState(false);
  const location = useLocation();

  const sections = [
    {
      title: '🛡️ Modération',
      items: [
        { id: 'dashboard', label: 'Tableau de bord', icon: '📊' },
        { id: 'users', label: 'Comptes clients', icon: '👤' },
        { id: 'content', label: 'Contenu & produits', icon: '🏷️' },
        { id: 'fraud', label: 'Centre anti-fraude', icon: '🚨' },
        { id: 'reports', label: 'Signalements & litiges', icon: '⚖️' },
        { id: 'refunds', label: 'Remboursements', icon: '💸' },
      ],
    },
    {
      title: '⭐ Communauté',
      items: [
        { id: 'reviews', label: 'Modérer les avis', icon: '⭐' },
        { id: 'complaints', label: 'Réclamations', icon: '⚠️' },
        { id: 'events', label: 'Événements', icon: '🎪' },
        { id: 'messages', label: 'Messagerie directe', icon: '💬' },
      ],
    },
    {
      title: '📋 Compte',
      items: [
        { id: 'profile', label: 'Profil', icon: '👤' },
      ],
    },
  ];

  const isTabActive = (to) =>
    location.pathname === to || location.pathname.startsWith(`${to}/`);

  return (
    <aside className="livreur-sidebar moderator-sidebar" aria-label="Navigation modérateur">
      <div className="sidebar-header">
        <div className="sidebar-logo">🛡️</div>
        <div>
          <h2>Petfood Modération</h2>
          <span>Espace modérateur</span>
        </div>
      </div>

      <div className="sidebar-user">
        <div className="user-info">
          {!sidebarImageError ? (
            <img
              src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&h=100&fit=crop&crop=face"
              alt="Profil modérateur"
              className="w-12 h-12 rounded-full object-cover ring-2 ring-amber-300/50"
              onError={() => setSidebarImageError(true)}
            />
          ) : (
            <div className="avatar w-12 h-12 flex items-center justify-center bg-gradient-to-br from-amber-500 to-amber-600 text-white font-bold text-sm rounded-full">
              🛡️ {user?.name ? user.name.charAt(0).toUpperCase() : 'M'}
            </div>
          )}
          <div>
            <p>{user?.name || 'Modérateur'}</p>
            <p>Modérateur</p>
          </div>
        </div>
        <NotificationBell />
      </div>

      <nav className="sidebar-nav">
        {sections.map((section) => (
          <div key={section.title} className="admin-sidebar-section">
            <p className="admin-sidebar-section-title">{section.title}</p>
            {section.items.map((item) => {
              const to = `/moderator/${item.id}`;
              return (
                <NavLink
                  key={item.id}
                  to={to}
                  onClick={() => onNavigate?.()}
                  className={() => `admin-sidebar-item ${isTabActive(to) ? 'active' : ''}`}
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

export default ModeratorSidebar;
