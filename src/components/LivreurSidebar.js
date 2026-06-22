import React from 'react';
import { NavLink } from 'react-router-dom';
import NotificationBell from './NotificationBell';
import ThemeToggles from './ThemeToggles';
import PetfoodLogo from './PetfoodLogo';
import SidebarAvatar from './SidebarAvatar';

const LivreurSidebar = ({ onLogout, user, onNavigate }) => {
  const sections = [
    {
      title: '🚚 Activités Principales',
      items: [
        { id: 'dashboard', label: 'Tableau de bord', icon: '📊' },
        { id: 'orders', label: 'Commandes', icon: '📦' },
        { id: 'route', label: 'Tournée', icon: '🛣️' },
        { id: 'map', label: 'Carte', icon: '🗺️' },
        { id: 'availability', label: 'Disponibilité', icon: '🟢' },
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
      title: '🚚 Livraison',
      items: [
        { id: 'delivery-cold-chain', label: 'Livraison chaud / froid', icon: '🌡️' },
        { id: 'rse', label: 'Logistique verte', icon: '🌱' },
      ],
    },
    {
      title: '🤖 Intelligence IA',
      items: [
        { id: 'intelligence', label: 'Intelligence livraison', icon: '🧠' },
        { id: 'recommendations', label: 'Recommandations IA', icon: '🎯' },
        { id: 'ml', label: 'Prévisions ML', icon: '📊' },
      ],
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
        { id: 'leave-requests', label: 'Congés / maladie', icon: '🏖️' },
        { id: 'profile', label: 'Profil', icon: '👤' },
        { id: 'security', label: 'Sécurité', icon: '🛡️' },
      ]
    }
  ];

  return (
    <aside className="livreur-sidebar" aria-label="Navigation livreur">
      {/* Brand Header */}
      <div className="sidebar-header" style={{ paddingBottom: 12 }}>
        <PetfoodLogo size="sm" showTagline subtitle="Espace livreur" />
      </div>

      {/* User Profile Bar */}
      <div className="sidebar-user">
        <div className="user-info">
        <SidebarAvatar user={user} role="livreur" className="w-12 h-12 rounded-full object-cover ring-2 ring-emerald-300/50" />
          <div>
            <p>{user?.name || 'Livreur'}</p>
            <p>{user?.region ? `Zone ${user.region}` : 'Livreur'}</p>
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
            {section.items.map((item) => (
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
            ))}
          </div>
        ))}
      </nav>

      {/* Bottom Actions */}
      <div className="sidebar-footer">
        <ThemeToggles />
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
