import React from 'react';
import { Outlet } from 'react-router-dom';
import VetSidebar from '../components/VetSidebar';
import ChatAssistant from '../components/ChatAssistant';
import { useAuth } from '../contexts/AuthContext';
import ResponsiveShell from './ResponsiveShell';
import MobileBottomNav, { VET_MOBILE_NAV } from '../components/MobileBottomNav';

const VetLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const chatKey = user?._id || user?.id || 'vet';

  return (
    <ResponsiveShell
      className="livreur-layout vet-layout"
      roleBadge="Vétérinaire"
      bottomNav={<MobileBottomNav items={VET_MOBILE_NAV} />}
      sidebar={(onClose) => <VetSidebar user={user} onLogout={logout} onNavigate={onClose} />}
    >
      {children ?? <Outlet />}
      <ChatAssistant key={chatKey} variant="vet" />
    </ResponsiveShell>
  );
};

export default VetLayout;
