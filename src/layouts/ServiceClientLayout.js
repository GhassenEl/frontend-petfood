import React from 'react';
import ServiceClientSidebar from '../components/ServiceClientSidebar';
import ChatAssistant from '../components/ChatAssistant';
import { useAuth } from '../contexts/AuthContext';
import ResponsiveShell from './ResponsiveShell';
import MobileBottomNav, { SUPPORT_MOBILE_NAV } from '../components/MobileBottomNav';

const ServiceClientLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const chatKey = user?._id || user?.id || 'support';

  return (
    <ResponsiveShell
      className="support-layout"
      roleBadge="Service Client"
      bottomNav={<MobileBottomNav items={SUPPORT_MOBILE_NAV} />}
      sidebar={(onClose) => <ServiceClientSidebar user={user} onLogout={logout} onNavigate={onClose} />}
    >
      {children}
      <ChatAssistant key={chatKey} variant="admin" title="Assistant service client" />
    </ResponsiveShell>
  );
};

export default ServiceClientLayout;
