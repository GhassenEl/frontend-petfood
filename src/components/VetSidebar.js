import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import NotificationBell from './NotificationBell';
import ThemeToggles from './ThemeToggles';

const VetSidebar = ({ onLogout, user, onNavigate }) => {
  const [sidebarImageError, setSidebarImageError] = useState(false);

  const sections = [
    {
      title: '🩺 Activités cliniques',
      items: [
        { id: 'dashboard', label: 'Tableau de bord', icon: '📊' },
        { id: 'bi', label: 'Dashboard BI', icon: '📈' },
        { id: 'calendar', label: 'Calendrier', icon: '📅' },
        { id: 'availability', label: 'Disponibilité', icon: '🟢' },
        { id: 'prescriptions', label: 'Ordonnances', icon: '💊' },
        { id: 'medication-recommendations', label: 'Recommandations médicaments', icon: '✨' },
        { id: 'pharmacy', label: 'Pharmacie', icon: '🏪' },
        { id: 'clinic', label: 'Ma clinique', icon: '🏥' },
        { id: 'medical-dossiers', label: 'Dossiers médicaux', icon: '📁' },
        { id: 'vaccinations', label: 'Vaccinations', icon: '💉' },
        { id: 'diagnostics', label: 'Détection précoce', icon: '🔬' },
        { id: 'teleconsult', label: 'Téléconsultations', icon: '📹' },
        { id: 'nutrition', label: 'Conseils nutrition', icon: '🥗' },
      ],
    },
    {
      title: '👥 Patients & suivi',
      items: [
        { id: 'clients', label: 'Clients', icon: '👥' },
        { id: 'history', label: 'Historique', icon: '📜' },
        { id: 'contact-requests', label: 'Demandes contact', icon: '📩' },
      ],
    },
    {
      title: '🤖 Assistant IA',
      items: [
        { id: '__open-chat__', label: 'Assistant IA', icon: '🤖', action: 'open-chat' },
        { id: 'platform-services', label: 'Catalogue services', icon: '📋' },
      ],
    },
    {
      title: '👤 Compte',
      items: [
        { id: 'leave-requests', label: 'Congés / maladie', icon: '🏖️' },
        { id: 'profile', label: 'Profil', icon: '👤' },
      ],
    },
  ];

  return (
    <aside className="livreur-sidebar vet-sidebar" aria-label="Navigation vétérinaire">
      <div className="sidebar-header">
        <div className="sidebar-logo">🩺</div>
        <div>
          <h2>Petfood Vétérinaire</h2>
          <span>Espace Clinique</span>
        </div>
      </div>

      <div className="sidebar-user">
        <div className="user-info">
          {!sidebarImageError ? (
            <img
              src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&h=100&fit=crop&crop=face"
              alt="Profil vétérinaire"
              className="w-12 h-12 rounded-full object-cover ring-2 ring-sky-300/50"
              onError={() => setSidebarImageError(true)}
            />
          ) : (
            <div className="avatar w-12 h-12 flex items-center justify-center bg-gradient-to-br from-sky-500 to-sky-600 text-white font-bold text-sm rounded-full">
              🩺 {user?.name ? user.name.charAt(0).toUpperCase() : 'V'}
            </div>
          )}
          <div>
            <p>{user?.name || 'Vétérinaire'}</p>
            <p>Vétérinaire</p>
          </div>
        </div>
        <NotificationBell />
      </div>

      <nav className="sidebar-nav">
        {sections.map((section) => (
          <div key={section.title} className="admin-sidebar-section">
            <p className="admin-sidebar-section-title">{section.title}</p>
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
                  to={`/vet/${item.id}`}
                  onClick={() => onNavigate?.()}
                  className={({ isActive }) => `admin-sidebar-item ${isActive ? 'active' : ''}`}
                >
                  <span className="icon">{item.icon}</span>
                  <span>{item.label}</span>
                </NavLink>
              )
            )}
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

export default VetSidebar;
