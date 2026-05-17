import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import NotificationBell from './NotificationBell';
import { useTheme } from '../contexts/ThemeContext';

const LivreurSidebar = ({ onLogout, user, onNavigate }) => {
  const { isDark, toggleDark } = useTheme();
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
        { id: '__open-chat__', label: 'Assistant en ligne', icon: '🤖', action: 'open-chat' },
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
    <aside className="livreur-sidebar" aria-label="Navigation livreur">
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
            {section.items.map((item) =>
              item.action === 'open-chat' ? (
                <button
                  key={item.id}
                  type="button"
                  className="admin-sidebar-item"
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    border: 'none',
                    background: 'transparent',
                    font: 'inherit',
                    textAlign: 'left',
                    cursor: 'pointer',
                  }}
                  onClick={() => {
                    window.dispatchEvent(new CustomEvent('petfood:open-chat'));
                    onNavigate?.();
                  }}
                >
                  <span className="icon">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              ) : (
                <NavLink
                  key={item.id}
                  to={`/livreur/${item.id}`}
                  onClick={() => onNavigate?.()}
                  className={({ isActive }) =>
                    `admin-sidebar-item ${isActive ? 'active' : ''}`
                  }
                >
                  <span className="icon">{item.icon}</span>
                  <span>{item.label}</span>
                </NavLink>
              )
            )}
          </div>
        ))}
      </nav>

      {/* Bottom Actions */}
      <div className="sidebar-footer">
        <button
          type="button"
          onClick={toggleDark}
          className="btn btn-outline"
          style={{ width: '100%', justifyContent: 'flex-start', padding: '12px 14px', marginBottom: '8px' }}
        >
          <span>{isDark ? '☀️' : '🌙'}</span>
          <span>{isDark ? 'Mode clair' : 'Mode sombre'}</span>
        </button>
        <button
          type="button"
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
