import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import NotificationBell from './NotificationBell';

const LivreurSidebar = ({ onLogout, user }) => {
  const [sidebarImageError, setSidebarImageError] = useState(false);
  const sections = [
    {
      title: '🚚 Activités Principales',
      items: [
        { id: 'dashboard', label: 'Tableau de bord', icon: '📊' },
        { id: 'orders', label: 'Commandes', icon: '📦' },
        { id: 'map', label: 'Carte', icon: '🗺️' },
      ]
    },
    {
      title: '📊 Statistiques',
      items: [
        { id: 'stats', label: 'Statistiques', icon: '📈' },
        { id: 'earnings', label: 'Gains', icon: '💰' },
      ]
    },
    {
      title: '💬 Communications',
      items: [
        { id: 'messages', label: 'Messages', icon: '💬' },
      ]
    },
    {
      title: '📋 Historique & Profil',
      items: [
        { id: 'history', label: 'Historique', icon: '📜' },
        { id: 'profile', label: 'Profil', icon: '👤' },
      ]
    }
  ];

  return (
    <aside className="livreur-sidebar">
      {/* Brand Header */}
      <div className="sidebar-header">
        <div className="sidebar-logo">
          🚚
        </div>
        <div>
          <h2>Petfood Livreur</h2>
          <span>Espace Livreur</span>
        </div>
      </div>

      {/* User Profile Bar */}
      <div className="sidebar-user">
        <div className="user-info">
        {!sidebarImageError ? (
          <img 
            src="https://images.unsplash.com/photo-1558618047-3c8c76bbb17e?w=100&h=100&fit=crop&crop=face" 
            alt="Profile" 
            className="w-12 h-12 rounded-full object-cover ring-2 ring-emerald-300/50 hover:scale-110 transition-transform duration-300" 
            onError={() => setSidebarImageError(true)}
          />
        ) : (
          <div className="avatar w-12 h-12 flex items-center justify-center bg-gradient-to-br from-emerald-500 to-emerald-600 text-white font-bold text-sm rounded-full">
            🚚 {user?.name ? user.name.charAt(0).toUpperCase() : 'L'}
          </div>
        )}
          <div>
            <p>{user?.name || 'Livreur'}</p>
            <p>Livreur</p>
          </div>
        </div>
        <NotificationBell />
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {sections.map((section, idx) => (
          <div key={section.title} className="admin-sidebar-section">
            <p className="admin-sidebar-section-title">
              {section.title}
            </p>
            {section.items.map(item => (
              <NavLink
                key={item.id}
                to={`/livreur/${item.id}`}
                className={({ isActive }) =>
                  `admin-sidebar-item ${isActive ? 'active' : ''}`
                }
              >
                <span className="icon">{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {/* Bottom Actions */}
      <div className="sidebar-footer">
        <button
          onClick={onLogout}
          className="btn btn-danger"
        >
          <span>🚪</span>
          <span>Déconnexion</span>
        </button>
      </div>
    </aside>
  );
};

export default LivreurSidebar;
