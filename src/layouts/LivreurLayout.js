import React from 'react';
import LivreurSidebar from '../components/LivreurSidebar';
import ChatAssistant from '../components/ChatAssistant';
import RecommendedForYouButton from '../components/RecommendedForYouButton';
import { useAuth } from '../contexts/AuthContext';
import ResponsiveShell from './ResponsiveShell';
import MobileBottomNav, { LIVREUR_MOBILE_NAV } from '../components/MobileBottomNav';

const LivreurLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const chatKey = user?._id || user?.id || 'livreur';

  return (
    <ResponsiveShell
      className="livreur-layout"
      roleBadge="Livraison"
      bottomNav={<MobileBottomNav items={LIVREUR_MOBILE_NAV} />}
      sidebar={(onClose) => <LivreurSidebar user={user} onLogout={logout} onNavigate={onClose} />}
    >
      {children}
      <RecommendedForYouButton bottomOffset={88} />
      <ChatAssistant key={chatKey} variant="livreur" />
    </ResponsiveShell>
  );
};

export default LivreurLayout;

