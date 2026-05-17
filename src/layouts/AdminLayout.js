import React from 'react';
import Sidebar from '../components/Sidebar';
import ChatAssistant from '../components/ChatAssistant';
import { useAuth } from '../contexts/AuthContext';
import ResponsiveShell from './ResponsiveShell';

const AdminLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const chatKey = user?._id || user?.id || 'admin';

  return (
    <ResponsiveShell
      roleBadge="Administration"
      sidebar={(onClose) => <Sidebar user={user} onLogout={logout} onNavigate={onClose} />}
    >
      {children}
      <ChatAssistant key={chatKey} variant="admin" />
    </ResponsiveShell>
  );
};

export default AdminLayout;

