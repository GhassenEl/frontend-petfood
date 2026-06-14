import React from 'react';
import VisitorSidebar from '../components/VisitorSidebar';
import ChatAssistant from '../components/ChatAssistant';
import ResponsiveShell from './ResponsiveShell';
import MobileBottomNav, { VISITOR_MOBILE_NAV } from '../components/MobileBottomNav';

const VisitorLayout = ({ children }) => (
  <ResponsiveShell
    className="visitor-layout"
    roleBadge="Visiteur"
    bottomNav={<MobileBottomNav items={VISITOR_MOBILE_NAV} />}
    sidebar={(onClose) => <VisitorSidebar onNavigate={onClose} />}
  >
    {children}
    <ChatAssistant variant="visitor" />
  </ResponsiveShell>
);

export default VisitorLayout;
