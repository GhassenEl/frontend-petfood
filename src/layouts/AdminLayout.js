import React from 'react';
import Sidebar from '../components/Sidebar';
import ChatAssistant from '../components/ChatAssistant';
import { useAuth } from '../contexts/AuthContext';
import ResponsiveShell from './ResponsiveShell';
import MobileBottomNav, { ADMIN_MOBILE_NAV } from '../components/MobileBottomNav';
import RecommendedForYouButton from '../components/RecommendedForYouButton';

const AdminLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const chatKey = user?._id || user?.id || 'admin';

  return (
    <ResponsiveShell
      roleBadge="Administration"
      bottomNav={<MobileBottomNav items={ADMIN_MOBILE_NAV} />}
      sidebar={(onClose) => <Sidebar user={user} onLogout={logout} onNavigate={onClose} />}
    >
      {children}
      <ChatAssistant key={chatKey} variant="admin" />
      <RecommendedForYouButton />
    </ResponsiveShell>
  );
};

export default AdminLayout;

