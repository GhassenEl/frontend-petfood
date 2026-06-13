import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import NotificationBell from './NotificationBell';
import ThemeToggles from './ThemeToggles';

const ServiceClientSidebar = ({ onLogout, user, onNavigate }) => {
  const [sidebarImageError, setSidebarImageError] = useState(false);

  const items = [
    { to: '/support/complaints', label: 'Réclamations', icon: '⚠️' },
    { to: '/support/tickets', label: 'Tickets', icon: '🎫' },
    { to: '/support/assist', label: 'Assistance', icon: '🎧' },
    { to: '/support/returns', label: 'Retours', icon: '↩️' },
    { to: '/capabilities', label: 'Matrice capacités', icon: '📋' },
    { to: '/support/profile', label: 'Profil', icon: '👤' },
  ];

  return (
    <aside className="livreur-sidebar support-sidebar" aria-label="Navigation service client">
      <div className="sidebar-header">
        <div className="sidebar-logo">📞</div>
        <div>
          <h2>Service Client</h2>
          <span>Assistance & SAV</span>
        </div>
      </div>

      <div className="sidebar-user">
        <div className="user-info">
          {!sidebarImageError ? (
            <img
              src="https://images.unsplash.com/photo-1580518337846-f959e7c5f9bf?w=100&h=100&fit=crop&crop=face"
              alt="Profil service client"
              className="w-12 h-12 rounded-full object-cover ring-2 ring-blue-300/50"
              onError={() => setSidebarImageError(true)}
            />
          ) : (
            <div className="avatar w-12 h-12 flex items-center justify-center bg-gradient-to-br from-blue-500 to-blue-600 text-white font-bold text-sm rounded-full">
              📞 {user?.name ? user.name.charAt(0).toUpperCase() : 'S'}
            </div>
          )}
          <div>
            <p>{user?.name || 'Agent support'}</p>
            <p>Service Client</p>
          </div>
        </div>
        <NotificationBell />
      </div>

      <nav className="sidebar-nav">
        <div className="admin-sidebar-section">
          <p className="admin-sidebar-section-title">📞 SAV</p>
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => onNavigate?.()}
              className={({ isActive }) => `admin-sidebar-item ${isActive ? 'active' : ''}`}
            >
              <span className="icon">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </div>
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

export default ServiceClientSidebar;
