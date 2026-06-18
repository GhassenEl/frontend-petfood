import React from 'react';
import VendorSidebar from '../components/VendorSidebar';
import { useAuth } from '../contexts/AuthContext';
import ResponsiveShell from './ResponsiveShell';
import MobileBottomNav, { VENDOR_MOBILE_NAV } from '../components/MobileBottomNav';

const VendorLayout = ({ children }) => {
  const { user, logout } = useAuth();

  return (
    <ResponsiveShell
      className="vendor-layout"
      roleBadge="Vendeur"
      bottomNav={<MobileBottomNav items={VENDOR_MOBILE_NAV} />}
      sidebar={(onClose) => <VendorSidebar user={user} onLogout={logout} onNavigate={onClose} />}
    >
      {children}
    </ResponsiveShell>
  );
};

export default VendorLayout;
