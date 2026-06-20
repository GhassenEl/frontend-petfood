import React from 'react';
import NotificationBell from './NotificationBell';
import ThemeToggles from './ThemeToggles';
import ConfigSidebarNav from './platform/ConfigSidebarNav';
import useVetClinicalOverview from '../hooks/useVetClinicalOverview';
import { VET_SIDEBAR_SECTIONS, getVetSidebarBadge } from '../config/vetSidebarConfig';
import PetfoodLogo from './PetfoodLogo';
import SidebarAvatar from './SidebarAvatar';
import '../pages/VetPages.css';

const VetSidebar = ({ onLogout, user, onNavigate }) => {
  const { overview } = useVetClinicalOverview();

  return (
    <aside className="livreur-sidebar vet-sidebar" aria-label="Navigation vétérinaire">
      <div className="sidebar-header" style={{ paddingBottom: 12 }}>
        <PetfoodLogo size="sm" showTagline subtitle="Espace vétérinaire" />
      </div>

      <div className="sidebar-user">
        <div className="user-info">
          <SidebarAvatar user={user} role="vet" className="w-12 h-12 rounded-full object-cover ring-2 ring-sky-300/50" />
          <div>
            <p>{user?.name || 'Vétérinaire'}</p>
            <p>Vétérinaire</p>
          </div>
        </div>
        <NotificationBell />
      </div>

      <nav className="sidebar-nav">
        <ConfigSidebarNav
          sections={VET_SIDEBAR_SECTIONS}
          routePrefix="/vet/"
          onNavigate={onNavigate}
          getBadge={(itemId) => getVetSidebarBadge(itemId, overview)}
        />
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
