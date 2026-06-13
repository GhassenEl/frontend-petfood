import React from 'react';
import VendorSidebar from '../components/VendorSidebar';
import ChatAssistant from '../components/ChatAssistant';
import { useAuth } from '../contexts/AuthContext';
import ResponsiveShell from './ResponsiveShell';
import MobileBottomNav, { VENDOR_MOBILE_NAV } from '../components/MobileBottomNav';

const VendorLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const chatKey = user?._id || user?.id || 'vendor';

  return (
    <ResponsiveShell
      className="vendor-layout"
      roleBadge="Vendeur"
      bottomNav={<MobileBottomNav items={VENDOR_MOBILE_NAV} />}
      sidebar={(onClose) => <VendorSidebar user={user} onLogout={logout} onNavigate={onClose} />}
    >
      {children}
      <ChatAssistant key={chatKey} variant="admin" title="Assistant vendeur" />
    </ResponsiveShell>
  );
};

export default VendorLayout;
