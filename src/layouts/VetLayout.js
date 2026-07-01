import React from 'react';
import VetSidebar from '../components/VetSidebar';
import ChatAssistant from '../components/ChatAssistant';
import { useAuth } from '../contexts/AuthContext';
import ResponsiveShell from './ResponsiveShell';
import MobileBottomNav, { VET_MOBILE_NAV } from '../components/MobileBottomNav';
import RecommendedForYouButton from '../components/RecommendedForYouButton';

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
      {children}
      <ChatAssistant key={chatKey} variant="vet" />
      <RecommendedForYouButton />
    </ResponsiveShell>
  );
};

export default VetLayout;
