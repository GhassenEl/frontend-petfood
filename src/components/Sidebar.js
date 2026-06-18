import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import NotificationBell from './NotificationBell';
import ThemeToggles from './ThemeToggles';
import PetfoodLogo from './PetfoodLogo';

const Sidebar = ({ onNavigate, onLogout, user }) => {
  const [sidebarImageError, setSidebarImageError] = useState(false);
  const navigate = useNavigate();

  const sections = [
    {
      title: '📊 Tableau de bord',
      items: [
        { id: 'dashboard', label: 'Dashboard & BI', icon: '📈' },
      ],
    },
    {
      title: '📡 PetFoodIoT',
      items: [
        { id: 'iot-anomalies', label: 'Surveillance IoT & capteurs', icon: '📡' },
        { id: 'food-quality-cam', label: 'ESP32-CAM PetFoodIoT', icon: '📷' },
        { id: 'food-quality', label: 'Qualité alimentaire IoT', icon: '🌡️' },
      ],
    },
    {
      title: '🤖 Assistant IA',
      items: [
        { id: '__open-chat__', label: 'Assistant IA', icon: '🤖', action: 'open-chat' },
      ],
    },
    {
      title: '📊 Analytics',
      items: [
        { id: 'business-intelligence', label: 'Business Intelligence', icon: '📈' },
        { id: 'powerbi', label: 'Power BI', icon: '📊' },
        { id: 'performance', label: 'Performance plateforme', icon: '⚡' },
        { id: 'nlp-models', label: 'Modèles NLP', icon: '🧠' },
        { id: 'history', label: 'Historique', icon: '📜' },
      ],
    },
    {
      title: '👥 Acteurs plateforme',
      items: [
        { id: 'live-audience', label: 'Audience temps réel', icon: '📡' },
        { id: 'partners', label: 'Fournisseurs & partenariats', icon: '🤝' },
        { id: 'vendors', label: 'Vendeurs marketplace', icon: '🏬' },
        { id: 'moderators', label: 'Modérateurs', icon: '🛡️' },
        { id: 'vets', label: 'Vétérinaires', icon: '🩺' },
        { id: 'livreurs', label: 'Livreurs', icon: '🚚' },
      ],
    },
    {
      title: '🛒 Gestion',
      items: [
        { id: 'orders', label: 'Commandes', icon: '📦' },
        { id: 'sales', label: 'Ventes & CA', icon: '💰' },
        { id: 'invoices', label: 'Factures', icon: '🧾' },
        { id: 'products', label: 'Produits', icon: '🏷️' },
        { id: 'cities', label: 'Réseau villes', icon: '🏙️' },
        { id: 'stock', label: 'Gestion stock', icon: '📦' },
        { id: 'promotions', label: 'Promotions & coupons', icon: '🎟️' },
        { id: 'users', label: 'Utilisateurs', icon: '👥' },
        { id: 'leave-requests', label: 'Congés / maladie', icon: '🏖️' },
        { id: 'messages', label: 'Messages', icon: '💬' },
        { id: 'veterinary', label: 'Suivi vétérinaire', icon: '🩺' },
        { id: 'events', label: 'Événements', icon: '📅' },
      ],
    },
    {
      title: '💬 Feedback',
      items: [
        { id: 'reviews', label: 'Avis', icon: '⭐' },
        { id: 'complaints', label: 'Réclamations', icon: '⚠️' },
        { id: 'refunds', label: 'Remboursements', icon: '💸' },
      ],
    },
    {
      title: '⚙️ Paramètres',
      items: [
        { id: 'security', label: 'Centre de sécurité', icon: '🛡️' },
        { id: 'intelligent-security', label: 'Sécurité intelligente', icon: '🧠' },
        { id: 'system', label: 'Configuration globale', icon: '🔧' },
        { id: 'activity-logs', label: 'Journaux d\'activité', icon: '📋' },
        { id: 'profile', label: 'Mon Profil', icon: '👤' },
      ],
    },
  ];

  return (
    <aside className="admin-sidebar" style={{ display: 'flex', flexDirection: 'column' }} aria-label="Navigation administration">
      <div style={{
        padding: '16px 20px',
        borderBottom: '1px solid rgba(0,0,0,0.06)',
      }}>
        <PetfoodLogo size="sm" showTagline subtitle="Administration" />
      </div>

      <div
        style={{
          padding: '12px 20px',
          borderBottom: '1px solid rgba(0,0,0,0.06)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
        }}
        onClick={() => navigate('/admin/profile')}
        title="Cliquez pour voir votre profil"
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {!sidebarImageError ? (
            <img
              src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face"
              alt="Admin Profile"
              className="w-8 h-8 rounded-full object-cover ring-2 ring-orange-300/50 hover:scale-110 transition-transform duration-300"
              onError={() => setSidebarImageError(true)}
            />
          ) : (
            <div className="avatar inline-flex items-center justify-center w-8 h-8 bg-gradient-to-br from-orange-500 to-amber-600 text-white font-bold text-xs rounded-full ring-2 ring-orange-300/50" style={{ fontSize: '0.85rem' }}>
              👨‍💼 {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
            </div>
          )}
          <div>
            <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 700, color: '#333' }}>
              {user?.name || 'Admin'}
            </p>
            <p style={{ margin: 0, fontSize: '0.7rem', color: '#888' }}>
              Administrateur
            </p>
          </div>
        </div>
        <NotificationBell />
      </div>

      <nav style={{ flex: 1, padding: '12px 0', overflowY: 'auto' }}>
        {sections.map((section, idx) => (
          <div key={section.title} className="admin-sidebar-section">
            <p className="admin-sidebar-section-title animate-fade-in" style={{ animationDelay: `${idx * 0.1}s` }}>
              {section.title}
            </p>
            {section.items.map((item) =>
              item.action === 'open-chat' ? (
                <button
                  key={item.id}
                  type="button"
                  className="admin-sidebar-item animate-slide-left"
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
                    onNavigate?.(item.id);
                  }}
                >
                  <span className="icon">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              ) : (
                <NavLink
                  key={item.id}
                  to={item.route || `/admin/${item.id}`}
                  onClick={() => {
                    onNavigate?.(item.id);
                  }}
                  className={({ isActive }) =>
                    `admin-sidebar-item ${isActive ? 'active' : ''} animate-slide-left`
                  }
                  style={{
                    textDecoration: 'none',
                    width: '100%',
                    boxSizing: 'border-box',
                  }}
                >
                  <span className="icon">{item.icon}</span>
                  <span>{item.label}</span>
                </NavLink>
              ),
            )}
          </div>
        ))}
      </nav>

      <div style={{
        padding: '16px',
        borderTop: '1px solid rgba(0,0,0,0.06)',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
      }}>
        <ThemeToggles />

        <button
          onClick={onLogout}
          className="btn btn-danger"
          style={{ width: '100%', justifyContent: 'flex-start', padding: '10px 14px', marginTop: '4px' }}
        >
          <span>🚪</span>
          <span>Déconnexion</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
