import React from 'react';
import VendorPublicSidebar from '../components/VendorPublicSidebar';
import ChatAssistant from '../components/ChatAssistant';
import ResponsiveShell from './ResponsiveShell';
import MobileBottomNav, { VENDOR_PUBLIC_MOBILE_NAV } from '../components/MobileBottomNav';

const VendorPublicLayout = ({ children }) => (
  <ResponsiveShell
    className="vendor-public-layout"
    roleBadge="Vendeur"
    bottomNav={<MobileBottomNav items={VENDOR_PUBLIC_MOBILE_NAV} />}
    sidebar={(onClose) => <VendorPublicSidebar onNavigate={onClose} />}
  >
    {children}
    <ChatAssistant variant="vendor" />
  </ResponsiveShell>
);

export default VendorPublicLayout;
