import React from 'react';
import ModeratorSidebar from '../components/ModeratorSidebar';
import ChatAssistant from '../components/ChatAssistant';
import { useAuth } from '../contexts/AuthContext';
import ResponsiveShell from './ResponsiveShell';
import MobileBottomNav, { MODERATOR_MOBILE_NAV } from '../components/MobileBottomNav';

const ModeratorLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const chatKey = user?._id || user?.id || 'moderator';

  return (
    <ResponsiveShell
      className="moderator-layout"
      roleBadge="Modération"
      bottomNav={<MobileBottomNav items={MODERATOR_MOBILE_NAV} />}
      sidebar={(onClose) => <ModeratorSidebar user={user} onLogout={logout} onNavigate={onClose} />}
    >
      {children}
      <ChatAssistant key={chatKey} variant="moderator" />
    </ResponsiveShell>
  );
};

export default ModeratorLayout;
