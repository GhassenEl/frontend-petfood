import React from 'react';
import LivreurSidebar from '../components/LivreurSidebar';
import ChatAssistant from '../components/ChatAssistant';
import { useAuth } from '../contexts/AuthContext';
import ResponsiveShell from './ResponsiveShell';

const LivreurLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const chatKey = user?._id || user?.id || 'livreur';

  return (
    <ResponsiveShell
      className="livreur-layout"
      roleBadge="Livraison"
      sidebar={(onClose) => <LivreurSidebar user={user} onLogout={logout} onNavigate={onClose} />}
    >
      {children}
      <ChatAssistant key={chatKey} variant="livreur" />
    </ResponsiveShell>
  );
};

export default LivreurLayout;

