import React from 'react';
import ClientSidebar from '../components/ClientSidebar';
import ChatAssistant from '../components/ChatAssistant';
import { useAuth } from '../contexts/AuthContext';
import ResponsiveShell from './ResponsiveShell';

const ClientLayout = ({ children }) => {
  const { logout, user } = useAuth();
  const chatKey = user?._id || user?.id || 'client';

  return (
    <ResponsiveShell
      roleBadge="Espace client"
      sidebar={(onClose) => <ClientSidebar onLogout={logout} onNavigate={onClose} />}
    >
      {children}
      <ChatAssistant key={chatKey} variant="client" />
    </ResponsiveShell>
  );
};
export default ClientLayout;